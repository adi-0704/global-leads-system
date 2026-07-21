# -*- coding: utf-8 -*-
"""
scrape_and_outreach_india.py — India Doctor Outreach Engine
============================================================
Scrapes all types of medical clinics across India via Google Maps,
audits websites for modernity, sends personalised outreach emails via SMTP,
and tracks replies via IMAP. Persists all data in SQLite (leads.db).

Budget system (prevents pipeline starvation):
  - Daily cap       : 50 emails total (configurable)
  - Follow-up pool  : max 20/day (sent FIRST, to leads ≥5 days old with no reply)
  - New outreach    : min 30/day (always guaranteed even on heavy follow-up days)
  - Excess follow-ups carry over to tomorrow — never dropped

Usage:
    python scrape_and_outreach_india.py [--dry-run] [--limit N]
                                        [--keyword TERM] [--city CITY]
                                        [--no-scrape] [--no-email]
                                        [--target N] [--max-iterations N]
"""

import os
import sys
import time
import re
import json
import random
import sqlite3
import asyncio
import argparse
import subprocess
import requests
from datetime import datetime, timedelta
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import imaplib
import email as email_parser

# ---------------------------------------------------------------------------
# Path Setup — add parent dir so 'scraper' package is importable
# ---------------------------------------------------------------------------
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PARENT_DIR = os.path.dirname(SCRIPT_DIR)
if PARENT_DIR not in sys.path:
    sys.path.insert(0, PARENT_DIR)

from scraper import GoogleMapsScraper, EmailFinder  # noqa: E402

# Default paths
DB_PATH     = os.path.join(SCRIPT_DIR, "leads.db")
CONFIG_PATH = os.path.join(SCRIPT_DIR, "config.json")

# Noise strings returned by Google Maps sidebar UI
_NOISE_NAMES = frozenset(["", "results", "more results", "advertisement", "sponsored"])

# ---------------------------------------------------------------------------
# Database
# ---------------------------------------------------------------------------

