/**
 * app.js — LeadReach v3 — Multi-Specialty AI Engineer Outreach Tracker
 * ==========================================================================
 * Features:
 *  - Personal AI Engineer voice for ALL 8+ doctor specialties + recruitment
 *  - Full F0 / F1 / F2 follow-up sequence per specialty
 *  - Smart CSV import with duplicate detection (phone + name matching)
 *  - Supabase cloud sync + LocalStorage fallback
 *  - Pagination, Priority scoring, Analytics charts
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

// ── LocalStorage Keys — all specialties ──────────────────────────────────
const STORAGE_KEY              = "LEAD_TRACKER_DATA";
const SHOW_ANALYTICS_KEY       = "SHOW_ANALYTICS_DASH";
const DB_SUPABASE_URL_KEY      = "SUPABASE_DB_URL";
const DB_SUPABASE_KEY_KEY      = "SUPABASE_DB_KEY";

// Doctor templates (initial + F1 + F2)
const TMPL = {
  dental:      { f0: "TMPL_DENTAL_F0",      f1: "TMPL_DENTAL_F1",      f2: "TMPL_DENTAL_F2"      },
  derma:       { f0: "TMPL_DERMA_F0",       f1: "TMPL_DERMA_F1",       f2: "TMPL_DERMA_F2"       },
  eye:         { f0: "TMPL_EYE_F0",         f1: "TMPL_EYE_F1",         f2: "TMPL_EYE_F2"         },
  pediatrics:  { f0: "TMPL_PEDIA_F0",       f1: "TMPL_PEDIA_F1",       f2: "TMPL_PEDIA_F2"       },
  ent:         { f0: "TMPL_ENT_F0",         f1: "TMPL_ENT_F1",         f2: "TMPL_ENT_F2"         },
  ortho:       { f0: "TMPL_ORTHO_F0",       f1: "TMPL_ORTHO_F1",       f2: "TMPL_ORTHO_F2"       },
  cardio:      { f0: "TMPL_CARDIO_F0",      f1: "TMPL_CARDIO_F1",      f2: "TMPL_CARDIO_F2"      },
  general:     { f0: "TMPL_GENERAL_F0",     f1: "TMPL_GENERAL_F1",     f2: "TMPL_GENERAL_F2"     },
  recruitment: { f0: "TMPL_RECRUIT_F0",     f1: "TMPL_RECRUIT_F1",     f2: "TMPL_RECRUIT_F2"     },
};

// Keep legacy keys pointing to same values for backward compat
const TEMPLATE_DENTAL_KEY         = TMPL.dental.f0;
const TEMPLATE_DERMA_KEY          = TMPL.derma.f0;
const TEMPLATE_DOCTOR_KEY         = TMPL.general.f0;
const TEMPLATE_RECRUITMENT_KEY    = TMPL.recruitment.f0;
const TEMPLATE_DENTAL_F1_KEY      = TMPL.dental.f1;
const TEMPLATE_DENTAL_F2_KEY      = TMPL.dental.f2;
const TEMPLATE_DERMA_F1_KEY       = TMPL.derma.f1;
const TEMPLATE_DERMA_F2_KEY       = TMPL.derma.f2;
const TEMPLATE_RECRUITMENT_F1_KEY = TMPL.recruitment.f1;
const TEMPLATE_RECRUITMENT_F2_KEY = TMPL.recruitment.f2;
const TEMPLATE_DENTAL_AUDIT_KEY   = "TMPL_DENTAL_AUDIT";
const TEMPLATE_DERMA_AUDIT_KEY    = "TMPL_DERMA_AUDIT";

const DEFAULT_SUPABASE_URL = "https://gagkjmoxdsxjgitjxnxi.supabase.co";
const DEFAULT_SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhZ2tqbW94ZHN4amdpdGp4bnhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM4NjIyMTQsImV4cCI6MjA5OTQzODIxNH0.6bhJmTt019kGBbjXnbaSMH4orkF_4hj-P5uO6rp76Ao";

// ── Database Client State ──
let supabaseClient = null;

// ══════════════════════════════════════════════════════════════════════════
// DEFAULT WHATSAPP TEMPLATES — Personal AI & Automation Engineer Voice
// Sender: Aditya (independent AI & automation engineer)
// All messages include specific [Vercel_Link] + [Audit_Link] per specialty
// ══════════════════════════════════════════════════════════════════════════

// ─── 🦷 DENTAL ────────────────────────────────────────────────────────────
const DEFAULT_DENTAL = `Hey Dr. [Doctor_Name] 👋

I'm Aditya — an independent AI & automation engineer. I build booking & patient flow systems for clinics.

I noticed [Clinic_Name] doesn't have a website yet. I ran a quick Digital Presence Audit — it estimates how many dental patients in [City] you're losing each month to clinics that have online booking:
👉 [Audit_Link]

I also built a live demo — a 24/7 dental booking + patient intake flow — specifically for clinics like yours:
👉 [Vercel_Link]

I can have this live with your branding in under 24 hours. Worth a 2-min look? 🦷`;

const DEFAULT_DENTAL_F1 = `Hey Dr. [Doctor_Name] — Aditya here again 👋

Just wanted to make sure you saw the dental booking demo I built:
👉 [Vercel_Link]

And your personalized presence audit (shows the monthly leads you're missing):
👉 [Audit_Link]

If you'd like I can walk you through it in 5 minutes over a call — no pressure at all. 🦷`;

const DEFAULT_DENTAL_F2 = `Dr. [Doctor_Name] — last message from me, I promise 🙂

I'm setting up dental booking sites for a few clinics in [City] this week. If [Clinic_Name] wants a custom setup, I can prioritize your slot — just say the word.

Demo: 👉 [Vercel_Link]

No commitment — just a quick look and we take it from there. 🦷`;

// ─── 🌿 DERMATOLOGY ───────────────────────────────────────────────────────
const DEFAULT_DERMA = `Hey Dr. [Doctor_Name] 👋

I'm Aditya — an AI & automation engineer. I build smart patient acquisition systems for skin clinics.

Acne, pigmentation and skin patients in [City] search online for hours before picking a clinic. Most book from whoever has the most professional-looking web presence.

I ran an audit for [Clinic_Name] showing the gap:
👉 [Audit_Link]

And built a live skin clinic demo with a 1-minute "Skin Concern Screener" quiz that pre-qualifies patients before they arrive:
👉 [Vercel_Link]

Can have it customized for your clinic in 24 hours. Worth a quick look? 🌿`;

const DEFAULT_DERMA_F1 = `Hey Dr. [Doctor_Name] — Aditya again 👋

Did you get a chance to try the skin quiz on the demo?
👉 [Vercel_Link]

It lets patients pre-select their concern (Acne, Melasma, Hair loss) before booking — saves your receptionist time and filters serious patients.

Your clinic audit is here if you haven't seen it:
👉 [Audit_Link]

Open to a 5-min chat this week? 🌿`;

const DEFAULT_DERMA_F2 = `Dr. [Doctor_Name] — final message from me 🙂

Launching the "ClearSkin" patient acquisition system for a few dermatology clinics in [City] this week.

If [Clinic_Name] wants a spot, I can set it up with your branding:
👉 [Vercel_Link]

Just one message back and we can start. No pressure. 🌿`;

// ─── 👁️ OPHTHALMOLOGY / EYE ──────────────────────────────────────────────
const DEFAULT_EYE = `Hey Dr. [Doctor_Name] 👋

I'm Aditya — an AI & automation engineer. I build appointment booking systems for specialty clinics.

Eye patients in [City] searching for LASIK evaluations, retina checks, or vision exams almost always book from clinics they can find online with easy booking.

I ran a quick presence audit for [Clinic_Name]:
👉 [Audit_Link]

And built a live demo — an Eye Clinic website with a Vision Screening Quiz + instant slot booking:
👉 [Vercel_Link]

I can customize and launch this for your clinic in under 24 hours. Worth a quick look? 👁️`;

const DEFAULT_EYE_F1 = `Hey Dr. [Doctor_Name] — Aditya here 👋

Following up on the Eye Clinic demo I sent:
👉 [Vercel_Link]

The vision screening quiz on it pre-qualifies patients (blurry vision, LASIK interest, etc.) before they even book — reduces no-shows significantly.

Your clinic audit:
👉 [Audit_Link]

Happy to walk you through it in 5 mins if you're free this week. 👁️`;

const DEFAULT_EYE_F2 = `Dr. [Doctor_Name] — last follow-up from my side 🙂

Setting up eye clinic booking systems in [City] this week. If [Clinic_Name] wants to be included, I can start your custom setup now:
👉 [Vercel_Link]

Just one message and we go. No obligation. 👁️`;

// ─── 👶 PEDIATRICS ────────────────────────────────────────────────────────
const DEFAULT_PEDIA = `Hey Dr. [Doctor_Name] 👋

I'm Aditya — an AI & automation engineer. I build booking and patient intake systems for child care clinics.

Parents in [City] searching for a trusted pediatrician almost always book from clinics that have online appointment booking and WhatsApp confirmation — especially for vaccinations and urgent visits.

I ran a presence audit for [Clinic_Name]:
👉 [Audit_Link]

And built a live demo — a pediatric clinic website with vaccination schedule + instant online booking:
👉 [Vercel_Link]

Can have it live with your branding in 24 hours. Worth a quick 2-min look? 👶`;

const DEFAULT_PEDIA_F1 = `Hey Dr. [Doctor_Name] — Aditya again 👋

Just checking — did you get to see the pediatric clinic demo?
👉 [Vercel_Link]

It includes a vaccination schedule tracker and WhatsApp slot confirmation for parents — really cuts down on missed appointments.

Your presence audit:
👉 [Audit_Link]

Happy to demo it live for you this week. 👶`;

const DEFAULT_PEDIA_F2 = `Dr. [Doctor_Name] — last message from me 🙂

Setting up pediatric clinic websites for a few practices in [City] this week. [Clinic_Name] would be a great fit.

Demo:
👉 [Vercel_Link]

One message and I'll get it started. No pressure. 👶`;

// ─── 👂 ENT ───────────────────────────────────────────────────────────────
const DEFAULT_ENT = `Hey Dr. [Doctor_Name] 👋

I'm Aditya — an AI & automation engineer. I build patient booking systems for specialty clinics.

ENT patients dealing with sinusitis, tonsils or hearing issues in [City] often search online for weeks before committing to a clinic. Most go with whoever has the cleanest online presence and easiest booking.

I ran a quick presence audit for [Clinic_Name]:
👉 [Audit_Link]

And built a live ENT clinic demo with a Symptom Checker quiz + instant appointment booking:
👉 [Vercel_Link]

I can customize this for your clinic in under 24 hours. Worth a look? 👂`;

const DEFAULT_ENT_F1 = `Hey Dr. [Doctor_Name] — Aditya here 👋

Following up on the ENT clinic demo:
👉 [Vercel_Link]

The symptom checker helps patients self-diagnose (ear vs nose vs throat) and book the right slot — reduces unnecessary walk-ins.

Clinic audit:
👉 [Audit_Link]

Free for a 5-min call this week? 👂`;

const DEFAULT_ENT_F2 = `Dr. [Doctor_Name] — final follow-up from my side 🙂

Launching ENT clinic booking systems in [City] this week. I can get [Clinic_Name] set up with a custom design:
👉 [Vercel_Link]

Just reply and I'll send over the details. 👂`;

// ─── 🦴 ORTHOPEDICS ───────────────────────────────────────────────────────
const DEFAULT_ORTHO = `Hey Dr. [Doctor_Name] 👋

I'm Aditya — an AI & automation engineer. I build booking and patient intake systems for orthopedic clinics.

People with joint pain, back problems or sports injuries in [City] increasingly search online and book from the first clinic that shows up with a professional, mobile-friendly website.

I ran a presence audit for [Clinic_Name]:
👉 [Audit_Link]

And built a live ortho demo with a Pain Zone Selector + instant appointment booking:
👉 [Vercel_Link]

I can have this live with your branding in 24 hours. Worth a quick look? 🦴`;

const DEFAULT_ORTHO_F1 = `Hey Dr. [Doctor_Name] — Aditya here 👋

Following up on the ortho clinic demo:
👉 [Vercel_Link]

The pain zone selector lets patients pick their specific complaint (knee, spine, shoulder, etc.) before booking — helps route them to the right slot.

Presence audit:
👉 [Audit_Link]

Happy to walk you through it in 5 mins. 🦴`;

const DEFAULT_ORTHO_F2 = `Dr. [Doctor_Name] — last message 🙂

Building ortho clinic websites in [City] this week. If [Clinic_Name] wants a custom slot, I can start immediately:
👉 [Vercel_Link]

One reply and we're good to go. 🦴`;

// ─── 🫀 CARDIOLOGY ────────────────────────────────────────────────────────
const DEFAULT_CARDIO = `Hey Dr. [Doctor_Name] 👋

I'm Aditya — an AI & automation engineer. I build smart booking and patient intake systems for cardiology clinics.

Patients in [City] looking for a cardiologist — especially those with chest pain, hypertension or preventive check-ups — almost always book from clinics with online booking and easy access to consultation info.

I ran a presence audit for [Clinic_Name]:
👉 [Audit_Link]

And built a live cardiology demo with a Heart Risk Score Calculator + instant consultation booking:
👉 [Vercel_Link]

I can customize and launch this for your clinic in under 24 hours. Worth a quick look? 🫀`;

const DEFAULT_CARDIO_F1 = `Hey Dr. [Doctor_Name] — Aditya again 👋

Following up on the cardiology demo:
👉 [Vercel_Link]

The heart risk score calculator on it helps patients self-assess their risk and book urgently or for preventive check-ups — great for driving serious consultations.

Clinic audit:
👉 [Audit_Link]

Free for a quick call this week? 🫀`;

const DEFAULT_CARDIO_F2 = `Dr. [Doctor_Name] — final follow-up from me 🙂

Setting up cardiology clinic websites in [City] this week. I can slot in [Clinic_Name] with a custom design:
👉 [Vercel_Link]

Just one message and I'll send over the setup details. 🫀`;

// ─── 🏥 GENERAL MEDICAL ───────────────────────────────────────────────────
const DEFAULT_DOCTOR_GENERAL = `Hey Dr. [Doctor_Name] 👋

I'm Aditya — an AI & automation engineer. I build 24/7 online booking and patient flow systems for clinics.

Patients in [City] searching for a general physician or specialist now expect instant online booking — most won't call. They just move on to the next clinic that has a website.

I ran a presence audit for [Clinic_Name]:
👉 [Audit_Link]

And built a live demo — an AI-powered clinic website with instant appointment booking and 24/7 patient intake:
👉 [Vercel_Link]

I can have this live with your branding in under 24 hours. Worth a quick 2-min look? 🏥`;

const DEFAULT_GENERAL_F1 = `Hey Dr. [Doctor_Name] — Aditya here 👋

Following up on the clinic booking demo I sent:
👉 [Vercel_Link]

It's a simple 24/7 booking page that takes patient name, concern, and slot preference — and sends them a WhatsApp confirmation. Super easy to set up.

Your presence audit:
👉 [Audit_Link]

Happy to show you how it works in 5 mins. 🏥`;

const DEFAULT_GENERAL_F2 = `Dr. [Doctor_Name] — last message from me 🙂

Setting up online booking systems for clinics in [City] this week. If [Clinic_Name] wants to be included, I can start right away:
👉 [Vercel_Link]

Just one reply. No pressure. 🏥`;

// ─── 💼 RECRUITMENT AGENCY ────────────────────────────────────────────────
const DEFAULT_RECRUITMENT = `Hey [Contact_Name] 👋

I'm Aditya — an AI & automation engineer. I build automated candidate screening and ATS integration systems for recruitment agencies.

Most agencies in [City] are still manually screening applicants over the phone, which kills hours every week. I can automate this with a 24/7 AI pre-screening flow on your website.

I ran a quick workflow audit for [Agency_Name] to show where the bottlenecks are:
👉 [Audit_Link]

And built a live demo — an AI Candidate Screening flow that pre-qualifies applicants before they reach your recruiters:
👉 [Vercel_Link]

I can connect this to your ATS in under 24 hours. Worth a quick 2-min look? 💼`;

const DEFAULT_RECRUITMENT_F1 = `Hey [Contact_Name] — Aditya here again 👋

Following up on the AI candidate screening demo for [Agency_Name]:
👉 [Vercel_Link]

It pre-screens candidates for skills, notice period, and salary expectations — so your recruiters only talk to people who are actually a fit.

Workflow audit:
👉 [Audit_Link]

Free for a 5-min call this week? 💼`;

const DEFAULT_RECRUITMENT_F2 = `[Contact_Name] — last message from my side 🙂

Building AI pre-screening flows for recruitment agencies in [City] this week. I can set up a custom one for [Agency_Name] with your intake questions:
👉 [Vercel_Link]

Just one message and I'll start. No obligation. 💼`;

// ─── Legacy audit templates ────────────────────────────────────────────────
const DEFAULT_DENTAL_AUDIT = `Hey Dr. [Doctor_Name]! 👋

I'm Aditya — an AI engineer. I ran a quick Digital Presence Audit for [Clinic_Name] in [City]. It shows how many monthly dental patients you're losing to competitors with websites.

Personalized audit report:
👉 [Audit_Link]

Free for a 2-minute call to discuss this? 📞`;

const DEFAULT_DERMA_AUDIT = `Hello Dr. [Doctor_Name]! 👋

I'm Aditya — an AI engineer. I ran a quick Digital Presence Audit for [Clinic_Name] in [City] — it shows your patient acquisition gaps vs competitors.

Personalized report:
👉 [Audit_Link]

Open to a quick 2-minute call? 🌿`;

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

// ── Vercel Link Resolver — maps specialty → demo site URL ──────────────
function getVercelLink(lead) {
  if (lead && lead.vercelUrl && lead.vercelUrl.trim() !== "") {
    return lead.vercelUrl.trim();
  }
  const spec = ((lead && lead.specialty) || "").toLowerCase();
  if (spec.includes("recruitment") || spec.includes("staffing") || spec.includes("exec") || spec.includes("headhunt")) {
    return "https://recruitment-ai-assistant.vercel.app/";
  } else if (spec.includes("dental")) {
    return "https://smile-dental.vercel.app";
  } else if (spec.includes("derm") || spec.includes("skin")) {
    return "https://derm-site.vercel.app";
  } else if (spec.includes("eye") || spec.includes("ophthalm")) {
    return "https://clearvision-eye-demo.vercel.app";
  } else if (spec.includes("pediatr") || spec.includes("child") || spec.includes("pedia")) {
    return "https://tinysteps-pedia-demo.vercel.app";
  } else if (spec.includes("ent")) {
    return "https://soundcare-ent-demo.vercel.app";
  } else if (spec.includes("ortho")) {
    return "https://bonestrong-ortho-demo.vercel.app";
  } else if (spec.includes("cardio")) {
    return "https://heartguard-cardio-demo.vercel.app";
  } else {
    return "https://doctor-ai-assistant.vercel.app/";
  }
}

// ── Specialty Key Resolver — maps specialty string → TMPL key group ─────
function getSpecialtyKey(specialty) {
  const s = (specialty || "").toLowerCase();
  if (s.includes("recruitment") || s.includes("staffing") || s.includes("exec") || s.includes("headhunt")) return "recruitment";
  if (s.includes("dental"))                    return "dental";
  if (s.includes("derm") || s.includes("skin")) return "derma";
  if (s.includes("eye") || s.includes("ophthalm")) return "eye";
  if (s.includes("pediatr") || s.includes("child") || s.includes("pedia")) return "pediatrics";
  if (s.includes("ent"))                       return "ent";
  if (s.includes("ortho"))                     return "ortho";
  if (s.includes("cardio"))                    return "cardio";
  return "general";
}

// ── Default template lookup ──────────────────────────────────────────────
const DEFAULT_TEMPLATES = {
  dental:      { f0: () => DEFAULT_DENTAL,           f1: () => DEFAULT_DENTAL_F1,        f2: () => DEFAULT_DENTAL_F2        },
  derma:       { f0: () => DEFAULT_DERMA,            f1: () => DEFAULT_DERMA_F1,         f2: () => DEFAULT_DERMA_F2         },
  eye:         { f0: () => DEFAULT_EYE,              f1: () => DEFAULT_EYE_F1,           f2: () => DEFAULT_EYE_F2           },
  pediatrics:  { f0: () => DEFAULT_PEDIA,            f1: () => DEFAULT_PEDIA_F1,         f2: () => DEFAULT_PEDIA_F2         },
  ent:         { f0: () => DEFAULT_ENT,              f1: () => DEFAULT_ENT_F1,           f2: () => DEFAULT_ENT_F2           },
  ortho:       { f0: () => DEFAULT_ORTHO,            f1: () => DEFAULT_ORTHO_F1,         f2: () => DEFAULT_ORTHO_F2         },
  cardio:      { f0: () => DEFAULT_CARDIO,           f1: () => DEFAULT_CARDIO_F1,        f2: () => DEFAULT_CARDIO_F2        },
  general:     { f0: () => DEFAULT_DOCTOR_GENERAL,   f1: () => DEFAULT_GENERAL_F1,       f2: () => DEFAULT_GENERAL_F2       },
  recruitment: { f0: () => DEFAULT_RECRUITMENT,      f1: () => DEFAULT_RECRUITMENT_F1,   f2: () => DEFAULT_RECRUITMENT_F2   },
};

function getTemplate(specialtyKey, stage) {
  const group = TMPL[specialtyKey] || TMPL.general;
  const stageKey = stage === 0 ? "f0" : stage === 1 ? "f1" : "f2";
  const stored = localStorage.getItem(group[stageKey]);
  if (stored && stored.trim()) return stored;
  return (DEFAULT_TEMPLATES[specialtyKey] || DEFAULT_TEMPLATES.general)[stageKey]();
}

// ── WhatsApp Automator — Specialty-specific personal AI engineer pitch ───
function sendPersonalizedWa(id) {
  const lead = leads.find(l => l.id === id);
  if (!lead || !lead.phone) {
    alert("This lead doesn't have a phone number.");
    return;
  }

  let cleanPhone = lead.phone.replace(/[^\d]/g, "");
  if (cleanPhone.length === 10) cleanPhone = "91" + cleanPhone;

  // Extract doctor/contact first name
  let docName = lead.name;
  const drMatch = lead.name.match(/Dr\.?\s*([A-Za-z]+)/i);
  if (drMatch) docName = drMatch[1];
  else docName = lead.name.split(" ").slice(0, 2).join(" ");

  // Resolve specialty key and load template
  const specKey = getSpecialtyKey(lead.specialty);
  const template = getTemplate(specKey, 0);

  const auditLink  = getAuditLink(lead);
  const vercelLink = getVercelLink(lead);
  const text = template
    .replace(/\[Doctor_Name\]/g, docName)
    .replace(/\[Contact_Name\]/g, docName)
    .replace(/\[Clinic_Name\]/g, lead.name)
    .replace(/\[Agency_Name\]/g, lead.name)
    .replace(/\[City\]/g, lead.city)
    .replace(/\[Audit_Link\]/g, auditLink)
    .replace(/\[Vercel_Link\]/g, vercelLink);

  lead.status = "Demo Sent";
  lead.lastContacted = new Date().toISOString();
  lead.followupStage = 0;
  saveToStorage();
  updateStats();

  const row = document.getElementById(`row-${id}`);
  if (row) {
    const sel = row.querySelector(".status-select");
    if (sel) { sel.value = "Demo Sent"; sel.className = "status-select demo-sent"; }
  }

  window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, "_blank");
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

// ── Send WhatsApp Follow-up — Specialty-specific F1 / F2 messages ────────
function sendFollowupWa(id, nextStage) {
  const lead = leads.find(l => l.id === id);
  if (!lead) return;

  let cleanPhone = lead.phone.replace(/[^\d]/g, "");
  if (cleanPhone.length === 10) cleanPhone = "91" + cleanPhone;

  let docName = lead.name;
  const drMatch = lead.name.match(/Dr\.?\s*([A-Za-z]+)/i);
  if (drMatch) docName = drMatch[1];
  else docName = lead.name.split(" ").slice(0, 2).join(" ");

  // Resolve specialty key and load correct F1 or F2 template
  const specKey = getSpecialtyKey(lead.specialty);
  const template = getTemplate(specKey, nextStage);

  const auditLink  = getAuditLink(lead);
  const vercelLink = getVercelLink(lead);
  const text = template
    .replace(/\[Doctor_Name\]/g, docName)
    .replace(/\[Contact_Name\]/g, docName)
    .replace(/\[Clinic_Name\]/g, lead.name)
    .replace(/\[Agency_Name\]/g, lead.name)
    .replace(/\[City\]/g, lead.city)
    .replace(/\[Audit_Link\]/g, auditLink)
    .replace(/\[Vercel_Link\]/g, vercelLink);

  lead.status = "Follow-up";
  lead.lastContacted = new Date().toISOString();
  lead.followupStage = nextStage;
  saveToStorage();
  updateStats();
  renderFollowupTable();

  window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, "_blank");
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
  if (document.getElementById("template-doctor")) {
    document.getElementById("template-doctor").value = localStorage.getItem(TEMPLATE_DOCTOR_KEY) || DEFAULT_DOCTOR_GENERAL;
  }
  if (document.getElementById("template-recruitment")) {
    document.getElementById("template-recruitment").value = localStorage.getItem(TEMPLATE_RECRUITMENT_KEY) || DEFAULT_RECRUITMENT;
  }

  document.getElementById("template-dental-f1").value = localStorage.getItem(TEMPLATE_DENTAL_F1_KEY) || DEFAULT_DENTAL_F1;
  document.getElementById("template-derma-f1").value = localStorage.getItem(TEMPLATE_DERMA_F1_KEY) || DEFAULT_DERMA_F1;
  if (document.getElementById("template-recruitment-f1")) {
    document.getElementById("template-recruitment-f1").value = localStorage.getItem(TEMPLATE_RECRUITMENT_F1_KEY) || DEFAULT_RECRUITMENT_F1;
  }

  document.getElementById("template-dental-f2").value = localStorage.getItem(TEMPLATE_DENTAL_F2_KEY) || DEFAULT_DENTAL_F2;
  document.getElementById("template-derma-f2").value = localStorage.getItem(TEMPLATE_DERMA_F2_KEY) || DEFAULT_DERMA_F2;
  if (document.getElementById("template-recruitment-f2")) {
    document.getElementById("template-recruitment-f2").value = localStorage.getItem(TEMPLATE_RECRUITMENT_F2_KEY) || DEFAULT_RECRUITMENT_F2;
  }
  
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
  const doctor = document.getElementById("template-doctor") ? document.getElementById("template-doctor").value.trim() : "";
  const recruitment = document.getElementById("template-recruitment") ? document.getElementById("template-recruitment").value.trim() : "";

  const dentalF1 = document.getElementById("template-dental-f1").value.trim();
  const dermaF1 = document.getElementById("template-derma-f1").value.trim();
  const recruitmentF1 = document.getElementById("template-recruitment-f1") ? document.getElementById("template-recruitment-f1").value.trim() : "";

  const dentalF2 = document.getElementById("template-dental-f2").value.trim();
  const dermaF2 = document.getElementById("template-derma-f2").value.trim();
  const recruitmentF2 = document.getElementById("template-recruitment-f2") ? document.getElementById("template-recruitment-f2").value.trim() : "";

  // Database configs
  const dbUrl = document.getElementById("db-supabase-url").value.trim();
  const dbKey = document.getElementById("db-supabase-key").value.trim();

  localStorage.setItem(TEMPLATE_DENTAL_KEY, dental);
  localStorage.setItem(TEMPLATE_DERMA_KEY, derma);
  if (doctor) localStorage.setItem(TEMPLATE_DOCTOR_KEY, doctor);
  if (recruitment) localStorage.setItem(TEMPLATE_RECRUITMENT_KEY, recruitment);

  localStorage.setItem(TEMPLATE_DENTAL_F1_KEY, dentalF1);
  localStorage.setItem(TEMPLATE_DERMA_F1_KEY, dermaF1);
  if (recruitmentF1) localStorage.setItem(TEMPLATE_RECRUITMENT_F1_KEY, recruitmentF1);

  localStorage.setItem(TEMPLATE_DENTAL_F2_KEY, dentalF2);
  localStorage.setItem(TEMPLATE_DERMA_F2_KEY, dermaF2);
  if (recruitmentF2) localStorage.setItem(TEMPLATE_RECRUITMENT_F2_KEY, recruitmentF2);
  
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

// ── CSV Import — with smart dedup preview modal ──────────────────────────
function handleCsvImport(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(evt) {
    parseAndImportCsv(evt.target.result);
  };
  reader.readAsText(file);
}

// ── CSV line parser (handles quoted fields with embedded newlines/commas) ─
function parseCsvRows(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuote = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];
    if (inQuote) {
      if (ch === '"' && next === '"') { field += '"'; i++; }
      else if (ch === '"') { inQuote = false; }
      else { field += ch; }
    } else {
      if (ch === '"') { inQuote = true; }
      else if (ch === ',') { row.push(field.trim()); field = ""; }
      else if (ch === '\n') {
        row.push(field.trim()); field = "";
        if (row.some(c => c)) rows.push(row);
        row = [];
      } else if (ch === '\r') { /* skip */ }
      else { field += ch; }
    }
  }
  if (field || row.length) { row.push(field.trim()); if (row.some(c => c)) rows.push(row); }
  return rows;
}

