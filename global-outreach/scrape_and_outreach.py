# -*- coding: utf-8 -*-
"""
scrape_and_outreach.py — Global Lead Outreach Engine
=====================================================
Scrapes dermatologist & dental clinics globally via Google Maps,
audits websites for modernity, sends outreach emails via SMTP,
and tracks replies via IMAP. Persists all data in SQLite (leads.db).

Usage:
    python scrape_and_outreach.py [--dry-run] [--limit N]
                                  [--keyword TERM] [--city CITY]
                                  [--no-scrape] [--no-email]
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
import requests
from datetime import datetime
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

# Noise strings returned by Google Maps sidebar UI — not real businesses
_NOISE_NAMES = frozenset(["", "results", "more results", "advertisement", "sponsored"])

# ---------------------------------------------------------------------------
# Database
# ---------------------------------------------------------------------------

def init_db(db_path: str) -> None:
    """Create the leads table and add a name index if they don't exist yet."""
    with sqlite3.connect(db_path) as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS leads (
                id                    INTEGER PRIMARY KEY AUTOINCREMENT,
                name                  TEXT UNIQUE,
                phone                 TEXT,
                address               TEXT,
                website               TEXT,
                status                TEXT,
                email                 TEXT,
                email_status          TEXT DEFAULT 'Not Sent',
                sent_at               TEXT,
                replied_at            TEXT,
                query                 TEXT,
                location              TEXT,
                scraped_at            TEXT,
                website_viewport      INTEGER,
                website_ssl           INTEGER,
                website_copyright_year INTEGER,
                website_notes         TEXT,
                email_error           TEXT
            )
        """)
        # FIX O2: Index on name for fast duplicate lookups on large databases
        conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_leads_name ON leads (name)"
        )
        # Migration: add email_error column to pre-existing databases that lack it
        existing_cols = {
            row[1] for row in conn.execute("PRAGMA table_info(leads)").fetchall()
        }
        if "email_error" not in existing_cols:
            conn.execute("ALTER TABLE leads ADD COLUMN email_error TEXT")
        conn.commit()

# ---------------------------------------------------------------------------
# Website Modernity Analysis
# ---------------------------------------------------------------------------

_VIEWPORT_RE  = re.compile(r'<meta\s+name=["\']viewport["\']', re.IGNORECASE)
_COPYRIGHT_RE = re.compile(
    r'(?:copyright|\u00a9|&copy;)\s*(?:20[0-2]\d\s*-\s*)?(20[0-2]\d)',
    re.IGNORECASE
)
_COPYRIGHT_FB = re.compile(
    r'copyright.*?\b(20[0-2]\d)\b',
    re.IGNORECASE | re.DOTALL
)

# --- Booking system detection patterns ---
_BOOKING_PATTERNS = [
    r'calendly\.com',
    r'acuityscheduling\.com',
    r'booksy\.com',
    r'zocdoc\.com',
    r'doctolib',
    r'practo\.com',
    r'appointy\.com',
    r'simplybook\.me',
    r'square\.site.*book',
    r'setmore\.com',
    r'fresha\.com',
    r'vagaro\.com',
    r'mindbodyonline\.com',
    r'10to8\.com',
    r'picktime\.com',
    r'class="book',        # generic booking button/widget class
    r'id="book',
    r'book.?now',
    r'book.?appointment',
    r'schedule.?appointment',
    r'online.?booking',
    r'request.?appointment',
    r'type="submit"[^>]*book',
    r'<button[^>]*>\s*book',
]
_BOOKING_RE = re.compile('|'.join(_BOOKING_PATTERNS), re.IGNORECASE)

# --- AI / chatbot detection patterns ---
_AI_PATTERNS = [
    r'intercom\.io',
    r'intercomcdn\.com',
    r'drift\.com',
    r'driftt\.com',
    r'tidio\.com',
    r'crisp\.chat',
    r'freshchat',
    r'zendesk',
    r'hubspot.*chat',
    r'livechat',
    r'tawk\.to',
    r'chatbot',
    r'openai',
    r'gpt',
    r'dialogflow',
    r'botpress',
    r'manychat',
    r'ai.?assistant',
    r'ai.?chat',
    r'virtual.?assistant',
]
_AI_RE = re.compile('|'.join(_AI_PATTERNS), re.IGNORECASE)

# --- Contact form detection ---
_CONTACT_FORM_RE = re.compile(
    r'<form|contact.?form|enquiry.?form|patient.?form|intake.?form'
    r'|<input[^>]+type=["\'](?:email|tel)["\']'
    r'|mailto:',
    re.IGNORECASE
)

# --- Google Analytics / tracking detection ---
_ANALYTICS_RE = re.compile(
    r'google-analytics\.com|googletagmanager\.com|gtag\(|ga\(|fbq\(|_gaq'
    r'|hotjar|mixpanel|segment\.com|clarity\.ms',
    re.IGNORECASE
)

# --- Social media link detection ---
_SOCIAL_RE = re.compile(
    r'facebook\.com|instagram\.com|twitter\.com|x\.com|linkedin\.com'
    r'|youtube\.com|tiktok\.com|threads\.net',
    re.IGNORECASE
)

# --- Testimonial / review section detection ---
_REVIEW_RE = re.compile(
    r'testimonial|review|patient.said|what.our.patient|star.rating'
    r'|google.review|trustpilot|doctolib.*review|zocdoc.*review'
    r'|class=["\'][^"\'>]*(?:review|testimonial|rating)',
    re.IGNORECASE
)

_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "en-US,en;q=0.9",
}


def _build_fault_list(result: dict) -> list:
    """
    Convert analysis result dict into a list of specific, human-readable
    fault strings. Used to personalise outreach emails.
    """
    faults = []
    if not result["ssl"]:
        faults.append("no SSL certificate (website shows as 'Not Secure' in browsers)")
    if not result["viewport"]:
        faults.append("not mobile-friendly (broken layout on phones and tablets)")
    if result["copyright_year"] and result["copyright_year"] <= 2022:
        faults.append(f"outdated design (copyright shows {result['copyright_year']})")
    if not result["has_booking"]:
        faults.append("no online booking (patients cannot schedule appointments from the website)")
    if not result["has_ai"]:
        faults.append("no AI assistant or live chat (no way to answer patient questions after hours)")
    if not result["has_contact_form"]:
        faults.append("no contact form or online enquiry form")
    if not result["has_analytics"]:
        faults.append("no website analytics (no visibility into how many patients visit or where they come from)")
    if not result["has_social"]:
        faults.append("no social media links visible on the website")
    if not result["has_reviews"]:
        faults.append("no patient testimonials or reviews section")
    return faults


def analyze_website(url: str) -> dict:
    """
    Fetch *url* and perform a comprehensive audit for 10 specific faults.

    Status hierarchy:
      'No Website'    - no URL present
      'Old Website'   - HTTP-only, no viewport, or copyright <= 2022
      'No Booking/AI' - modern site but lacks booking AND AI chatbot
      'Modern Website'- modern site WITH booking system or AI chat

    Returns dict with keys:
        ssl, viewport, copyright_year,
        has_booking, has_ai, has_contact_form,
        has_analytics, has_social, has_reviews,
        faults (list), status, notes
    """
    result = {
        "ssl": 0,
        "viewport": 0,
        "copyright_year": None,
        "has_booking": 0,
        "has_ai": 0,
        "has_contact_form": 0,
        "has_analytics": 0,
        "has_social": 0,
        "has_reviews": 0,
        "faults": [],
        "status": "Old Website",
        "notes": "",
    }

    if not url or not url.strip():
        result["status"] = "No Website"
        result["notes"]  = "No website listed."
        result["faults"] = ["no website at all"]
        return result

    fetch_url = url.strip()
    if not fetch_url.startswith(("http://", "https://")):
        fetch_url = "https://" + fetch_url

    try:
        resp = requests.get(
            fetch_url, timeout=8, headers=_HEADERS, allow_redirects=True
        )

        # 1. SSL
        if resp.url.startswith("https://"):
            result["ssl"] = 1

        if not resp.ok:
            result["notes"] += f"Server returned HTTP {resp.status_code}. "
            result["faults"] = _build_fault_list(result)
            return result

        html = resp.text

        # 2. Mobile viewport
        if _VIEWPORT_RE.search(html):
            result["viewport"] = 1

        # 3. Copyright year
        m = _COPYRIGHT_RE.search(html) or _COPYRIGHT_FB.search(html[:100_000])
        if m:
            year = int(m.group(1))
            result["copyright_year"] = year

        # 4. Booking system
        if _BOOKING_RE.search(html):
            result["has_booking"] = 1

        # 5. AI / chatbot
        if _AI_RE.search(html):
            result["has_ai"] = 1

        # 6. Contact form
        if _CONTACT_FORM_RE.search(html):
            result["has_contact_form"] = 1

        # 7. Analytics / tracking
        if _ANALYTICS_RE.search(html):
            result["has_analytics"] = 1

        # 8. Social media links
        if _SOCIAL_RE.search(html):
            result["has_social"] = 1

        # 9. Testimonials / reviews
        if _REVIEW_RE.search(html):
            result["has_reviews"] = 1

        # -- Status decision --
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

        # Build fault list AFTER all checks are done
        result["faults"] = _build_fault_list(result)

        # Human-readable notes summary
        if result["faults"]:
            result["notes"] = f"Issues found: {'; '.join(result['faults'][:3])}."
        else:
            result["notes"] = "Website appears fully optimised."

    except requests.exceptions.Timeout:
        result["notes"]  = "Website timed out (very slow or unresponsive)."
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
# Scraping Process
# ---------------------------------------------------------------------------

async def scrape_new_leads(
    db_path: str,
    config: dict,
    keyword_override: str | None = None,
    city_override:   str | None = None,
    limit: int = 20,
) -> None:
    """Run one Google Maps search and persist results to SQLite."""

    # Resolve keyword + niche
    if keyword_override:
        kw_obj = next(
            (k for k in config["keywords"] if k["term"].lower() == keyword_override.lower()),
            {"term": keyword_override, "niche": "dental"},   # safe fallback
        )
    else:
        kw_obj = random.choice(config["keywords"])

    target_kw: str = kw_obj["term"]
    niche:     str = kw_obj["niche"]
    city:      str = city_override or random.choice(config["cities"])

    print(f"\n[Scraper] Searching '{target_kw}' in '{city}' (niche: {niche}) — limit {limit}")

    init_db(db_path)
    email_finder = EmailFinder(delay=0.5, check_contact_pages=True)

    real_count = 0      # FIX #9: counter only increments for real (non-noise) listings
    new_count  = 0

    # FIX #11: use try/finally to guarantee connection closure
    conn = sqlite3.connect(db_path)
    try:
        cursor = conn.cursor()

        async with GoogleMapsScraper(headless=True, delay_ms=1800) as scraper:
            async for record in scraper.search(target_kw, city, max_results=limit):
                name = record.name.strip()

                # FIX #9: Filter noise BEFORE incrementing counter
                if name.lower() in _NOISE_NAMES:
                    continue

                real_count += 1

                # Duplicate check (fast via idx_leads_name index)
                cursor.execute(
                    "SELECT id FROM leads WHERE name = ?", (name,)
                )
                if cursor.fetchone():
                    print(f"  [Skip] Duplicate: '{name}'")
                    continue

                website = (record.website or "").strip()
                print(f"\n  [{real_count}] '{name}'  |  {website or 'no website'}  |  {record.phone or 'no phone'}")

                # Audit website
                analysis = analyze_website(website)
                print(f"      -> {analysis['status']}  {analysis['notes'].strip()}")
                # Discover email only for Old Website/No Booking leads
                email = ""
                lead_status = analysis["status"]
                if website and lead_status in ["Old Website", "No Booking/AI"]:
                    print("      -> Searching for contact email...")
                    email = email_finder.find(website)
                    print(f"      -> Email: {email or 'not found'}")
                    if not email:
                        lead_status = "Filtered (No Email)"
                        print("      -> Skipped from outreach queue (no email found)")

                # Persist
                try:
                    cursor.execute("""
                        INSERT INTO leads (
                            name, phone, address, website, status, email,
                            email_status, query, location, scraped_at,
                            website_viewport, website_ssl,
                            website_copyright_year, website_notes
                        ) VALUES (?,?,?,?,?,?,'Not Sent',?,?,?,?,?,?,?)
                    """, (
                        name, record.phone, record.address,
                        website, lead_status, email,
                        target_kw, city, datetime.now().isoformat(),
                        analysis["viewport"], analysis["ssl"],
                        analysis["copyright_year"],
                        analysis["notes"].strip(),
                    ))
                    conn.commit()
                    new_count += 1
                except sqlite3.IntegrityError:
                    # Race-condition duplicate (shouldn't happen but safe guard)
                    print(f"      → Integrity conflict skipped for '{name}'")
                except sqlite3.Error as db_err:
                    print(f"      → DB error: {db_err}")
    finally:
        conn.close()

    print(f"\n[Scraper] Done. {real_count} real listings found, {new_count} new leads added.")
    return new_count   # return count so caller can track progress


# ---------------------------------------------------------------------------
# Target-Based Scraping Loop
# ---------------------------------------------------------------------------

async def scrape_until_target(
    db_path:     str,
    config:      dict,
    target:      int  = 60,
    limit:       int  = 25,
    max_iters:   int  = 20,
) -> None:
    """
    Repeatedly call scrape_new_leads with random city + keyword combinations
    until `target` Old Website leads have been collected today, or until
    `max_iters` search iterations are exhausted (safety cap).

    Each iteration picks a fresh (city, keyword) pair to maximise coverage
    and avoid repeating the same Google Maps page.
    """
    from datetime import date
    today = date.today().isoformat()

    def _count_today() -> int:
        """Count Old Website/No Booking leads WITH EMAILS scraped today."""
        with sqlite3.connect(db_path) as conn:
            return conn.execute(
                "SELECT COUNT(*) FROM leads "
                "WHERE status IN ('Old Website', 'No Booking/AI') "
                "  AND email IS NOT NULL AND email != '' "
                "  AND scraped_at LIKE ?",
                (f"{today}%",)
            ).fetchone()[0]

    for iteration in range(1, max_iters + 1):
        current = _count_today()
        print(f"\n{'='*60}")
        print(f"[Target] Iteration {iteration}/{max_iters}  |  Old Website leads today: {current}/{target}")
        print(f"{'='*60}")

        if current >= target:
            print(f"[Target] Goal reached! {current} outreach targets with email collected today. Done.")
            break

        remaining = target - current
        print(f"[Target] Need {remaining} more outreach targets with email — starting search...")

        try:
            await scrape_new_leads(db_path, config, limit=limit)
        except Exception as err:
            print(f"[Target] Search iteration {iteration} failed: {err}")

    else:
        final = _count_today()
        print(f"\n[Target] Max iterations reached. Collected {final}/{target} Old Website leads today.")

    final = _count_today()
    print(f"\n[Target] Session complete. Total Old Website leads today: {final}")

# ---------------------------------------------------------------------------
# Outbound Email Campaigns
# ---------------------------------------------------------------------------

def send_outreach_emails(
    db_path: str,
    config:  dict,
    dry_run: bool = False,
) -> None:
    """
    Send outreach emails to:
      - 'Old Website' leads  (pitch: modern redesign)
      - 'No Booking/AI' leads (pitch: AI booking assistant)

    Rules:
      - Auto-start only when >= 10 new leads exist (freshness gate)
      - Send at most 50 emails per day (today's sent count tracked in DB)
      - Wait 10 minutes between each real send (avoids spam flags)
      - Dry-run: log to console, no wait, mark 'Sent (Dry Run)'
    """
    is_dry_run = dry_run

    smtp_host     = os.environ.get("SMTP_HOST",     "smtp.gmail.com").strip()
    smtp_port     = int(os.environ.get("SMTP_PORT",  "587"))
    smtp_user     = os.environ.get("SMTP_USER",     "").strip()
    smtp_password = os.environ.get("SMTP_PASSWORD", "").strip()
    smtp_from     = os.environ.get("SMTP_FROM",     smtp_user).strip()

    if not (smtp_user and smtp_password) and not is_dry_run:
        print("\n[Outreach] SMTP credentials missing — skipping email stage.")
        return

    DAILY_CAP    = config.get("daily_email_limit", 50)
    MIN_NEW_LEADS = 10   # Only start emailing when >= 10 new leads exist today
    SEND_GAP_SEC  = 600  # 10 minutes between real emails
    today         = datetime.now().strftime("%Y-%m-%d")

    with sqlite3.connect(db_path) as conn:
        # How many emails already sent today?
        sent_today = conn.execute(
            "SELECT COUNT(*) FROM leads WHERE sent_at LIKE ?",
            (f"{today}%",)
        ).fetchone()[0]

        # How many new leads scraped today? (freshness gate)
        new_today = conn.execute(
            "SELECT COUNT(*) FROM leads WHERE scraped_at LIKE ?",
            (f"{today}%",)
        ).fetchone()[0]

        print(f"\n[Outreach] Leads scraped today: {new_today}  |  Emails sent today: {sent_today}/{DAILY_CAP}")

        if new_today < MIN_NEW_LEADS:
            print(f"[Outreach] Freshness gate: only {new_today} new leads today "
                  f"(need {MIN_NEW_LEADS}). Skipping email stage.")
            return

        if sent_today >= DAILY_CAP:
            print(f"[Outreach] Daily cap of {DAILY_CAP} emails already reached. Done.")
            return

        remaining_slots = DAILY_CAP - sent_today

        # Pull eligible leads: Old Website + No Booking/AI — unsent, have email
        leads_to_email = conn.execute("""
            SELECT id, name, email, website, query, location, status, website_notes
            FROM   leads
            WHERE  status       IN ('Old Website', 'No Booking/AI')
              AND  email_status  = 'Not Sent'
              AND  email         IS NOT NULL
              AND  email         != ''
            ORDER BY scraped_at DESC
            LIMIT ?
        """, (remaining_slots,)).fetchall()

    if not leads_to_email:
        print("[Outreach] No eligible leads in queue.")
        return

    print(f"[Outreach] {len(leads_to_email)} leads to contact (cap remaining: {remaining_slots}).")
    if is_dry_run:
        print("  [DRY-RUN] Emails will be logged, not dispatched (no 10-min wait).")

    sent_count = 0

    with sqlite3.connect(db_path) as conn:
        cursor = conn.cursor()

        for lead_id, name, email, website, query_term, location, lead_status, website_notes in leads_to_email:

            # Resolve niche from keyword
            niche = "dental"
            for kw in config["keywords"]:
                if kw["term"].lower() in (query_term or "").lower():
                    niche = kw["niche"]
                    break

            # Format the specific website issues as a numbered list for the email
            raw_notes = website_notes or ""
            if "Issues found:" in raw_notes:
                # Parse out the fault list from stored notes
                issues_raw = raw_notes.replace("Issues found:", "").strip().rstrip(".")
                issue_items = [i.strip() for i in issues_raw.split(";") if i.strip()]
            else:
                issue_items = [raw_notes] if raw_notes else ["several areas that could be improved"]
            # Format as numbered list
            website_issues = "\n".join(
                f"  {i+1}. {item.capitalize()}" for i, item in enumerate(issue_items[:5])
            )

            # Choose template based on lead type
            if lead_status == "No Booking/AI":
                template_key = f"{niche}_no_booking_ai"
                template = (
                    config["email_templates"].get(template_key)
                    or config["email_templates"].get("no_booking_ai")
                    or config["email_templates"].get(niche)
                )
            else:
                template = config["email_templates"].get(niche) or list(config["email_templates"].values())[0]

            promo_url = config["promo_urls"].get(niche, config["promo_urls"].get("dental", ""))
            subject   = template["subject"].format(business_name=name)
            body      = template["body"].format(
                business_name=name,
                website_url=website or "your website",
                promo_url=promo_url,
                website_issues=website_issues,
            )

            if is_dry_run:
                print(f"\n  [DRY-RUN][{lead_status}] -> {email}  |  {name}")
                print(f"  Subject : {subject}")
                print(f"  Preview : {body[:180]}...")
                cursor.execute(
                    "UPDATE leads SET email_status='Sent (Dry Run)', sent_at=? WHERE id=?",
                    (datetime.now().isoformat(), lead_id),
                )
                conn.commit()
                sent_count += 1
                continue  # no wait in dry-run

            # Real send
            try:
                msg = MIMEMultipart()
                msg["From"]    = smtp_from
                msg["To"]      = email
                msg["Subject"] = subject
                msg.attach(MIMEText(body, "plain", "utf-8"))

                with smtplib.SMTP(smtp_host, smtp_port) as server:
                    server.ehlo()
                    server.starttls()
                    server.login(smtp_user, smtp_password)
                    server.sendmail(smtp_from, [email], msg.as_string())

                cursor.execute(
                    "UPDATE leads SET email_status='Sent', sent_at=? WHERE id=?",
                    (datetime.now().isoformat(), lead_id),
                )
                conn.commit()
                print(f"  [Sent][{lead_status}] {email}  |  {name}")
                sent_count += 1

                # Check if daily cap now reached
                if sent_count + sent_today >= DAILY_CAP:
                    print(f"  [Cap] Daily limit of {DAILY_CAP} reached. Stopping.")
                    break

                # 10-minute gap between sends (avoids spam flags)
                remaining = len(leads_to_email) - sent_count
                if remaining > 0:
                    print(f"  [Wait] Pausing 10 minutes before next email ({remaining} remaining)...")
                    time.sleep(SEND_GAP_SEC)

            except Exception as mail_err:
                print(f"  [Error] {email}: {mail_err}")
                cursor.execute(
                    "UPDATE leads SET email_status='Failed', email_error=? WHERE id=?",
                    (str(mail_err), lead_id),
                )
                conn.commit()

    print(f"[Outreach] Finished. {sent_count} emails dispatched today (total: {sent_count + sent_today}).")

# ---------------------------------------------------------------------------
# Inbound Reply Tracking
# ---------------------------------------------------------------------------

def check_for_replies(db_path: str) -> None:
    """Check IMAP inbox for replies from leads we pitched."""

    imap_user     = os.environ.get("IMAP_USER",     "").strip()
    imap_password = os.environ.get("IMAP_PASSWORD", "").strip()
    imap_host     = os.environ.get("IMAP_HOST",     "imap.gmail.com").strip()

    if not (imap_user and imap_password):
        print("\n[IMAP Tracker] Credentials missing — skipping reply check.")
        return

    # Load sent-lead emails into a lookup dict  {sender_email → lead_id}
    with sqlite3.connect(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, email FROM leads
            WHERE email_status IN ('Sent', 'Sent (Dry Run)')
              AND email IS NOT NULL AND email != ''
        """)
        active_leads = {
            row[1].lower().strip(): row[0]
            for row in cursor.fetchall()
        }

    if not active_leads:
        print("\n[IMAP Tracker] No active leads awaiting replies.")
        return

    print(f"\n[IMAP Tracker] Connecting to {imap_host} …")
    replies_found = 0

    try:
        with imaplib.IMAP4_SSL(imap_host) as mail:
            mail.login(imap_user, imap_password)
            mail.select("INBOX")

            status, data = mail.search(None, "UNSEEN")
            if status != "OK" or not data[0]:
                status, data = mail.search(None, "ALL")

            if status != "OK" or not data[0]:
                print("  No messages found in inbox.")
                return

            email_ids = data[0].split()
            max_check = min(200, len(email_ids))
            print(f"  Scanning last {max_check} messages …")

            # FIX #6: correct slice — iterate from newest backwards, safely
            ids_to_scan = email_ids[-max_check:]   # last N items
            updated_ids = []

            for msg_id in reversed(ids_to_scan):
                res, msg_data = mail.fetch(msg_id, "(RFC822)")
                if res != "OK":
                    continue

                for part in msg_data:
                    if not isinstance(part, tuple):
                        continue
                    msg  = email_parser.message_from_bytes(part[1])
                    from_hdr = msg.get("From") or ""

                    # Robustly extract bare email addr from "Name <addr>" or plain addr
                    m = re.search(r'<([^>]+)>', from_hdr)
                    sender = (m.group(1) if m else from_hdr).lower().strip()

                    if sender in active_leads:
                        lead_id = active_leads[sender]
                        updated_ids.append((lead_id, sender))
                        replies_found += 1

            # Batch-update database
            if updated_ids:
                with sqlite3.connect(db_path) as conn:
                    for lead_id, sender in updated_ids:
                        conn.execute(
                            "UPDATE leads SET email_status='Replied', replied_at=? WHERE id=?",
                            (datetime.now().isoformat(), lead_id),
                        )
                        print(f"  [Reply] '{sender}' replied!")
                    conn.commit()

    except Exception as imap_err:
        print(f"  [IMAP Error] {imap_err}")

    if replies_found:
        print(f"  {replies_found} replies recorded.")
    else:
        print("  No new replies detected.")

