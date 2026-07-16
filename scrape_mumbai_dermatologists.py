"""
scrape_mumbai_dermatologists.py
================================
Scrapes ALL dermatologists across Mumbai by running multiple targeted
searches (different areas + query terms), then merges and deduplicates
into a single clean CSV.

Searches run:
  1. dermatologist        → Mumbai
  2. skin specialist      → Mumbai
  3. skin clinic          → Mumbai
  4. dermatologist        → South Mumbai
  5. dermatologist        → Andheri Mumbai
  6. dermatologist        → Bandra Mumbai
  7. dermatologist        → Borivali Mumbai
  8. dermatologist        → Thane
  9. dermatologist        → Navi Mumbai
  10. dermatologist       → Powai Mumbai
  11. dermatologist       → Malad Mumbai
  12. skin doctor         → Mumbai

Output: results/dermatologist_Mumbai_clean.csv
"""

import asyncio
import csv
import os
import sys
import time

sys.path.insert(0, os.path.dirname(__file__))

from scraper import GoogleMapsScraper, BusinessRecord, EmailFinder


# ---------------------------------------------------------------------------
# Search plan — (query, location) pairs
# ---------------------------------------------------------------------------

SEARCH_PLAN = [
    ("dermatologist",   "Mumbai"),
    ("skin specialist", "Mumbai"),
    ("skin clinic",     "Mumbai"),
    ("dermatologist",   "South Mumbai"),
    ("dermatologist",   "Andheri Mumbai"),
    ("dermatologist",   "Bandra Mumbai"),
    ("dermatologist",   "Borivali Mumbai"),
    ("dermatologist",   "Thane"),
    ("dermatologist",   "Navi Mumbai"),
    ("dermatologist",   "Powai Mumbai"),
    ("dermatologist",   "Malad Mumbai"),
    ("skin doctor",     "Mumbai"),
]

MAX_PER_SEARCH = 100    # Max listings per individual search
EMAIL_DELAY    = 0.35   # Seconds between website visits

# Bad email domain fragments (noise / false-positives)
BAD_EMAIL_DOMAINS = [
    "sentry", "wixpress", "wix.com", "example.com",
    "schema.org", "w3.org", "google.com",
]

OUTPUT_DIR  = "results"
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "dermatologist_Mumbai_clean.csv")
RAW_FILE    = os.path.join(OUTPUT_DIR, "dermatologist_Mumbai_raw.csv")


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def is_noise_name(name: str) -> bool:
    """Return True if the record's name is clearly not a real clinic."""
    stripped = name.strip().lower()
    return stripped in ("", "results", "more results")


def is_bad_email(email: str) -> bool:
    """Return True if the email is a known false-positive."""
    if not email:
        return False
    return any(b in email.lower() for b in BAD_EMAIL_DOMAINS)


def dedup_records(records: list) -> list:
    """
    Deduplicate records by (name.lower + phone).
    When two records have the same key, prefer the one with more data.
    """
    best: dict = {}
    for rec in records:
        key = (rec.name.strip().lower(), rec.phone.strip())
        if key not in best:
            best[key] = rec
        else:
            # Prefer record with more fields filled
            existing = best[key]
            if (bool(rec.email) + bool(rec.website)) > (bool(existing.email) + bool(existing.website)):
                best[key] = rec
    return list(best.values())


def save_csv(records: list, filepath: str) -> None:
    """Write a list of BusinessRecord objects to a CSV file."""
    os.makedirs(os.path.dirname(filepath) or ".", exist_ok=True)
    fields = ["Name", "Phone", "Email", "Website", "Address", "Scraped At"]
    with open(filepath, "w", newline="", encoding="utf-8-sig") as f:
        writer = csv.writer(f)
        writer.writerow(fields)
        for r in records:
            writer.writerow([r.name, r.phone, r.email, r.website, r.address, r.scraped_at])


def print_banner(text: str) -> None:
    print("\n" + "=" * 65)
    print(f"  {text}")
    print("=" * 65)


def print_progress(done: int, total: int, start: float, label: str = "Scraped") -> None:
    pct    = int((done / total) * 100) if total else 0
    elapsed = time.time() - start
    speed  = done / elapsed if elapsed > 0 else 0
    bar_w  = 28
    filled = int(bar_w * pct / 100)
    bar    = "#" * filled + "." * (bar_w - filled)
    print(f"\r  [{bar}] {pct:>3}%  {done:>4}/{total}  ({speed:.1f}/s)  {label}", end="", flush=True)


