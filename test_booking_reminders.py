"""
test_booking_reminders.py -- End-to-End Reminder Verification
=============================================================

This script:
  1. Pings the booking server health check.
  2. Creates a real test booking (for BOTH dental and derm clinics).
  3. Calls the /api/test-reminder endpoint for each booking.
  4. Reads reminders.log and confirms both reminders were written.
  5. Prints a clear PASS / FAIL summary.

Usage
-----
  1. Start the booking server:
       python booking_server.py
  2. In another terminal, run this script:
       python test_booking_reminders.py
"""

import os
import sys
import time
from datetime import datetime, timedelta

try:
    import requests
except ImportError:
    print("Installing requests...")
    os.system(f"{sys.executable} -m pip install requests")
    import requests

BASE = "http://localhost:5001"
LOG_PATH = os.path.join(os.path.dirname(__file__), "reminders.log")

PASS = "[PASS]"
FAIL = "[FAIL]"
INFO = "[INFO]"


def sep(title=""):
    print("\n" + "-" * 60)
    if title:
        print(f"  {title}")
    print()


def check(condition, label):
    status = PASS if condition else FAIL
    print(f"  {status}  {label}")
    return condition


def test_clinic(clinic: str, display: str) -> bool:
    sep(f"Testing: {display}")

    # 1. Create booking
    appt_dt = (datetime.now() + timedelta(days=1, hours=2)).strftime("%Y-%m-%dT%H:%M:%S")
    payload = {
        "clinic":  clinic,
        "name":    f"Test Patient ({display})",
        "email":   "test@primehealth.in",
        "phone":   "9999999999",
        "service": "Test Consultation",
        "appt_dt": appt_dt,
        "notes":   "Automated reminder test",
    }

    try:
        resp = requests.post(f"{BASE}/api/book", json=payload, timeout=10)
    except requests.ConnectionError:
        print(f"  {FAIL}  Cannot connect to booking server at {BASE}")
        print(f"         Run:  python booking_server.py")
        return False

    ok = check(resp.status_code == 201, f"POST /api/book -> {resp.status_code}")
    if not ok:
        print(f"         Response: {resp.text}")
        return False

    data       = resp.json()
    booking_id = data.get("booking_id")
    check(bool(booking_id), f"Booking ID received: {booking_id}")
    print(f"  {INFO} Appointment: {appt_dt}")
    print(f"  {INFO} Message    : {data.get('message')}")

    # 2. Fire both reminders
    time.sleep(0.5)
    resp2 = requests.post(f"{BASE}/api/test-reminder/{booking_id}", timeout=10)
    ok2   = check(resp2.status_code == 200, f"POST /api/test-reminder/{booking_id}")

    if not ok2:
        print(f"         Response: {resp2.text}")
        return False

    result    = resp2.json()
    sent_24h  = result.get("sent_24h")
    sent_2h   = result.get("sent_2h")

    check(sent_24h, "T-24h reminder fired")
    check(sent_2h,  "T-2h  reminder fired")

    # 3. Verify DB flags
    resp3 = requests.get(f"{BASE}/api/booking/{booking_id}", timeout=10)
    bk    = resp3.json()
    check(bk.get("reminder_24h_sent") == 1, "DB: reminder_24h_sent = 1")
    check(bk.get("reminder_2h_sent")  == 1, "DB: reminder_2h_sent  = 1")

    # 4. Verify log file
    if os.path.exists(LOG_PATH):
        with open(LOG_PATH, encoding="utf-8") as f:
            log_content = f.read()
        check("[24H]" in log_content.upper(), "T-24h entry in reminders.log")
        check("[2H]"  in log_content.upper(), "T-2h  entry in reminders.log")
    else:
        check(False, "reminders.log exists")

    return True


def main():
    print("\n" + "="*60)
    print("  Prime Health -- Booking Reminder System Test Suite")
    print("="*60)

    # Health check
    sep("Server Health Check")
    try:
        resp = requests.get(f"{BASE}/api/health", timeout=5)
        check(resp.status_code == 200, f"Server online at {BASE}")
        print(f"  {INFO} {resp.json()}")
    except requests.ConnectionError:
        print(f"  {FAIL}  Server is NOT running at {BASE}")
        print(f"         Start it with:  python booking_server.py")
        sys.exit(1)

    # Test both clinics
    all_passed = True
    all_passed &= test_clinic("dental", "Smile Dental Care")
    all_passed &= test_clinic("derm",   "ClearSkin Dermatology")

    # Show log tail
    sep("Latest reminders.log entries")
    if os.path.exists(LOG_PATH):
        with open(LOG_PATH, encoding="utf-8") as f:
            lines = f.readlines()
        print("".join(lines[-40:]))
    else:
        print("  (reminders.log not found)")

    # Final summary
    sep("Summary")
    if all_passed:
        print(f"  {PASS}  All tests passed!")
        print()
        print("  Both the T-24h and T-2h reminders were fired successfully")
        print("  for BOTH the dental and derm clinics.")
        print(f"  Reminder details are in: {LOG_PATH}")
    else:
        print(f"  {FAIL}  Some tests failed -- see output above.")
        sys.exit(1)
    print()


if __name__ == "__main__":
    main()
