# LeadReach v3 — Complete Deployment Guide
> **For AI Agents / Developers — Step-by-step deployment of the full system**
> Last updated: 2026-07-25

---

## ⚡ CRITICAL STEP AFTER EVERY DEPLOYMENT — UPDATE VERCEL LINKS IN app.js

> **This is the most important step. WhatsApp messages will show broken links if you skip this.**

After deploying the demo sites to Vercel, you MUST update the URLs in `app.js`.

### How to update the links:

1. Open `app.js` in any text editor (Notepad, VS Code, etc.)
2. Press **Ctrl+F** and search for: `getVercelLink`
3. Find the function that looks like this (around line 680–720):

```javascript
function getVercelLink(lead) {
  const spec = (lead.specialty || '').toLowerCase();
  if (spec.includes("dental"))       return "https://smile-dental.vercel.app";
  if (spec.includes("derm"))         return "https://derm-site.vercel.app";
  if (spec.includes("eye") || spec.includes("ophthalm"))
                                     return "https://clearvision-eye-demo.vercel.app";
  if (spec.includes("pediatr") || spec.includes("child"))
                                     return "https://tinysteps-pedia-demo.vercel.app";
  if (spec.includes("ent") || spec.includes("ear"))
                                     return "https://soundcare-ent-demo.vercel.app";
  if (spec.includes("ortho") || spec.includes("bone"))
                                     return "https://bonestrong-ortho-demo.vercel.app";
  if (spec.includes("cardio") || spec.includes("heart"))
                                     return "https://heartguard-cardio-demo.vercel.app";
  if (spec.includes("recruit"))      return "https://recruitment-ai-assistant.vercel.app";
  return "https://doctor-ai-assistant.vercel.app";
}
```

4. Replace each URL with your actual deployed Vercel URL. Example:
   - Change `"https://clearvision-eye-demo.vercel.app"` → `"https://YOUR-ACTUAL-EYE-SITE.vercel.app"`
5. Save `app.js`
6. **Re-upload the entire tracker folder** to Vercel (tracker will auto-redeploy)

### URL Reference Table — Fill This In After Deploying:

| Specialty | Search For (in app.js) | Replace With Your URL |
|-----------|------------------------|----------------------|
| 🦷 Dental | `smile-dental.vercel.app` | __________________ |
| 🌿 Derma | `derm-site.vercel.app` | __________________ |
| 👁️ Eye | `clearvision-eye-demo.vercel.app` | __________________ |
| 👶 Pediatric | `tinysteps-pedia-demo.vercel.app` | __________________ |
| 👂 ENT | `soundcare-ent-demo.vercel.app` | __________________ |
| 🦴 Ortho | `bonestrong-ortho-demo.vercel.app` | __________________ |
| 🫀 Cardio | `heartguard-cardio-demo.vercel.app` | __________________ |

---

---

## 📦 WHAT'S IN THIS ZIP

```
leadreach-v3/
├── index.html           ← Main Lead Tracker Dashboard (upload to Vercel/Netlify)
├── style.css            ← Dashboard styles
├── app.js               ← All logic: templates, CSV import, WhatsApp, follow-ups
├── leads.js             ← Default sample leads data
├── audit.html           ← Personalized clinic audit report page
├── audit.css            ← Audit page styles
├── DEPLOY_GUIDE.md      ← This file
└── demo-sites/
    ├── eye-clinic/index.html        ← 👁️ Eye Clinic demo (deploy separately)
    ├── pediatric-care/index.html    ← 👶 Pediatric demo (deploy separately)
    ├── ent-clinic/index.html        ← 👂 ENT Clinic demo (deploy separately)
    ├── ortho-care/index.html        ← 🦴 Orthopedics demo (deploy separately)
    └── cardio-care/index.html       ← 🫀 Cardiology demo (deploy separately)
```

---

## 🗺️ SYSTEM OVERVIEW