# ---------------------------------------------------------------------------
# Main scrape routine
# ---------------------------------------------------------------------------

async def run_all_searches() -> list:
    """Run all searches and return a merged list of BusinessRecord objects."""

    all_records: list[BusinessRecord] = []
    total_searches = len(SEARCH_PLAN)

    async with GoogleMapsScraper(headless=True, delay_ms=1500) as scraper:
        for idx, (query, location) in enumerate(SEARCH_PLAN, 1):
            print_banner(f"Search {idx}/{total_searches}: '{query}' in '{location}'")
            batch: list[BusinessRecord] = []
            start = time.time()

            try:
                async for record in scraper.search(query, location, max_results=MAX_PER_SEARCH):
                    batch.append(record)
                    print_progress(len(batch), MAX_PER_SEARCH, start)
            except Exception as e:
                print(f"\n  [WARN] Search failed: {e}")

            print(f"\n  --> Got {len(batch)} records from this search.")
            all_records.extend(batch)

    return all_records


async def main() -> None:
    start_total = time.time()

    print_banner("Mumbai Dermatologist Scraper - STARTING")
    print(f"  Searches planned : {len(SEARCH_PLAN)}")
    print(f"  Max per search   : {MAX_PER_SEARCH}")
    print(f"  Email discovery  : YES")
    print(f"  Output           : {OUTPUT_FILE}")

    # ── Phase 1: Scrape all searches ─────────────────────────────────────
    print_banner("PHASE 1 / 3 - Scraping Google Maps")
    raw_records = await run_all_searches()

    print_banner(f"Phase 1 complete: {len(raw_records)} total raw records")

    # Save raw file for reference
    save_csv(raw_records, RAW_FILE)
    print(f"  Raw file saved: {RAW_FILE}")

    # ── Phase 2: Email discovery ─────────────────────────────────────────
    print_banner("PHASE 2 / 3 - Finding Emails from Websites")

    finder = EmailFinder(delay=EMAIL_DELAY, check_contact_pages=True)
    needs_email = [r for r in raw_records if r.website and not r.email]
    print(f"  Visiting {len(needs_email)} websites for emails...")

    em_start = time.time()
    for i, rec in enumerate(needs_email, 1):
        rec.email = finder.find(rec.website)
        print_progress(i, len(needs_email), em_start, "Emails")

    found = sum(1 for r in raw_records if r.email)
    print(f"\n  Emails found: {found} / {len(raw_records)}")

    # ── Phase 3: Clean + deduplicate ─────────────────────────────────────
    print_banner("PHASE 3 / 3 - Cleaning & Deduplicating")

    # Remove noise names
    cleaned = [r for r in raw_records if not is_noise_name(r.name)]
    print(f"  After noise removal    : {len(cleaned)}")

    # Clean bad emails
    for r in cleaned:
        if is_bad_email(r.email):
            r.email = ""

    # Deduplicate
    unique = dedup_records(cleaned)
    print(f"  After deduplication    : {len(unique)}")

    # Sort by name
    unique.sort(key=lambda r: r.name.lower())

    # Save final clean CSV
    save_csv(unique, OUTPUT_FILE)

    # ── Final summary ─────────────────────────────────────────────────────
    total_time = time.time() - start_total
    emails_found  = sum(1 for r in unique if r.email)
    websites_found = sum(1 for r in unique if r.website)

    print_banner("COMPLETE!")
    print(f"  Unique dermatologists : {len(unique)}")
    print(f"  With email            : {emails_found}")
    print(f"  With website          : {websites_found}")
    print(f"  Total time            : {total_time/60:.1f} minutes")
    print(f"  Clean CSV saved to    : {OUTPUT_FILE}")
    print("=" * 65)

    # Preview first 20
    print("\n  PREVIEW (first 20 unique records):")
    print(f"  {'#':<4} {'Name':<36} {'Phone':<16} {'Email':<30} {'Has Website'}")
    print("  " + "-" * 100)
    for i, r in enumerate(unique[:20], 1):
        has_web = "Yes" if r.website else "No"
        print(f"  {i:<4} {r.name[:35]:<36} {r.phone[:15]:<16} {r.email[:29]:<30} {has_web}")

    print(f"\n  Full file: {os.path.abspath(OUTPUT_FILE)}\n")


if __name__ == "__main__":
    asyncio.run(main())
