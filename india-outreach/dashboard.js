/* =========================================================================
   India Outreach Dashboard — dashboard.js
   ========================================================================= */

// ── State ──────────────────────────────────────────────────────────────────
let ALL_LEADS   = [];
let STATS       = {};
let NICHE_DATA  = [];
let CITY_DATA   = [];
let NO_WEB_CSV  = "";
let ACTIVE_TAB  = "overview";
let selectedDate = 'ALL';

const PAGE_SIZE = 25;
let pages = {
  overview: 1, nowebsite: 1, campaign: 1,
  followup: 1, replies: 1,
};

// Chart instances (so we can destroy/recreate on re-render)
let chartStatus = null, chartCities = null, chartHealth = null, chartPipeline = null;

function getFilteredLeads() {
  if (selectedDate === 'ALL') {
    return ALL_LEADS;
  }
  return ALL_LEADS.filter(lead => {
    return lead.scraped_at && lead.scraped_at.startsWith(selectedDate);
  });
}

function calculateStats(leadsList) {
  const stats = {
    total: 0,
    sent: 0,
    followup_sent: 0,
    replied: 0,
    conversion_rate: 0,
    old_website: 0,
    no_website: 0,
    followups_due: 0,
    failed: 0,
    modern_website: 0
  };

  const now = Date.now();
  const FIVE_DAY = 5 * 24 * 60 * 60 * 1000;

  leadsList.forEach(l => {
    stats.total++;
    
    if (l.status === "No Website") {
      stats.no_website++;
    } else if (l.status === "Old Website" || l.status === "No Booking/AI") {
      stats.old_website++;
    } else if (l.status === "Modern Website") {
      stats.modern_website++;
    }

    if (["Sent", "Sent (Dry Run)", "Follow-Up Sent", "Replied"].includes(l.email_status)) {
      stats.sent++;
    }

    if (l.email_status === "Follow-Up Sent" || l.followup_sent_at) {
      stats.followup_sent++;
    }

    if (l.email_status === "Replied") {
      stats.replied++;
    } else if (l.email_status === "Failed") {
      stats.failed++;
    }

    // Follow-ups due today calculation
    const isDue = l.email_status === "Sent" && 
                  !l.followup_sent_at && 
                  l.sent_at && 
                  (now - new Date(l.sent_at)) >= FIVE_DAY;
    if (isDue) {
      stats.followups_due++;
    }
  });

  if (stats.sent > 0) {
    stats.conversion_rate = Math.round((stats.replied / stats.sent) * 100);
  }

  return stats;
}

function populateDateFilterBar() {
  const bar = document.getElementById("date-filter-bar");
  if (!bar) return;

  const dateSet = new Set();
  ALL_LEADS.forEach(lead => {
    if (lead.scraped_at) {
      const datePart = lead.scraped_at.split("T")[0]; // "YYYY-MM-DD"
      if (datePart && datePart.match(/^\d{4}-\d{2}-\d{2}$/)) {
        dateSet.add(datePart);
      }
    }
  });

  const sortedDates = Array.from(dateSet).sort().reverse();

  let html = `<button class="date-tab ${selectedDate === 'ALL' ? 'active' : ''}" onclick="setDateFilter('ALL')">All Time</button>`;

  sortedDates.forEach(dateStr => {
    const dateObj = new Date(dateStr);
    const todayLocal = new Date();
    const offset = todayLocal.getTimezoneOffset();
    const localDateStr = new Date(todayLocal.getTime() - (offset*60*1000)).toISOString().split('T')[0];

    let label = "";
    const formattedDate = dateObj.toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });

    if (dateStr === localDateStr) {
      label = `Today (${dateObj.toLocaleDateString("en-IN", { month: "short", day: "numeric" })})`;
    } else {
      label = formattedDate;
    }

    html += `<button class="date-tab ${selectedDate === dateStr ? 'active' : ''}" onclick="setDateFilter('${dateStr}')">${label}</button>`;
  });

  bar.innerHTML = html;
}

