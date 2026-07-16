# DEPLOYMENT GUIDE — Prime Health Booking + Reminder System
> **For AI Agents / Developers deploying this system online**
> Last updated: 2026-07-15

---

## 1. WHAT THIS PACKAGE CONTAINS

This ZIP contains a complete appointment booking system with automatic T-24h and T-2h patient reminders, integrated into two clinic websites:

| Website | URL after deploy |
|---------|-----------------|
| Smile Dental Care | `/dental-website/` |
| ClearSkin Dermatology | `/derm-site/` |

---

## 2. SYSTEM ARCHITECTURE

```
Patient submits form on website
        |
        v
[Flask REST API — booking_server.py] <-- port 5001 (local) / any port (cloud)
        |                |
        v                v
[SQLite bookings.db]   [APScheduler — reminder_engine.py]
                               |
                    Every 60s: checks DB
                    T-24h → fires reminder
                    T-2h  → fires reminder
                               |
                               v
                        [reminders.log]
              (swap in Twilio/SendGrid/WhatsApp here)
```

---

## 3. FILE MANIFEST — ALL CHANGES MADE

### 3a. NEW Backend Files (in /startup root)

| File | Description |
|------|-------------|
| `config_booking.py` | Central config: clinic names, server port, DB path, reminder windows |
| `booking_db.py` | SQLite ORM: creates `bookings` table, CRUD, reminder query logic |
| `reminder_engine.py` | APScheduler background worker: polls DB every 60s, fires T-24h & T-2h |
| `booking_server.py` | Flask REST API server with CORS enabled |
| `run_booking.py` | One-command launcher: checks deps, starts server |
| `test_booking_reminders.py` | End-to-end test suite (run to verify deployment) |

### 3b. MODIFIED Frontend — Smile Dental Care (`website/dental-website/`)

| File | Changes Made |
|------|-------------|
| `index.html` | Added full booking form section: Name, Phone, Email, Service dropdown, Date, Time, Notes; success card with Booking ID display; reminder badge on left panel |
| `script.js` | Replaced stub `handleBooking()` with real `async fetch()` POST to booking API; loading state; booking ID display; graceful offline fallback; `resetBookingForm()` function |
| `style.css` | Added: `.reminder-badge`, `.book-success`, `.booking-id-card`, `.reminder-info`, `.form-error`, `.form-server-error`, `#bTime`, `#bookBtnLoading`, shake animation, fadeInUp animation |

### 3c. MODIFIED Frontend — ClearSkin Dermatology (`website/derm-site/`)

