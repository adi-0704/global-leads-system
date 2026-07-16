"""
clean_csv.py - Deduplicates and cleans the scraped dermatologist CSV
"""
import csv

input_path  = r'results\dermatologist_Delhi.csv'
output_path = r'results\dermatologist_Delhi_clean.csv'

rows = []
with open(input_path, encoding='utf-8-sig') as f:
    reader = csv.DictReader(f)
    for row in reader:
        rows.append(row)

# 1. Remove noise rows (Name is 'Results' or empty) — headers are capitalized
rows = [r for r in rows if r['Name'].strip() not in ('', 'Results')]

# 2. Remove false-positive emails (sentry, wix noise)
BAD_EMAIL_DOMAINS = ['sentry', 'wixpress', 'wix.com', 'example.com', 'schema.org']
for r in rows:
    email = r.get('Email', '')
    if any(b in email.lower() for b in BAD_EMAIL_DOMAINS):
        r['Email'] = ''

# 3. Deduplicate by (Name + Phone) — keep first occurrence only
seen = set()
deduped = []
for r in rows:
    key = (r['Name'].strip().lower(), r['Phone'].strip())
    if key not in seen:
        seen.add(key)
        deduped.append(r)

# 4. Write clean output CSV (use same capitalized headers as original)
FIELDS = ['Name', 'Phone', 'Email', 'Website', 'Address', 'Scraped At']
with open(output_path, 'w', newline='', encoding='utf-8-sig') as f:
    writer = csv.DictWriter(f, fieldnames=FIELDS)
    writer.writeheader()
    writer.writerows(deduped)

# 5. Print summary
total    = len(deduped)
emails   = sum(1 for r in deduped if r['Email'])
websites = sum(1 for r in deduped if r['Website'])

print("=" * 60)
print("  CSV CLEAN - SUMMARY")
print("=" * 60)
print(f"  Total unique records : {total}")
print(f"  With email           : {emails}")
print(f"  With website         : {websites}")
print(f"  Saved to             : {output_path}")
print("=" * 60)
print()
print("  PREVIEW (first 15 records):")
print(f"  {'#':<4} {'Name':<38} {'Phone':<16} {'Email':<32} {'Website'}")
print("  " + "-" * 110)
for i, r in enumerate(deduped[:15], 1):
    name    = r['Name'][:37]
    phone   = r['Phone'][:15]
    email   = r['Email'][:31]
    website = r['Website'][:40]
    print(f"  {i:<4} {name:<38} {phone:<16} {email:<32} {website}")