function setDateFilter(dateStr) {
  selectedDate = dateStr;

  const bar = document.getElementById("date-filter-bar");
  if (bar) {
    bar.querySelectorAll(".date-tab").forEach(btn => {
      btn.classList.remove("active");
    });
    const targetBtn = Array.from(bar.querySelectorAll(".date-tab")).find(btn => {
      return btn.getAttribute("onclick").includes(`'${dateStr}'`);
    });
    if (targetBtn) targetBtn.classList.add("active");
  }

  renderAll();
}

// ── Boot ───────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", fetchData);

async function fetchData() {
  document.getElementById("last-updated").textContent = "Loading…";
  try {
    const res  = await fetch("data.json?t=" + Date.now());
    const data = await res.json();

    ALL_LEADS  = data.leads       || [];
    STATS      = data.stats       || {};
    NICHE_DATA = data.niche_breakdown || [];
    CITY_DATA  = data.city_breakdown  || [];
    NO_WEB_CSV = data.no_website_csv  || "";

    const genAt = data.generated_at
      ? new Date(data.generated_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) + " IST"
      : "—";
    document.getElementById("last-updated").textContent = "Updated: " + genAt;

    populateDateFilterBar();
    renderAll();
  } catch (e) {
    console.error("Failed to load data.json:", e);
    document.getElementById("last-updated").textContent = "⚠ Failed to load data";
  }
}

function renderAll() {
  renderStatCards();
  renderBadges();
  renderOverviewTable();
  renderNoWebsiteTable();
  renderCampaignTable();
  renderFollowUpTab();
  renderRepliesTable();
  renderAnalyticsTab();
  populateNicheFilter();
}

// ── Tab Switching ──────────────────────────────────────────────────────────
function switchTab(tab) {
  ACTIVE_TAB = tab;
  document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
  document.querySelectorAll(".nav-item").forEach(b => b.classList.remove("active"));
  document.getElementById("tab-" + tab).classList.add("active");
  document.getElementById("btn-tab-" + tab).classList.add("active");

  const titles = {
    overview: ["India Outreach — Overview", "All medical specialties · 80+ cities · Live tracking"],
    nowebsite: ["No Website Leads", "Clinics with zero online presence — opportunity pipeline"],
    campaign: ["Campaign Queue", "Old/broken websites ready for outreach"],
    followup: ["Follow-Up System", "5-day follow-up queue · max 20/day · min 30 new guaranteed"],
    replies: ["Email Replies", "Doctors who responded to your outreach"],
    analytics: ["Analytics", "Niche breakdown · City heatmap · Pipeline health"],
    settings: ["Settings", "Campaign configuration and system status"],
  };
  const [title, subtitle] = titles[tab] || ["India Outreach", ""];
  document.getElementById("page-title").textContent    = title;
  document.getElementById("page-subtitle").textContent = subtitle;

  // Re-render charts when analytics tab becomes visible
  if (tab === "analytics") renderAnalyticsTab();
}

// ── Stat Cards ─────────────────────────────────────────────────────────────
function renderStatCards() {
  const filtered = getFilteredLeads();
  const s = calculateStats(filtered);
  setText("stat-total",     fmtNum(s.total));
  setText("stat-sent",      fmtNum(s.sent));
  setText("stat-followup",  fmtNum(s.followup_sent));
  setText("stat-replied",   fmtNum(s.replied));
  setText("stat-conv",      (s.conversion_rate || 0) + "%");
  setText("stat-old",       fmtNum(s.old_website));
  setText("stat-nowebsite", fmtNum(s.no_website));
  setText("stat-due",       fmtNum(s.followups_due));
}

function renderBadges() {
  const filtered = getFilteredLeads();
  const noWebsite = filtered.filter(l => l.status === "No Website").length;
  const campaign  = filtered.filter(l => ["Old Website","No Booking/AI"].includes(l.status) && l.email).length;
  const followups = filtered.filter(l => l.email_status === "Follow-Up Sent").length;
  const replies   = filtered.filter(l => l.email_status === "Replied").length;

  setText("badge-nowebsite", noWebsite);
  setText("badge-campaign",  campaign);
  setText("badge-followup",  followups);
  setText("badge-replies",   replies);
}

