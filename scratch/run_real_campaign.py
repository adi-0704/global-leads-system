# -*- coding: utf-8 -*-
import os
import sys
import json
import sqlite3

WORKSPACE_DIR = r"c:\Users\aditya tyagi\OneDrive\Desktop\antigravity\startup"
sys.path.insert(0, WORKSPACE_DIR)
sys.path.insert(0, os.path.join(WORKSPACE_DIR, "global-outreach"))

# Set real SMTP credentials
os.environ["SMTP_HOST"] = "smtp.gmail.com"
os.environ["SMTP_PORT"] = "587"
os.environ["SMTP_USER"] = "business.n8n25@gmail.com"
os.environ["SMTP_PASSWORD"] = "gtea ikdk yoat jekq"
os.environ["SMTP_FROM"] = "business.n8n25@gmail.com"

# Set IMAP credentials
os.environ["IMAP_HOST"] = "imap.gmail.com"
os.environ["IMAP_USER"] = "business.n8n25@gmail.com"
os.environ["IMAP_PASSWORD"] = "gtea ikdk yoat jekq"

import asyncio
from scrape_and_outreach import scrape_new_leads, send_outreach_emails

async def main():
    db_path = os.path.join(WORKSPACE_DIR, "global-outreach", "leads.db")
    config_path = os.path.join(WORKSPACE_DIR, "global-outreach", "config.json")
    
    with open(config_path, "r", encoding="utf-8") as fh:
        config = json.load(fh)

    # We will search in Birmingham (fresh city, many dentists) to collect new targets!
    print("Starting a real scrape in Birmingham to extract new clinics...")
    try:
        await scrape_new_leads(db_path, config, keyword_override="dentist", city_override="Birmingham", limit=20)
    except Exception as e:
        print(f"Scraper error: {e}")
        return

    # Trigger sending real emails (MIN_NEW_LEADS is bypassed by setting environment or running directly)
    print("\nStarting real outreach email stage for any newly found leads with emails...")
    
    # Temporarily patch MIN_NEW_LEADS to 0 in memory for this instant run
    import scrape_and_outreach
    scrape_and_outreach.MIN_NEW_LEADS = 0
    
    send_outreach_emails(db_path, config, dry_run=False)

if __name__ == "__main__":
    asyncio.run(main())
