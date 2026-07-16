"""
app.py — Flask Web Server & REST API
=====================================
Serves the web UI and exposes async scraping jobs via a REST API.

Endpoints
---------
  GET  /                          Serve the main UI page.
  POST /api/scrape                Start a scrape job.
                                  Body JSON: { query, location, max_results, find_emails }
                                  Returns: { job_id }
  GET  /api/status/<job_id>       Poll job progress.
                                  Returns: { status, count, total, done }
  GET  /api/results/<job_id>      Fetch collected records (live, paginated).
                                  Returns: { records: [...] }
  GET  /api/download/<job_id>     Download results as CSV / JSON / Excel.
                                  Query param: ?format=csv|json|excel

Author  : Google Maps Scraper Project
"""

import asyncio
import os
import threading
import uuid
from datetime import datetime
from typing import Dict, List

from flask import Flask, jsonify, render_template, request, send_file
from flask_cors import CORS

from scraper import GoogleMapsScraper, BusinessRecord, EmailFinder
from scraper.exporters import export_csv, export_json, export_excel


# ---------------------------------------------------------------------------
# App setup
# ---------------------------------------------------------------------------

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests (handy if UI is opened separately)

# Directory where temporary export files are stored
EXPORTS_DIR = os.path.join(os.path.dirname(__file__), "exports")
os.makedirs(EXPORTS_DIR, exist_ok=True)


# ---------------------------------------------------------------------------
# In-memory job store
# ---------------------------------------------------------------------------

# Structure:
#   jobs[job_id] = {
#       "status":  "running" | "done" | "error",
#       "count":   int,          # records scraped so far
#       "total":   int,          # max_results requested
#       "records": [BusinessRecord, ...],
#       "error":   str | None,
#       "started": datetime,
#   }
jobs: Dict[str, dict] = {}


# ---------------------------------------------------------------------------
# Routes — UI
# ---------------------------------------------------------------------------

@app.route("/")
def index():
    """Serve the main single-page application."""
    return render_template("index.html")


# ---------------------------------------------------------------------------
# Routes — API
# ---------------------------------------------------------------------------

@app.route("/api/scrape", methods=["POST"])
def start_scrape():
    """
    Start a new scrape job in a background thread.

    Request JSON
    ------------
    {
        "query":       str   — Search term, e.g. "dentists"
        "location":    str   — Location filter, e.g. "Mumbai"
        "max_results": int   — Max listings to scrape (default: 50)
        "find_emails": bool  — Whether to visit websites for emails (default: true)
    }

    Response JSON
    -------------
    { "job_id": str }
    """
    data = request.get_json(force=True)
    query       = (data.get("query") or "").strip()
    location    = (data.get("location") or "").strip()
    max_results = int(data.get("max_results") or 50)
    find_emails = bool(data.get("find_emails", True))

    if not query:
        return jsonify({"error": "query is required"}), 400

    job_id = str(uuid.uuid4())[:8]
    jobs[job_id] = {
        "status":  "running",
        "count":   0,
        "total":   max_results,
        "records": [],
        "error":   None,
        "started": datetime.now().isoformat(),
        "query":   query,
        "location": location,
    }

    # Run the async scraper in a separate daemon thread
    thread = threading.Thread(
        target=_run_scraper_thread,
        args=(job_id, query, location, max_results, find_emails),
        daemon=True,
    )
    thread.start()

    return jsonify({"job_id": job_id})


@app.route("/api/status/<job_id>")
def job_status(job_id: str):
    """
    Return current job status.

    Response JSON
    -------------
    {
        "status":   "running" | "done" | "error",
        "count":    int,
        "total":    int,
        "done":     bool,
        "error":    str | null
    }
    """
    job = jobs.get(job_id)
    if not job:
        return jsonify({"error": "job not found"}), 404

    return jsonify({
        "status":   job["status"],
        "count":    job["count"],
        "total":    job["total"],
        "done":     job["status"] in ("done", "error"),
        "error":    job["error"],
        "query":    job["query"],
        "location": job["location"],
    })


@app.route("/api/results/<job_id>")
def job_results(job_id: str):
    """
    Return all records collected so far for a job.

    Response JSON
    -------------
    { "count": int, "records": [ {...}, ... ] }
    """
    job = jobs.get(job_id)
    if not job:
        return jsonify({"error": "job not found"}), 404

    records = [r.to_dict() for r in job["records"]]
    return jsonify({"count": len(records), "records": records})


@app.route("/api/download/<job_id>")
def download_results(job_id: str):
    """
    Download results in the specified format.

    Query Parameters
    ----------------
    format : "csv" | "json" | "excel"  (default: "csv")

    Returns
    -------
    File attachment download.
    """
    job = jobs.get(job_id)
    if not job:
        return jsonify({"error": "job not found"}), 404

    fmt     = request.args.get("format", "csv").lower()
    records = job["records"]

    # Build a safe filename from query + location
    safe_q    = "".join(c if c.isalnum() else "_" for c in job["query"])
    safe_loc  = "".join(c if c.isalnum() else "_" for c in job.get("location", ""))
    base_name = f"{safe_q}_{safe_loc}".strip("_") or "results"
    base_path = os.path.join(EXPORTS_DIR, f"{job_id}_{base_name}")

    if fmt == "json":
        filepath = export_json(records, base_path + ".json")
        mime = "application/json"
        dl_name = base_name + ".json"
    elif fmt == "excel":
        filepath = export_excel(records, base_path + ".xlsx")
        mime = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        dl_name = base_name + ".xlsx"
    else:
        filepath = export_csv(records, base_path + ".csv")
        mime = "text/csv"
        dl_name = base_name + ".csv"

    return send_file(filepath, mimetype=mime, as_attachment=True, download_name=dl_name)


# ---------------------------------------------------------------------------
# Background scraper thread
# ---------------------------------------------------------------------------

def _run_scraper_thread(
    job_id: str,
    query: str,
    location: str,
    max_results: int,
    find_emails: bool,
) -> None:
    """
    Run the async scraper inside a new event loop (safe for threads).
    Populates jobs[job_id] with results and updates status.
    """
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        loop.run_until_complete(
            _async_scrape(job_id, query, location, max_results, find_emails)
        )
    except Exception as exc:
        jobs[job_id]["status"] = "error"
        jobs[job_id]["error"]  = str(exc)
    finally:
        loop.close()


async def _async_scrape(
    job_id: str,
    query: str,
    location: str,
    max_results: int,
    find_emails: bool,
) -> None:
    """Core async scraping coroutine called from the thread."""
    job = jobs[job_id]
    finder = EmailFinder(delay=0.4) if find_emails else None

    async with GoogleMapsScraper(headless=True) as scraper:
        async for record in scraper.search(query, location, max_results):
            # Optionally enrich with email from website
            if finder and record.website:
                record.email = finder.find(record.website)

            job["records"].append(record)
            job["count"] += 1

    job["status"] = "done"


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import sys
    sys.stdout.reconfigure(encoding="utf-8") if hasattr(sys.stdout, "reconfigure") else None
    print("\n[Maps Scraper] Web UI starting...")
    print("   Open http://localhost:5000 in your browser\n")
    app.run(debug=False, port=5000, threaded=True)
