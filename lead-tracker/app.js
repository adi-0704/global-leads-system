/**
 * app.js — Standalone Lead Tracker Dashboard Logic (LeadReach v2)
 * ==========================================================================
 * Features:
 *  - Persistent LocalStorage State
 *  - Responsive Filtering & Sorting (Priority, Niche, City, Stage)
 *  - Pagination (25 rows per page)
 *  - Interactive Pipeline status stages dropdown with automatic colors
 *  - Priority Scoring based on Google ratings & review counts (High, Med, Low)
 *  - Live Chart.js analytics for conversion stages and city distribution
 *  - Customized Settings panel for live WhatsApp outreach templates
 *  - CSV Import & Export capabilities
 *  - Manual Lead creation
 * ==========================================================================
 */

"use strict";

// ── State ─────────────────────────────────────────────────────────────────
let leads = [];
let filteredLeads = [];
let selectedLeadIds = new Set();

// Pagination State
let currentPage = 1;
const rowsPerPage = 25;

// Chart.js Instances
let pipelineChart = null;
let cityChart = null;

// ── LocalStorage Keys ──
const STORAGE_KEY = "LEAD_TRACKER_DATA";
const TEMPLATE_DENTAL_KEY = "OUTREACH_TEMPLATE_DENTAL";
const TEMPLATE_DERMA_KEY = "OUTREACH_TEMPLATE_DERMA";
const TEMPLATE_DENTAL_F1_KEY = "OUTREACH_TEMPLATE_DENTAL_F1";
const TEMPLATE_DENTAL_F2_KEY = "OUTREACH_TEMPLATE_DENTAL_F2";
const TEMPLATE_DERMA_F1_KEY = "OUTREACH_TEMPLATE_DERMA_F1";
const TEMPLATE_DERMA_F2_KEY = "OUTREACH_TEMPLATE_DERMA_F2";
const TEMPLATE_DENTAL_AUDIT_KEY = "OUTREACH_TEMPLATE_DENTAL_AUDIT";
const TEMPLATE_DERMA_AUDIT_KEY = "OUTREACH_TEMPLATE_DERMA_AUDIT";
const SHOW_ANALYTICS_KEY = "SHOW_ANALYTICS_DASH";
const DB_SUPABASE_URL_KEY = "SUPABASE_DB_URL";
const DB_SUPABASE_KEY_KEY = "SUPABASE_DB_KEY";

const DEFAULT_SUPABASE_URL = "https://gagkjmoxdsxjgitjxnxi.supabase.co";
const DEFAULT_SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhZ2tqbW94ZHN4amdpdGp4bnhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM4NjIyMTQsImV4cCI6MjA5OTQzODIxNH0.6bhJmTt019kGBbjXnbaSMH4orkF_4hj-P5uO6rp76Ao";

// ── Database Client State ──
let supabaseClient = null;

// ── Default Pitch Templates ──
const DEFAULT_DENTAL = `Hey Dr. [Doctor_Name]! 👋 

Did you know that 70% of dental patients in [City] book appointments after hours when clinics are closed?

We generated a personalized Digital Presence Audit showing how many patient leads [Clinic_Name] is currently missing in [City]:
👉 [Audit_Link]

We also designed a "Zero-Friction Booking Flow" for your practice (demo styled as "Smile Dental Clinic") to capture these bookings:
👉 https://smile-dental.vercel.app

We can customize this layout with your branding and treatments in under 24 hours. Worth a 2-minute look? 🦷`;

const DEFAULT_DERMA = `Hello Dr. [Doctor_Name]! 👋

Acne and melasma patients in [City] usually search online for hours before choosing a clinic. 

We ran a Digital Presence Audit for [Clinic_Name] detailing your patient acquisition gaps and competitors' visibility:
👉 [Audit_Link]

To solve this, we designed a smart patient onboarding flow (demo styled as "ClearSkin") with an interactive 1-minute Skin Quiz:
👉 https://derm-site.vercel.app

We can customize and launch this for you this week. Would you be open to a quick chat? 🌿`;

const DEFAULT_DENTAL_F1 = `Hey Dr. [Doctor_Name] — just following up on the zero-friction booking layout: 👉 https://smile-dental.vercel.app. Here is your practice presence audit again in case you missed it: 👉 [Audit_Link]. Let me know if you are free for a quick chat. 📞`;

const DEFAULT_DERMA_F1 = `Hello Dr. [Doctor_Name] — did you get a chance to run through the 5-question Skin Quiz on the demo: 👉 https://derm-site.vercel.app? You can also check your clinic's visibility gaps in our audit report here: 👉 [Audit_Link]. Let me know your thoughts! 🌿`;

const DEFAULT_DENTAL_F2 = `Dr. [Doctor_Name] — checking in once last time. We're launching dental booking sites in [City] this week and have one slot left for customized branding. Let me know if [Clinic_Name] wants to claim it! 🦷`;

const DEFAULT_DERMA_F2 = `Dr. [Doctor_Name] — checking in once last time. We're setting up the "ClearSkin" patient acquisition quiz for skin clinics in [City] this week. Let me know if you'd like to test it for [Clinic_Name]! 🌿`;

const DEFAULT_DENTAL_AUDIT = `Hey Dr. [Doctor_Name]! 👋 

I ran a quick Digital Presence Audit for [Clinic_Name] in [City]. It shows how many monthly search leads you are currently losing to competitors with websites. 

You can view your personalized audit report here:
👉 [Audit_Link]

Let me know if you are free for a quick 2-minute call to discuss this! 📞`;

const DEFAULT_DERMA_AUDIT = `Hello Dr. [Doctor_Name]! 👋

I ran a quick Digital Presence Audit for [Clinic_Name] in [City] regarding your patient acquisition gaps and competitors' visibility.

You can view your personalized report here:
👉 [Audit_Link]

Would you be open to a quick 2-minute call to discuss this? 🌿`;

// ── Initialization ────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", async () => {
  initTemplates();
  initSupabase();
  await initData();
  populateCityFilter();
  applyFilters();
  updateStats();
  initAnalyticsState();
  updateCharts();
});

function initSupabase() {
  let url = localStorage.getItem(DB_SUPABASE_URL_KEY);
  let key = localStorage.getItem(DB_SUPABASE_KEY_KEY);
  
  if (!url || url === "null" || url === "undefined" || url.trim() === "") {
    url = DEFAULT_SUPABASE_URL;
  }
  if (!key || key === "null" || key === "undefined" || key.trim() === "") {
    key = DEFAULT_SUPABASE_KEY;
  }

  if (url && key && window.supabase) {
    try {
      supabaseClient = window.supabase.createClient(url, key);
      console.log("Supabase Client initialized successfully.");
    } catch (e) {
      console.error("Failed to initialize Supabase client:", e);
      supabaseClient = null;
    }
  } else {
    supabaseClient = null;
  }
}