```
┌─────────────────────────────────────────────────────────────┐
│                    LEADREACH v3 SYSTEM                      │
│                                                             │
│  ┌──────────────────┐      ┌──────────────────────────┐    │
│  │  Lead Tracker    │      │   Demo Websites (7)       │    │
│  │  index.html      │─────▶│   Deployed on Vercel      │    │
│  │  (Vercel/GH Pages│      │   One per specialty        │    │
│  │  or Netlify)     │      └──────────────────────────┘    │
│  └────────┬─────────┘                                       │
│           │                                                  │
│           ▼ WhatsApp message sent with:                      │
│     [Vercel_Link] ──▶ Specialty demo site                    │
│     [Audit_Link]  ──▶ audit.html?params (personalized)       │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Cloud Database: Supabase (free tier)                │  │
│  │  Leads synced automatically across devices           │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ STEP 1 — Deploy the Lead Tracker (index.html)

The lead tracker is a **pure static HTML app**. No backend needed.

### Option A: Vercel (Recommended — free, instant HTTPS)

1. Go to [vercel.com](https://vercel.com) → Sign in with GitHub
2. Click **"Add New → Project"**
3. Click **"Deploy without a Git repository"** → **Upload folder**
4. Upload the entire `leadreach-v3/` folder (the root, not demo-sites)
5. Click **Deploy**
6. Your tracker URL: `https://leadreach-v3.vercel.app` (or custom name)

> ⚠️ Make sure `index.html` is at the **root** of the uploaded folder.

### Option B: Netlify Drop (Easiest — drag and drop)

