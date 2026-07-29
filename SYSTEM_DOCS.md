# 🚀 Global AI Outreach System — Master Documentation

> **Version 2.0** | Author: Aditya Tyagi | Last Updated: July 2026

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Architecture — The DAG](#2-architecture--the-dag)
3. [Workflows](#3-workflows)
4. [Intelligence Modules](#4-intelligence-modules)
5. [Dashboards](#5-dashboards)
6. [Email Safety & Deliverability](#6-email-safety--deliverability)
7. [Configuration Reference](#7-configuration-reference)
8. [GitHub Actions](#8-github-actions)
9. [Resilience & Error Handling](#9-resilience--error-handling)
10. [Module API Reference](#10-module-api-reference)
11. [Deployment Guide](#11-deployment-guide)
12. [Troubleshooting](#12-troubleshooting)

---

## 1. System Overview

The Global AI Outreach System is a fully automated B2B email outreach platform that:

- **Scrapes** potential clients (dental/dermatology clinics, recruitment agencies) from Google Maps
- **Validates** emails via MX record checks before sending
- **Scores** leads 0–100 to prioritise the best prospects
- **Sends** personalised outreach emails via Gmail SMTP with anti-spam compliance
- **Tracks** replies via IMAP and auto-detects unsubscribes
- **Follows up** with leads who didn't reply after 5+ days
- **Deduplicates** across all 3 workflows (same email never contacted twice)
- **Reports** a daily HTML summary email to the operator

### Three Workflows

| Workflow | Trigger | Email Account | Target Niche |
|----------|---------|---------------|-------------|
| **Global Outreach** | Daily 2:30 PM IST | cupboard587@gmail.com | Dental/derma clinics (global) |
| **India Outreach** | Daily 10:00 AM IST | cupboard587@gmail.com | Medical clinics (India, 35+ niches) |
| **Recruitment** | Daily (configurable) | aditya.airecruitment@gmail.com | Recruitment agencies |

---

## 2. Architecture — The DAG

Every workflow is modelled as a **Directed Acyclic Graph (DAG)** using `workflow_graph.py`.

```
[Config Load] ──→ [DB Init] ──→ [Bounce Guard]
                                      │
                    ┌─────────────────┴─────────────────┐
                    ▼                                   ▼
             [Scraper]                         [Reply Checker]   ← PARALLEL
             (Google Maps)                     (IMAP inbox)
                    └─────────────────┬─────────────────┘
                                      ▼
                            [Email Validator]
                            (MX record check)
                                      ▼
                             [Lead Scorer]
                             (0–100 score)
                    ┌─────────────────┴─────────────────┐
                    ▼                                   ▼
            [Email Sender]                    [Follow-Up Sender]  ← PARALLEL
                    └─────────────────┬─────────────────┘
                                      ▼
                            [Data Exporter]
                            (data.json → dashboard)
                                      ▼
                              [Git Sync]
                              (push to GitHub)
                                      ▼
                            [Run Summary Email]
                            (HTML report to operator)
```

### Why DAG?

| Approach | Scraper fails → | Email still sends? | Time |
|----------|----------------|-------------------|------|
| **Old (linear)** | Crash, everything stops | ❌ No | ~50 min |
| **New (DAG)** | Scraper node FAILED, marked non-critical | ✅ Yes | ~30 min |

**Key optimisation**: `[Scraper]` and `[Reply Checker]` run in **parallel** (no dependency between them). Same for `[Email Sender]` and `[Follow-Up Sender]`. This saves ~40% runtime.

---

## 3. Workflows

### 3.1 Directory Structure

```
startup/
├── global-outreach/
│   ├── scrape_and_outreach.py      # Main script
│   ├── generate_data_json.py       # Dashboard data generator
│   ├── run_dashboard.py            # Local Flask dashboard server
│   ├── dashboard.html              # Dashboard UI
│   ├── dashboard.js                # Dashboard logic (auto-refresh 60s)
│   ├── dashboard.css               # Dashboard styles
│   ├── config.json                 # All configuration
│   ├── leads.db                    # SQLite database
│   ├── data.json                   # Dashboard data (auto-generated)
│   ├── email_intelligence.py       # Copy of intelligence module
│   ├── dedup_engine.py             # Copy of dedup module
│   └── email_safety.py             # Copy of safety module
│
├── india-outreach/
│   └── [same structure]
│
├── email_safety.py                 # Anti-spam email sender
├── email_intelligence.py           # MX validation, scoring, summaries
├── dedup_engine.py                 # Cross-workflow deduplication
├── workflow_graph.py               # DAG workflow orchestrator
├── global_dedup.db                 # Shared cross-workflow dedup DB
│
└── .github/workflows/
    ├── global_outreach.yml
    ├── india_outreach.yml
    └── (recruitment has its own repo)

recruitment-leads-system/
├── scrape_and_outreach.py
├── generate_data_json.py
├── dashboard.html / .js / .css
├── email_intelligence.py
├── dedup_engine.py
├── email_safety.py
└── .github/workflows/outreach.yml
```

### 3.2 How a Run Works (Step by Step)

1. **GitHub Actions triggers** the workflow (cron schedule or manual)
2. **Python installed**, dependencies installed from `requirements.txt`
3. **Playwright Chromium** installed for headless scraping
4. **Main script runs** with resilience wrapper:
   - If scraping fails → retries with `--no-scrape` flag (emails from existing DB)
5. Inside the script (for each iteration):
   - Load config from `config.json`
   - Check bounce rate — pause if >5%
   - **Scrape Google Maps** for new leads (unless `--no-scrape`)
   - **Check IMAP** for new replies simultaneously
   - Validate all new lead emails via MX check
   - Score leads — send highest-scoring first
   - **Skip leads already in `global_dedup.db`** (cross-workflow dedup)
   - Send emails with 300s (5 min) gap between each
   - Mark each sent email in `global_dedup.db`
   - Auto-detect unsubscribes in replies
   - Send follow-up emails to leads 5+ days old with no reply
6. **Export `data.json`** (dashboard data) — always runs, even if emails failed
7. **Git commit & push** — always runs
8. **Send run summary** HTML email to operator

---

## 4. Intelligence Modules

### 4.1 `email_intelligence.py`

The brain of the email system.

#### MX Validation

```python
from email_intelligence import validate_email_full

ok, reason = validate_email_full("dr.smith@clinic.com")
if not ok:
    print(f"Skipping: {reason}")
    # e.g. "No MX records for domain: clinic.com"
```

Results are **cached for 1 hour** to avoid redundant DNS lookups.

#### Lead Scoring

```python
from email_intelligence import score_lead

score = score_lead(
    status="No Website",    # +30 points
    email_status="Not Sent",
    location="Mumbai",      # +10 points (Tier 1)
    has_email=True,         # +10 points
    has_phone=True,         # +5 points
)
# → 105 → clamped to 100
```

| Factor | Points |
|--------|--------|
| No website | +30 |
| Old/outdated website | +25 |
| No booking/AI | +20 |
| Tier 1 city | +10 |
| Has email | +10 |
| Has phone | +5 |
| Tier 2 city | +5 |
| Already emailed | -20 |
| Failed delivery | -30 |
| Modern website | -50 |
| Already replied | -100 |
| Unsubscribed | -200 |

#### Subject Line A/B Rotation

```python
from email_intelligence import rotate_subject

# Deterministic per-recipient (same email = same subject = proper reply threading)
subject = rotate_subject("cold_outreach", "City Dental", seed="dr@citydental.com")
# → "Quick question about City Dental's online presence"

# Rotates through 8 templates per category
```

#### Daily Run Summary Email

```python
from email_intelligence import send_run_summary

send_run_summary(
    workflow_name = "India Outreach",
    stats = {
        "emails_sent": 22,
        "leads_scraped": 48,
        "followups_sent": 5,
        "replies_found": 3,
        "duration_seconds": 1842,
        "total_in_db": 1247,
    },
    smtp_user  = "cupboard587@gmail.com",
    smtp_pass  = "ykzv xkxl vecb dlgx",
    recipient  = "aditya.airecruitment@gmail.com",
)
```

Sends a **beautiful dark HTML email** with metric cards.

#### Bounce Guard

```python
from email_intelligence import check_bounce_guard

ok, msg = check_bounce_guard("leads.db", max_bounce_rate=0.05)
if not ok:
    print(f"PAUSING: {msg}")  # "Bounce rate 8.3% exceeds 5% ..."
```

### 4.2 `dedup_engine.py`

Cross-workflow deduplication via shared `global_dedup.db`.

```python
from dedup_engine import dedup   # module-level singleton

# Before sending
if not dedup.is_sendable("dr@clinic.com"):
    continue  # Already contacted by Global or India workflow

# After sending
dedup.mark_contacted("dr@clinic.com", "India Outreach", "cupboard587@gmail.com")

# Auto-detect unsubscribes from replies
if dedup.scan_reply_for_unsubscribe(sender_email, reply_body):
    print("Auto-unsubscribed")   # Added to permanent list

# Bulk filter (single DB query for efficiency)
sendable, skipped = dedup.filter_sendable([l['email'] for l in leads])
print(f"Skipping {len(skipped)} already-contacted leads")

# Statistics
stats = dedup.get_stats()
# {'total_contacted': 1842, 'today_count': 22, 'by_workflow': {...}}
```

### 4.3 `workflow_graph.py`

DAG orchestrator for parallel task execution.

```python
from workflow_graph import WorkflowGraph, WorkflowNode

graph = WorkflowGraph("My Workflow")

graph.add_node(WorkflowNode("config",  "Load Config",   load_config, deps=[]))
graph.add_node(WorkflowNode("scraper", "Scrape Maps",   run_scraper, deps=["config"], critical=False))
graph.add_node(WorkflowNode("replies", "Check Replies", run_imap,    deps=["config"], critical=False))
graph.add_node(WorkflowNode("sender",  "Send Emails",   send_emails, deps=["scraper", "replies"]))
graph.add_node(WorkflowNode("export",  "Export JSON",   export_data, deps=["sender"]))

# Prints the ASCII graph before running
print(graph.ascii_graph())

import asyncio
report = asyncio.run(graph.execute())
print(report.summary())

if not report.succeeded:
    sys.exit(1)
```

Key features:
- **Kahn's Algorithm** for topological sort → execution layers
- **asyncio.gather** for parallel execution within each layer
- **Critical path identification** — shows the bottleneck
- **Retry logic** per node with configurable retries + delay
- **Timeout** per node to prevent runaway tasks
- **Isolated failures** — non-critical node failure doesn't block others

---

## 5. Dashboards

All 3 dashboards share the same design pattern.

### Features

| Feature | Description |
|---------|-------------|
| **Auto-refresh** | Every 60 seconds, pulls latest `data.json` |
| **Today filter** | Shows emails sent TODAY (by `sent_at`, not `scraped_at`) |
| **KPI cards** | Total leads, emails sent, replies, follow-ups |
| **Lead table** | Sortable, filterable, paginated |
| **Status badges** | Color-coded by email status |
| **Refresh countdown** | Live "Refresh in Xs" counter in status bar |
| **Error resilience** | No page-breaking alerts — errors show inline |

### Running Locally

```bash
# Global dashboard: http://localhost:5002
python global-outreach/run_dashboard.py

# India dashboard: http://localhost:5003
python india-outreach/run_dashboard.py

# Recruitment dashboard: http://localhost:5001
cd recruitment-leads-system && python run_dashboard.py
```

### GitHub Pages (Static Mode)

Dashboards auto-detect if running on GitHub Pages (no API available) and fetch `data.json` directly from the repo.

---

## 6. Email Safety & Deliverability

### What `email_safety.py` Does

Every email sent goes through `send_safe_email()` which adds:

| Header | Value | Purpose |
|--------|-------|---------|
| `Message-ID` | `<unique@domain.com>` | Prevents threading issues |
| `Date` | Current RFC 2822 date | Prevents spam filters |
| `List-Unsubscribe` | `mailto:` link | Gmail compliance |
| `List-Unsubscribe-Post` | `One-Click` | RFC 8058 compliance |

Plus an unsubscribe footer in every email body.

### Rate Limiting

```json
{
  "daily_email_limit": 25,
  "send_gap_seconds": 300,
  "followup_max_per_day": 10
}
```

- **25 emails/day** maximum (well below Gmail's 500/day limit)
- **5 minutes** between each send (appears human-like)
- **10 follow-ups/day** maximum

### Bounce Protection

- MX validation before every send (blocks bad domains)
- `check_bounce_guard()` pauses campaigns if bounce rate > 5%
- Failed sends marked in DB — never retried automatically
- Permanent unsubscribe list shared across all workflows

---

## 7. Configuration Reference

Each workflow has a `config.json`. Key fields:

```json
{
  "daily_email_limit":    25,
  "send_gap_seconds":    300,
  "followup_max_per_day": 10,
  "follow_up_days":        5,
  "smtp_user": "cupboard587@gmail.com",
  "smtp_password": "ykzv xkxl vecb dlgx",
  "imap_user": "cupboard587@gmail.com",
  "imap_password": "ykzv xkxl vecb dlgx",
  "keywords": [
    { "term": "dentist", "niche": "dental" },
    { "term": "dermatologist", "niche": "derma" }
  ],
  "cities": ["Mumbai", "Delhi", "Bangalore"],
  "email_templates": {
    "outreach": {
      "subject": "Quick website audit for {business_name}",
      "body": "Hi there,\n\n..."
    },
    "followup": {
      "subject": "Re: Quick website audit for {business_name}",
      "body": "Hi there,\n\n..."
    }
  },
  "promo_urls": {
    "dental": "https://example.com/dental",
    "general": "https://example.com"
  }
}
```

---

## 8. GitHub Actions

### Schedules

| Workflow | Cron | IST Time |
|----------|------|----------|
| Global | `0 9 * * *` | 2:30 PM |
| India | `30 4 * * *` | 10:00 AM |
| Recruitment | Configurable | — |

### Resilience Pattern

All 3 workflows use a **two-stage resilience pattern**:

```bash
# Stage 1: Try full run (scrape + email)
if ! python script.py $ARGS; then

  # Stage 2: Scraper failed — retry with --no-scrape
  # This still sends emails from existing leads in the DB
  python script.py $ARGS --no-scrape || echo "Both stages failed"
fi
```

### Always-Run Steps

The following steps run even if the main script fails (`if: always()`):
- `Export data.json` — dashboard always has latest data
- `Commit Results` — DB always pushed to GitHub
- Run summary email is sent regardless of outcome

### Manual Trigger

Go to **Actions → [Workflow] → Run workflow**:
- `dry_run=true` — logs what would happen, no emails sent
- `no_scrape=true` — sends from existing DB only
- `target=30` — override daily target
- `limit=20` — override scrape results per search

---

## 9. Resilience & Error Handling

### Error Hierarchy

| Error Type | Behaviour |
|-----------|-----------|
| Scraper crash (Playwright timeout) | Non-critical → falls back to `--no-scrape` |
| Single SMTP send failure | Retried 2x, then marked `Failed`, continues |
| IMAP connection failure | Non-critical, skipped — sends still happen |
| `data.json` export failure | Retried 3x with 5s delay |
| Git push conflict | `git pull --rebase || true` then retry |
| Bounce rate > 5% | Campaign PAUSED, not crashed |

### Python-Level Resilience

```python
# Every email send is wrapped:
try:
    ok, account = _send_smtp_email(email, subject, body)
except Exception as err:
    print(f"[Error] {email}: {err}")
    # Mark as Failed, continue to next lead
    conn.execute("UPDATE leads SET email_status='Failed' WHERE id=?", (lead_id,))
    continue   # ← Never stops the whole campaign
```

### Dashboard Resilience

```javascript
// Auto-retry on fetch failure (non-blocking)
async function fetchData() {
    try {
        const resp = await fetch('data.json');
        // ...
    } catch (err) {
        console.warn('Fetch failed, retrying in 60s:', err);
        updateStatus('Data unavailable — retrying in 60s');
        // Does NOT crash the page
    }
}
// Auto-refresh every 60 seconds
setInterval(fetchData, 60_000);
```

---

## 10. Module API Reference

### `email_intelligence.py`

| Function | Args | Returns | Description |
|----------|------|---------|-------------|
| `validate_email_format(email)` | `str` | `bool` | RFC 5322 format check |
| `is_disposable_email(email)` | `str` | `bool` | Disposable domain check |
| `validate_email_mx(email, timeout)` | `str, float` | `(bool, str)` | DNS MX record check |
| `validate_email_full(email)` | `str` | `(bool, str)` | Full validation chain |
| `score_lead(**kwargs)` | kwargs | `int` 0–100 | Lead quality score |
| `rotate_subject(category, name, seed)` | `str, str, str` | `str` | A/B subject rotation |
| `send_run_summary(...)` | see docstring | `bool` | HTML summary email |
| `check_bounce_guard(db_path, ...)` | `str, float` | `(bool, str)` | Bounce rate check |
| `get_warmup_daily_limit(age_days, cap)` | `int, int` | `int` | Warm-up email limit |
| `extract_first_name(email)` | `str` | `str` | First name from email |
| `is_good_send_time()` | — | `(bool, str)` | Business hours check |
| `format_send_stats(...)` | kwargs | `str` | Printable stats block |

### `dedup_engine.py`

| Method | Args | Returns | Description |
|--------|------|---------|-------------|
| `is_contacted(email)` | `str` | `bool` | Check any workflow contacted |
| `is_unsubscribed(email)` | `str` | `bool` | Check unsubscribe list |
| `is_sendable(email)` | `str` | `bool` | Combined gate check |
| `mark_contacted(email, workflow, sent_by, status)` | `str, str, str, str` | `bool` | Record successful send |
| `add_unsubscribe(email, reason)` | `str, str` | `bool` | Add to permanent unsub list |
| `scan_reply_for_unsubscribe(email, body)` | `str, str` | `bool` | Auto-detect unsub in reply |
| `filter_sendable(emails)` | `list` | `(list, list)` | Bulk filter (single query) |
| `get_stats()` | — | `dict` | DB statistics |
| `export_unsubscribe_list(path)` | `str` | `int` | Export unsub list to file |

### `workflow_graph.py`

| Class/Function | Description |
|----------------|-------------|
| `WorkflowNode` | Single task node (dataclass) |
| `WorkflowGraph` | DAG container + executor |
| `WorkflowGraph.add_node(node)` | Add node, returns self (fluent) |
| `WorkflowGraph.validate()` | Check for cycles + missing deps |
| `WorkflowGraph.topological_sort()` | Kahn's algo → execution layers |
| `WorkflowGraph.execute(shared)` | Run entire graph, returns report |
| `WorkflowGraph.ascii_graph()` | Print DAG as ASCII diagram |
| `ExecutionReport.succeeded` | True if no critical failures |
| `ExecutionReport.critical_path` | List of node IDs on critical path |
| `ExecutionReport.summary()` | Human-readable execution report |
| `ExecutionReport.to_dict()` | JSON-serializable report |
| `build_standard_outreach_graph(...)` | Factory: pre-wired 10-node graph |

---

## 11. Deployment Guide

### Prerequisites

- Python 3.10+
- Gmail account with 2FA enabled + App Password generated
- GitHub repository with Actions enabled

### Gmail App Password Setup

1. Go to [myaccount.google.com/security](https://myaccount.google.com/security)
2. Enable 2-Step Verification
3. Go to App Passwords → Create password
4. Select "Mail" + device name → Generate
5. Copy the 16-char password (format: `xxxx xxxx xxxx xxxx`)

### GitHub Secrets (Optional)

Set these in `Settings → Secrets → Actions` to avoid hardcoding credentials:

| Secret | Value |
|--------|-------|
| `SMTP_USER` | cupboard587@gmail.com |
| `SMTP_PASSWORD` | App password |
| `SMTP_HOST` | smtp.gmail.com |
| `SMTP_PORT` | 587 |
| `IMAP_USER` | cupboard587@gmail.com |
| `IMAP_PASSWORD` | App password |

### Running Locally

```bash
# Install dependencies
pip install -r global-outreach/requirements.txt
playwright install chromium

# Dry-run (no emails sent)
python global-outreach/scrape_and_outreach.py --dry-run --limit 5

# Send from existing DB only (no scraping)
python global-outreach/scrape_and_outreach.py --no-scrape --target 10

# Full run
python global-outreach/scrape_and_outreach.py --target 25 --limit 50
```

---

## 12. Troubleshooting

### "Emails not showing in Today's dashboard"

**Cause**: Dashboard was filtering by `scraped_at` instead of `sent_at`.

**Fix**: Already resolved in `dashboard.js` — the `getFilteredLeads()` function now filters by `sent_at` date.

### "Workflow failed but no emails sent"

**Cause**: Playwright crash during scraping caused the whole script to exit.

**Fix**: Resilience wrapper in workflow YAML now catches scraper failure and retries with `--no-scrape`.

### "Same doctor getting emails from multiple workflows"

**Cause**: No cross-workflow deduplication.

**Fix**: `dedup_engine.py` + `global_dedup.db` — all 3 workflows check this before sending.

### "Gmail account suspended / rate limited"

**Cause**: Too many emails too fast, or bounce rate too high.

**Fix**:
1. Reduce `daily_email_limit` in `config.json` (start at 10)
2. Increase `send_gap_seconds` (try 600 = 10 minutes)
3. Check `check_bounce_guard()` output for bounce rate
4. Wait 24–48 hours before resuming

### "data.json not updated after run"

**Cause**: `generate_data_json.py` failed silently.

**Fix**: Check Actions logs for the "Export data.json" step. Usually caused by empty DB (no leads yet).

### "Dashboard shows old data"

**Cause**: GitHub Pages caches `data.json`.

**Fix**: Dashboard auto-refreshes every 60 seconds. Force refresh with Ctrl+Shift+R. The `?v=timestamp` cache-busting parameter is added to all JSON fetches.

---

*This document is auto-maintained. Last updated by the system on every major change.*
