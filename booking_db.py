"""
booking_db.py — SQLite Database Layer for Booking System
=========================================================
Manages the `appointments` table.

Schema
------
id                TEXT      PRIMARY KEY (UUID8)
clinic            TEXT      "dental" | "derm"
name              TEXT
email             TEXT
phone             TEXT
service           TEXT
appt_dt           TEXT      ISO-8601 datetime string (UTC)
notes             TEXT
created_at        TEXT      ISO-8601 datetime string (UTC)
reminder_24h_sent INTEGER   0 / 1
reminder_2h_sent  INTEGER   0 / 1
"""

import sqlite3
import uuid
import os
from datetime import datetime, timezone

DB_PATH = os.path.join(os.path.dirname(__file__), "bookings.db")


def _connect():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Create the appointments table if it does not exist."""
    with _connect() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS appointments (
                id                TEXT PRIMARY KEY,
                clinic            TEXT NOT NULL,
                name              TEXT NOT NULL,
                email             TEXT,
                phone             TEXT,
                service           TEXT,
                appt_dt           TEXT NOT NULL,
                notes             TEXT,
                created_at        TEXT NOT NULL,
                reminder_24h_sent INTEGER DEFAULT 0,
                reminder_2h_sent  INTEGER DEFAULT 0
            )
        """)
        conn.commit()


def create_booking(clinic: str, name: str, email: str, phone: str,
                   service: str, appt_dt: str, notes: str = "") -> str:
    """
    Insert a new appointment.  Returns the new booking ID.

    Parameters
    ----------
    appt_dt : str
        ISO-8601 string, e.g. "2026-07-16T14:00:00"
    """
    booking_id = str(uuid.uuid4())[:8].upper()
    now_utc = datetime.now(timezone.utc).isoformat()
    with _connect() as conn:
        conn.execute(
            """
            INSERT INTO appointments
                (id, clinic, name, email, phone, service, appt_dt,
                 notes, created_at, reminder_24h_sent, reminder_2h_sent)
            VALUES
                (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0)
            """,
            (booking_id, clinic, name, email, phone, service,
             appt_dt, notes, now_utc),
        )
        conn.commit()
    return booking_id


def get_booking(booking_id: str) -> dict | None:
    """Return a single booking as a dict, or None if not found."""
    with _connect() as conn:
        row = conn.execute(
            "SELECT * FROM appointments WHERE id = ?", (booking_id,)
        ).fetchone()
    return dict(row) if row else None


def list_bookings(limit: int = 100) -> list[dict]:
    """Return the most recent bookings."""
    with _connect() as conn:
        rows = conn.execute(
            "SELECT * FROM appointments ORDER BY created_at DESC LIMIT ?",
            (limit,),
        ).fetchall()
    return [dict(r) for r in rows]


def mark_reminder_sent(booking_id: str, reminder_type: str):
    """
    Mark a reminder as sent.

    Parameters
    ----------
    reminder_type : "24h" | "2h"
    """
    col = "reminder_24h_sent" if reminder_type == "24h" else "reminder_2h_sent"
    with _connect() as conn:
        conn.execute(
            f"UPDATE appointments SET {col} = 1 WHERE id = ?", (booking_id,)
        )
        conn.commit()


def get_pending_reminders(now: datetime) -> list[dict]:
    """
    Return bookings whose T-24h or T-2h reminder window is active
    and whose reminder has NOT yet been sent.

    Uses a ±5-minute window around each target time.
    """
    from datetime import timedelta
    window = timedelta(minutes=5)

    t24_start = (now + timedelta(hours=24) - window).isoformat()
    t24_end   = (now + timedelta(hours=24) + window).isoformat()
    t2_start  = (now + timedelta(hours=2)  - window).isoformat()
    t2_end    = (now + timedelta(hours=2)  + window).isoformat()

    with _connect() as conn:
        rows = conn.execute(
            """
            SELECT *, '24h' AS due_type FROM appointments
            WHERE reminder_24h_sent = 0
              AND appt_dt BETWEEN ? AND ?
            UNION ALL
            SELECT *, '2h' AS due_type FROM appointments
            WHERE reminder_2h_sent = 0
              AND appt_dt BETWEEN ? AND ?
            """,
            (t24_start, t24_end, t2_start, t2_end),
        ).fetchall()
    return [dict(r) for r in rows]
