"""
config_booking.py — Booking System Configuration
=================================================
Edit this file to set your SMTP credentials and other settings.

If SMTP is not configured the reminder engine falls back to writing
reminders to `reminders.log` in this directory (great for local testing).
"""

import os

# ---------------------------------------------------------------------------
# Server
# ---------------------------------------------------------------------------
BOOKING_SERVER_PORT = 5001
BOOKING_SERVER_HOST = "0.0.0.0"

# ---------------------------------------------------------------------------
# Secret key for admin endpoints (change in production)
# ---------------------------------------------------------------------------
ADMIN_SECRET = os.environ.get("BOOKING_ADMIN_SECRET", "primehealth-admin-2026")

# ---------------------------------------------------------------------------
# SMTP settings — set these or use environment variables
# ---------------------------------------------------------------------------
SMTP_HOST     = os.environ.get("SMTP_HOST",     "smtp.gmail.com")
SMTP_PORT     = int(os.environ.get("SMTP_PORT", "587"))
SMTP_USER     = os.environ.get("SMTP_USER",     "")   # your-email@gmail.com
SMTP_PASSWORD = os.environ.get("SMTP_PASSWORD", "")   # App Password (not account password)
SMTP_FROM     = os.environ.get("SMTP_FROM",     "")   # Display "From" address

# ---------------------------------------------------------------------------
# Clinic branding
# ---------------------------------------------------------------------------
CLINIC_CONFIG = {
    "dental": {
        "name":    "Smile Dental Care",
        "address": "12 Turner Road, Bandra West, Mumbai",
        "phone":   "+91 22 6677 8899",
        "color":   "#1a6fc4",
    },
    "derm": {
        "name":    "ClearSkin - Dr. Ananya Sharma",
        "address": "2nd Floor, Galleria Market, Sector 28, Gurugram",
        "phone":   "+91 98765 43210",
        "color":   "#C17683",
    },
}

# ---------------------------------------------------------------------------
# Reminder timing windows (seconds around the target)
# ---------------------------------------------------------------------------
REMINDER_WINDOW_SECONDS = 5 * 60  # ±5 minute window