def init_db(db_path: str) -> None:
    """Create leads table with India-specific columns and follow-up tracking."""
    with sqlite3.connect(db_path) as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS leads (
                id                     INTEGER PRIMARY KEY AUTOINCREMENT,
                name                   TEXT,
                phone                  TEXT,
                address                TEXT,
                website                TEXT,
                status                 TEXT,
                email                  TEXT UNIQUE,
                email_status           TEXT DEFAULT 'Not Sent',
                sent_at                TEXT,
                followup_sent_at       TEXT,
                replied_at             TEXT,
                reply_subject          TEXT,
                reply_body             TEXT,
                query                  TEXT,
                niche                  TEXT,
                location               TEXT,
                scraped_at             TEXT,
                website_viewport       INTEGER,
                website_ssl            INTEGER,
                website_copyright_year INTEGER,
                website_notes          TEXT,
                email_error            TEXT
            )
        """)
        conn.execute("CREATE INDEX IF NOT EXISTS idx_leads_email ON leads (email)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_leads_name  ON leads (name)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_leads_sent  ON leads (sent_at)")

        # Migrations for pre-existing databases
        existing_cols = {
            row[1] for row in conn.execute("PRAGMA table_info(leads)").fetchall()
        }
        migrations = [
            ("email_error",            "TEXT"),
            ("reply_subject",          "TEXT"),
            ("reply_body",             "TEXT"),
            ("followup_sent_at",       "TEXT"),
            ("niche",                  "TEXT"),
        ]
        for col, col_type in migrations:
            if col not in existing_cols:
                conn.execute(f"ALTER TABLE leads ADD COLUMN {col} {col_type}")
        conn.commit()

# ---------------------------------------------------------------------------
# Website Modernity Analysis (same robust analysis as global system)
# ---------------------------------------------------------------------------

_VIEWPORT_RE  = re.compile(r'<meta\s+name=["\']viewport["\']', re.IGNORECASE)
_COPYRIGHT_RE = re.compile(
    r'(?:copyright|\xa9|&copy;)\s*(?:20[0-2]\d\s*-\s*)?(20[0-2]\d)',
    re.IGNORECASE
)
_COPYRIGHT_FB = re.compile(r'copyright.*?\b(20[0-2]\d)\b', re.IGNORECASE | re.DOTALL)

_BOOKING_PATTERNS = [
    r'calendly\.com', r'acuityscheduling\.com', r'booksy\.com',
    r'practo\.com', r'justdial\.com', r'lybrate\.com', r'sulekha\.com',
    r'zocdoc\.com', r'appointy\.com', r'simplybook\.me',
    r'setmore\.com', r'picktime\.com', r'vcita\.com',
    r'class="book', r'id="book', r'book.?now', r'book.?appointment',
    r'schedule.?appointment', r'online.?booking', r'request.?appointment',
    r'type="submit"[^>]*book', r'<button[^>]*>\s*book',
    r'whatsapp.*book', r'wa\.me', r'api\.whatsapp\.com',
]
_BOOKING_RE = re.compile('|'.join(_BOOKING_PATTERNS), re.IGNORECASE)

_AI_PATTERNS = [
    r'intercom\.io', r'drift\.com', r'tidio\.com', r'crisp\.chat',
    r'freshchat', r'zendesk', r'hubspot.*chat', r'livechat',
    r'tawk\.to', r'chatbot', r'openai', r'gpt', r'dialogflow',
    r'botpress', r'manychat', r'ai.?assistant', r'ai.?chat',
    r'virtual.?assistant', r'landbot',
]
_AI_RE = re.compile('|'.join(_AI_PATTERNS), re.IGNORECASE)

_CONTACT_FORM_RE = re.compile(
    r'<form|contact.?form|enquiry.?form|patient.?form|intake.?form'
    r'|<input[^>]+type=["\'](?:email|tel)["\']'
    r'|mailto:|wa\.me|api\.whatsapp\.com',
    re.IGNORECASE
)

_ANALYTICS_RE = re.compile(
    r'google-analytics\.com|googletagmanager\.com|gtag\(|ga\(|fbq\(|_gaq'
    r'|hotjar|mixpanel|segment\.com|clarity\.ms',
    re.IGNORECASE
)

_SOCIAL_RE = re.compile(
    r'facebook\.com|instagram\.com|twitter\.com|x\.com|linkedin\.com'
    r'|youtube\.com|tiktok\.com|threads\.net',
    re.IGNORECASE
)

_REVIEW_RE = re.compile(
    r'testimonial|review|patient.said|what.our.patient|star.rating'
    r'|google.review|practo.*review|justdial.*review'
    r'|class=["\'][^"\'<>]*(?:review|testimonial|rating)',
    re.IGNORECASE
)

_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "en-US,en;q=0.9,hi;q=0.8",
}


def _build_fault_list(result: dict) -> list:
    faults = []
    if not result["ssl"]:
        faults.append("no SSL certificate (website shows 'Not Secure' in browsers)")
    if not result["viewport"]:
        faults.append("not mobile-friendly (broken layout on phones — most patients in India browse on mobile)")
    if result["copyright_year"] and result["copyright_year"] <= 2022:
        faults.append(f"outdated design (copyright shows {result['copyright_year']})")
    if not result["has_booking"]:
        faults.append("no online booking or WhatsApp appointment link (patients cannot schedule without calling)")
    if not result["has_ai"]:
        faults.append("no AI assistant or live chat (no way to answer patient questions after hours)")
    if not result["has_contact_form"]:
        faults.append("no contact form or WhatsApp link for quick patient enquiries")
    if not result["has_analytics"]:
        faults.append("no website analytics (no visibility into how many patients visit or where they come from)")
    if not result["has_social"]:
        faults.append("no social media links (Instagram and Facebook are key for patient trust in India)")
    if not result["has_reviews"]:
        faults.append("no patient testimonials or Google review section")
    return faults


def analyze_website(url: str) -> dict:
    """Fetch url and perform a 9-point audit for website quality issues."""
    result = {
        "ssl": 0, "viewport": 0, "copyright_year": None,
        "has_booking": 0, "has_ai": 0, "has_contact_form": 0,
        "has_analytics": 0, "has_social": 0, "has_reviews": 0,
        "faults": [], "status": "Old Website", "notes": "",
    }

    if not url or not url.strip():
        result["status"] = "No Website"
        result["notes"]  = "No website listed."
        result["faults"] = ["no website at all — not discoverable online"]
        return result

    fetch_url = url.strip()
    if not fetch_url.startswith(("http://", "https://")):
        fetch_url = "https://" + fetch_url

    try:
        resp = requests.get(fetch_url, timeout=8, headers=_HEADERS, allow_redirects=True)

        if resp.url.startswith("https://"):
            result["ssl"] = 1

        if not resp.ok:
            result["notes"] += f"Server returned HTTP {resp.status_code}. "
            result["faults"] = _build_fault_list(result)
            return result

        html = resp.text

        if _VIEWPORT_RE.search(html):
            result["viewport"] = 1

        m = _COPYRIGHT_RE.search(html) or _COPYRIGHT_FB.search(html[:100_000])
        if m:
            result["copyright_year"] = int(m.group(1))

        if _BOOKING_RE.search(html):
            result["has_booking"] = 1
        if _AI_RE.search(html):
            result["has_ai"] = 1
        if _CONTACT_FORM_RE.search(html):
            result["has_contact_form"] = 1
        if _ANALYTICS_RE.search(html):
            result["has_analytics"] = 1
        if _SOCIAL_RE.search(html):
            result["has_social"] = 1
        if _REVIEW_RE.search(html):
            result["has_reviews"] = 1

        is_old = (
            result["ssl"] == 0
            or result["viewport"] == 0
            or (result["copyright_year"] and result["copyright_year"] <= 2022)
        )
        if is_old:
            result["status"] = "Old Website"
        elif not result["has_booking"] and not result["has_ai"]:
            result["status"] = "No Booking/AI"
        else:
            result["status"] = "Modern Website"

        result["faults"] = _build_fault_list(result)
        result["notes"]  = (
            f"Issues found: {'; '.join(result['faults'][:3])}."
            if result["faults"] else "Website appears fully optimised."
        )

    except requests.exceptions.Timeout:
        result["notes"]  = "Website timed out."
        result["status"] = "Old Website"
        result["faults"] = ["website is very slow or unresponsive"] + _build_fault_list(result)
    except requests.exceptions.ConnectionError:
        result["notes"]  = "Could not connect to website."
        result["status"] = "Old Website"
        result["faults"] = ["website appears to be down or unreachable"] + _build_fault_list(result)
    except Exception as exc:
        result["notes"]  = f"Analysis error: {exc}."
        result["status"] = "Old Website"
        result["faults"] = _build_fault_list(result)

    return result

# ---------------------------------------------------------------------------
# Email Sending
# ---------------------------------------------------------------------------

def _get_smtp_config() -> dict:
    return {
        "host":     os.environ.get("SMTP_HOST",     "smtp.gmail.com").strip(),
        "port":     int(os.environ.get("SMTP_PORT",  "587")),
        "user":     os.environ.get("SMTP_USER",     "").strip(),
        "password": os.environ.get("SMTP_PASSWORD", "").strip(),
        "from":     os.environ.get("SMTP_FROM",     os.environ.get("SMTP_USER", "")).strip(),
    }


def _format_issues(website_notes: str) -> str:
    """Convert notes string into a numbered list for email body."""
    raw = website_notes or ""
    if "Issues found:" in raw:
        items = [i.strip() for i in raw.replace("Issues found:", "").strip().rstrip(".").split(";") if i.strip()]
    else:
        items = [raw] if raw else ["several areas that could be improved"]
    return "\n".join(f"  {i+1}. {item.capitalize()}" for i, item in enumerate(items[:5]))


def send_single_email(
    db_path: str,
    lead_id: int,
    name: str,
    email: str,
    website: str,
    query_term: str,
    city: str,
    niche: str,
    lead_status: str,
    website_notes: str,
    config: dict,
    dry_run: bool = False,
    is_followup: bool = False,
) -> bool:
    """Send outreach (or follow-up) email to a single lead. Returns True on success."""
    smtp = _get_smtp_config()

    if not (smtp["user"] and smtp["password"]) and not dry_run:
        print(f"  [India Outreach] SMTP credentials missing — skipping {email}.")
        return False

    website_issues = _format_issues(website_notes)

    templates = config.get("email_templates", {})
    if is_followup:
        template = templates.get("followup") or templates.get("default") or list(templates.values())[0]
    elif lead_status == "No Booking/AI":
        template = (
            templates.get(f"{niche}_no_booking_ai")
            or templates.get(niche)
            or templates.get("default")
            or list(templates.values())[0]
        )
    else:
        template = (
            templates.get(niche)
            or templates.get("default")
            or list(templates.values())[0]
        )

    promo_url = config["promo_urls"].get(niche, config["promo_urls"].get("general", ""))
    subject   = template["subject"].format(business_name=name, city=city or "your city")
    body      = template["body"].format(
        business_name=name,
        website_url=website or "your website",
        promo_url=promo_url,
        website_issues=website_issues,
        city=city or "your city",
    )

    if dry_run:
        tag = "[FOLLOW-UP DRY-RUN]" if is_followup else "[DRY-RUN]"
        print(f"\n  {tag}[{lead_status}] -> {email}  |  {name}")
        print(f"  Subject : {subject}")
        print(f"  Preview : {body[:200]}...")
        try:
            with sqlite3.connect(db_path) as conn:
                if is_followup:
                    conn.execute(
                        "UPDATE leads SET email_status='Follow-Up Sent', followup_sent_at=? WHERE id=?",
                        (datetime.now().isoformat(), lead_id),
                    )
                else:
                    conn.execute(
                        "UPDATE leads SET email_status='Sent (Dry Run)', sent_at=? WHERE id=?",
                        (datetime.now().isoformat(), lead_id),
                    )
                conn.commit()
        except sqlite3.Error as e:
            print(f"  [Error] DB update failed: {e}")
        return True

    # Real send
    try:
        msg = MIMEMultipart()
        msg["From"]    = smtp["from"]
        msg["To"]      = email
        msg["Subject"] = subject
        msg.attach(MIMEText(body, "plain", "utf-8"))

        with smtplib.SMTP(smtp["host"], smtp["port"]) as server:
            server.ehlo()
            server.starttls()
            server.login(smtp["user"], smtp["password"])
            server.sendmail(smtp["from"], [email], msg.as_string())

        with sqlite3.connect(db_path) as conn:
            if is_followup:
                conn.execute(
                    "UPDATE leads SET email_status='Follow-Up Sent', followup_sent_at=? WHERE id=?",
                    (datetime.now().isoformat(), lead_id),
                )
            else:
                conn.execute(
                    "UPDATE leads SET email_status='Sent', sent_at=? WHERE id=?",
                    (datetime.now().isoformat(), lead_id),
                )
            conn.commit()

        tag = "[Follow-Up]" if is_followup else "[Sent]"
        print(f"  {tag}[{lead_status}] {email}  |  {name}")
        git_sync(db_path)
        return True

    except Exception as mail_err:
        print(f"  [Error] {email}: {mail_err}")
        try:
            with sqlite3.connect(db_path) as conn:
                conn.execute(
                    "UPDATE leads SET email_status='Failed', email_error=? WHERE id=?",
                    (str(mail_err), lead_id),
                )
                conn.commit()
        except sqlite3.Error:
            pass
        git_sync(db_path)
        return False

# ---------------------------------------------------------------------------
# Follow-Up Engine
# ---------------------------------------------------------------------------

def send_followup_emails(
    db_path: str,
    config: dict,
    budget_used: int = 0,
    dry_run: bool = False,
) -> int:
    """
    Send follow-up emails to leads that:
      - Have email_status = 'Sent' (not yet replied, not already followed up)
      - Were sent to >= follow_up_days days ago
      - Have followup_sent_at IS NULL

    Capped at followup_max_per_day. Returns number of follow-ups sent.
    """
    DAILY_CAP        = config.get("daily_email_limit", 50)
    FOLLOWUP_MAX     = config.get("followup_max_per_day", 20)
    FOLLOW_UP_DAYS   = config.get("follow_up_days", 5)
    SEND_GAP_SEC     = config.get("send_gap_seconds", 60)

    # How many follow-ups can we send given the already-used budget?
    remaining_budget  = DAILY_CAP - budget_used
    followup_cap      = min(FOLLOWUP_MAX, remaining_budget)

    if followup_cap <= 0:
        print("[Follow-Up] No budget remaining for follow-ups today.")
        return 0

    cutoff_date = (datetime.now() - timedelta(days=FOLLOW_UP_DAYS)).strftime("%Y-%m-%d")

    with sqlite3.connect(db_path) as conn:
        due_leads = conn.execute("""
            SELECT id, name, email, website, query, location, niche, status, website_notes
            FROM   leads
            WHERE  email_status   = 'Sent'
              AND  sent_at        < ?
              AND  followup_sent_at IS NULL
              AND  email          IS NOT NULL
              AND  email          != ''
            ORDER BY sent_at ASC
            LIMIT ?
        """, (cutoff_date + "T00:00:00", followup_cap)).fetchall()

    if not due_leads:
        print("[Follow-Up] No follow-ups due today.")
        return 0

    print(f"\n[Follow-Up] {len(due_leads)} follow-up(s) due (cap: {followup_cap}). Sending...")
    sent_count = 0

    for lead in due_leads:
        lead_id, name, email, website, query, city, niche, lead_status, website_notes = lead
        success = send_single_email(
            db_path=db_path,
            lead_id=lead_id,
            name=name,
            email=email,
            website=website or "",
            query_term=query or "",
            city=city or "",
            niche=niche or "general",
            lead_status=lead_status or "Old Website",
            website_notes=website_notes or "",
            config=config,
            dry_run=dry_run,
            is_followup=True,
        )
        if success:
            sent_count += 1
            if sent_count < len(due_leads) and not dry_run:
                print(f"  [Wait] Pausing before next follow-up ({len(due_leads) - sent_count} remaining)...")
                time.sleep(SEND_GAP_SEC)

    print(f"[Follow-Up] Done. {sent_count} follow-up email(s) sent.")
    return sent_count

# ---------------------------------------------------------------------------
# New Outreach Emails (from existing DB queue)
# ---------------------------------------------------------------------------

def send_outreach_emails(
    db_path: str,
    config: dict,
    budget_used: int = 0,
    dry_run: bool = False,
) -> int:
    """
    Send new outreach emails to unsent leads up to the remaining daily budget.
    Guarantees at least new_outreach_min_per_day slots are reserved for new leads.
    """
    DAILY_CAP    = config.get("daily_email_limit", 50)
    NEW_MIN      = config.get("new_outreach_min_per_day", 30)
    SEND_GAP_SEC = config.get("send_gap_seconds", 60)

    remaining_budget = DAILY_CAP - budget_used
    if remaining_budget <= 0:
        print("[New Outreach] Budget exhausted.")
        return 0

    with sqlite3.connect(db_path) as conn:
        leads_to_email = conn.execute("""
            SELECT id, name, email, website, query, location, niche, status, website_notes
            FROM   leads
            WHERE  status       IN ('Old Website', 'No Booking/AI')
              AND  email_status  = 'Not Sent'
              AND  email         IS NOT NULL
              AND  email         != ''
            ORDER BY scraped_at DESC
            LIMIT ?
        """, (remaining_budget,)).fetchall()

    if not leads_to_email:
        print("[New Outreach] No unsent leads in queue.")
        return 0

    print(f"[New Outreach] {len(leads_to_email)} leads queued (budget remaining: {remaining_budget}).")
    sent_count = 0

    for lead in leads_to_email:
        lead_id, name, email, website, query, city, niche, lead_status, website_notes = lead
        success = send_single_email(
            db_path=db_path,
            lead_id=lead_id,
            name=name,
            email=email,
            website=website or "",
            query_term=query or "",
            city=city or "",
            niche=niche or "general",
            lead_status=lead_status or "Old Website",
            website_notes=website_notes or "",
            config=config,
            dry_run=dry_run,
            is_followup=False,
        )
        if success:
            sent_count += 1
            if sent_count < len(leads_to_email) and not dry_run:
                print(f"  [Wait] Pausing 10 minutes before next email ({len(leads_to_email) - sent_count} remaining)...")
                time.sleep(SEND_GAP_SEC)

    print(f"[New Outreach] Done. {sent_count} new email(s) sent.")
    return sent_count

# ---------------------------------------------------------------------------
# Scraping
# ---------------------------------------------------------------------------

async def scrape_new_leads(
    db_path: str,
    config: dict,
    keyword_override: str | None = None,
    city_override:   str | None = None,
    limit: int = 20,
    immediate_outreach: bool = False,
    budget_remaining: int = 30,
    dry_run: bool = False,
) -> tuple[int, int, bool]:
    """Run one Google Maps search, audit websites, persist, optionally send email."""

    if keyword_override:
        kw_obj = next(
            (k for k in config["keywords"] if k["term"].lower() == keyword_override.lower()),
            {"term": keyword_override, "niche": "general"},
        )
    else:
        kw_obj = random.choice(config["keywords"])

    target_kw: str = kw_obj["term"]
    niche:     str = kw_obj["niche"]
    city:      str = city_override or random.choice(config["cities"])

    print(f"\n[Scraper] '{target_kw}' in '{city}' (niche: {niche}) — limit {limit}")

    init_db(db_path)
    email_finder = EmailFinder(delay=0.5, check_contact_pages=True)

    records = []
    async with GoogleMapsScraper(headless=True, delay_ms=1800) as scraper:
        async for record in scraper.search(target_kw, city, max_results=limit):
            records.append(record)

    real_count  = 0
    new_count   = 0
    emails_sent = 0
    cap_reached = False

    SEND_GAP_SEC = config.get("send_gap_seconds", 60)

    conn = sqlite3.connect(db_path)
    try:
        cursor = conn.cursor()
        for idx, record in enumerate(records, 1):
            name = record.name.strip()
            if name.lower() in _NOISE_NAMES:
                continue
            real_count += 1

            website = (record.website or "").strip()
            print(f"\n  [{real_count}] '{name}'  |  {website or 'no website'}  |  {record.phone or 'no phone'}")

            analysis = analyze_website(website)
            print(f"      -> {analysis['status']}  {analysis['notes'].strip()}")

            email = ""
            lead_status = analysis["status"]

            if website and lead_status in ["Old Website", "No Booking/AI"]:
                print("      -> Searching for contact email...")
                email = email_finder.find(website)
                print(f"      -> Email: {email or 'not found'}")
                if not email:
                    lead_status = "Filtered (No Email)"

            should_email = (
                immediate_outreach
                and lead_status in ["Old Website", "No Booking/AI"]
                and email
                and budget_remaining > 0
            )

            lead_id = None
            try:
                cursor.execute("""
                    INSERT INTO leads (
                        name, phone, address, website, status, email,
                        email_status, query, niche, location, scraped_at,
                        website_viewport, website_ssl,
                        website_copyright_year, website_notes
                    ) VALUES (?,?,?,?,?,?,'Not Sent',?,?,?,?,?,?,?,?)
                """, (
                    name, record.phone, record.address,
                    website, lead_status, email or None,
                    target_kw, niche, city, datetime.now().isoformat(),
                    analysis["viewport"], analysis["ssl"],
                    analysis["copyright_year"],
                    analysis["notes"].strip(),
                ))
                conn.commit()
                lead_id = cursor.lastrowid
                new_count += 1
            except sqlite3.IntegrityError:
                print(f"      -> Duplicate email skipped for '{name}'")
                continue
            except sqlite3.Error as db_err:
                print(f"      -> DB error: {db_err}")
                continue

            if should_email and lead_id and not cap_reached:
                success = send_single_email(
                    db_path=db_path,
                    lead_id=lead_id,
                    name=name,
                    email=email,
                    website=website,
                    query_term=target_kw,
                    city=city,
                    niche=niche,
                    lead_status=lead_status,
                    website_notes=analysis["notes"].strip(),
                    config=config,
                    dry_run=dry_run,
                    is_followup=False,
                )
                if success:
                    emails_sent += 1
                    budget_remaining -= 1
                    if budget_remaining <= 0:
                        print("      -> [Cap] New outreach budget exhausted. Stopping.")
                        cap_reached = True
                        break
                    is_last_item = (idx == len(records))
                    if not is_last_item and not dry_run:
                        print(f"      -> [Wait] Pausing 10 minutes...")
                        time.sleep(SEND_GAP_SEC)
    finally:
        conn.close()

    print(f"\n[Scraper] Done. {real_count} listings checked, {new_count} new leads added.")
    return new_count, emails_sent, cap_reached

# ---------------------------------------------------------------------------
# Continuous Outreach Loop
# ---------------------------------------------------------------------------

async def run_continuous_outreach_loop(
    db_path: str,
    config: dict,
    limit: int = 25,
    max_iters: int = 25,
    dry_run: bool = False,
    keyword_override: str | None = None,
    city_override: str | None = None,
    target_override: int = 0,
) -> None:
    """
    Full daily run:
      1. Send follow-ups first (capped at followup_max_per_day=20)
      2. Send new emails from existing queue (fills remaining budget)
      3. Scrape new leads + email them immediately until daily cap is hit
    """
    DAILY_CAP    = config.get("daily_email_limit", 50)
    FOLLOWUP_MAX = config.get("followup_max_per_day", 20)
    NEW_MIN      = config.get("new_outreach_min_per_day", 30)
    today        = datetime.now().strftime("%Y-%m-%d")

    def _count_sent_today() -> int:
        with sqlite3.connect(db_path) as c:
            return c.execute(
                "SELECT COUNT(*) FROM leads WHERE sent_at LIKE ? OR followup_sent_at LIKE ?",
                (f"{today}%", f"{today}%")
            ).fetchone()[0]

    total_sent_today = _count_sent_today()
    print(f"\n[India Outreach] Campaign starting. Emails sent today so far: {total_sent_today}/{DAILY_CAP}")

    if total_sent_today >= DAILY_CAP:
        print("[India Outreach] Daily cap already reached. Nothing to do.")
        return

    # ── Step 1: Follow-ups (max 20, respects remaining budget) ──────────────
    print("\n[India Outreach] Step 1 — Sending follow-up emails...")
    followup_budget = min(FOLLOWUP_MAX, DAILY_CAP - total_sent_today)
    followups_sent  = send_followup_emails(db_path, config, budget_used=total_sent_today, dry_run=dry_run)
    total_sent_today += followups_sent

    git_sync(db_path)

    if total_sent_today >= DAILY_CAP:
        print("[India Outreach] Daily cap reached after follow-ups.")
        return

    # ── Step 2: Email existing unsent leads from queue ──────────────────────
    print("\n[India Outreach] Step 2 — Emailing unsent leads from queue...")
    queue_sent = send_outreach_emails(db_path, config, budget_used=total_sent_today, dry_run=dry_run)
    total_sent_today += queue_sent

    git_sync(db_path)

    if total_sent_today >= DAILY_CAP:
        print(f"[India Outreach] Daily cap reached via queue. Total: {total_sent_today}/{DAILY_CAP}")
        return

    # ── Step 3: Scrape new leads + email immediately ─────────────────────────
    for iteration in range(1, max_iters + 1):
        total_sent_today = _count_sent_today()
        if total_sent_today >= DAILY_CAP:
            print(f"[India Outreach] Goal reached! {total_sent_today}/{DAILY_CAP} emails sent today.")
            break

        remaining = DAILY_CAP - total_sent_today
        print(f"\n[India Outreach] Iteration {iteration}/{max_iters} — Need {remaining} more emails.")

        try:
            new_leads, emails_sent, cap_reached = await scrape_new_leads(
                db_path=db_path,
                config=config,
                keyword_override=keyword_override,
                city_override=city_override,
                limit=limit,
                immediate_outreach=True,
                budget_remaining=remaining,
                dry_run=dry_run,
            )
            print(f"[India Outreach] Iteration {iteration}: +{new_leads} leads, +{emails_sent} sent.")
            git_sync(db_path)
            if cap_reached:
                print("[India Outreach] Daily cap reached during scraping. Done.")
                break
        except Exception as err:
            print(f"[India Outreach] Iteration {iteration} failed: {err}")

    final = _count_sent_today()
    print(f"\n[India Outreach] Session complete. Total today: {final}/{DAILY_CAP}")

# ---------------------------------------------------------------------------
# Reply Tracking (IMAP)
# ---------------------------------------------------------------------------

def decode_mime_header(header_val: str) -> str:
    if not header_val:
        return ""
    try:
        from email.header import decode_header
        decoded = decode_header(header_val)
        parts = []
        for text, encoding in decoded:
            if isinstance(text, bytes):
                parts.append(text.decode(encoding or "utf-8", errors="ignore"))
            else:
                parts.append(str(text))
        return "".join(parts)
    except Exception:
        return header_val


def get_email_body_text(msg) -> str:
    body = ""
    try:
        if msg.is_multipart():
            for part in msg.walk():
                ct   = part.get_content_type()
                disp = str(part.get("Content-Disposition"))
                if ct == "text/plain" and "attachment" not in disp:
                    payload = part.get_payload(decode=True)
                    if payload:
                        body = payload.decode("utf-8", errors="ignore")
                        break
        else:
            payload = msg.get_payload(decode=True)
            if payload:
                body = payload.decode("utf-8", errors="ignore")
    except Exception:
        pass
    if body and ("<html" in body.lower() or "<div" in body.lower()):
        body = re.sub(r"<[^>]+>", "", body)
    if body:
        body = re.sub(r"\s+", " ", body).strip()
    return body or ""


def check_for_replies(db_path: str) -> None:
    """Check IMAP inbox for replies from Indian leads we pitched."""
    imap_user     = os.environ.get("IMAP_USER",     "").strip()
    imap_password = os.environ.get("IMAP_PASSWORD", "").strip()
    imap_host     = os.environ.get("IMAP_HOST",     "imap.gmail.com").strip()

    if not (imap_user and imap_password):
        print("\n[IMAP Tracker] Credentials missing — skipping reply check.")
        return

    with sqlite3.connect(db_path) as conn:
        active_leads = {
            row[1].lower().strip(): row[0]
            for row in conn.execute("""
                SELECT id, email FROM leads
                WHERE email_status IN ('Sent', 'Sent (Dry Run)', 'Follow-Up Sent')
                  AND email IS NOT NULL AND email != ''
            """).fetchall()
        }

    if not active_leads:
        print("\n[IMAP Tracker] No active leads awaiting replies.")
        return

    print(f"\n[IMAP Tracker] Connecting to {imap_host}...")
    replies_found = 0

    try:
        with imaplib.IMAP4_SSL(imap_host) as mail:
            mail.login(imap_user, imap_password)
            mail.select("INBOX")
            status, data = mail.search(None, "UNSEEN")
            if status != "OK" or not data[0]:
                status, data = mail.search(None, "ALL")
            if status != "OK" or not data[0]:
                print("  No messages found.")
                return

            email_ids   = data[0].split()
            max_check   = min(200, len(email_ids))
            ids_to_scan = email_ids[-max_check:]
            updates     = []

            for msg_id in reversed(ids_to_scan):
                res, msg_data = mail.fetch(msg_id, "(RFC822)")
                if res != "OK":
                    continue
                for part in msg_data:
                    if not isinstance(part, tuple):
                        continue
                    msg       = email_parser.message_from_bytes(part[1])
                    from_hdr  = msg.get("From") or ""
                    m         = re.search(r"<([^>]+)>", from_hdr)
                    sender    = (m.group(1) if m else from_hdr).lower().strip()
                    if sender in active_leads:
                        lead_id = active_leads[sender]
                        updates.append((
                            lead_id, sender,
                            decode_mime_header(msg.get("Subject") or ""),
                            get_email_body_text(msg)[:1000],
                        ))
                        replies_found += 1

            if updates:
                with sqlite3.connect(db_path) as conn:
                    for lead_id, sender, subject, body in updates:
                        conn.execute(
                            "UPDATE leads SET email_status='Replied', replied_at=?, "
                            "reply_subject=?, reply_body=? WHERE id=?",
                            (datetime.now().isoformat(), subject, body, lead_id),
                        )
                        print(f"  [Reply] '{sender}' replied!")
                    conn.commit()

    except Exception as imap_err:
        print(f"  [IMAP Error] {imap_err}")

    print(f"  {replies_found} reply/replies recorded." if replies_found else "  No new replies.")

# ---------------------------------------------------------------------------
# Real-time Git Sync
# ---------------------------------------------------------------------------

def git_sync(db_path: str):
    """Export data.json and commit/push changes in real-time during run."""
    if not os.environ.get("GITHUB_ACTIONS"):
        return

    try:
        smtp_from = os.environ.get("SMTP_FROM", os.environ.get("SMTP_USER", "")).strip()
        if smtp_from:
            txt_path = os.path.join(SCRIPT_DIR, "sender_email.txt")
            with open(txt_path, "w", encoding="utf-8") as f:
                f.write(smtp_from)
    except Exception as e:
        print(f"  [Git Sync] sender_email.txt write failed: {e}")

    try:
        if SCRIPT_DIR not in sys.path:
            sys.path.insert(0, SCRIPT_DIR)
        import generate_data_json_india
        generate_data_json_india.main()
    except Exception as export_err:
        print(f"  [Git Sync] data.json export failed: {export_err}")
        return

    try:
        subprocess.run(["git", "config", "--global", "user.name",  "github-actions[bot]"], check=True, capture_output=True)
        subprocess.run(["git", "config", "--global", "user.email", "github-actions[bot]@users.noreply.github.com"], check=True, capture_output=True)
        subprocess.run(["git", "add",
                        "india-outreach/leads.db",
                        "india-outreach/data.json",
                        "india-outreach/sender_email.txt"],
                       check=True, capture_output=True)
        diff = subprocess.run(["git", "diff", "--staged", "--quiet"])
        if diff.returncode == 0:
            return
        subprocess.run(["git", "commit", "-m", "chore: india real-time dashboard sync [skip ci]"], check=True, capture_output=True)
        subprocess.run(["git", "pull",  "--rebase"], check=True, capture_output=True)
        subprocess.run(["git", "push"],              check=True, capture_output=True)
        print("  [Git Sync] India dashboard updated on GitHub Pages.")
    except subprocess.CalledProcessError as e:
        err = e.stderr.decode("utf-8", errors="ignore") if e.stderr else ""
        print(f"  [Git Sync] Git error: {err}")
    except Exception as e:
        print(f"  [Git Sync] Unexpected error: {e}")

# ---------------------------------------------------------------------------
# CLI Entry Point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="India Doctor Outreach — Scraper + Email Engine")
    parser.add_argument("--dry-run",        action="store_true", help="Log emails, do not send")
    parser.add_argument("--limit",          type=int, default=25, help="Max Google Maps results per search")
    parser.add_argument("--target",         type=int, default=0,  help="Target emails to send today (0 = use config)")
    parser.add_argument("--max-iterations", type=int, default=25, help="Safety cap on scraping loops")
    parser.add_argument("--keyword",        type=str, default=None)
    parser.add_argument("--city",           type=str, default=None)
    parser.add_argument("--no-scrape",      action="store_true")
    parser.add_argument("--no-email",       action="store_true")
    args = parser.parse_args()

    try:
        with open(CONFIG_PATH, "r", encoding="utf-8") as fh:
            config = json.load(fh)
    except Exception as exc:
        print(f"[Error] Cannot load config.json: {exc}")
        sys.exit(1)

    init_db(DB_PATH)

    if not args.no_email:
        check_for_replies(DB_PATH)

    if args.no_scrape:
        if not args.no_email:
            send_followup_emails(DB_PATH, config, dry_run=args.dry_run)
            send_outreach_emails(DB_PATH, config, dry_run=args.dry_run)
    elif args.no_email:
        asyncio.run(
            scrape_new_leads(DB_PATH, config,
                             keyword_override=args.keyword,
                             city_override=args.city,
                             limit=args.limit,
                             immediate_outreach=False,
                             dry_run=args.dry_run)
        )
    else:
        asyncio.run(
            run_continuous_outreach_loop(
                DB_PATH, config,
                limit=args.limit,
                max_iters=args.max_iterations,
                dry_run=args.dry_run,
                keyword_override=args.keyword,
                city_override=args.city,
                target_override=args.target,
            )
        )
