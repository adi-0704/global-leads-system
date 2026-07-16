"""
booking_server.py — Flask REST API for Patient Booking
=======================================================
Port: 5001  (separate from the Maps Scraper on 5000)

Endpoints
---------
  POST /api/book
      Body JSON: { clinic, name, email, phone, service, appt_dt, notes }
      Returns:   { booking_id, message }

  GET  /api/bookings
      Query param: ?secret=<ADMIN_SECRET>
      Returns:   { bookings: [...] }

  GET  /api/booking/<booking_id>
      Returns:   booking dict or 404

  POST /api/test-reminder/<booking_id>
      Immediately fires BOTH T-24h and T-2h reminders for any booking.
      Used to verify the reminder system end-to-end.
      Returns:   { sent_24h: bool, sent_2h: bool, log_path: str }

  GET  /api/health
      Returns:   { status: "ok" }
"""

from flask import Flask, jsonify, request
from flask_cors import CORS

import booking_db as db
import reminder_engine as engine
from config_booking import ADMIN_SECRET, BOOKING_SERVER_HOST, BOOKING_SERVER_PORT

# ---------------------------------------------------------------------------
# App setup
# ---------------------------------------------------------------------------

app = Flask(__name__)
CORS(app)   # Allow requests from the static HTML websites

# Initialise database on startup
db.init_db()

# Start the background reminder scheduler
engine.start_scheduler()

print("\n" + "="*60)
print("  Prime Health Booking Server")
print("="*60)
print(f"  -> REST API  : http://localhost:{BOOKING_SERVER_PORT}/api/book")
print(f"  -> Dashboard : http://localhost:{BOOKING_SERVER_PORT}/api/bookings")
print(f"  -> Health    : http://localhost:{BOOKING_SERVER_PORT}/api/health")
print("  -> Reminder log: reminders.log")
print("="*60 + "\n")


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.route("/api/health")
def health():
    return jsonify({"status": "ok", "server": "Prime Health Booking"})


@app.route("/api/book", methods=["POST"])
def book_appointment():
    """Create a new appointment."""
    data = request.get_json(force=True)

    clinic  = (data.get("clinic") or "").strip().lower()
    name    = (data.get("name")   or "").strip()
    email   = (data.get("email")  or "").strip()
    phone   = (data.get("phone")  or "").strip()
    service = (data.get("service") or "").strip()
    appt_dt = (data.get("appt_dt") or "").strip()
    notes   = (data.get("notes")   or "").strip()

    # Validation
    errors = []
    if clinic not in ("dental", "derm"):
        errors.append("'clinic' must be 'dental' or 'derm'")
    if not name:
        errors.append("'name' is required")
    if not appt_dt:
        errors.append("'appt_dt' is required (ISO-8601, e.g. 2026-07-17T10:00:00)")

    if errors:
        return jsonify({"error": "; ".join(errors)}), 400

    booking_id = db.create_booking(
        clinic=clinic, name=name, email=email, phone=phone,
        service=service, appt_dt=appt_dt, notes=notes,
    )

    from config_booking import CLINIC_CONFIG
    clinic_name = CLINIC_CONFIG.get(clinic, {}).get("name", "Clinic")

    return jsonify({
        "booking_id": booking_id,
        "message": (
            f"Booking confirmed at {clinic_name}! "
            f"You will receive reminders 24 hours and 2 hours before your appointment."
        ),
        "clinic": clinic_name,
    }), 201


@app.route("/api/booking/<booking_id>")
def get_booking(booking_id: str):
    """Return details of a single booking."""
    booking = db.get_booking(booking_id.upper())
    if not booking:
        return jsonify({"error": "Booking not found"}), 404
    return jsonify(booking)


@app.route("/api/bookings")
def list_bookings():
    """Admin: list all bookings (requires secret key)."""
    secret = request.args.get("secret", "")
    if secret != ADMIN_SECRET:
        return jsonify({"error": "Unauthorized"}), 401
    bookings = db.list_bookings(limit=200)
    return jsonify({"count": len(bookings), "bookings": bookings})


@app.route("/api/test-reminder/<booking_id>", methods=["POST"])
def test_reminder(booking_id: str):
    """
    Immediately fire BOTH the T-24h and T-2h reminders for a booking.
    This is the verification endpoint — used by test_booking_reminders.py.

    Does NOT check window timing; fires unconditionally.
    Resets the sent flags first so the test is always fresh.
    """
    booking = db.get_booking(booking_id.upper())
    if not booking:
        return jsonify({"error": "Booking not found"}), 404

    # Reset sent flags so they can be fired again
    with db._connect() as conn:
        conn.execute(
            "UPDATE appointments SET reminder_24h_sent=0, reminder_2h_sent=0 WHERE id=?",
            (booking["id"],),
        )
        conn.commit()

    # Re-fetch with reset flags
    booking = db.get_booking(booking_id.upper())

    sent_24h = engine.send_reminder(booking, "24h")
    sent_2h  = engine.send_reminder(booking, "2h")

    return jsonify({
        "booking_id": booking["id"],
        "sent_24h":   sent_24h,
        "sent_2h":    sent_2h,
        "log_path":   engine.LOG_PATH,
        "message":    "Both reminders fired successfully! Check reminders.log for details.",
    })


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import sys
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    app.run(
        host=BOOKING_SERVER_HOST,
        port=BOOKING_SERVER_PORT,
        debug=False,
        threaded=True,
    )