// ── Overview Table ─────────────────────────────────────────────────────────
function renderOverviewTable() {
  const q = val("search-overview").toLowerCase();
  const filtered = getFilteredLeads().filter(l =>
    !q || (l.name || "").toLowerCase().includes(q) || (l.location || "").toLowerCase().includes(q)
  );
  const { rows, paginationHtml } = paginate(filtered, "overview");
  const tbody = document.getElementById("tbody-overview");
  tbody.innerHTML = rows.map(l => `
    <tr>
      <td title="${esc(l.name)}">${esc(l.name || "—")}</td>
      <td class="td-dim">${esc(l.location || "—")}</td>
      <td><span class="status-pill pill-notsent" style="background:rgba(255,140,0,0.08);color:var(--saffron-light)">${esc(nicheLabel(l.niche))}</span></td>
      <td>${websitePill(l.status)}</td>
      <td>${emailPill(l.email_status)}</td>
      <td class="td-dim">${fmtDate(l.scraped_at)}</td>
    </tr>
  `).join("") || emptyRow(6);
  document.getElementById("pagination-overview").innerHTML = paginationHtml;
  renderOverviewChart();
}

// ── No Website Table ───────────────────────────────────────────────────────
function renderNoWebsiteTable() {
  const q = val("search-nowebsite").toLowerCase();
  const leads = getFilteredLeads().filter(l =>
    l.status === "No Website" &&
    (!q || (l.name || "").toLowerCase().includes(q) || (l.location || "").toLowerCase().includes(q))
  );
  const { rows, paginationHtml } = paginate(leads, "nowebsite");
  document.getElementById("tbody-nowebsite").innerHTML = rows.map(l => `
    <tr>
      <td title="${esc(l.name)}">${esc(l.name || "—")}</td>
      <td class="td-dim">${esc(l.phone || "—")}</td>
      <td class="td-dim">${esc(l.location || "—")}</td>
      <td><span class="status-pill pill-notsent" style="background:rgba(255,140,0,0.08);color:var(--saffron-light)">${esc(nicheLabel(l.niche))}</span></td>
      <td class="td-dim" title="${esc(l.address)}">${esc((l.address || "—").slice(0,40))}</td>
      <td class="td-dim">${fmtDate(l.scraped_at)}</td>
    </tr>
  `).join("") || emptyRow(6);
  document.getElementById("pagination-nowebsite").innerHTML = paginationHtml;
}

// ── Campaign Queue Table ───────────────────────────────────────────────────
function renderCampaignTable() {
  const q     = val("search-campaign").toLowerCase();
  const niche = val("filter-niche");
  const leads = getFilteredLeads().filter(l =>
    ["Old Website","No Booking/AI"].includes(l.status) &&
    l.email &&
    (!q || (l.name || "").toLowerCase().includes(q) || (l.email || "").toLowerCase().includes(q)) &&
    (!niche || l.niche === niche)
  );
  const { rows, paginationHtml } = paginate(leads, "campaign");
  document.getElementById("tbody-campaign").innerHTML = rows.map(l => `
    <tr>
      <td title="${esc(l.name)}">${esc(l.name || "—")}</td>
      <td class="td-dim" style="font-size:0.75rem">${esc(l.email || "—")}</td>
      <td class="td-dim">${esc(l.location || "—")}</td>
      <td><span class="status-pill pill-notsent" style="background:rgba(255,140,0,0.08);color:var(--saffron-light)">${esc(nicheLabel(l.niche))}</span></td>
      <td class="td-dim" style="font-size:0.75rem"><a href="${esc(l.website||'#')}" target="_blank" style="color:var(--sent-blue)">${esc((l.website||"—").slice(0,30))}</a></td>
      <td class="td-dim" style="font-size:0.72rem" title="${esc(l.website_notes)}">${esc((l.website_notes||"—").slice(0,50))}</td>
      <td>${emailPill(l.email_status)}</td>
      <td class="td-dim">${fmtDate(l.sent_at)}</td>
    </tr>
  `).join("") || emptyRow(8);
  document.getElementById("pagination-campaign").innerHTML = paginationHtml;
}