function initTemplates() {
  // Reset initial pitches if they contain [Audit_Link] (as we want them to be simple site pitches)
  let dental = localStorage.getItem(TEMPLATE_DENTAL_KEY);
  if (!dental || dental.includes("[Audit_Link]") || dental.includes("http://localhost:4001") || dental.includes("specifically for your practice") || dental.includes("modern clinic website")) {
    localStorage.setItem(TEMPLATE_DENTAL_KEY, DEFAULT_DENTAL);
  }
  let derma = localStorage.getItem(TEMPLATE_DERMA_KEY);
  if (!derma || derma.includes("[Audit_Link]") || derma.includes("http://localhost:4000") || derma.includes("practice like yours") || derma.includes("dermatologist profiles")) {
    localStorage.setItem(TEMPLATE_DERMA_KEY, DEFAULT_DERMA);
  }

  // Enforce F1 templates to contain [Audit_Link]
  let dentalF1 = localStorage.getItem(TEMPLATE_DENTAL_F1_KEY);
  if (!dentalF1 || !dentalF1.includes("[Audit_Link]") || dentalF1.includes("http://localhost:4001") || dentalF1.includes("built for [Clinic_Name] earlier")) {
    localStorage.setItem(TEMPLATE_DENTAL_F1_KEY, DEFAULT_DENTAL_F1);
  }
  let dermaF1 = localStorage.getItem(TEMPLATE_DERMA_F1_KEY);
  if (!dermaF1 || !dermaF1.includes("[Audit_Link]") || dermaF1.includes("http://localhost:4000") || dermaF1.includes("Our clinics see a 40%")) {
    localStorage.setItem(TEMPLATE_DERMA_F1_KEY, DEFAULT_DERMA_F1);
  }
  
  // Force update F2 templates as well if they contain old generic placeholder text
  let dentalF2 = localStorage.getItem(TEMPLATE_DENTAL_F2_KEY);
  if (!dentalF2 || dentalF2.includes("yours live this week") || dentalF2.includes("saving smiles")) {
    localStorage.setItem(TEMPLATE_DENTAL_F2_KEY, DEFAULT_DENTAL_F2);
  }
  let dermaF2 = localStorage.getItem(TEMPLATE_DERMA_F2_KEY);
  if (!dermaF2 || dermaF2.includes("available for a quick chat") || dermaF2.includes("having a great week")) {
    localStorage.setItem(TEMPLATE_DERMA_F2_KEY, DEFAULT_DERMA_F2);
  }

  // Initialize direct audit report templates
  if (!localStorage.getItem(TEMPLATE_DENTAL_AUDIT_KEY)) {
    localStorage.setItem(TEMPLATE_DENTAL_AUDIT_KEY, DEFAULT_DENTAL_AUDIT);
  }
  if (!localStorage.getItem(TEMPLATE_DERMA_AUDIT_KEY)) {
    localStorage.setItem(TEMPLATE_DERMA_AUDIT_KEY, DEFAULT_DERMA_AUDIT);
  }
}

async function initData() {
  if (supabaseClient) {
    try {
      console.log("Fetching leads from Supabase cloud database...");
      const { data, error } = await supabaseClient
        .from('leads')
        .select('*');
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        // Map database naming (snake_case) to client naming (camelCase)
        leads = data.map(row => ({
          id: row.id,
          name: row.name || "",
          phone: row.phone || "",
          email: row.email || "",
          address: row.address || "",
          specialty: row.specialty || "Dental",
          city: row.city || "Mumbai",
          tier: row.tier || "Metro",
          status: row.status || "New",
          rating: row.rating !== null ? parseFloat(row.rating) : 4.5,
          reviews: row.reviews !== null ? parseInt(row.reviews) : 50,
          remark: row.remark || "",
          lastContacted: row.last_contacted || null,
          followupStage: row.followup_stage !== null ? parseInt(row.followup_stage) : 0
        }));
        console.log(`Loaded ${leads.length} leads from Supabase.`);
        saveToLocalStorageOnly();
        return;
      } else {
        console.log("Supabase table is empty. Initializing default database...");
        initDefaultLeadsList();
        await pushAllLeadsToSupabase();
        return;
      }
    } catch (err) {
      console.error("Supabase load failed, falling back to LocalStorage:", err);
    }
  }

  // LocalStorage Fallback
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      leads = JSON.parse(stored);
    } catch (e) {
      console.error("Failed to parse stored leads, resetting to defaults", e);
      leads = [];
    }
  }

  if (!leads || leads.length === 0) {
    initDefaultLeadsList();
  } else {
    // Schema migration
    let migrated = false;
    leads.forEach((l, idx) => {
      if (l.status === undefined) {
        if (l.whatsapp) l.status = "Demo Sent";
        else if (l.called) l.status = "Called";
        else l.status = "New";
        migrated = true;
      }
      if (l.rating === undefined) {
        l.rating = parseFloat((3.8 + ((idx * 7) % 12) / 10).toFixed(1));
        l.reviews = (idx * 17) % 360 + 5;
        migrated = true;
      }
      if (l.lastContacted === undefined) {
        l.lastContacted = l.status !== "New" ? new Date().toISOString() : null;
        l.followupStage = l.status === "Demo Sent" ? 1 : 0;
        migrated = true;
      }
    });
    if (migrated) saveToLocalStorageOnly();
  }
}

function initDefaultLeadsList() {
  if (typeof DEFAULT_LEADS !== "undefined") {
    leads = DEFAULT_LEADS.map((lead, idx) => {
      const rating = parseFloat((3.8 + ((idx * 7) % 12) / 10).toFixed(1));
      const reviews = (idx * 17) % 360 + 5;
      
      return {
        id: idx + 1,
        name: lead.name || "",
        phone: lead.phone || "",
        email: lead.email || "",
        address: lead.address || "",
        specialty: lead.specialty || "Dental",
        city: lead.city || "Mumbai",
        tier: lead.tier || "Metro",
        status: "New",
        rating: rating,
        reviews: reviews,
        remark: "",
        lastContacted: null,
        followupStage: 0
      };
    });
    saveToLocalStorageOnly();
  } else {
    leads = [];
  }
}

function saveToLocalStorageOnly() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
}