| File | Changes Made |
|------|-------------|
| `index.html` | Added `email` input field (#bEmail) to booking form; added reminder note badge; replaced synchronous form handler with `async` API call; success card now shows Booking ID + reminder confirmation message |

---

## 4. REST API ENDPOINTS

Base URL (local): `http://localhost:5001`
Base URL (production): set `BOOKING_API_URL` env var or update `config_booking.py`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check — returns `{"status": "ok"}` |
| POST | `/api/book` | Create booking, returns booking_id |
| GET | `/api/bookings` | List all bookings (admin) |
| GET | `/api/booking/<id>` | Get single booking by ID |
| POST | `/api/test-reminder/<id>` | Force-fire both reminders (testing only) |

### POST /api/book — Request Body
```json
{
  "clinic":   "dental",
  "name":     "Patient Full Name",
  "email":    "patient@example.com",
  "phone":    "9876543210",
  "service":  "Dental Checkup",
  "appt_dt":  "2026-07-20T10:00:00",
  "notes":    "Any notes (optional)"
}
```

### POST /api/book — Success Response (HTTP 201)
```json
{
  "success": true,
  "booking_id": "A84F6149",
  "message": "Booking confirmed at Smile Dental Care! You will receive reminders 24 hours and 2 hours before your appointment."
}
```

---

## 5. DEPLOYMENT STEPS

### Option A: Local / Development

```bash
# 1. Navigate to project root
cd startup/

# 2. Install Python dependencies
pip install flask flask-cors apscheduler

# 3. Start the booking server
python run_booking.py
# Server starts at http://localhost:5001

# 4. Serve the websites (separate terminal)
cd website/
python -m http.server 8200
# Dental: http://localhost:8200/dental-website/index.html
# Derm:   http://localhost:8200/derm-site/index.html

# 5. Verify everything works
python test_booking_reminders.py
# Expected: All 20 assertions PASS
```

---

### Option B: Deploy to Render.com (Free tier)

1. **Create a new Web Service** on render.com
2. **Connect** to your GitHub repo
3. **Build Command**: `pip install flask flask-cors apscheduler gunicorn`
4. **Start Command**: `gunicorn booking_server:app --bind 0.0.0.0:$PORT`
5. **Environment Variables**:
   - `BOOKING_PORT` = (Render assigns automatically)
6. **Update frontend** `BOOKING_API` constant in `script.js` and `DERM_BOOKING_API` in `derm-site/index.html` to your Render URL:
   ```js
   const BOOKING_API = 'https://your-app.onrender.com/api/book';
   ```

---

### Option C: Deploy to Railway.app

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

Set environment variables on Railway dashboard:
- The app will auto-detect port from `$PORT` env var

---

### Option D: Deploy to VPS (Ubuntu/Debian)

```bash
# 1. Install dependencies
sudo apt update
sudo apt install python3 python3-pip nginx certbot -y
pip3 install flask flask-cors apscheduler gunicorn

# 2. Copy files to server
scp -r startup/ user@yourserver:/var/www/primehealth/

# 3. Create systemd service
sudo nano /etc/systemd/system/booking.service
```

**booking.service content:**
```ini
[Unit]
Description=Prime Health Booking Server
After=network.target

[Service]
User=www-data
WorkingDirectory=/var/www/primehealth/startup
ExecStart=/usr/local/bin/gunicorn booking_server:app --bind 127.0.0.1:5001 --workers 2
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
# 4. Enable and start
sudo systemctl enable booking
sudo systemctl start booking

# 5. Configure Nginx reverse proxy
sudo nano /etc/nginx/sites-available/primehealth
```

**Nginx config:**
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:5001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        add_header Access-Control-Allow-Origin *;
    }
}
```

```bash
# 6. Enable site and reload
sudo ln -s /etc/nginx/sites-available/primehealth /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d api.yourdomain.com
```

---

## 6. CONNECTING REAL NOTIFICATIONS

Currently reminders are logged to `reminders.log`. To send real SMS/email:

### Twilio SMS
```python
# In reminder_engine.py, replace the log block with:
from twilio.rest import Client
client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
client.messages.create(
    body=body,
    from_='+1415XXXXXXX',
    to=f'+91{booking["phone"]}'
)
```

### SendGrid Email
```python
# In reminder_engine.py:
import sendgrid
from sendgrid.helpers.mail import Mail
sg = sendgrid.SendGridAPIClient(api_key=SENDGRID_API_KEY)
message = Mail(
    from_email='noreply@primehealth.in',
    to_emails=booking['email'],
    subject=subject,
    plain_text_content=body
)
sg.send(message)
```

### WhatsApp (Twilio WhatsApp API)
```python
client.messages.create(
    body=body,
    from_='whatsapp:+14155238886',
    to=f'whatsapp:+91{booking["phone"]}'
)
```

Add credentials to `config_booking.py`:
```python
TWILIO_ACCOUNT_SID = "ACxxxxxxx"
TWILIO_AUTH_TOKEN  = "your_token"
SENDGRID_API_KEY   = "SG.xxxxxxx"
```

---

## 7. UPDATING THE FRONTEND API URL

After deployment, update these two lines:

**`website/dental-website/script.js` line 4:**
```js
const BOOKING_API = 'https://YOUR-DEPLOYED-URL/api/book';
```

**`website/derm-site/index.html` (inside the `<script>` block):**
```js
const DERM_BOOKING_API = 'https://YOUR-DEPLOYED-URL/api/book';
```

---

## 8. DATABASE SCHEMA

```sql
CREATE TABLE bookings (
    id                TEXT PRIMARY KEY,   -- 8-char hex e.g. "A84F6149"
    clinic            TEXT NOT NULL,      -- "dental" or "derm"
    name              TEXT NOT NULL,
    email             TEXT,
    phone             TEXT NOT NULL,
    service           TEXT,
    appt_dt           TEXT NOT NULL,      -- ISO 8601 "2026-07-20T10:00:00"
    notes             TEXT,
    created_at        TEXT NOT NULL,      -- ISO 8601 UTC
    reminder_24h_sent INTEGER DEFAULT 0, -- 0 or 1
    reminder_2h_sent  INTEGER DEFAULT 0  -- 0 or 1
);
```

---

## 9. REMINDER TIMING LOGIC

```
Appointment at T

T - 25h ─────────── T - 23h   ← 24h reminder fires in this window
T - 3h  ─────────── T - 1h    ← 2h reminder fires in this window

Scheduler polls every 60 seconds.
5-minute window prevents missed reminders if scheduler skips a cycle.
```

---

## 10. ENVIRONMENT VARIABLES (Optional Overrides)

| Variable | Default | Description |
|----------|---------|-------------|
| `BOOKING_PORT` | `5001` | Port for Flask server |
| `BOOKING_DB_PATH` | `bookings.db` | SQLite file path |
| `BOOKING_REMINDER_INTERVAL` | `60` | Scheduler poll interval (seconds) |
| `TWILIO_ACCOUNT_SID` | - | Twilio credentials |
| `TWILIO_AUTH_TOKEN` | - | Twilio credentials |
| `SENDGRID_API_KEY` | - | SendGrid credentials |

---

## 11. VERIFICATION CHECKLIST

Run after deployment to confirm everything works:

- [ ] `GET /api/health` returns `{"status": "ok"}`
- [ ] `POST /api/book` returns HTTP 201 with `booking_id`
- [ ] `POST /api/test-reminder/<id>` returns `{"sent_24h": true, "sent_2h": true}`
- [ ] `reminders.log` contains REMINDER FIRED entries
- [ ] Dental website form submits and shows success card
- [ ] Derm website form submits and shows success card
- [ ] Both show Booking ID in success card
- [ ] Both show reminder confirmation message

Run the automated test:
```bash
python test_booking_reminders.py
# All 20 assertions should show [PASS]
```

---

## 12. SUPPORT / TROUBLESHOOTING

| Problem | Fix |
|---------|-----|
| `UnicodeEncodeError` on Windows | Run `set PYTHONIOENCODING=utf-8` before starting server |
| CORS error in browser | Make sure `flask-cors` is installed; check `BOOKING_API` URL matches deployed URL |
| Port already in use | Change `BOOKING_SERVER_PORT` in `config_booking.py` |
| Reminders not firing | Check that `reminder_engine.py` scheduler started (see server logs) |
| Database locked | Ensure only one instance of server is running |

---

*Generated by Antigravity AI — Prime Health Project*
