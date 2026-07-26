import sqlite3

def audit_db(path, name):
    print(f"=== {name} ({path}) ===")
    try:
        conn = sqlite3.connect(path)
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) FROM leads")
        total = cur.fetchone()[0]
        cur.execute("SELECT email_status, COUNT(*) FROM leads GROUP BY email_status")
        statuses = cur.fetchall()
        print(f"Total leads: {total}")
        print("Statuses:", dict(statuses))
        
        # Check today sends
        cur.execute("SELECT COUNT(*) FROM leads WHERE sent_at LIKE '2026-07-26%' OR followup_sent_at LIKE '2026-07-26%'")
        today_sent = cur.fetchone()[0]
        print(f"Sent today (2026-07-26): {today_sent}")

        # Check yesterday sends
        cur.execute("SELECT COUNT(*) FROM leads WHERE sent_at LIKE '2026-07-25%' OR followup_sent_at LIKE '2026-07-25%'")
        yesterday_sent = cur.fetchone()[0]
        print(f"Sent yesterday (2026-07-25): {yesterday_sent}")

        # Check latest 5 emails sent
        cur.execute("SELECT email, name, email_status, sent_at, followup_sent_at, email_error FROM leads WHERE email_status != 'Not Sent' ORDER BY id DESC LIMIT 5")
        rows = cur.fetchall()
        print("Recent non-Not-Sent rows:")
        for r in rows:
            print("  ", r)
    except Exception as e:
        print("Error:", e)
    print()

audit_db("global-outreach/leads.db", "GLOBAL OUTREACH")
audit_db("india-outreach/leads.db", "INDIA OUTREACH")
audit_db("../recruitment-leads-system/leads.db", "RECRUITMENT OUTREACH")
