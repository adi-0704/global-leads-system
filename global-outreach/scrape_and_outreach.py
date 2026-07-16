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
    r'(?:copyright|©|&copy;)\s*(?:20[0-2]\d\s*-\s*)?(20[0-2]\d)',
    re.IGNORECASE
)
_COPYRIGHT_FB = re.compile(
    r'copyright.*?\b(20[0-2]\d)\b',
    re.IGNORECASE | re.DOTALL
)

_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "en-US,en;q=0.9",
}


def analyze_website(url: str) -> dict:
    """
    Fetch *url* and check for three modernity signals:
      1. HTTPS / SSL redirect
      2. Mobile viewport meta-tag
      3. Copyright year <= 2022

    Returns a dict:
        ssl           : int  (1 = HTTPS, 0 = HTTP)
        viewport      : int  (1 = found, 0 = missing)
        copyright_year: int | None
        status        : str  ('No Website' | 'Old Website' | 'Modern Website')
        notes         : str  (human-readable reasons)
    """
    result = {
        "ssl": 0,
        "viewport": 0,
        "copyright_year": None,
        "status": "Old Website",
        "notes": "",
    }

    if not url or not url.strip():
        result["status"] = "No Website"
        result["notes"]  = "No website listed."
        return result

    fetch_url = url.strip()
    if not fetch_url.startswith(("http://", "https://")):
        fetch_url = "https://" + fetch_url

    try:
        resp = requests.get(
            fetch_url, timeout=8, headers=_HEADERS, allow_redirects=True
        )

        # SSL determined by final URL after redirects
        if resp.url.startswith("https://"):
            result["ssl"] = 1
        elif not url.startswith("https://"):
            result["notes"] += "HTTP-only (no SSL). "

        if not resp.ok:
            result["notes"] += f"Server returned HTTP {resp.status_code}. "
            return result

        html = resp.text

        # --- Viewport check ---
        if _VIEWPORT_RE.search(html):
            result["viewport"] = 1
        else:
            result["notes"] += "Missing mobile viewport meta tag. "

        # --- Copyright year check ---
        m = _COPYRIGHT_RE.search(html) or _COPYRIGHT_FB.search(html[:100_000])
        if m:
            year = int(m.group(1))
            result["copyright_year"] = year
            if year <= 2022:
                result["notes"] += f"Outdated copyright year ({year}). "

        # --- Determine final status ---
        is_old = (
            result["ssl"] == 0
            or result["viewport"] == 0
            or (result["copyright_year"] and result["copyright_year"] <= 2022)
        )
        if is_old:
            result["status"] = "Old Website"
            if not result["notes"].strip():
                result["notes"] = "Outdated design indicators found."
        else:
            result["status"] = "Modern Website"
            result["notes"]  = "Website is secure and responsive."

    except requests.exceptions.Timeout:
        result["notes"]  = "Website request timed out."
        result["status"] = "Old Website"
    except requests.exceptions.ConnectionError:
        result["notes"]  = "Could not connect to website."
        result["status"] = "Old Website"
    except Exception as exc:
        result["notes"]  = f"Analysis error: {exc}."
        result["status"] = "Old Website"

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
                print(f"      → {analysis['status']}  {analysis['notes'].strip()}")

                # Discover email only for Old Website leads (they are our email targets)
                email = ""
                if website and analysis["status"] == "Old Website":
                    print("      → Searching for contact email…")
                    email = email_finder.find(website)
                    print(f"      → Email: {email or 'not found'}")

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
                        website, analysis["status"], email,
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

# ---------------------------------------------------------------------------
# Outbound Email Campaigns
# ---------------------------------------------------------------------------

def send_outreach_emails(db_path: str, config: dict, dry_run: bool = False) -> None:
    """Send up to `daily_email_limit` outreach emails for Old Website leads."""

    smtp_user     = os.environ.get("SMTP_USER",     "").strip()
    smtp_password = os.environ.get("SMTP_PASSWORD", "").strip()
    smtp_host     = os.environ.get("SMTP_HOST",     "smtp.gmail.com").strip()
    smtp_port     = int(os.environ.get("SMTP_PORT", "587"))
    smtp_from     = os.environ.get("SMTP_FROM",     smtp_user).strip()

    is_dry_run = dry_run or not (smtp_user and smtp_password)

    with sqlite3.connect(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, name, email, website, query, location
            FROM leads
            WHERE status       = 'Old Website'
              AND email_status = 'Not Sent'
              AND email        IS NOT NULL
              AND email        != ''
            LIMIT ?
        """, (config["daily_email_limit"],))
        leads_to_email = cursor.fetchall()

    if not leads_to_email:
        print("\n[Outreach] No eligible leads in queue.")
        return

    print(f"\n[Outreach] {len(leads_to_email)} leads to contact today.")
    if is_dry_run:
        print("  [DRY-RUN] Emails will be logged, not dispatched.")

    sent_count = 0

    with sqlite3.connect(db_path) as conn:
        cursor = conn.cursor()

        for lead_id, name, email, website, query_term, location in leads_to_email:

            # Resolve niche from keyword
            niche = "dental"
            for kw in config["keywords"]:
                if kw["term"].lower() in (query_term or "").lower():
                    niche = kw["niche"]
                    break

            template  = config["email_templates"][niche]
            promo_url = config["promo_urls"][niche]
            subject   = template["subject"].format(business_name=name)
            body      = template["body"].format(
                business_name=name,
                website_url=website or "your website",
                promo_url=promo_url,
            )

            if is_dry_run:
                print(f"\n  [DRY-RUN] → {email}  |  {name}")
                print(f"  Subject : {subject}")
                print(f"  Preview : {body[:180]}…")
                cursor.execute(
                    "UPDATE leads SET email_status='Sent (Dry Run)', sent_at=? WHERE id=?",
                    (datetime.now().isoformat(), lead_id),
                )
                sent_count += 1
                continue

            # FIX #5: Use context manager so the socket is always closed
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
                print(f"  [Sent] {email}  |  {name}")
                sent_count += 1
                time.sleep(1.5)   # polite delay between sends

            except Exception as mail_err:
                # FIX #4: write error to dedicated email_error column, preserve website_notes
                print(f"  [Error] {email}: {mail_err}")
                cursor.execute(
                    "UPDATE leads SET email_status='Failed', email_error=? WHERE id=?",
                    (str(mail_err), lead_id),
                )

        conn.commit()

    print(f"[Outreach] Finished. {sent_count} emails dispatched.")

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
    parser.add_argument("--dry-run",   action="store_true",
                        help="Log emails to console instead of sending")
    parser.add_argument("--limit",     type=int, default=20,
                        help="Max Google Maps results per search (default: 20)")
    parser.add_argument("--keyword",   type=str, default=None,
                        help="Override keyword (e.g. 'dentist')")
    parser.add_argument("--city",      type=str, default=None,
                        help="Override city (e.g. 'London')")
    parser.add_argument("--no-scrape", action="store_true",
                        help="Skip scraping; run email + reply stages only")
    parser.add_argument("--no-email",  action="store_true",
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