1. Go to [app.netlify.com/drop](https://app.netlify.com/drop)
2. Drag and drop the entire `leadreach-v3/` folder
3. Wait 30 seconds → Get instant public URL
4. Your tracker URL: `https://random-name.netlify.app`

### Option C: GitHub Pages

1. Create a new GitHub repo (e.g. `leadreach-tracker`)
2. Upload all files from `leadreach-v3/` root to the repo root
3. Go to Settings → Pages → Source: `main branch / root`
4. Your URL: `https://yourusername.github.io/leadreach-tracker/`

---

## ✅ STEP 2 — Deploy Each Specialty Demo Site

Each demo site in `demo-sites/` needs its own Vercel deployment. These are the links embedded in WhatsApp messages.

### Deploy all 5 in sequence on Vercel:

| Site Folder | Suggested Vercel Name | Expected URL |
|-------------|----------------------|--------------|
| `demo-sites/eye-clinic/` | `clearvision-eye-demo` | `clearvision-eye-demo.vercel.app` |
| `demo-sites/pediatric-care/` | `tinysteps-pedia-demo` | `tinysteps-pedia-demo.vercel.app` |
| `demo-sites/ent-clinic/` | `soundcare-ent-demo` | `soundcare-ent-demo.vercel.app` |
| `demo-sites/ortho-care/` | `bonestrong-ortho-demo` | `bonestrong-ortho-demo.vercel.app` |
| `demo-sites/cardio-care/` | `heartguard-cardio-demo` | `heartguard-cardio-demo.vercel.app` |

**Plus 2 already deployed sites (from previous work):**

| Specialty | URL |
|-----------|-----|
| 🦷 Dental | `https://smile-dental.vercel.app` |
| 🌿 Dermatology | `https://derm-site.vercel.app` |
| 🏥 General / Recruitment | `https://doctor-ai-assistant.vercel.app` |

### How to deploy each one on Vercel:
1. Go to [vercel.com](https://vercel.com) → Add New → Project
2. Upload **only** that single demo site's folder (e.g. upload the contents of `eye-clinic/`)
3. **Important:** Set the Vercel project name to exactly the suggested name above
4. Deploy

---

## ✅ STEP 3 — Update Vercel Links in app.js (if URLs differ)

If your Vercel URLs are different from the defaults, open `app.js` and find the `getVercelLink()` function (around line 680). Update these URLs:

```javascript
function getVercelLink(lead) {
  // ...
  } else if (spec.includes("eye") || spec.includes("ophthalm")) {
    return "https://YOUR-EYE-SITE.vercel.app";        // ← Update this
  } else if (spec.includes("pediatr") || ...) {
    return "https://YOUR-PEDIA-SITE.vercel.app";      // ← Update this
  } else if (spec.includes("ent")) {
    return "https://YOUR-ENT-SITE.vercel.app";        // ← Update this
  } else if (spec.includes("ortho")) {
    return "https://YOUR-ORTHO-SITE.vercel.app";      // ← Update this
  } else if (spec.includes("cardio")) {
    return "https://YOUR-CARDIO-SITE.vercel.app";     // ← Update this
  }
```

After editing `app.js`, **re-upload** the tracker folder to Vercel (it will auto-redeploy).

---

## ✅ STEP 4 — Set Up Supabase Database (Optional but Recommended)

The tracker works 100% offline with browser localStorage. Supabase adds **cloud sync across devices**.

### Create free Supabase project:

1. Go to [supabase.com](https://supabase.com) → Sign up → New Project
2. Note down your **Project URL** and **Anon/Public API Key**
3. Go to **SQL Editor** and run this setup query:

```sql
CREATE TABLE leads (
  id              BIGINT PRIMARY KEY,
  name            TEXT NOT NULL,
  phone           TEXT,
  email           TEXT,
  address         TEXT,
  specialty       TEXT DEFAULT 'General Medical',
  city            TEXT DEFAULT 'Mumbai',
  tier            TEXT DEFAULT 'Metro',
  status          TEXT DEFAULT 'New',
  rating          FLOAT DEFAULT 4.5,
  reviews         INT DEFAULT 50,
  remark          TEXT DEFAULT '',
  last_contacted  TEXT,
  followup_stage  INT DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Enable public read/write for anon key (adjust in production)
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON leads FOR ALL USING (true);
```

4. In the Lead Tracker → click **⚙️ Templates** → tab **⚙️ Supabase Database**
5. Paste your **Project URL** and **Anon Key** → Save

---

## ✅ STEP 5 — Import Your CSV Data

Your scraped `india_no_website_clinics.csv` format is supported natively.

1. Open the deployed tracker URL
2. Click **📤 Import CSV**
3. Select your CSV file
4. A **preview modal** appears showing:
   - ✅ New unique leads (with specialty breakdown)
   - ⚠️ Duplicates removed (by phone number + name)
   - ⛔ Rows skipped (no phone number)
5. Click **✅ Import** to confirm

**Supported CSV columns (auto-detected):**
| Column | Auto-detected from |
|--------|-------------------|
| Name | `Name`, `Title`, `Clinic`, `Doctor` |
| Phone | `Phone`, `Tel`, `Mobile`, `Contact` |
| Address | `Address`, `Addr`, `Location` |
| City | `City`, `Loc` |
| Specialty | `Niche`, `Keyword`, `Spec`, `Type`, `Category` |
| Rating | `Rating`, `Score` |

**Auto specialty mapping from your scraper's `niche` column:**
| Scraped Niche | Maps To |
|--------------|---------|
| `pediatrics`, `children clinic` | Pediatrics |
| `dermatology`, `skin` | Dermatology |
| `dental`, `dentist` | Dental |
| `ent`, `ear`, `nose`, `sinus` | ENT |
| `orthopedics`, `bone`, `joint` | Orthopedics |
| `cardiology`, `heart` | Cardiology |
| `ophthalmology`, `eye`, `lasik` | Ophthalmology |
| `recruitment`, `staffing` | Tech Recruitment |
| (anything else) | General Medical |

---

## ✅ STEP 6 — How the WhatsApp Outreach Works

### Initial Pitch (💬 button in tracker):

1. Find a lead in the table
2. Click the 💬 WhatsApp button
3. WhatsApp Web opens with a **pre-written message** — already personalized with:
   - Doctor's first name extracted from clinic name
   - City name
   - Specialty-specific pitch (Aditya's voice as AI engineer)
   - Correct demo website link for their specialty
   - Personalized audit report link
4. Just click **Send** in WhatsApp Web

### Follow-up Sequence:

1. Click the **⏳ Follow-up Queue** tab
2. See all leads you've messaged, sorted by urgency
3. **🔴 DUE NOW** = ready for next follow-up
4. Click **💬 Send Follow-up 1** (2 days after initial)
5. Click **💬 Send Follow-up 2** (4 days after F1)
6. Each follow-up auto-uses the correct specialty template

---

## 📋 WHATSAPP MESSAGE TEMPLATES (What Each Specialty Sends)

All messages are from **Aditya** as an independent AI & automation engineer.

### 🦷 Dental — Initial:
```
Hey Dr. [Name] 👋
I'm Aditya — an independent AI & automation engineer. I build booking & patient flow systems for clinics.
I noticed [Clinic] doesn't have a website yet. I ran a quick Digital Presence Audit...
👉 [audit link]
I also built a live demo — a 24/7 dental booking + patient intake flow:
👉 [smile-dental.vercel.app]
Can have this live with your branding in 24 hours. Worth a 2-min look? 🦷
```

### 👁️ Eye — Initial:
```
Hey Dr. [Name] 👋
I'm Aditya — an AI & automation engineer. I build appointment booking systems for specialty clinics.
Eye patients in [City] searching for LASIK or vision exams book from clinics with easy online booking.
👉 [audit link]
Live demo — Eye Clinic website with Vision Screening Quiz + instant slot booking:
👉 [clearvision-eye-demo.vercel.app]
```

*(All 9 specialties have Initial + F1 + F2 templates — editable in Settings → Templates)*

---

## 🔗 FINAL URLS AFTER DEPLOYMENT

Fill these in after you deploy:

| What | URL |
|------|-----|
| 📊 Lead Tracker | `https://_________________.vercel.app` |
| 🦷 Dental Demo | `https://smile-dental.vercel.app` |
| 🌿 Derma Demo | `https://derm-site.vercel.app` |
| 👁️ Eye Demo | `https://clearvision-eye-demo.vercel.app` |
| 👶 Pediatric Demo | `https://tinysteps-pedia-demo.vercel.app` |
| 👂 ENT Demo | `https://soundcare-ent-demo.vercel.app` |
| 🦴 Ortho Demo | `https://bonestrong-ortho-demo.vercel.app` |
| 🫀 Cardio Demo | `https://heartguard-cardio-demo.vercel.app` |
| 💼 Recruitment Demo | `https://recruitment-ai-assistant.vercel.app` |

---

## ⚡ QUICK CHECKLIST FOR CLAUDE / AI AGENT

If you're an AI agent being asked to deploy this, run through this checklist:

- [ ] Deploy `leadreach-v3/` root to Vercel → note tracker URL
- [ ] Deploy `demo-sites/eye-clinic/` to Vercel as `clearvision-eye-demo`
- [ ] Deploy `demo-sites/pediatric-care/` to Vercel as `tinysteps-pedia-demo`
- [ ] Deploy `demo-sites/ent-clinic/` to Vercel as `soundcare-ent-demo`
- [ ] Deploy `demo-sites/ortho-care/` to Vercel as `bonestrong-ortho-demo`
- [ ] Deploy `demo-sites/cardio-care/` to Vercel as `heartguard-cardio-demo`
- [ ] Create Supabase project → run SQL schema → paste URL+Key in tracker Settings
- [ ] Test: Open tracker → click 💬 on a Pediatrics lead → verify message has `tinysteps-pedia-demo.vercel.app`
- [ ] Test: Import `india_no_website_clinics.csv` → verify dedup preview shows correctly
- [ ] Test: Follow-up Queue tab shows leads after sending initial message

---

## 🛠️ TROUBLESHOOTING

| Problem | Fix |
|---------|-----|
| Tracker shows blank / white page | Make sure `index.html` is at the root of the upload |
| WhatsApp message shows `[Vercel_Link]` literally | Update `getVercelLink()` in `app.js` with real URLs |
| CSV import says "Invalid CSV" | Ensure file is comma-separated, has a `Name` column |
| Supabase not syncing | Check URL and Anon key; run the SQL schema first |
| Follow-up queue is empty | Send at least one initial WhatsApp message (💬 button) first |
| Charts not showing | Click 📈 Analytics button in the header to expand |

---

*Built by Aditya — AI & Automation Engineer*
*LeadReach v3 — Multi-Specialty Doctor & Recruitment Outreach System*