// ── Follow-Up Tab ──────────────────────────────────────────────────────────
function renderFollowUpTab() {
  const now      = Date.now();
  const FIVE_DAY = 5 * 24 * 60 * 60 * 1000;
  const filtered = getFilteredLeads();

  // Categorise leads
  const dueLds     = filtered.filter(l => l.email_status === "Sent" && !l.followup_sent_at && l.sent_at && (now - new Date(l.sent_at)) >= FIVE_DAY);
  const sentFU     = filtered.filter(l => l.email_status === "Follow-Up Sent");
  const pendingLds = filtered.filter(l => l.email_status === "Sent" && !l.followup_sent_at && l.sent_at && (now - new Date(l.sent_at)) < FIVE_DAY);
  const repliedFU  = filtered.filter(l => l.email_status === "Replied" && l.followup_sent_at);

  setText("fu-stat-sent",    fmtNum(sentFU.length));
  setText("fu-stat-due",     fmtNum(dueLds.length));
  setText("fu-stat-replied", fmtNum(repliedFU.length));
  setText("fu-stat-pending", fmtNum(pendingLds.length));

  // Alert banner
  const banner = document.getElementById("followup-alert-banner");
  if (dueLds.length > 0) {
    banner.innerHTML = `
      <div class="followup-alert">
        <div class="alert-icon">⏰</div>
        <div class="alert-text">
          <h4>${dueLds.length} follow-up email${dueLds.length > 1 ? "s" : ""} due today</h4>
          <p>These leads were emailed 5+ days ago with no reply. The next GitHub Actions run will send up to 20 follow-ups automatically.</p>
        </div>
      </div>`;
  } else {
    banner.innerHTML = "";
  }

  renderFollowUpTable();
}

function renderFollowUpTable() {
  const now      = Date.now();
  const FIVE_DAY = 5 * 24 * 60 * 60 * 1000;
  const q        = val("search-followup").toLowerCase();
  const filter   = val("filter-fu-status");

  let leads = getFilteredLeads().filter(l => l.email_status === "Sent" || l.email_status === "Follow-Up Sent");

  if (filter === "due")     leads = leads.filter(l => l.email_status === "Sent" && !l.followup_sent_at && (now - new Date(l.sent_at)) >= FIVE_DAY);
  if (filter === "sent")    leads = leads.filter(l => l.email_status === "Follow-Up Sent");
  if (filter === "pending") leads = leads.filter(l => l.email_status === "Sent" && !l.followup_sent_at && (now - new Date(l.sent_at)) < FIVE_DAY);
  if (q)                    leads = leads.filter(l => (l.name||"").toLowerCase().includes(q) || (l.email||"").toLowerCase().includes(q));

  const { rows, paginationHtml } = paginate(leads, "followup");
  document.getElementById("tbody-followup").innerHTML = rows.map(l => {
    const daysSince = l.sent_at ? Math.floor((now - new Date(l.sent_at)) / 86400000) : "—";
    const isDue     = l.email_status === "Sent" && !l.followup_sent_at && daysSince >= 5;
    return `
      <tr>
        <td title="${esc(l.name)}">${esc(l.name || "—")}</td>
        <td class="td-dim" style="font-size:0.75rem">${esc(l.email || "—")}</td>
        <td class="td-dim">${esc(l.location || "—")}</td>
        <td><span class="status-pill" style="background:rgba(255,140,0,0.08);color:var(--saffron-light)">${esc(nicheLabel(l.niche))}</span></td>
        <td class="td-dim">${fmtDate(l.sent_at)}</td>
        <td class="td-dim">${l.followup_sent_at ? fmtDate(l.followup_sent_at) : '<span style="color:var(--grey-dim)">—</span>'}</td>
        <td style="font-weight:600;color:${daysSince >= 5 ? 'var(--followup-amber)' : 'var(--grey-text)'}">${daysSince}d</td>
        <td>${isDue ? '<span class="status-pill pill-followup">⚡ Due</span>' : emailPill(l.email_status)}</td>
      </tr>`;
  }).join("") || emptyRow(8);
  document.getElementById("pagination-followup").innerHTML = paginationHtml;
}