// ── Hybrid Save (Updates LocalStorage + Supabase asynchronously) ──
async function saveLead(lead) {
  saveToLocalStorageOnly();
  if (supabaseClient) {
    try {
      const dbRow = {
        id: lead.id,
        name: lead.name,
        phone: lead.phone,
        email: lead.email,
        address: lead.address,
        specialty: lead.specialty,
        city: lead.city,
        tier: lead.tier,
        status: lead.status,
        rating: lead.rating,
        reviews: lead.reviews,
        remark: lead.remark,
        last_contacted: lead.lastContacted,
        followup_stage: lead.followupStage
      };
      
      const { error } = await supabaseClient
        .from('leads')
        .upsert(dbRow);
        
      if (error) throw error;
    } catch (e) {
      console.error("Failed to upsert lead to Supabase:", e);
    }
  }
}

async function deleteLeadFromDb(id) {
  if (supabaseClient) {
    try {
      const { error } = await supabaseClient
        .from('leads')
        .delete()
        .eq('id', id);
      if (error) throw error;
    } catch (e) {
      console.error("Failed to delete lead from Supabase:", e);
    }
  }
}

async function pushAllLeadsToSupabase() {
  if (!supabaseClient || leads.length === 0) return;
  try {
    console.log(`Syncing all ${leads.length} leads to Supabase...`);
    const dbRows = leads.map(lead => ({
      id: lead.id,
      name: lead.name,
      phone: lead.phone,
      email: lead.email,
      address: lead.address,
      specialty: lead.specialty,
      city: lead.city,
      tier: lead.tier,
      status: lead.status,
      rating: lead.rating,
      reviews: lead.reviews,
      remark: lead.remark,
      last_contacted: lead.lastContacted,
      followup_stage: lead.followupStage
    }));

    // Split rows in chunks of 50 to avoid request size limitations
    const chunkSize = 50;
    for (let i = 0; i < dbRows.length; i += chunkSize) {
      const chunk = dbRows.slice(i, i + chunkSize);
      const { error } = await supabaseClient
        .from('leads')
        .upsert(chunk);
      if (error) throw error;
    }
    console.log("Supabase bulk upload completed successfully.");
  } catch (e) {
    console.error("Bulk upload to Supabase failed:", e);
  }
}

function saveToStorage() {
  saveToLocalStorageOnly();
  if (supabaseClient) {
    pushAllLeadsToSupabase();
  }
}

// ── Dropdowns ─────────────────────────────────────────────────────────────
function populateCityFilter() {
  const select = document.getElementById("filter-city");
  const cities = [...new Set(leads.map(l => l.city))].filter(Boolean);
  cities.sort();

  select.innerHTML = '<option value="">All Cities</option>';
  cities.forEach(city => {
    const opt = document.createElement("option");
    opt.value = city;
    opt.textContent = city;
    select.appendChild(opt);
  });
}

// ── Stats Calculation ─────────────────────────────────────────────────────
function updateStats() {
  const total = leads.length;
  const contacted = leads.filter(l => l.status !== "New").length;
  const newCount = leads.filter(l => l.status === "New").length;
  const wonCount = leads.filter(l => l.status === "Won").length;

  document.getElementById("stat-total").textContent = total;
  document.getElementById("stat-contacted").textContent = `${contacted} (${total > 0 ? Math.round(contacted/total*100) : 0}%)`;
  document.getElementById("stat-new").textContent = newCount;
  document.getElementById("stat-won").textContent = wonCount;

  const pct = total > 0 ? (contacted / total) * 100 : 0;
  document.getElementById("stat-progress-bar").style.width = `${pct}%`;

  // Update follow-up badge counts in UI
  const followupQueue = leads.filter(l => l.status !== "New" && l.status !== "Won" && l.status !== "Lost");
  document.getElementById("followup-queue-count").textContent = followupQueue.length;
  document.getElementById("followup-badge").textContent = `${followupQueue.length} active in queue`;
}

// ── Priority Lead Scoring (Google Maps reviews & rating) ─────────────────
function calculatePriorityScore(rating, reviews) {
  // Score formula: rating * 10 (max 50) + reviews / 5 (capped at 50)
  const rScore = (rating || 0) * 10;
  const revScore = Math.min((reviews || 0) / 5, 50);
  return Math.round(rScore + revScore);
}

function getPriorityLabel(score) {
  if (score >= 70) return { text: "High", emoji: "🔥", class: "high" };
  if (score >= 50) return { text: "Medium", emoji: "⚡", class: "medium" };
  return { text: "Low", emoji: "💤", class: "low" };
}

// ── Search & Filter Logic ─────────────────────────────────────────────────
function applyFilters() {
  const searchQ = document.getElementById("search-input").value.trim().toLowerCase();
  const city = document.getElementById("filter-city").value;
  const specialty = document.getElementById("filter-specialty").value;
  const status = document.getElementById("filter-status").value;
  const priority = document.getElementById("filter-priority").value;
  const sortBy = document.getElementById("sort-by").value;

  filteredLeads = leads.filter(lead => {
    // 1. Search Query
    if (searchQ) {
      const matchName = lead.name.toLowerCase().includes(searchQ);
      const matchPhone = lead.phone.toLowerCase().includes(searchQ);
      const matchEmail = lead.email.toLowerCase().includes(searchQ);
      const matchAddress = lead.address.toLowerCase().includes(searchQ);
      if (!matchName && !matchPhone && !matchEmail && !matchAddress) return false;
    }

    // 2. City Filter
    if (city && lead.city !== city) return false;

    // 3. Specialty Filter
    if (specialty && lead.specialty !== specialty) return false;

    // 4. Status Stage Filter
    if (status && lead.status !== status) return false;

    // 5. Priority Filter
    if (priority) {
      const score = calculatePriorityScore(lead.rating, lead.reviews);
      const labelObj = getPriorityLabel(score);
      if (labelObj.text !== priority) return false;
    }

    return true;
  });

  // ── Sorting ──
  filteredLeads.sort((a, b) => {
    const scoreA = calculatePriorityScore(a.rating, a.reviews);
    const scoreB = calculatePriorityScore(b.rating, b.reviews);

    if (sortBy === "priority-desc") {
      return scoreB - scoreA;
    }
    if (sortBy === "priority-asc") {
      return scoreA - scoreB;
    }
    if (sortBy === "name-asc") {
      return a.name.localeCompare(b.name);
    }
    if (sortBy === "reviews-desc") {
      return (b.reviews || 0) - (a.reviews || 0);
    }
    return 0;
  });

  currentPage = 1;
  renderTable();
  updateCharts();
}

