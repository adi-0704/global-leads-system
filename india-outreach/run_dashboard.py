# -*- coding: utf-8 -*-
"""
run_dashboard.py — Local Flask Server for India Outreach Dashboard
===================================================================
Serves the dashboard UI at http://localhost:5003 and exposes API
endpoints that the frontend uses to read/write leads.db and config.json.

Start with:
    python india-outreach/run_dashboard.py
"""

import csv
import io
import json
import os
import sqlite3
import subprocess
import sys
import threading

from flask import Flask, jsonify, request, send_file
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

SCRIPT_DIR  = os.path.dirname(os.path.abspath(__file__))
DB_PATH     = os.path.join(SCRIPT_DIR, "leads.db")
CONFIG_PATH = os.path.join(SCRIPT_DIR, "config.json")

def _get_conn() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def ensure_db() -> None:
    if not os.path.exists(DB_PATH):
        if SCRIPT_DIR not in sys.path:
            sys.path.insert(0, SCRIPT_DIR)
        from scrape_and_outreach_india import init_db
        init_db(DB_PATH)

def sync_json():
    """Helper to auto-sync data.json whenever DB updates."""
    try:
        if SCRIPT_DIR not in sys.path:
            sys.path.insert(0, SCRIPT_DIR)
        import generate_data_json_india
        generate_data_json_india.main()
    except Exception as e:
        print(f"[Dashboard] Error syncing data.json: {e}")

@app.route("/")
def index():
    return send_file(os.path.join(SCRIPT_DIR, "dashboard.html"))

@app.route("/dashboard.css")
def css():
    return send_file(os.path.join(SCRIPT_DIR, "dashboard.css"), mimetype="text/css")

@app.route("/dashboard.js")
def js():
    return send_file(os.path.join(SCRIPT_DIR, "dashboard.js"), mimetype="application/javascript")

@app.route("/api/leads", methods=["GET"])
def get_leads():
    ensure_db()
    status_filter = request.args.get("status")
    email_filter  = request.args.get("email_status")

    sql    = "SELECT * FROM leads WHERE status != 'Filtered (No Email)'"
    params = []

    if status_filter:
        sql += " AND status = ?"
        params.append(status_filter)
    if email_filter:
        sql += " AND email_status = ?"
        params.append(email_filter)
    sql += " ORDER BY scraped_at DESC"

    with _get_conn() as conn:
        leads = [dict(row) for row in conn.execute(sql, params).fetchall()]

    return jsonify(leads)

@app.route("/api/stats", methods=["GET"])
def get_stats():
    ensure_db()
    sql = """
        SELECT
            COUNT(*)                                                                              AS total,
            SUM(status = 'No Website')                                                            AS no_website,
            SUM(status IN ('Old Website', 'No Booking/AI') AND email IS NOT NULL AND email != '') AS old_website,
            SUM(status = 'Modern Website')                                                        AS modern_website,
            SUM(email_status IN ('Sent','Sent (Dry Run)', 'Follow-Up Sent', 'Replied'))           AS sent,
            SUM(email_status = 'Follow-Up Sent')                                                  AS followup_sent,
            SUM(email_status = 'Replied')                                                         AS replied,
            SUM(email_status = 'Failed')                                                          AS failed
        FROM leads
        WHERE status != 'Filtered (No Email)'
    """
    with _get_conn() as conn:
        row = conn.execute(sql).fetchone()

    total        = row["total"]        or 0
    no_website   = row["no_website"]   or 0
    old_website  = row["old_website"]  or 0
    modern_website = row["modern_website"] or 0
    sent         = row["sent"]         or 0
    replied      = row["replied"]      or 0
    failed       = row["failed"]       or 0

    conversion = round(min(replied / sent * 100, 100) if sent > 0 else 0, 1)

    return jsonify({
        "total":           total,
        "no_website":      no_website,
        "old_website":     old_website,
        "modern_website":  modern_website,
        "sent":            sent,
        "replied":         replied,
        "failed":          failed,
        "conversion_rate": conversion,
    })

@app.route("/api/config", methods=["GET", "POST"])
def config_endpoint():
    if request.method == "GET":
        if not os.path.exists(CONFIG_PATH):
            return jsonify({"error": "config.json not found"}), 404
        with open(CONFIG_PATH, "r", encoding="utf-8") as fh:
            return jsonify(json.load(fh))

    new_config = request.get_json(force=True)
    if new_config is None:
        return jsonify({"error": "Invalid JSON body"}), 400
    with open(CONFIG_PATH, "w", encoding="utf-8") as fh:
        json.dump(new_config, fh, indent=2)
    return jsonify({"success": True, "message": "Configuration saved."})

@app.route("/api/sync", methods=["POST", "GET"])
def trigger_sync():
    """Trigger manual re-sync of data.json from leads.db."""
    sync_json()
    return jsonify({"success": True, "message": "India Outreach data.json successfully re-synced."})

@app.route("/api/trigger-scrape", methods=["POST"])
def trigger_scrape():
    data    = request.get_json(force=True) or {}
    limit   = int(data.get("limit", 20))
    keyword = data.get("keyword") or None
    city    = data.get("city")    or None
    dry_run = bool(data.get("dry_run", False))

    def _run_bg():
        script = os.path.join(SCRIPT_DIR, "scrape_and_outreach_india.py")
        cmd = [sys.executable, script, f"--limit={limit}"]
        if keyword:
            cmd += ["--keyword", keyword]
        if city:
            cmd += ["--city", city]
        if dry_run:
            cmd.append("--dry-run")
        print(f"[India Dashboard] Background job: {' '.join(cmd)}")
        subprocess.run(cmd, cwd=SCRIPT_DIR)
        sync_json()
        print("[India Dashboard] Background job finished.")

    threading.Thread(target=_run_bg, daemon=True).start()
    return jsonify({
        "success": True,
        "message": "India Scraper background task initiated. Refresh dashboard in ~60 seconds.",
    })

if __name__ == "__main__":
    ensure_db()
    sync_json()
    port = 5003
    print("=" * 60)
    print("  INDIA OUTREACH DASHBOARD — Local Server")
    print(f"  Open http://localhost:{port} in your browser")
    print("=" * 60)
    app.run(host="0.0.0.0", port=port, debug=False)