// ── Replies Table ──────────────────────────────────────────────────────────
function renderRepliesTable() {
  const q = val("search-replies").toLowerCase();
  const leads = getFilteredLeads().filter(l =>
    l.email_status === "Replied" &&
    (!q || (l.name||"").toLowerCase().includes(q) || (l.email||"").toLowerCase().includes(q))
  );
  const { rows, paginationHtml } = paginate(leads, "replies");
  document.getElementById("tbody-replies").innerHTML = rows.map(l => `
    <tr>
      <td title="${esc(l.name)}">${esc(l.name||"—")}</td>
      <td class="td-dim" style="font-size:0.75rem">${esc(l.email||"—")}</td>
      <td class="td-dim">${esc(l.location||"—")}</td>
      <td><span class="status-pill" style="background:rgba(255,140,0,0.08);color:var(--saffron-light)">${esc(nicheLabel(l.niche))}</span></td>
      <td class="td-dim" title="${esc(l.reply_subject)}">${esc((l.reply_subject||"—").slice(0,50))}</td>
      <td class="td-dim">${fmtDate(l.replied_at)}</td>
    </tr>
  `).join("") || emptyRow(6);
  document.getElementById("pagination-replies").innerHTML = paginationHtml;
}

// ── Analytics Tab ──────────────────────────────────────────────────────────
function renderAnalyticsTab() {
  renderNicheBars();
  renderCityGrid();
  renderHealthChart();
  renderPipelineChart();
}

function renderNicheBars() {
  const container = document.getElementById("niche-bars");
  const filtered = getFilteredLeads();
  
  const nicheCounts = {};
  filtered.forEach(l => {
    if (l.niche) {
      nicheCounts[l.niche] = (nicheCounts[l.niche] || 0) + 1;
    }
  });
  const nicheData = Object.entries(nicheCounts)
    .map(([niche, count]) => ({ niche, count }))
    .sort((a, b) => b.count - a.count);

  if (!nicheData.length) { container.innerHTML = "<p style='color:var(--grey-dim);font-size:0.82rem'>No niche data yet.</p>"; return; }
  const max = nicheData[0].count || 1;
  container.innerHTML = nicheData.map(d => `
    <div class="niche-bar-row">
      <div class="niche-bar-label" title="${esc(d.niche)}">${esc(nicheLabel(d.niche))}</div>
      <div class="niche-bar-track"><div class="niche-bar-fill" style="width:${Math.round(d.count/max*100)}%"></div></div>
      <div class="niche-bar-val">${d.count}</div>
    </div>
  `).join("");
}

function renderCityGrid() {
  const container = document.getElementById("city-grid");
  const filtered = getFilteredLeads();
  
  const cityCounts = {};
  filtered.forEach(l => {
    if (l.location) {
      cityCounts[l.location] = (cityCounts[l.location] || 0) + 1;
    }
  });
  const cityData = Object.entries(cityCounts)
    .map(([city, count]) => ({ city, count }))
    .sort((a, b) => b.count - a.count);

  if (!cityData.length) { container.innerHTML = "<p style='color:var(--grey-dim);font-size:0.82rem'>No city data yet.</p>"; return; }
  container.innerHTML = cityData.map(d => `
    <div class="city-tile">
      <div class="city-count">${d.count}</div>
      <div class="city-name">${esc(d.city)}</div>
    </div>
  `).join("");
}

function renderHealthChart() {
  const filtered = getFilteredLeads();
  const s = calculateStats(filtered);
  const ctx = document.getElementById("chart-health").getContext("2d");
  if (chartHealth) chartHealth.destroy();
  chartHealth = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Old Website", "No Booking/AI", "Modern", "No Website"],
      datasets: [{
        data: [
          s.old_website || 0,
          (filtered.filter(l => l.status === "No Booking/AI").length),
          s.modern_website || 0,
          s.no_website || 0,
        ],
        backgroundColor: ["#fc814a","#4299e1","#48bb78","#718096"],
        borderWidth: 0,
      }]
    },
    options: chartOptions(),
  });
}

function renderPipelineChart() {
  const filtered = getFilteredLeads();
  const s = calculateStats(filtered);
  const ctx = document.getElementById("chart-pipeline").getContext("2d");
  if (chartPipeline) chartPipeline.destroy();
  chartPipeline = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Not Sent", "Sent", "Follow-Up Sent", "Replied", "Failed"],
      datasets: [{
        data: [
          filtered.filter(l => l.email_status === "Not Sent").length,
          filtered.filter(l => l.email_status === "Sent").length,
          s.followup_sent || 0,
          s.replied || 0,
          s.failed || 0,
        ],
        backgroundColor: ["#718096","#4299e1","#f6ad55","#48bb78","#fc8181"],
        borderRadius: 6,
        borderWidth: 0,
      }]
    },
    options: {
      ...chartOptions(),
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: "#718096" }, grid: { color: "rgba(255,255,255,0.04)" } },
        y: { ticks: { color: "#718096" }, grid: { color: "rgba(255,255,255,0.04)" } },
      },
    },
  });
}

