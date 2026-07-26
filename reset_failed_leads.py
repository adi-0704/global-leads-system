import sqlite3

for path, label in [('global-outreach/leads.db', 'GLOBAL'), ('india-outreach/leads.db', 'INDIA')]:
    conn = sqlite3.connect(path)
    cur = conn.cursor()
    cur.execute("UPDATE leads SET email_status = 'Not Sent' WHERE email_status = 'Failed'")
    print(f"{label}: Reset {cur.rowcount} Failed leads back to Not Sent.")
    conn.commit()
    conn.close()
