"""
reminder_engine.py — Automatic T-24h / T-2h Reminder Engine
=============================================================
Runs as a background thread inside the Flask server.

Reminder delivery
-----------------
1. If SMTP credentials are configured → sends real email.
2. Otherwise → writes human-readable entries to `reminders.log`
   (same directory as this file). This is perfect for local testing
   without any email account.

Both modes mark the reminder as sent in the DB so duplicates
are never fired.
"""

import logging
import os
import smtplib
import threading
import time
from datetime import datetime, timezone
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

import booking_db as db
from config_booking import (
    CLINIC_CONFIG,
    SMTP_FROM,
    SMTP_HOST,
    SMTP_PASSWORD,
    SMTP_PORT,
    SMTP_USER,
)

LOG_PATH = os.path.join(os.path.dirname(__file__), "reminders.log")
logger = logging.getLogger("reminder_engine")
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  [%(levelname)s]  %(message)s",
)


# ---------------------------------------------------------------------------
# Email helpers
# ---------------------------------------------------------------------------

def _build_email(booking: dict, reminder_type: str) -> tuple[str, str]:
    """Return (subject, html_body) for the reminder."""
    clinic_cfg = CLINIC_CONFIG.get(booking["clinic"], {})
    clinic_name = clinic_cfg.get("name", "Your Clinic")
    clinic_phone = clinic_cfg.get("phone", "")
    clinic_addr = clinic_cfg.get("address", "")
    color = clinic_cfg.get("color", "#1a6fc4")

    # Format the appointment datetime nicely
    try:
        dt = datetime.fromisoformat(booking["appt_dt"])
        appt_str = dt.strftime("%A, %d %B %Y at %I:%M %p")
    except Exception:
        appt_str = booking["appt_dt"]

    if reminder_type == "24h":
        subject = f"Reminder: Your appointment at {clinic_name} is TOMORROW"
        headline = "Your appointment is tomorrow! 📅"
        subline = "We look forward to seeing you."
    else:
        subject = f"Reminder: Your appointment at {clinic_name} is in 2 HOURS"
        headline = "Your appointment is in 2 hours! ⏰"
        subline = "Please make sure you're on your way."

    html = f"""
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"/></head>
    <body style="margin:0;padding:0;background:#f4f4f8;font-family:Inter,Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f8;padding:40px 20px;">
        <tr><td align="center">
          <table width="580" cellpadding="0" cellspacing="0"
                 style="background:#fff;border-radius:16px;overflow:hidden;
                        box-shadow:0 4px 24px rgba(0,0,0,.08);">
            <!-- Header -->
            <tr>
              <td style="background:{color};padding:32px 40px;text-align:center;">
                <h1 style="margin:0;color:#fff;font-size:26px;font-weight:700;">{clinic_name}</h1>
              </td>
            </tr>
            <!-- Body -->
            <tr>
              <td style="padding:40px;">
                <h2 style="margin:0 0 8px;color:#1a1a2e;font-size:22px;">{headline}</h2>
                <p style="color:#555;margin:0 0 28px;">{subline}</p>
                <!-- Appointment card -->
                <div style="background:#f8f9fc;border-left:4px solid {color};
                            border-radius:8px;padding:20px 24px;margin-bottom:28px;">
                  <table cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td width="50%">
                        <p style="margin:0 0 4px;font-size:12px;color:#888;text-transform:uppercase;
                                  letter-spacing:.08em;">Patient</p>
                        <p style="margin:0;font-size:16px;font-weight:600;color:#1a1a2e;">{booking['name']}</p>
                      </td>
                      <td width="50%">
                        <p style="margin:0 0 4px;font-size:12px;color:#888;text-transform:uppercase;
                                  letter-spacing:.08em;">Service</p>
                        <p style="margin:0;font-size:16px;font-weight:600;color:#1a1a2e;">{booking.get('service','—')}</p>
                      </td>
                    </tr>
                    <tr><td colspan="2" style="padding:12px 0 0;"></td></tr>
                    <tr>
                      <td colspan="2">
                        <p style="margin:0 0 4px;font-size:12px;color:#888;text-transform:uppercase;
                                  letter-spacing:.08em;">Date &amp; Time</p>
                        <p style="margin:0;font-size:18px;font-weight:700;color:{color};">{appt_str}</p>
                      </td>
                    </tr>
                    <tr><td colspan="2" style="padding:12px 0 0;"></td></tr>
                    <tr>
                      <td colspan="2">
                        <p style="margin:0 0 4px;font-size:12px;color:#888;text-transform:uppercase;
                                  letter-spacing:.08em;">Location</p>
                        <p style="margin:0;font-size:14px;color:#444;">{clinic_addr}</p>
                      </td>
                    </tr>
                    <tr><td colspan="2" style="padding:12px 0 0;"></td></tr>
                    <tr>
                      <td colspan="2">
                        <p style="margin:0 0 4px;font-size:12px;color:#888;text-transform:uppercase;
                                  letter-spacing:.08em;">Booking ID</p>
                        <p style="margin:0;font-size:14px;font-family:monospace;color:#555;">{booking['id']}</p>
                      </td>
                    </tr>
                  </table>
                </div>
                <!-- Need to reschedule? -->
                <p style="color:#777;font-size:14px;margin:0 0 24px;">
                  Need to reschedule or cancel? Call us at
                  <a href="tel:{clinic_phone}" style="color:{color};font-weight:600;">{clinic_phone}</a>
                  at least 2 hours before your appointment.
                </p>
                <!-- CTA -->
                <div style="text-align:center;">
                  <a href="tel:{clinic_phone}"
                     style="display:inline-block;background:{color};color:#fff;
                            text-decoration:none;padding:14px 32px;border-radius:999px;
                            font-weight:700;font-size:15px;">📞 Call Clinic</a>
                </div>
              </td>
            </tr>
            <!-- Footer -->
            <tr>
              <td style="background:#f8f9fc;padding:20px 40px;text-align:center;
                         border-top:1px solid #eee;">
                <p style="margin:0;font-size:12px;color:#aaa;">
                  This is an automated reminder from {clinic_name}.
                  Please do not reply to this email.
                </p>
              </td>
            </tr>
          </table>
        </td></tr>
      </table>
    </body>
    </html>
    """
    return subject, html