// ── Overview Charts ────────────────────────────────────────────────────────
function renderOverviewChart() {
  renderStatusChart();
  renderCitiesChart();
}

function renderStatusChart() {
  const ctx = document.getElementById("chart-status").getContext("2d");
  if (chartStatus) chartStatus.destroy();
  const filtered = getFilteredLeads();
  const s = calculateStats(filtered);
  chartStatus = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Not Sent", "Sent", "Follow-Up", "Replied", "Failed"],
      datasets: [{
        data: [
          filtered.filter(l => l.email_status === "Not Sent").length,
          filtered.filter(l => ["Sent","Sent (Dry Run)"].includes(l.email_status)).length,
          s.followup_sent || 0,
          s.replied || 0,
          s.failed || 0,
        ],
        backgroundColor: ["#718096","#4299e1","#f6ad55","#48bb78","#fc8181"],
        borderWidth: 0,
      }]
    },
    options: chartOptions(),
  });
}

function renderCitiesChart() {
  const filtered = getFilteredLeads();
  const cityCounts = {};
  filtered.forEach(l => {
    if (l.location) {
      cityCounts[l.location] = (cityCounts[l.location] || 0) + 1;
    }
  });
  const cityData = Object.entries(cityCounts)
    .map(([city, count]) => ({ city, count }))
    .sort((a, b) => b.count - a.count);

  if (!cityData.length) return;
  const ctx = document.getElementById("chart-cities").getContext("2d");
  if (chartCities) chartCities.destroy();
  const top = cityData.slice(0, 8);
  chartCities = new Chart(ctx, {
    type: "bar",
    data: {
      labels: top.map(d => d.city),
      datasets: [{
        data: top.map(d => d.count),
        backgroundColor: "rgba(255,140,0,0.7)",
        borderRadius: 6,
        borderWidth: 0,
      }]
    },
    options: {
      ...chartOptions(),
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: "#718096", font: { size: 10 } }, grid: { display: false } },
        y: { ticks: { color: "#718096" }, grid: { color: "rgba(255,255,255,0.04)" } },
      },
    },
  });
}

// ── CSV Export ─────────────────────────────────────────────────────────────
function exportCSV() {
  const headers = ["Name","Email","Phone","City","Niche","Website","Status","Email Status","Sent At","Follow-Up Sent At","Notes"];
  const rows = getFilteredLeads().map(l => [
    l.name, l.email, l.phone, l.location, l.niche,
    l.website, l.status, l.email_status, l.sent_at,
    l.followup_sent_at, l.website_notes,
  ].map(v => `"${String(v||"").replace(/"/g,'""')}"`).join(","));
  downloadFile("india_leads.csv", [headers.join(","), ...rows].join("\n"), "text/csv");
}

function downloadNoWebsiteCSV() {
  if (!NO_WEB_CSV) return alert("No data available.");
  downloadFile("india_no_website_clinics.csv", NO_WEB_CSV, "text/csv");
}

function downloadFile(name, content, mime) {
  const a  = document.createElement("a");
  a.href   = URL.createObjectURL(new Blob([content], { type: mime }));
  a.download = name;
  a.click();
}

// ── Niche Filter Populate ──────────────────────────────────────────────────
function populateNicheFilter() {
  const niches  = [...new Set(getFilteredLeads().map(l => l.niche).filter(Boolean))].sort();
  const select  = document.getElementById("filter-niche");
  const current = select.value;
  select.innerHTML = '<option value="">All Niches</option>' +
    niches.map(n => `<option value="${esc(n)}" ${n===current?"selected":""}>${esc(nicheLabel(n))}</option>`).join("");
}

