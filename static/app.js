/**
 * app.js — Frontend Logic for Google Maps Scraper UI
 * ====================================================
 * Responsibilities:
 *  - Send scrape job requests to the Flask REST API.
 *  - Poll job status every 2 seconds and update the progress bar.
 *  - Fetch live results and append new rows to the results table.
 *  - Handle download button clicks (CSV / JSON / Excel).
 *
 * Global state:
 *  currentJobId  — ID of the currently running job (null if idle).
 *  pollTimer     — setInterval handle for the status-poll loop.
 *  renderedCount — Number of rows already rendered in the table.
 */

"use strict";

// ── State ─────────────────────────────────────────────────────────────────

let currentJobId   = null;   // Active job identifier
let pollTimer      = null;   // Interval handle
let renderedCount  = 0;      // Rows already added to the DOM

// ── DOM refs ──────────────────────────────────────────────────────────────

const elQuery        = () => document.getElementById("query");
const elLocation     = () => document.getElementById("location");
const elMaxResults   = () => document.getElementById("max-results");
const elResultsBadge = () => document.getElementById("results-badge");
const elFindEmails   = () => document.getElementById("find-emails-toggle");
const elBtnScrape    = () => document.getElementById("btn-scrape");
const elBtnStop      = () => document.getElementById("btn-stop");

const elProgressSection = () => document.getElementById("progress-section");
const elProgressLabel   = () => document.getElementById("progress-label");
const elProgressCount   = () => document.getElementById("progress-count");
const elProgressFill    = () => document.getElementById("progress-fill");
const elProgressAria    = () => document.getElementById("progress-aria");
const elProgressStatus  = () => document.getElementById("progress-status");

const elResultsSection  = () => document.getElementById("results-section");
const elResultsBadge2   = () => document.getElementById("result-count-badge");
const elResultsTbody    = () => document.getElementById("results-tbody");
const elEmptyState      = () => document.getElementById("empty-state");
const elDownloadGroup   = () => document.getElementById("download-group");

// ── Initialise page ───────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  // Sync the badge with the range slider
  const slider = elMaxResults();
  slider.addEventListener("input", () => {
    elResultsBadge().textContent = slider.value;
  });
});

// ── Start scrape ──────────────────────────────────────────────────────────

/**
 * Validate inputs, POST to /api/scrape, and begin polling.
 * Called when the "Start Scraping" button is clicked.
 */
async function startScrape() {
  const query      = elQuery().value.trim();
  const location   = elLocation().value.trim();
  const maxResults = parseInt(elMaxResults().value, 10);
  const findEmails = elFindEmails().checked;

  // ── Validate ──────────────────────────────────────────────────────────
  if (!query) {
    elQuery().focus();
    shakeElement(elQuery());
    return;
  }

  // ── Reset UI ──────────────────────────────────────────────────────────
  resetResults();
  setScrapingState(true);
  showSection(elProgressSection(), true);
  showSection(elResultsSection(), true);
  elProgressStatus().textContent = "🔍 Connecting to Google Maps…";

  // ── POST /api/scrape ──────────────────────────────────────────────────
  let jobId;
  try {
    const resp = await fetch("/api/scrape", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, location, max_results: maxResults, find_emails: findEmails }),
    });
    const data = await resp.json();

    if (!resp.ok || data.error) {
      throw new Error(data.error || "Server error");
    }

    jobId = data.job_id;
    currentJobId = jobId;
  } catch (err) {
    showError("Failed to start job: " + err.message);
    setScrapingState(false);
    return;
  }

  // ── Begin polling ─────────────────────────────────────────────────────
  elProgressLabel().textContent = `Scraping "${query}"${location ? " in " + location : ""}…`;
  pollTimer = setInterval(() => pollJob(jobId, maxResults), 2000);
}

// ── Stop scrape ───────────────────────────────────────────────────────────

/**
 * Stop polling. The server continues to scrape but we stop updating the UI.
 * A future improvement could add a server-side cancellation endpoint.
 */
function stopScrape() {
  clearInterval(pollTimer);
  pollTimer = null;
  setScrapingState(false);
  elProgressStatus().textContent = "⛔ Stopped by user.";
}

// ── Polling ───────────────────────────────────────────────────────────────

/**
 * Poll /api/status and /api/results, update the progress bar and table.
 *
 * @param {string} jobId      — The job identifier to poll.
 * @param {number} maxResults — Total requested results (for progress %).
 */