def _send_email(to_email: str, subject: str, html_body: str) -> bool:
    """Send email via SMTP. Returns True on success."""
    if not SMTP_USER or not SMTP_PASSWORD:
        return False  # SMTP not configured
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"]    = SMTP_FROM or SMTP_USER
        msg["To"]      = to_email
        msg.attach(MIMEText(html_body, "html"))

        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as smtp:
            smtp.ehlo()
            smtp.starttls()
            smtp.login(SMTP_USER, SMTP_PASSWORD)
            smtp.sendmail(SMTP_USER, to_email, msg.as_string())
        return True
    except Exception as exc:
        logger.error(f"SMTP error: {exc}")
        return False


# ---------------------------------------------------------------------------
# Log reminder to file (fallback when SMTP is not configured)
# ---------------------------------------------------------------------------

def _log_reminder(booking: dict, reminder_type: str, subject: str):
    """Append a human-readable reminder entry to reminders.log."""
    try:
        dt = datetime.fromisoformat(booking["appt_dt"])
        appt_str = dt.strftime("%A, %d %B %Y at %I:%M %p")
    except Exception:
        appt_str = booking["appt_dt"]

    clinic_cfg = CLINIC_CONFIG.get(booking["clinic"], {})
    clinic_name = clinic_cfg.get("name", "Clinic")

    line = (
        f"\n{'='*60}\n"
        f"  REMINDER FIRED  [{reminder_type.upper()}]\n"
        f"  Time       : {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n"
        f"  Clinic     : {clinic_name}\n"
        f"  Patient    : {booking['name']}  ({booking.get('email','--')})\n"
        f"  Service    : {booking.get('service','--')}\n"
        f"  Appointment: {appt_str}\n"
        f"  Booking ID : {booking['id']}\n"
        f"  Subject    : {subject}\n"
        f"{'='*60}\n"
    )
    with open(LOG_PATH, "a", encoding="utf-8") as f:
        f.write(line)
    logger.info(f"Reminder [{reminder_type}] logged → {booking['name']} ({booking['id']})")


# ---------------------------------------------------------------------------
# Core: send one reminder
# ---------------------------------------------------------------------------

def send_reminder(booking: dict, reminder_type: str) -> bool:
    """
    Fire a single reminder (email + log).

    Parameters
    ----------
    reminder_type : "24h" | "2h"

    Returns True if reminder was delivered (email or log).
    """
    subject, html = _build_email(booking, reminder_type)

    email_sent = False
    if booking.get("email"):
        email_sent = _send_email(booking["email"], subject, html)
        if email_sent:
            logger.info(
                f"Email reminder [{reminder_type}] sent → "
                f"{booking['name']} <{booking['email']}> ({booking['id']})"
            )

    # Always log regardless of email outcome
    _log_reminder(booking, reminder_type, subject)

    # Mark as sent in DB
    db.mark_reminder_sent(booking["id"], reminder_type)
    return True


# ---------------------------------------------------------------------------
# Background scheduler loop
# ---------------------------------------------------------------------------

_scheduler_thread: threading.Thread | None = None
_stop_event = threading.Event()


def _scheduler_loop():
    """Poll every 60 seconds and fire due reminders."""
    logger.info("Reminder scheduler started (polling every 60 s)")
    while not _stop_event.is_set():
        try:
            now = datetime.now(timezone.utc)
            pending = db.get_pending_reminders(now)
            for booking in pending:
                due_type = booking.get("due_type", "")
                if due_type in ("24h", "2h"):
                    send_reminder(booking, due_type)
        except Exception as exc:
            logger.error(f"Scheduler error: {exc}")
        _stop_event.wait(60)  # sleep 60 seconds between polls
    logger.info("Reminder scheduler stopped.")


def start_scheduler():
    """Start the background scheduler thread (idempotent)."""
    global _scheduler_thread
    if _scheduler_thread and _scheduler_thread.is_alive():
        return
    _stop_event.clear()
    _scheduler_thread = threading.Thread(
        target=_scheduler_loop, daemon=True, name="ReminderScheduler"
    )
    _scheduler_thread.start()


def stop_scheduler():
    """Signal the scheduler to stop."""
    _stop_event.set()