// ── Specialty normalizer — maps scraped niche → our standard specialty ───
function normalizeSpecialty(raw) {
  const r = (raw || "").toLowerCase();
  if (r.includes("dental") || r.includes("dentist") || r.includes("orthodont")) return "Dental";
  if (r.includes("derm") || r.includes("skin") || r.includes("cosmet")) return "Dermatology";
  if (r.includes("eye") || r.includes("ophthalm") || r.includes("lasik") || r.includes("vision")) return "Ophthalmology";
  if (r.includes("pediatr") || r.includes("child") || r.includes("pedia") || r.includes("neonat") || r.includes("kids")) return "Pediatrics";
  if (r.includes("ent") || r.includes("ear") || r.includes("nose") || r.includes("throat") || r.includes("sinus")) return "ENT";
  if (r.includes("ortho") || r.includes("bone") || r.includes("joint") || r.includes("spine") || r.includes("fracture")) return "Orthopedics";
  if (r.includes("cardio") || r.includes("heart") || r.includes("ecg") || r.includes("echo")) return "Cardiology";
  if (r.includes("recruit") || r.includes("staffing") || r.includes("hr ") || r.includes("placement")) return "Tech Recruitment";
  return "General Medical";
}

let _pendingImportLeads = [];

function parseAndImportCsv(text) {
  const rows = parseCsvRows(text);
  if (rows.length < 2) { alert("Invalid CSV or empty file."); return; }

  const headers = rows[0].map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ""));

  // Flexible header detection — supports both our format and scraped format
  const idx = (terms) => headers.findIndex(h => terms.some(t => h.includes(t)));
  const idxName     = idx(["name", "title", "clinic", "doctor"]);
  const idxPhone    = idx(["phone", "tel", "mobile", "contact"]);
  const idxEmail    = idx(["email", "mail"]);
  const idxAddress  = idx(["address", "addr", "location"]);
  const idxCity     = idx(["city", "loc"]);
  const idxSpecialty= idx(["spec", "niche", "type", "keyword", "category"]);
  const idxTier     = idx(["tier"]);
  const idxRating   = idx(["rating", "score"]);
  const idxReviews  = idx(["reviews", "count"]);

  if (idxName === -1) { alert("CSV must have a 'Name' column."); return; }

  // Build existing phone set for fast dedup
  const existingPhones = new Set(leads.map(l => l.phone.replace(/[^\d]/g, "")));
  const existingNames  = new Set(leads.map(l => l.name.toLowerCase().trim()));

  // Track phones seen within this CSV to deduplicate within the file too
  const seenInFile = new Set();

  let currentMaxId = leads.length > 0 ? Math.max(...leads.map(l => l.id)) : 0;
  const toImport = [];
  const dupPhone = [];
  const dupName  = [];
  const noPhone  = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const name  = (row[idxName]  || "").trim();
    const rawPhone = (idxPhone !== -1 ? row[idxPhone] : "").trim();
    const cleanPh = rawPhone.replace(/[^\d]/g, "");

    if (!name) continue;

    // Skip if no phone
    if (!rawPhone || cleanPh.length < 7) {
      noPhone.push(name);
      continue;
    }

    // Deduplicate within this CSV batch
    if (seenInFile.has(cleanPh)) {
      dupPhone.push({ name, phone: rawPhone, reason: "Duplicate within CSV" });
      continue;
    }
    seenInFile.add(cleanPh);

    // Deduplicate against existing DB (by phone)
    if (existingPhones.has(cleanPh)) {
      dupPhone.push({ name, phone: rawPhone, reason: "Already in tracker (phone match)" });
      continue;
    }

    // Soft-deduplicate by name
    const nameLower = name.toLowerCase().trim();
    if (existingNames.has(nameLower)) {
      dupName.push({ name, phone: rawPhone, reason: "Already in tracker (name match)" });
      continue;
    }

    currentMaxId++;
    const rating  = idxRating  !== -1 ? parseFloat(row[idxRating])  || 4.2 : parseFloat((3.8 + ((currentMaxId * 7) % 12) / 10).toFixed(1));
    const reviews = idxReviews !== -1 ? parseInt(row[idxReviews])   || 20  : ((currentMaxId * 17) % 360 + 5);
    const rawSpec  = idxSpecialty !== -1 ? row[idxSpecialty] : "";
    const specialty = normalizeSpecialty(rawSpec);
    const city      = (idxCity !== -1 ? row[idxCity] : "Imported").trim() || "Imported";

    toImport.push({
      id: currentMaxId,
      name,
      phone: rawPhone,
      email:   idxEmail   !== -1 ? row[idxEmail]   : "",
      address: idxAddress !== -1 ? (row[idxAddress] || "").replace(/\n/g, " ") : "",
      city,
      tier:    idxTier    !== -1 ? row[idxTier]    : (city.match(/mumbai|delhi|bangalore|chennai|kolkata|pune|hyderabad/i) ? "Metro" : "Tier-2"),
      specialty,
      status: "New",
      rating, reviews,
      remark: "", lastContacted: null, followupStage: 0
    });
    existingPhones.add(cleanPh);
    existingNames.add(nameLower);
  }

  // Show dedup preview modal before committing
  _pendingImportLeads = toImport;
  showImportPreview(toImport, dupPhone, dupName, noPhone);
  document.getElementById("csv-file-input").value = "";
}