async function pollJob(jobId, maxResults) {
  try {
    const [statusResp, resultsResp] = await Promise.all([
      fetch(`/api/status/${jobId}`),
      fetch(`/api/results/${jobId}`),
    ]);

    const status  = await statusResp.json();
    const results = await resultsResp.json();

    // ── Update progress bar ───────────────────────────────────────────
    const pct = maxResults > 0 ? Math.min((status.count / maxResults) * 100, 100) : 0;
    elProgressFill().style.width     = pct + "%";
    elProgressAria().setAttribute("aria-valuenow", Math.round(pct));
    elProgressCount().textContent    = `${status.count} / ${status.total}`;
    elResultsBadge2().textContent    = status.count;

    if (status.status === "running") {
      elProgressStatus().textContent = `🔄 Scraping… ${status.count} records found so far`;
    }

    // ── Append new rows ───────────────────────────────────────────────
    const allRecords = results.records || [];
    const newRecords = allRecords.slice(renderedCount);
    newRecords.forEach((rec, i) => appendRow(rec, renderedCount + i + 1));
    renderedCount = allRecords.length;

    // Show / hide empty state
    elEmptyState().style.display = renderedCount === 0 ? "block" : "none";

    // ── Job done ──────────────────────────────────────────────────────
    if (status.done) {
      clearInterval(pollTimer);
      pollTimer = null;
      setScrapingState(false);

      if (status.status === "error") {
        elProgressStatus().textContent = "❌ Error: " + (status.error || "Unknown error");
        elProgressFill().style.background = "var(--accent-red)";
      } else {
        elProgressFill().style.width = "100%";
        elProgressStatus().textContent =
          `✅ Done! ${status.count} records scraped.`;
      }
    }

  } catch (err) {
    elProgressStatus().textContent = "⚠️ Connection error — retrying…";
  }
}

// ── Table rendering ───────────────────────────────────────────────────────

/**
 * Append a single BusinessRecord row to the results table.
 *
 * @param {{ name, phone, email, website, address }} rec — Record object.
 * @param {number} rowNum — 1-based display row number.
 */
function appendRow(rec, rowNum) {
  const tbody = elResultsTbody();
  const tr    = document.createElement("tr");
  tr.id       = `row-${rowNum}`;

  // ── Sanitise helper ───────────────────────────────────────────────────
  const esc = (s) => (s || "—").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  // ── Website link ──────────────────────────────────────────────────────
  let webCell = "—";
  if (rec.website) {
    const display = rec.website.replace(/^https?:\/\/(www\.)?/, "").split("/")[0];
    webCell = `<a href="${esc(rec.website)}" target="_blank" rel="noopener noreferrer">${esc(display)}</a>`;
  }

  tr.innerHTML = `
    <td class="num">${rowNum}</td>
    <td title="${esc(rec.name)}">${esc(rec.name)}</td>
    <td class="phone">${esc(rec.phone)}</td>
    <td class="email">${esc(rec.email)}</td>
    <td class="web">${webCell}</td>
    <td title="${esc(rec.address)}">${esc(rec.address)}</td>
  `;

  // Animate the row in
  tr.style.opacity = "0";
  tr.style.transform = "translateY(6px)";
  tbody.appendChild(tr);

  // Trigger animation on next frame
  requestAnimationFrame(() => {
    tr.style.transition = "opacity 0.3s ease, transform 0.3s ease";
    tr.style.opacity    = "1";
    tr.style.transform  = "translateY(0)";
  });
}

// ── Download ──────────────────────────────────────────────────────────────

/**
 * Trigger a file download for the current job's results.
 *
 * @param {"csv"|"json"|"excel"} format — Export format.
 */
function download(format) {
  if (!currentJobId) return;
  const url = `/api/download/${currentJobId}?format=${format}`;
  const link = document.createElement("a");
  link.href = url;
  link.click();
}

// ── UI helpers ────────────────────────────────────────────────────────────

/**
 * Switch between "scraping" and "idle" button states.
 * @param {boolean} active
 */
function setScrapingState(active) {
  const scrapeBtn = elBtnScrape();
  const stopBtn   = elBtnStop();

  if (active) {
    scrapeBtn.classList.add("hidden");
    stopBtn.classList.remove("hidden");
  } else {
    scrapeBtn.classList.remove("hidden");
    stopBtn.classList.add("hidden");
  }
}

/** Show or hide a section element. */
function showSection(el, visible) {
  if (visible) el.classList.remove("hidden");
  else         el.classList.add("hidden");
}

/** Clear the results table and reset counters. */
function resetResults() {
  renderedCount = 0;
  currentJobId  = null;
  elResultsTbody().innerHTML = "";
  elResultsBadge2().textContent = "0";
  elProgressFill().style.width = "0%";
  elProgressFill().style.background = "";
  elEmptyState().style.display = "none";
}

/** Flash an error message in the progress status label. */
function showError(msg) {
  elProgressStatus().textContent = "❌ " + msg;
  showSection(elProgressSection(), true);
}

/** Brief shake animation to signal invalid input. */
function shakeElement(el) {
  el.style.animation = "none";
  el.style.borderColor = "var(--accent-red)";
  el.style.boxShadow = "0 0 0 3px rgba(239,68,68,0.3)";
  setTimeout(() => {
    el.style.borderColor = "";
    el.style.boxShadow = "";
  }, 1500);
}
