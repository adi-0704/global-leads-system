"""
main.py — Command-Line Interface for Google Maps Scraper
=========================================================
Run the scraper without the web UI, directly from your terminal.

Usage
-----
    python main.py --query "dentists" --location "Mumbai" --max 50 --format csv
    python main.py --query "coffee shops" --location "Delhi" --max 100 --format excel --emails
    python main.py --query "lawyers" --max 30 --format json --no-emails

Arguments
---------
  --query     (required) Search term, e.g. "dentists"
  --location  (optional) City/area filter, e.g. "Mumbai"
  --max       (optional) Maximum results to scrape. Default: 50
  --format    (optional) Output format: csv | json | excel. Default: csv
  --emails    (optional) Flag to enable email discovery (default: ON)
  --no-emails (optional) Flag to skip email discovery (faster)
  --visible   (optional) Show the browser window (useful for debugging)
  --out       (optional) Custom output path (without extension)

Output
------
  File is saved to ./results/<query>_<location>.<format>

Author  : Google Maps Scraper Project
"""

import argparse
import asyncio
import os
import sys
import time

# Ensure the project root is on the path when run directly
sys.path.insert(0, os.path.dirname(__file__))

from scraper import GoogleMapsScraper, BusinessRecord, EmailFinder
from scraper.exporters import export_csv, export_json, export_excel


# ---------------------------------------------------------------------------
# Argument parser
# ---------------------------------------------------------------------------

def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="maps_scraper",
        description="Scrape Google Maps for business Name, Phone, Email, Website & Address.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python main.py --query "dentists" --location "Mumbai" --max 50
  python main.py --query "lawyers" --location "Delhi" --max 100 --format excel
  python main.py --query "pizza" --location "New York" --max 200 --no-emails
        """,
    )

    parser.add_argument("--query",    required=True,  help='Search niche, e.g. "dentists"')
    parser.add_argument("--location", default="",     help='City/area, e.g. "Mumbai"')
    parser.add_argument("--max",      type=int, default=50, help="Max results (default: 50)")
    parser.add_argument(
        "--format", choices=["csv", "json", "excel"], default="csv",
        help="Export format: csv | json | excel (default: csv)"
    )
    parser.add_argument(
        "--emails", dest="emails", action="store_true", default=True,
        help="Enable email discovery by visiting websites (default: ON)"
    )
    parser.add_argument(
        "--no-emails", dest="emails", action="store_false",
        help="Skip email discovery (faster)"
    )
    parser.add_argument(
        "--visible", action="store_true", default=False,
        help="Show the Chromium browser window (useful for debugging)"
    )
    parser.add_argument(
        "--out", default=None,
        help="Custom output path without extension, e.g. results/my_data"
    )

    return parser


# ---------------------------------------------------------------------------
# Progress printer
# ---------------------------------------------------------------------------

def print_progress(count: int, total: int, start_time: float, label: str = "Scraped") -> None:
    """Print an inline progress line that updates in place."""
    pct     = int((count / total) * 100) if total else 0
    elapsed = time.time() - start_time
    speed   = count / elapsed if elapsed > 0 else 0
    bar_w   = 30
    filled  = int(bar_w * pct / 100)
    bar     = "█" * filled + "░" * (bar_w - filled)
    print(
        f"\r  [{bar}] {pct:>3}%  {count:>4}/{total}  "
        f"({speed:.1f} rec/s)  {label}…",
        end="",
        flush=True,
    )


# ---------------------------------------------------------------------------
# Async scrape runner
# ---------------------------------------------------------------------------

async def run_scrape(args: argparse.Namespace) -> None:
    """Async entry point: scrapes, enriches with emails, and exports."""

    query    = args.query.strip()
    location = args.location.strip()
    max_res  = args.max
    find_em  = args.emails
    headless = not args.visible

    # ── Header ────────────────────────────────────────────────────────────
    print("\n" + "=" * 60)
    print(f"  [Google Maps Scraper]")
    print("=" * 60)
    print(f"  Query    : {query}")
    print(f"  Location : {location or '(none)'}")
    print(f"  Max      : {max_res}")
    print(f"  Emails   : {'yes (visits websites)' if find_em else 'no (skipped)'}")
    print(f"  Browser  : {'visible' if args.visible else 'headless'}")
    print("=" * 60)

    records: list[BusinessRecord] = []
    start   = time.time()
    finder  = EmailFinder(delay=0.3) if find_em else None

    print("\n  Phase 1/2 - Scraping Google Maps...\n")

    async with GoogleMapsScraper(headless=headless, delay_ms=1600) as scraper:
        async for record in scraper.search(query, location, max_results=max_res):
            records.append(record)
            print_progress(len(records), max_res, start)

    print(f"\n\n  [DONE] Phase 1 - {len(records)} records scraped.")

    # ── Email enrichment ──────────────────────────────────────────────────
    if finder and records:
        print("\n  Phase 2/2 - Finding emails from websites...\n")
        em_start = time.time()
        for i, rec in enumerate(records, 1):
            if rec.website:
                rec.email = finder.find(rec.website)
            print_progress(i, len(records), em_start, "Emails")
        found_emails = sum(1 for r in records if r.email)
        print(f"\n\n  [DONE] Phase 2 - {found_emails}/{len(records)} emails found.")
    else:
        print("\n  [INFO] Email discovery skipped.")

    # ── Export ────────────────────────────────────────────────────────────
    safe_q   = "".join(c if c.isalnum() else "_" for c in query)
    safe_loc = "".join(c if c.isalnum() else "_" for c in location)
    base_name = (args.out or os.path.join("results", f"{safe_q}_{safe_loc}")).strip("_")

    print(f"\n  Exporting as {args.format.upper()}…")

    if args.format == "json":
        path = export_json(records, base_name + ".json")
    elif args.format == "excel":
        path = export_excel(records, base_name + ".xlsx")
    else:
        path = export_csv(records, base_name + ".csv")

    total_time = time.time() - start
    print(f"  [SAVED] --> {path}")
    print(f"  Total time: {total_time:.1f}s")
    print("=" * 60 + "\n")

    # ── Preview top 5 ─────────────────────────────────────────────────────
    if records:
        print("  Preview (first 5 records):")
        print(f"  {'Name':<28} {'Phone':<16} {'Email':<28}")
        print("  " + "─" * 72)
        for rec in records[:5]:
            print(
                f"  {rec.name[:27]:<28} "
                f"{rec.phone[:15]:<16} "
                f"{rec.email[:27]:<28}"
            )
        print()


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import sys
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    parser = build_parser()
    args   = parser.parse_args()
    asyncio.run(run_scrape(args))
