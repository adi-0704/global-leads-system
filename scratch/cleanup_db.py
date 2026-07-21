import sqlite3

db_path = "global-outreach/leads.db"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Update leads with 'Old Website' or 'No Booking/AI' status but no email
res = cursor.execute("""
    UPDATE leads 
    SET status = 'Filtered (No Email)' 
    WHERE status IN ('Old Website', 'No Booking/AI') 
      AND (email IS NULL OR email = '' OR trim(email) = '')
""")
updated_count = res.rowcount

conn.commit()
conn.close()
print(f"Cleanup finished. Total leads updated to 'Filtered (No Email)': {updated_count}")
