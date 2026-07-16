"""
run_booking.py — One-Command Launcher for the Booking System
=============================================================

Usage:
    python run_booking.py

This script:
  1. Checks for required packages (flask, flask-cors) — installs if missing.
  2. Initialises the SQLite database.
  3. Starts the Flask booking server on port 5001.
  4. Prints instructions for running the reminder test.

The server stays running until you press Ctrl+C.
"""

import subprocess
import sys
import os


def ensure_package(pkg: str, import_name: str = None):
    """Install pkg if not already importable."""
    import_name = import_name or pkg.replace("-", "_")
    try:
        __import__(import_name)
    except ImportError:
        print(f"  Installing {pkg}…")
        subprocess.check_call(
            [sys.executable, "-m", "pip", "install", pkg, "-q"]
        )


def main():
    print("\n" + "="*60)
    print("  Prime Health — Booking System Launcher")
    print("="*60)

    # ── Ensure dependencies ──────────────────────────────────────────
    print("\n[1/3] Checking dependencies…")
    ensure_package("flask",      "flask")
    ensure_package("flask-cors", "flask_cors")
    print("      ✅  Dependencies OK")

    # ── Start server ──────────────────────────────────────────────────
    print("\n[2/3] Starting booking server…")
    print("      Port: 5001")
    print("      API : http://localhost:5001/api/book")
    print()

    print("[3/3] To test reminders, open a NEW terminal and run:")
    print("      python test_booking_reminders.py")
    print()
    print("  Press Ctrl+C to stop the server.")
    print("="*60 + "\n")

    # Import and run the server (blocking call)
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    import booking_server
    booking_server.app.run(
        host="0.0.0.0",
        port=5001,
        debug=False,
        threaded=True,
    )


if __name__ == "__main__":
    main()
