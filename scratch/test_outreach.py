# -*- coding: utf-8 -*-
import sqlite3
import os
import sys

WORKSPACE_DIR = r"c:\Users\aditya tyagi\OneDrive\Desktop\antigravity\startup"
sys.path.insert(0, WORKSPACE_DIR)
sys.path.insert(0, os.path.join(WORKSPACE_DIR, "global-outreach"))

# Set email credentials
os.environ["SMTP_HOST"] = "smtp.gmail.com"
os.environ["SMTP_PORT"] = "587"
os.environ["SMTP_USER"] = "business.n8n25@gmail.com"
os.environ["SMTP_PASSWORD"] = "gtea ikdk yoat jekq"
os.environ["SMTP_FROM"] = "business.n8n25@gmail.com"

# Also set IMAP just in case
os.environ["IMAP_HOST"] = "imap.gmail.com"
os.environ["IMAP_USER"] = "business.n8n25@gmail.com"
os.environ["IMAP_PASSWORD"] = "gtea ikdk yoat jekq"

from scrape_and_outreach import send_outreach_emails, check_for_replies
import json

def main():
    db_path = os.path.join(WORKSPACE_DIR, "global-outreach", "leads.db")
    config_path = os.path.join(WORKSPACE_DIR, "global-outreach", "config.json")
    
    # 1. Clean existing test leads if any
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM leads WHERE name = 'Aditya Dental Care'")
    
    # 2. Insert fresh test lead
    print("Inserting test lead 'Aditya Dental Care' with target email business.n8n25@gmail.com...")
    cursor.execute("""
        INSERT INTO leads (
            name, phone, address, website, status, email,
            email_status, query, location, scraped_at,
            website_viewport, website_ssl,
            website_copyright_year, website_notes
        ) VALUES (
            'Aditya Dental Care', '123-456-7890', '123 Test St', 'https://example.com',
            'No Booking/AI', 'business.n8n25@gmail.com', 'Not Sent', 'dentist', 'Miami',
            '2026-07-16T12:00:00', 1, 1, 2026,
            'Issues found: no online booking (patients cannot schedule appointments from the website); no AI assistant or live chat (no way to answer patient questions after hours); no website analytics.'
        )
    """)
    conn.commit()
    conn.close()

    # 3. Load config
    with open(config_path, "r", encoding="utf-8") as fh:
        config = json.load(fh)

    # 4. Trigger outreach
    print("\n--- Triggering Real Email Dispatch ---")
    send_outreach_emails(db_path, config, dry_run=False)

if __name__ == "__main__":
    main()
