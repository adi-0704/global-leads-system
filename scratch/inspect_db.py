import sqlite3
import os

db_path = "india-outreach/leads.db"
if not os.path.exists(db_path):
    print("Database not found at:", db_path)
    exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

print("--- Total counts ---")
total = cursor.execute("SELECT COUNT(*) FROM leads").fetchone()[0]
print(f"Total rows in leads: {total}")

print("\n--- Group by Status & Email Status ---")
rows = cursor.execute("""
    SELECT status, email_status, COUNT(*), SUM(case when email is not null and email != '' then 1 else 0 end)
    FROM leads
    GROUP BY status, email_status
""").fetchall()

for status, email_status, count, with_email in rows:
    print(f"Status: {status:<25} | Email Status: {email_status:<15} | Count: {count:<5} | With Email: {with_email:<5}")

print("\n--- Failed emails error list ---")
failed = cursor.execute("SELECT name, email, email_error FROM leads WHERE email_status = 'Failed'").fetchall()
for name, email, err in failed:
    print(f"Name: {name} | Email: {email} | Error: {err}")

conn.close()