// ── Pagination ─────────────────────────────────────────────────────────────
function paginate(items, key) {
  const p    = pages[key] || 1;
  const total = items.length;
  const start = (p - 1) * PAGE_SIZE;
  const rows  = items.slice(start, start + PAGE_SIZE);

  const totalPages = Math.ceil(total / PAGE_SIZE) || 1;
  let html = `<div>${start+1}–${Math.min(start+PAGE_SIZE,total)} of ${total}</div><div class="pagination-controls">`;
  html += `<button class="page-btn" onclick="changePage('${key}',${p-1})" ${p<=1?"disabled":""}>‹</button>`;
  const range = [...new Set([1, p-1, p, p+1, totalPages].filter(x => x >= 1 && x <= totalPages))].sort((a,b)=>a-b);
  range.forEach(pg => { html += `<button class="page-btn ${pg===p?"active":""}" onclick="changePage('${key}',${pg})">${pg}</button>`; });
  html += `<button class="page-btn" onclick="changePage('${key}',${p+1})" ${p>=totalPages?"disabled":""}>›</button></div>`;

  return { rows, paginationHtml: html };
}

function changePage(key, p) {
  if (p < 1) return;
  pages[key] = p;
  if (key === "overview")   renderOverviewTable();
  if (key === "nowebsite")  renderNoWebsiteTable();
  if (key === "campaign")   renderCampaignTable();
  if (key === "followup")   renderFollowUpTable();
  if (key === "replies")    renderRepliesTable();
}

// ── Chart Default Options ──────────────────────────────────────────────────
function chartOptions() {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: { color: "#a0aec0", font: { size: 11 }, boxWidth: 12, padding: 14 },
      },
    },
  };
}

// ── Helpers ────────────────────────────────────────────────────────────────
function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}
function val(id)  { return (document.getElementById(id)?.value || ""); }
function esc(str) { return String(str||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }
function fmtNum(n) { return typeof n === "number" ? n.toLocaleString("en-IN") : (n||"0"); }
function fmtDate(d) { if (!d) return "—"; try { return new Date(d).toLocaleDateString("en-IN"); } catch { return d.slice(0,10); } }
function emptyRow(cols) { return `<tr><td colspan="${cols}" style="text-align:center;padding:32px;color:var(--grey-dim)">No records found</td></tr>`; }

function nicheLabel(niche) {
  const map = {
    general:"General Physician", dental:"Dentist", derm:"Dermatologist",
    cardiology:"Cardiologist", orthopedic:"Orthopedic", ent:"ENT",
    gynecology:"Gynecologist", pediatrics:"Pediatrician", ophthalmology:"Ophthalmologist",
    neurology:"Neurologist", psychiatry:"Psychiatrist", urology:"Urologist",
    gastro:"Gastroenterologist", diabetes:"Diabetologist", physio:"Physiotherapist",
    homeopathy:"Homeopathy", ayurveda:"Ayurveda", hair:"Hair Clinic",
    weightloss:"Weight Loss", ivf:"IVF / Fertility", oncology:"Oncologist",
    nephrology:"Nephrologist", pulmonology:"Pulmonologist", rheumatology:"Rheumatologist",
    cosmetic:"Cosmetic Surgery",
  };
  return map[niche] || (niche ? niche.charAt(0).toUpperCase() + niche.slice(1) : "—");
}

function websitePill(status) {
  const map = {
    "Old Website":    ["pill-old",     "Old Website"],
    "No Booking/AI":  ["pill-booking",  "No Booking/AI"],
    "Modern Website": ["pill-modern",   "Modern"],
    "No Website":     ["pill-nosite",   "No Website"],
    "Filtered (No Email)": ["pill-nosite", "Filtered"],
  };
  const [cls, label] = map[status] || ["pill-nosite", status||"—"];
  return `<span class="status-pill ${cls}">${label}</span>`;
}

function emailPill(status) {
  const map = {
    "Not Sent":          ["pill-notsent",  "Not Sent"],
    "Sent":              ["pill-sent",     "Sent"],
    "Sent (Dry Run)":    ["pill-sent",     "Dry Run"],
    "Follow-Up Sent":    ["pill-followup", "Follow-Up ✓"],
    "Replied":           ["pill-replied",  "Replied ✓"],
    "Failed":            ["pill-failed",   "Failed"],
  };
  const [cls, label] = map[status] || ["pill-notsent", status||"—"];
  return `<span class="status-pill ${cls}">${label}</span>`;
}