# ---------------------------------------------------------------------------
# CLI Entry Point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Global Outreach — Scraper + Email Campaign Engine"
    )
    parser.add_argument("--dry-run",      action="store_true",
                        help="Log emails to console instead of sending")
    parser.add_argument("--limit",        type=int, default=25,
                        help="Max Google Maps results per single search (default: 25)")
    parser.add_argument("--target",       type=int, default=0,
                        help="Keep scraping until this many Old Website leads are collected today (0 = single run)")
    parser.add_argument("--max-iterations", type=int, default=20,
                        help="Safety cap: max search loops when using --target (default: 20)")
    parser.add_argument("--keyword",      type=str, default=None,
                        help="Override keyword (e.g. 'dentist')")
    parser.add_argument("--city",         type=str, default=None,
                        help="Override city (e.g. 'London')")
    parser.add_argument("--no-scrape",    action="store_true",
                        help="Skip scraping; run email + reply stages only")
    parser.add_argument("--no-email",     action="store_true",
                        help="Skip email + reply stages; run scraper only")
    args = parser.parse_args()

    # Load config
    try:
        with open(CONFIG_PATH, "r", encoding="utf-8") as fh:
            config = json.load(fh)
    except Exception as exc:
        print(f"[Error] Cannot load config.json: {exc}")
        sys.exit(1)

    init_db(DB_PATH)

    # Stage 1: Scrape
    if not args.no_scrape:
        try:
            if args.target > 0:
                # Target mode: loop until daily Old Website goal is met
                print(f"\n[Mode] TARGET mode — scraping until {args.target} Old Website leads collected today")
                asyncio.run(
                    scrape_until_target(
                        DB_PATH, config,
                        target=args.target,
                        limit=args.limit,
                        max_iters=args.max_iterations,
                    )
                )
            else:
                # Single run mode
                asyncio.run(
                    scrape_new_leads(
                        DB_PATH, config,
                        keyword_override=args.keyword,
                        city_override=args.city,
                        limit=args.limit,
                    )
                )
        except Exception as err:
            print(f"[Fatal] Scraping failed: {err}")

    # Stage 2: Check replies (before emailing, keeps state fresh)
    if not args.no_email:
        check_for_replies(DB_PATH)

    # Stage 3: Send outbound emails
    if not args.no_email:
        send_outreach_emails(DB_PATH, config, dry_run=args.dry_run)
