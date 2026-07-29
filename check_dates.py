import sqlite3

def check_dates(path, name):
    print(f"=== {name} ({path}) ===")
    conn = sqlite3.connect(path)
    cur = conn.cursor()
    
    cur.execute("SELECT DISTINCT substr(scraped_at, 1, 10) FROM leads WHERE scraped_at IS NOT NULL AND scraped_at != ''")
    scraped_dates = [r[0] for r in cur.fetchall() if r[0]]
    print("scraped_at dates:", sorted(scraped_dates))
    
    cur.execute("SELECT DISTINCT substr(sent_at, 1, 10) FROM leads WHERE sent_at IS NOT NULL AND sent_at != ''")
    sent_dates = [r[0] for r in cur.fetchall() if r[0]]
    print("sent_at dates:", sorted(sent_dates))
    
    cur.execute("SELECT DISTINCT substr(followup_sent_at, 1, 10) FROM leads WHERE followup_sent_at IS NOT NULL AND followup_sent_at != ''")
    fu_dates = [r[0] for r in cur.fetchall() if r[0]]
    print("followup_sent_at dates:", sorted(fu_dates))
    print()

check_dates("global-outreach/leads.db", "GLOBAL")
check_dates("india-outreach/leads.db", "INDIA")
check_dates("../recruitment-leads-system/leads.db", "RECRUITMENT")