function showImportPreview(toImport, dupPhone, dupName, noPhone) {
  const total    = toImport.length + dupPhone.length + dupName.length + noPhone.length;
  const dupTotal = dupPhone.length + dupName.length;

  // Build specialty breakdown
  const specCount = {};
  toImport.forEach(l => { specCount[l.specialty] = (specCount[l.specialty] || 0) + 1; });
  const specBreakdown = Object.entries(specCount)
    .sort((a, b) => b[1] - a[1])
    .map(([s, c]) => `<span style="background:rgba(139,92,246,0.15);border:1px solid rgba(139,92,246,0.25);border-radius:6px;padding:2px 8px;font-size:0.78rem;">${s}: ${c}</span>`)
    .join(" ");

  // Detect existing modal or create one
  let modal = document.getElementById("csv-import-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "csv-import-modal";
    modal.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.75);z-index:9999;display:flex;align-items:center;justify-content:center;";
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div style="background:#0d1526;border:1px solid rgba(255,255,255,0.1);border-radius:20px;padding:36px;max-width:560px;width:92%;max-height:85vh;overflow-y:auto;">
      <h2 style="font-size:1.3rem;font-weight:800;margin-bottom:6px;">📥 CSV Import Preview</h2>
      <p style="color:#94a3b8;font-size:0.85rem;margin-bottom:20px;">Review the dedup results before importing into your tracker.</p>

      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:20px;">
        <div style="background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.25);border-radius:10px;padding:14px;text-align:center;">
          <div style="font-size:1.8rem;font-weight:800;color:#34d399;">${toImport.length}</div>
          <div style="font-size:0.75rem;color:#94a3b8;">New Leads to Import</div>
        </div>
        <div style="background:rgba(249,115,22,0.1);border:1px solid rgba(249,115,22,0.25);border-radius:10px;padding:14px;text-align:center;">
          <div style="font-size:1.8rem;font-weight:800;color:#f97316;">${dupTotal}</div>
          <div style="font-size:0.75rem;color:#94a3b8;">Duplicates Removed</div>
        </div>
        <div style="background:rgba(100,116,139,0.1);border:1px solid rgba(100,116,139,0.25);border-radius:10px;padding:14px;text-align:center;">
          <div style="font-size:1.8rem;font-weight:800;color:#94a3b8;">${noPhone.length}</div>
          <div style="font-size:0.75rem;color:#94a3b8;">No Phone — Skipped</div>
        </div>
      </div>

      ${specBreakdown ? `<div style="margin-bottom:16px;"><div style="font-size:0.75rem;color:#94a3b8;font-weight:600;margin-bottom:8px;">SPECIALTY BREAKDOWN</div><div style="display:flex;flex-wrap:wrap;gap:6px;">${specBreakdown}</div></div>` : ""}

      ${dupPhone.length > 0 ? `
        <div style="background:rgba(249,115,22,0.05);border:1px solid rgba(249,115,22,0.15);border-radius:10px;padding:14px;margin-bottom:14px;">
          <div style="font-size:0.78rem;font-weight:700;color:#f97316;margin-bottom:8px;">⚠️ REMOVED — PHONE DUPLICATES (${dupPhone.length})</div>
          <div style="max-height:100px;overflow-y:auto;">
            ${dupPhone.slice(0, 15).map(d => `<div style="font-size:0.75rem;color:#94a3b8;padding:2px 0;">• ${d.name} — ${d.phone} <span style="color:#64748b;">(${d.reason})</span></div>`).join("")}
            ${dupPhone.length > 15 ? `<div style="font-size:0.72rem;color:#64748b;">...and ${dupPhone.length - 15} more</div>` : ""}
          </div>
        </div>` : ""}

      ${toImport.length === 0 ? `<div style="background:rgba(244,63,94,0.1);border:1px solid rgba(244,63,94,0.25);border-radius:10px;padding:14px;text-align:center;color:#f43f5e;font-weight:600;">No new unique leads found to import.</div>` : ""}

      <div style="display:flex;gap:10px;margin-top:20px;">
        <button onclick="closeImportModal()" style="flex:1;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);color:#f8fafc;padding:12px;border-radius:10px;cursor:pointer;font-family:inherit;font-size:0.95rem;">Cancel</button>
        ${toImport.length > 0 ? `<button onclick="confirmImport()" style="flex:2;background:linear-gradient(135deg,#8b5cf6,#06b6d4);color:#fff;font-weight:700;padding:12px;border-radius:10px;border:none;cursor:pointer;font-family:inherit;font-size:0.95rem;">✅ Import ${toImport.length} New Leads</button>` : ""}
      </div>
    </div>`;
  modal.style.display = "flex";
}

function closeImportModal() {
  const modal = document.getElementById("csv-import-modal");
  if (modal) modal.style.display = "none";
  _pendingImportLeads = [];
}

function confirmImport() {
  if (!_pendingImportLeads.length) return;
  leads.push(..._pendingImportLeads);
  saveToStorage();
  populateCityFilter();
  applyFilters();
  updateStats();
  closeImportModal();
  
  // Brief success toast
  const toast = document.createElement("div");
  toast.style.cssText = "position:fixed;bottom:24px;right:24px;background:linear-gradient(135deg,#8b5cf6,#06b6d4);color:#fff;font-weight:700;padding:14px 24px;border-radius:12px;z-index:9999;font-size:0.95rem;box-shadow:0 8px 24px rgba(0,0,0,0.4);";
  toast.textContent = `✅ ${_pendingImportLeads.length} leads imported successfully!`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
  _pendingImportLeads = [];
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