// ── Render Table ──────────────────────────────────────────────────────────
function renderTable() {
  const tbody = document.getElementById("leads-tbody");
  tbody.innerHTML = "";

  const total = filteredLeads.length;
  document.getElementById("showing-count").textContent = `${total} / ${leads.length}`;

  if (total === 0) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: var(--text-dim); padding: 40px 0;">No leads found matching current filters.</td></tr>`;
    updatePaginationControls(0);
    return;
  }

  const startIdx = (currentPage - 1) * rowsPerPage;
  const endIdx = Math.min(startIdx + rowsPerPage, total);
  const pageLeads = filteredLeads.slice(startIdx, endIdx);

  pageLeads.forEach(lead => {
    const tr = document.createElement("tr");
    tr.id = `row-${lead.id}`;
    
    const isSelected = selectedLeadIds.has(lead.id);

    // Escape helper
    const esc = (s) => (s || "").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const cleanAddr = esc(lead.address).replace(/^[\s\S]*?\n/, '').replace(/[^\x20-\x7E\s]/g, '').trim();

    // Priority badge
    const score = calculatePriorityScore(lead.rating, lead.reviews);
    const pri = getPriorityLabel(score);

    // Dynamic color class for stage dropdown
    const statusClass = lead.status.toLowerCase().replace(" ", "-");

    tr.innerHTML = `
      <td><input type="checkbox" class="lead-row-checkbox" data-id="${lead.id}" ${isSelected ? "checked" : ""} onchange="toggleSelectLead(this, ${lead.id})"></td>
      <td>
        <div class="lead-name-cell">
          <span class="lead-name-title" title="${esc(lead.name)}">${esc(lead.name)}</span>
          <span class="lead-address" title="${esc(lead.address)}">${cleanAddr || "No address listed"}</span>
          <div class="rating-row">
            <span class="stars">⭐ ${lead.rating ? lead.rating.toFixed(1) : "0.0"}</span>
            <span class="reviews">(${lead.reviews || 0} Google reviews)</span>
          </div>
        </div>
      </td>
      <td class="phone-cell">${esc(lead.phone) || "—"}</td>
      <td class="email-cell" title="${esc(lead.email)}">${esc(lead.email) || "—"}</td>
      <td>
        <div class="city-cell">
          <span class="city-name">${esc(lead.city)}</span>
          <span class="tier-badge ${lead.tier === "Metro" ? "metro" : "tier-2"}">${esc(lead.tier)}</span>
        </div>
      </td>
      <td>
        <span class="priority-badge ${pri.class}" title="Calculated Priority Score: ${score}/100">
          ${pri.emoji} ${pri.text} (${score})
        </span>
      </td>
      <td>
        <select class="status-select ${statusClass}" onchange="updateLeadStatus(${lead.id}, this.value, this)">
          <option value="New" ${lead.status === "New" ? "selected" : ""}>🆕 New</option>
          <option value="Called" ${lead.status === "Called" ? "selected" : ""}>📞 Called</option>
          <option value="Demo Sent" ${lead.status === "Demo Sent" ? "selected" : ""}>💻 Demo Sent</option>
          <option value="Follow-up" ${lead.status === "Follow-up" ? "selected" : ""}>🔄 Follow-up</option>
          <option value="Won" ${lead.status === "Won" ? "selected" : ""}>✅ Won</option>
          <option value="Lost" ${lead.status === "Lost" ? "selected" : ""}>❌ Lost</option>
        </select>
      </td>
      <td>
        <input type="text" class="remark-input" value="${esc(lead.remark)}" placeholder="Add note..." onchange="updateRemark(${lead.id}, this.value)">
      </td>
      <td>
        <div style="display: flex; gap: 4px; justify-content: center;">
          <button class="btn-wa-action" onclick="sendPersonalizedWa(${lead.id})" title="Launch WhatsApp Outreach with Template">💬</button>
          <button class="btn-wa-action btn-audit-action" onclick="openAuditReport(${lead.id})" title="Generate Personalized Presence Audit Report" style="background: rgba(59, 130, 246, 0.15); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.25);">📋</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });

  updatePaginationControls(total);
}

// ── Lead Stage Update ─────────────────────────────────────────────────────
function updateLeadStatus(id, newStatus, selectEl) {
  const lead = leads.find(l => l.id === id);
  if (lead) {
    lead.status = newStatus;
    
    // Apply dynamic border/text color class to dropdown select element
    selectEl.className = `status-select ${newStatus.toLowerCase().replace(" ", "-")}`;

    saveToStorage();
    updateStats();
    updateCharts();
  }
}

function updateRemark(id, value) {
  const lead = leads.find(l => l.id === id);
  if (lead) {
    lead.remark = value;
    saveToStorage();
  }
}

// ── WhatsApp Automator with settings ─────────────────────────────────────
function sendPersonalizedWa(id) {
  const lead = leads.find(l => l.id === id);
  if (!lead || !lead.phone) {
    alert("This lead doesn't have a phone number.");
    return;
  }

  let cleanPhone = lead.phone.replace(/[^\d]/g, "");
  if (cleanPhone.length === 10) {
    cleanPhone = "91" + cleanPhone;
  }

  const name = lead.name;
  const city = lead.city;
  const specialty = lead.specialty;

  // Clean doctor prefix to avoid double Dr. Dr. prefixes
  let docName = name;
  const drMatch = name.match(/Dr\.\s*([A-Za-z]+)/i);
  if (drMatch) {
    docName = drMatch[1]; // Get just the name without the "Dr."
  } else {
    docName = name.split(" ").slice(0, 2).join(" ");
  }

  // Load custom templates from localStorage
  let template = "";
  if (specialty === "Dermatology") {
    template = localStorage.getItem(TEMPLATE_DERMA_KEY) || DEFAULT_DERMA;
  } else {
    template = localStorage.getItem(TEMPLATE_DENTAL_KEY) || DEFAULT_DENTAL;
  }

  // Inject variables
  const auditLink = getAuditLink(lead);
  const text = template.replace(/\[Doctor_Name\]/g, docName)
                       .replace(/\[Clinic_Name\]/g, name)
                       .replace(/\[City\]/g, city)
                       .replace(/\[Audit_Link\]/g, auditLink);

  // Set pipeline state and timestamps
  lead.status = "Demo Sent";
  lead.lastContacted = new Date().toISOString();
  lead.followupStage = 0; // Stage 0: Initial Pitch Sent
  saveToStorage();
  updateStats();
  
  // Update table row in UI instantly
  const row = document.getElementById(`row-${id}`);
  if (row) {
    const sel = row.querySelector(".status-select");
    if (sel) {
      sel.value = "Demo Sent";
      sel.className = "status-select demo-sent";
    }
  }

  // Open in new window
  const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank");
}

// ── Open Dynamic Audit Report ──
function openAuditReport(id) {
  const lead = leads.find(l => l.id === id);
  if (!lead) return;
  const link = getAuditLink(lead);
  window.open(link, "_blank");
}

function getAuditLink(lead) {
  const nameEnc = encodeURIComponent(lead.name);
  const cityEnc = encodeURIComponent(lead.city);
  const specEnc = encodeURIComponent(lead.specialty);
  const rateEnc = encodeURIComponent(lead.rating || 4.2);
  const revsEnc = encodeURIComponent(lead.reviews || 30);
  
  const base = window.location.origin + window.location.pathname.replace("index.html", "").replace(/\/$/, "");
  return `${base}/audit.html?name=${nameEnc}&city=${cityEnc}&specialty=${specEnc}&rating=${rateEnc}&reviews=${revsEnc}`;
}

// ── View Mode Tab Switcher ──
let currentViewMode = "prospects";

function switchViewMode(mode) {
  currentViewMode = mode;
  const tabProspects = document.getElementById("tab-btn-prospects");
  const tabFollowups = document.getElementById("tab-btn-followups");
  
  const sectionProspects = document.getElementById("prospects-view-section");
  const sectionFollowups = document.getElementById("followups-view-section");
  const filterBar = document.getElementById("filter-bar-container");

  if (mode === "prospects") {
    tabProspects.classList.add("active");
    tabFollowups.classList.remove("active");
    sectionProspects.classList.remove("hidden");
    sectionFollowups.classList.add("hidden");
    filterBar.classList.remove("hidden");
    applyFilters();
  } else {
    tabFollowups.classList.add("active");
    tabProspects.classList.remove("active");
    sectionFollowups.classList.remove("hidden");
    sectionProspects.classList.add("hidden");
    filterBar.classList.add("hidden"); // Focus solely on followups
    renderFollowupTable();
  }
}

// ── Render Follow-up Queue Table ──
// Helper to format remaining time nicely
function formatRemainingTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const totalHours = Math.floor(totalMinutes / 60);
  const days = Math.floor(totalHours / 24);
  
  if (days > 0) {
    return `${days}d ${totalHours % 24}h`;
  }
  if (totalHours > 0) {
    return `${totalHours}h ${totalMinutes % 60}m`;
  }
  return `${totalMinutes}m`;
}

// ── Render Follow-up Queue Table ──
function renderFollowupTable() {
  const tbody = document.getElementById("followups-tbody");
  tbody.innerHTML = "";

  // Follow-up Queue shows contacted leads (not New, Won, or Lost)
  const queueLeads = leads.filter(l => l.status !== "New" && l.status !== "Won" && l.status !== "Lost");

  if (queueLeads.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-dim); padding: 40px 0;">No active leads in the follow-up queue yet. Start by sending an initial WhatsApp pitch to any prospect!</td></tr>`;
    return;
  }

  const now = new Date().getTime();
  queueLeads.forEach(lead => {
    const lastTime = lead.lastContacted ? new Date(lead.lastContacted).getTime() : 0;
    const elapsedMs = now - lastTime;
    
    // Determine required delay based on current stage
    let delayMs = 0;
    if (lead.followupStage === 0) {
      delayMs = 2 * 24 * 60 * 60 * 1000; // 2 days (48h) for F1
    } else if (lead.followupStage === 1) {
      delayMs = 3 * 24 * 60 * 60 * 1000; // 3 days (72h) for F2
    }
    
    lead._isDue = elapsedMs >= delayMs;
    lead._timeRemainingMs = Math.max(0, delayMs - elapsedMs);
  });

  // Sort: 
  // 1. Due leads first (oldest lastContacted first)
  // 2. Non-due leads next (closest to becoming due first, i.e., smallest remaining time)
  // 3. Maxed out leads last
  queueLeads.sort((a, b) => {
    const aMaxed = a.followupStage >= 2;
    const bMaxed = b.followupStage >= 2;
    
    if (aMaxed && !bMaxed) return 1;
    if (!aMaxed && bMaxed) return -1;
    if (aMaxed && bMaxed) return 0;
    
    if (a._isDue && !b._isDue) return -1;
    if (!a._isDue && b._isDue) return 1;
    
    if (a._isDue && b._isDue) {
      return new Date(a.lastContacted).getTime() - new Date(b.lastContacted).getTime();
    } else {
      return a._timeRemainingMs - b._timeRemainingMs;
    }
  });

  queueLeads.forEach(lead => {
    const tr = document.createElement("tr");
    tr.id = `followup-row-${lead.id}`;

    const esc = (s) => (s || "").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    // Relative contacted time helper
    const relativeTime = getRelativeTimeStr(lead.lastContacted);
    const dateFormatted = lead.lastContacted ? new Date(lead.lastContacted).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit"
    }) : "Never";

    // Stage labels
    let stageClass = "initial-pitch";
    let stageLabel = "Initial Pitch Sent";
    let nextActionLabel = "Send Follow-up 1";
    let btnClass = "btn-f1";
    let nextStageNum = 1;
    let isMaxed = false;

    if (lead.followupStage === 1) {
      stageClass = "follow-up-1";
      stageLabel = "Follow-up 1 Sent";
      nextActionLabel = "Send Follow-up 2";
      btnClass = "btn-f2";
      nextStageNum = 2;
    } else if (lead.followupStage >= 2) {
      stageClass = "follow-up-2";
      stageLabel = "Follow-up 2 Sent";
      nextActionLabel = "✅ All Follow-ups Sent";
      btnClass = "btn-secondary";
      isMaxed = true;
    }

    // Due badge
    let dueBadgeHtml = "";
    if (isMaxed) {
      dueBadgeHtml = `<span class="completed-badge">✓ Sequence Done</span>`;
    } else if (lead._isDue) {
      dueBadgeHtml = `<span class="due-now-badge">🔴 DUE NOW</span>`;
    } else {
      dueBadgeHtml = `<span class="waiting-badge">⏳ in ${formatRemainingTime(lead._timeRemainingMs)}</span>`;
    }

    tr.innerHTML = `
      <td>
        <div class="lead-name-cell">
          <span class="lead-name-title">${esc(lead.name)}</span>
          <span class="lead-address" style="color: var(--text-dim); font-size: 0.72rem;">${esc(lead.specialty)} • ⭐ ${lead.rating}</span>
        </div>
      </td>
      <td>
        <div class="city-cell">
          <span class="city-name">${esc(lead.city)}</span>
          <span class="tier-badge ${lead.tier === "Metro" ? "metro" : "tier-2"}">${esc(lead.tier)}</span>
        </div>
      </td>
      <td class="phone-cell">${esc(lead.phone)}</td>
      <td>
        <div class="last-contacted-info">
          <span class="last-contacted-time">${dateFormatted}</span>
          <span class="last-contacted-relative">${relativeTime}</span>
        </div>
      </td>
      <td>
        <span class="followup-stage-badge ${stageClass}">${stageLabel}</span>
        ${dueBadgeHtml}
      </td>
      <td>
        <input type="text" class="remark-input" value="${esc(lead.remark)}" placeholder="Add note..." onchange="updateRemark(${lead.id}, this.value)">
      </td>
      <td>
        <div style="display: flex; gap: 4px; justify-content: center; align-items: center;">
          <button class="btn-followup-action ${btnClass}" ${isMaxed ? "disabled" : ""} onclick="sendFollowupWa(${lead.id}, ${nextStageNum})" style="flex-grow: 1;">
            💬 ${nextActionLabel}
          </button>
          <button class="btn-wa-action btn-audit-action" onclick="openAuditReport(${lead.id})" title="View Personalized Presence Audit Report" style="background: rgba(59, 130, 246, 0.15); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.25); height: 32px; width: 32px; padding: 0; font-size: 0.85rem; border-radius: 4px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">📋</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// ── Send WhatsApp Follow-up ──
function sendFollowupWa(id, nextStage) {
  const lead = leads.find(l => l.id === id);
  if (!lead) return;

  let cleanPhone = lead.phone.replace(/[^\d]/g, "");
  if (cleanPhone.length === 10) {
    cleanPhone = "91" + cleanPhone;
  }

  const name = lead.name;
  const city = lead.city;
  const specialty = lead.specialty;

  let docName = name;
  const drMatch = name.match(/Dr\.\s+[A-Za-z]+/i);
  if (drMatch) {
    docName = drMatch[0];
  } else {
    docName = name.split(" ").slice(0, 3).join(" ");
  }

  // Choose the correct follow-up template
  let key = "";
  if (specialty === "Dermatology") {
    key = nextStage === 1 ? TEMPLATE_DERMA_F1_KEY : TEMPLATE_DERMA_F2_KEY;
  } else {
    key = nextStage === 1 ? TEMPLATE_DENTAL_F1_KEY : TEMPLATE_DENTAL_F2_KEY;
  }

  const defaultTemplate = specialty === "Dermatology" 
    ? (nextStage === 1 ? DEFAULT_DERMA_F1 : DEFAULT_DERMA_F2)
    : (nextStage === 1 ? DEFAULT_DENTAL_F1 : DEFAULT_DENTAL_F2);

  const template = localStorage.getItem(key) || defaultTemplate;

  // Inject variables
  const auditLink = getAuditLink(lead);
  const text = template.replace(/\[Doctor_Name\]/g, docName)
                       .replace(/\[Clinic_Name\]/g, name)
                       .replace(/\[City\]/g, city)
                       .replace(/\[Audit_Link\]/g, auditLink);

  // Update lead stage & contact timestamps
  lead.status = "Follow-up";
  lead.lastContacted = new Date().toISOString();
  lead.followupStage = nextStage;
  saveToStorage();
  updateStats();

  // Rerender follow-up table
  renderFollowupTable();

  // Open WhatsApp Link in a new tab
  const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank");
}

// ── Time helper ──
function getRelativeTimeStr(isoString) {
  if (!isoString) return "Never";
  const ms = new Date().getTime() - new Date(isoString).getTime();
  const sec = Math.floor(ms / 1000);
  if (sec < 60) return "Just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const days = Math.floor(hr / 24);
  return `${days}d ago`;
}

// ── Pagination Controls ───────────────────────────────────────────────────
function updatePaginationControls(total) {
  const prevBtn = document.getElementById("btn-prev");
  const nextBtn = document.getElementById("btn-next");
  const info = document.getElementById("pagination-info");
  const container = document.getElementById("page-numbers-container");
  
  container.innerHTML = "";

  if (total === 0) {
    info.textContent = "Showing 0 of 0 leads";
    prevBtn.disabled = true;
    nextBtn.disabled = true;
    return;
  }

  const totalPages = Math.ceil(total / rowsPerPage);
  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === totalPages;

  const start = (currentPage - 1) * rowsPerPage + 1;
  const end = Math.min(start + rowsPerPage - 1, total);
  info.textContent = `Showing ${start} to ${end} of ${total} leads`;

  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, startPage + 4);
  if (endPage - startPage < 4) {
    startPage = Math.max(1, endPage - 4);
  }

  for (let i = startPage; i <= endPage; i++) {
    const btn = document.createElement("button");
    btn.className = `btn-num ${i === currentPage ? "active" : ""}`;
    btn.textContent = i;
    btn.onclick = () => {
      currentPage = i;
      renderTable();
    };
    container.appendChild(btn);
  }
}

function prevPage() {
  if (currentPage > 1) {
    currentPage--;
    renderTable();
  }
}

function nextPage() {
  const totalPages = Math.ceil(filteredLeads.length / rowsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    renderTable();
  }
}

// ── Multi-Select Lead Selection ───────────────────────────────────────────
function toggleSelectLead(checkbox, id) {
  if (checkbox.checked) {
    selectedLeadIds.add(id);
  } else {
    selectedLeadIds.delete(id);
  }
  updateBulkActionVisibility();
}

function toggleSelectAll(checkbox) {
  const checkBoxes = document.querySelectorAll(".lead-row-checkbox");
  checkBoxes.forEach(box => {
    const id = parseInt(box.dataset.id);
    box.checked = checkbox.checked;
    if (checkbox.checked) {
      selectedLeadIds.add(id);
    } else {
      selectedLeadIds.delete(id);
    }
  });
  updateBulkActionVisibility();
}

function updateBulkActionVisibility() {
  const bulkBar = document.getElementById("bulk-actions");
  const countSpan = document.getElementById("selected-count");
  
  if (selectedLeadIds.size > 0) {
    bulkBar.style.display = "flex";
    countSpan.textContent = `${selectedLeadIds.size} selected`;
  } else {
    bulkBar.style.display = "none";
    document.getElementById("select-all-checkbox").checked = false;
  }
}

function bulkMark(status) {
  leads.forEach(lead => {
    if (selectedLeadIds.has(lead.id)) {
      lead.status = status;
      saveLead(lead); // Sync individual update to Supabase
    }
  });
  saveToLocalStorageOnly();
  updateStats();
  applyFilters();
  selectedLeadIds.clear();
  updateBulkActionVisibility();
}

function bulkDelete() {
  if (confirm(`Are you sure you want to delete the ${selectedLeadIds.size} selected leads?`)) {
    selectedLeadIds.forEach(id => {
      deleteLeadFromDb(id); // Sync delete to Supabase
    });
    leads = leads.filter(l => !selectedLeadIds.has(l.id));
    saveToLocalStorageOnly();
    populateCityFilter();
    applyFilters();
    updateStats();
    selectedLeadIds.clear();
    updateBulkActionVisibility();
  }
}

// ── Manual Add Modal ──────────────────────────────────────────────────────
function openAddLeadModal() {
  document.getElementById("add-lead-modal").classList.add("open");
}

function closeAddLeadModal() {
  document.getElementById("add-lead-modal").classList.remove("open");
  document.getElementById("add-lead-form").reset();
}

function handleAddLead(e) {
  e.preventDefault();
  const name = document.getElementById("lead-name").value.trim();
  const phone = document.getElementById("lead-phone").value.trim();
  const email = document.getElementById("lead-email").value.trim();
  const specialty = document.getElementById("lead-specialty").value;
  const city = document.getElementById("lead-city").value.trim();
  const tier = document.getElementById("lead-tier").value;
  const rating = parseFloat(document.getElementById("lead-rating").value);
  const reviews = parseInt(document.getElementById("lead-reviews").value);
  const address = document.getElementById("lead-address").value.trim();

  const newId = leads.length > 0 ? Math.max(...leads.map(l => l.id)) + 1 : 1;

  const newLead = {
    id: newId,
    name,
    phone,
    email,
    address,
    specialty,
    city,
    tier,
    status: "New",
    rating,
    reviews,
    remark: "",
    lastContacted: null,
    followupStage: 0
  };

  leads.push(newLead);
  saveLead(newLead); // Hybrid save: localStorage + Supabase
  populateCityFilter();
  applyFilters();
  updateStats();
  closeAddLeadModal();
}

// ── Settings / Template Editor Modal ──
function openSettingsModal() {
  document.getElementById("settings-modal").classList.add("open");
  document.getElementById("template-dental").value = localStorage.getItem(TEMPLATE_DENTAL_KEY) || DEFAULT_DENTAL;
  document.getElementById("template-derma").value = localStorage.getItem(TEMPLATE_DERMA_KEY) || DEFAULT_DERMA;
  document.getElementById("template-dental-f1").value = localStorage.getItem(TEMPLATE_DENTAL_F1_KEY) || DEFAULT_DENTAL_F1;
  document.getElementById("template-derma-f1").value = localStorage.getItem(TEMPLATE_DERMA_F1_KEY) || DEFAULT_DERMA_F1;
  document.getElementById("template-dental-f2").value = localStorage.getItem(TEMPLATE_DENTAL_F2_KEY) || DEFAULT_DENTAL_F2;
  document.getElementById("template-derma-f2").value = localStorage.getItem(TEMPLATE_DERMA_F2_KEY) || DEFAULT_DERMA_F2;
  
  // Database Config fields
  document.getElementById("db-supabase-url").value = localStorage.getItem(DB_SUPABASE_URL_KEY) || DEFAULT_SUPABASE_URL;
  document.getElementById("db-supabase-key").value = localStorage.getItem(DB_SUPABASE_KEY_KEY) || DEFAULT_SUPABASE_KEY;
  
  switchSettingsTab("initial");
}

function closeSettingsModal() {
  document.getElementById("settings-modal").classList.remove("open");
}

function switchSettingsTab(tabName) {
  const tabs = document.querySelectorAll(".settings-sec-tab");
  tabs.forEach(t => t.classList.add("hidden"));
  document.getElementById(`settings-section-${tabName}`).classList.remove("hidden");

  // Highlight active button
  const btns = ["initial", "follow1", "follow2", "db"];
  btns.forEach(b => {
    const el = document.getElementById(`btn-set-tab-${b}`);
    if (b === tabName) {
      el.classList.add("btn-primary");
      el.classList.remove("btn-secondary");
    } else {
      el.classList.add("btn-secondary");
      el.classList.remove("btn-primary");
    }
  });
}

async function saveSettings() {
  const dental = document.getElementById("template-dental").value.trim();
  const derma = document.getElementById("template-derma").value.trim();
  const dentalF1 = document.getElementById("template-dental-f1").value.trim();
  const dermaF1 = document.getElementById("template-derma-f1").value.trim();
  const dentalF2 = document.getElementById("template-dental-f2").value.trim();
  const dermaF2 = document.getElementById("template-derma-f2").value.trim();
  
  // Database configs
  const dbUrl = document.getElementById("db-supabase-url").value.trim();
  const dbKey = document.getElementById("db-supabase-key").value.trim();
  
  localStorage.setItem(TEMPLATE_DENTAL_KEY, dental);
  localStorage.setItem(TEMPLATE_DERMA_KEY, derma);
  localStorage.setItem(TEMPLATE_DENTAL_F1_KEY, dentalF1);
  localStorage.setItem(TEMPLATE_DERMA_F1_KEY, dermaF1);
  localStorage.setItem(TEMPLATE_DENTAL_F2_KEY, dentalF2);
  localStorage.setItem(TEMPLATE_DERMA_F2_KEY, dermaF2);
  
  // Update database config
  const oldUrl = localStorage.getItem(DB_SUPABASE_URL_KEY) || "";
  const oldKey = localStorage.getItem(DB_SUPABASE_KEY_KEY) || "";
  
  if (dbUrl) {
    localStorage.setItem(DB_SUPABASE_URL_KEY, dbUrl);
  } else {
    localStorage.removeItem(DB_SUPABASE_URL_KEY);
  }
  if (dbKey) {
    localStorage.setItem(DB_SUPABASE_KEY_KEY, dbKey);
  } else {
    localStorage.removeItem(DB_SUPABASE_KEY_KEY);
  }
  
  closeSettingsModal();
  
  // Re-initialize Supabase if connection details changed
  if (dbUrl !== oldUrl || dbKey !== oldKey) {
    initSupabase();
    alert("Configuration saved. Fetching data from your new Supabase database...");
    await initData();
    populateCityFilter();
    applyFilters();
    updateStats();
    updateCharts();
  } else {
    alert("Templates and settings saved successfully!");
  }
}

// ── Collapsible Analytics ─────────────────────────────────────────────────
function initAnalyticsState() {
  const show = localStorage.getItem(SHOW_ANALYTICS_KEY) === "true";
  const el = document.getElementById("analytics-section");
  if (show) el.classList.remove("hidden");
  else el.classList.add("hidden");
}

function toggleAnalytics() {
  const el = document.getElementById("analytics-section");
  const hidden = el.classList.toggle("hidden");
  localStorage.setItem(SHOW_ANALYTICS_KEY, (!hidden).toString());
  if (!hidden) {
    updateCharts();
  }
}

// ── Chart.js Visual Models ──
function updateCharts() {
  const el = document.getElementById("analytics-section");
  if (el.classList.contains("hidden")) return;

  // 1. Pipeline Stages Data
  const stages = ["New", "Called", "Demo Sent", "Follow-up", "Won", "Lost"];
  const stageCounts = stages.map(st => filteredLeads.filter(l => l.status === st).length);

  const pipelineCanvas = document.getElementById("pipelineChart");
  if (pipelineChart) {
    pipelineChart.data.datasets[0].data = stageCounts;
    pipelineChart.update();
  } else {
    pipelineChart = new Chart(pipelineCanvas, {
      type: "doughnut",
      data: {
        labels: stages,
        datasets: [{
          data: stageCounts,
          backgroundColor: ["#64748b", "#8b5cf6", "#06b6d4", "#f97316", "#10b981", "#f43f5e"],
          borderColor: "rgba(7, 7, 16, 0.6)",
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "right",
            labels: { color: "#f8fafc", font: { family: "Plus Jakarta Sans", size: 11 } }
          }
        }
      }
    });
  }

  // 2. Cities Lead Count Data (Top 7)
  const cityCounts = {};
  filteredLeads.forEach(l => {
    cityCounts[l.city] = (cityCounts[l.city] || 0) + 1;
  });
  const sortedCities = Object.keys(cityCounts).sort((a,b) => cityCounts[b] - cityCounts[a]).slice(0, 7);
  const cityValues = sortedCities.map(c => cityCounts[c]);

  const cityCanvas = document.getElementById("cityChart");
  if (cityChart) {
    cityChart.data.labels = sortedCities;
    cityChart.data.datasets[0].data = cityValues;
    cityChart.update();
  } else {
    cityChart = new Chart(cityCanvas, {
      type: "bar",
      data: {
        labels: sortedCities,
        datasets: [{
          label: "Leads",
          data: cityValues,
          backgroundColor: "rgba(139, 92, 246, 0.45)",
          borderColor: "#8b5cf6",
          borderWidth: 1.5,
          borderRadius: 4
        }]
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            grid: { color: "rgba(255, 255, 255, 0.05)" },
            ticks: { color: "#94a3b8", font: { size: 10 } }
          },
          y: {
            grid: { display: false },
            ticks: { color: "#f8fafc", font: { size: 10, weight: "bold" } }
          }
        },
        plugins: {
          legend: { display: false }
        }
      }
    });
  }
}

// ── CSV Import ────────────────────────────────────────────────────────────
function handleCsvImport(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(evt) {
    const text = evt.target.result;
    parseAndImportCsv(text);
  };
  reader.readAsText(file);
}

function parseAndImportCsv(text) {
  const rows = [];
  const lines = text.split(/\r\n|\n/);
  
  lines.forEach(line => {
    if (!line.trim()) return;
    const cols = [];
    let insideQuote = false;
    let entry = "";
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        insideQuote = !insideQuote;
      } else if (char === ',' && !insideQuote) {
        cols.push(entry.trim().replace(/^"|"$/g, ''));
        entry = "";
      } else {
        entry += char;
      }
    }
    cols.push(entry.trim().replace(/^"|"$/g, ''));
    rows.push(cols);
  });

  if (rows.length < 2) {
    alert("Invalid CSV format or empty file.");
    return;
  }

  const headers = rows[0].map(h => h.toLowerCase());
  const idxName = headers.findIndex(h => h.includes("name") || h.includes("title"));
  const idxPhone = headers.findIndex(h => h.includes("phone") || h.includes("tel"));
  const idxEmail = headers.findIndex(h => h.includes("email") || h.includes("mail"));
  const idxAddress = headers.findIndex(h => h.includes("address") || h.includes("addr"));
  const idxCity = headers.findIndex(h => h.includes("city") || h.includes("loc"));
  const idxSpecialty = headers.findIndex(h => h.includes("spec") || h.includes("type") || h.includes("niche"));
  const idxTier = headers.findIndex(h => h.includes("tier"));
  const idxRating = headers.findIndex(h => h.includes("rating") || h.includes("score"));
  const idxReviews = headers.findIndex(h => h.includes("reviews") || h.includes("count"));

  if (idxName === -1 || idxPhone === -1) {
    alert("CSV must contain at least 'Name' and 'Phone' headers.");
    return;
  }

  let importCount = 0;
  let dupCount = 0;
  let currentMaxId = leads.length > 0 ? Math.max(...leads.map(l => l.id)) : 0;

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length < 2) continue;

    const name = row[idxName] || "";
    const phone = row[idxPhone] || "";
    if (!name || !phone) continue;

    const isDup = leads.some(l => l.phone.replace(/[^\d]/g, "") === phone.replace(/[^\d]/g, ""));
    if (isDup) {
      dupCount++;
      continue;
    }

    currentMaxId++;
    
    // Fallback ratings
    const rating = idxRating !== -1 ? parseFloat(row[idxRating]) : parseFloat((3.8 + ((currentMaxId * 7) % 12) / 10).toFixed(1));
    const reviews = idxReviews !== -1 ? parseInt(row[idxReviews]) : ((currentMaxId * 17) % 360 + 5);

    const newLead = {
      id: currentMaxId,
      name,
      phone,
      email: idxEmail !== -1 ? row[idxEmail] : "",
      address: idxAddress !== -1 ? row[idxAddress] : "",
      city: idxCity !== -1 ? row[idxCity] : "Imported",
      tier: idxTier !== -1 ? row[idxTier] : "Metro",
      specialty: idxSpecialty !== -1 ? row[idxSpecialty] : "Dental",
      status: "New",
      rating,
      reviews,
      remark: "",
      lastContacted: null,
      followupStage: 0
    };

    leads.push(newLead);
    importCount++;
  }

  saveToStorage();
  populateCityFilter();
  applyFilters();
  updateStats();

  alert(`Import complete!\n📥 Imported: ${importCount} new leads\n⚠️ Skipped duplicates: ${dupCount}`);
  document.getElementById("csv-file-input").value = ""; 
}

// ── CSV Export ────────────────────────────────────────────────────────────
function exportToCsv() {
  const headers = ["ID", "Name", "Phone", "Email", "Address", "City", "Tier", "Specialty", "Google Rating", "Google Reviews", "Outreach Status", "Last Contacted Date", "Followup Stage", "Remarks"];
  
  const csvRows = [headers.join(",")];

  leads.forEach(l => {
    const row = [
      l.id,
      `"${l.name.replace(/"/g, '""')}"`,
      `"${l.phone}"`,
      `"${l.email}"`,
      `"${l.address.replace(/"/g, '""').replace(/\n/g, ' ')}"`,
      `"${l.city}"`,
      `"${l.tier}"`,
      `"${l.specialty}"`,
      l.rating ? l.rating.toFixed(1) : "0.0",
      l.reviews || 0,
      `"${l.status}"`,
      l.lastContacted ? `"${l.lastContacted}"` : '""',
      l.followupStage || 0,
      `"${(l.remark || "").replace(/"/g, '""')}"`
    ];
    csvRows.push(row.join(","));
  });

  const csvString = csvRows.join("\n");
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  
  const date = new Date().toISOString().split('T')[0];
  link.href = URL.createObjectURL(blob);
  link.download = `leads_tracker_outreach_${date}.csv`;
  link.click();
}
