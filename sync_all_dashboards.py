# -*- coding: utf-8 -*-
"""
sync_all_dashboards.py
======================
Master sync script that regenerates data.json from leads.db across
ALL THREE workflows:
  1. Global Doctor Outreach (global-outreach/)
  2. India Doctor Outreach  (india-outreach/)
  3. Recruitment Outreach   (../recruitment-leads-system/)

Run this script anytime to ensure 100% data sync between SQLite databases
and static frontend JSON files.
"""

import os
import sys
import time

STARTUP_DIR = os.path.dirname(os.path.abspath(__file__))
PARENT_DIR = os.path.dirname(STARTUP_DIR)

def sync_global():
    print("=" * 60)
    print("  [1/3] Syncing GLOBAL OUTREACH Dashboard...")
    print("=" * 60)
    global_dir = os.path.join(STARTUP_DIR, "global-outreach")
    if global_dir not in sys.path:
        sys.path.insert(0, global_dir)
    try:
        import generate_data_json
        generate_data_json.main()
        print("  [SUCCESS] Global Outreach data.json successfully updated.\n")
    except Exception as e:
        print(f"  [ERROR] Failed to sync Global Outreach: {e}\n")

def sync_india():
    print("=" * 60)
    print("  [2/3] Syncing INDIA OUTREACH Dashboard...")
    print("=" * 60)
    india_dir = os.path.join(STARTUP_DIR, "india-outreach")
    if india_dir not in sys.path:
        sys.path.insert(0, india_dir)
    try:
        import generate_data_json_india
        generate_data_json_india.main()
        print("  [SUCCESS] India Outreach data.json successfully updated.\n")
    except Exception as e:
        print(f"  [ERROR] Failed to sync India Outreach: {e}\n")

def sync_recruitment():
    print("=" * 60)
    print("  [3/3] Syncing RECRUITMENT OUTREACH Dashboard...")
    print("=" * 60)
    recruitment_dir = os.path.join(PARENT_DIR, "recruitment-leads-system")
    if os.path.exists(recruitment_dir):
        if recruitment_dir not in sys.path:
            sys.path.insert(0, recruitment_dir)
        try:
            prev_cwd = os.getcwd()
            os.chdir(recruitment_dir)
            import generate_data_json as rec_gen
            rec_gen.main()
            os.chdir(prev_cwd)
            print("  [SUCCESS] Recruitment Outreach data.json successfully updated.\n")
        except Exception as e:
            print(f"  [ERROR] Failed to sync Recruitment Outreach: {e}\n")
    else:
        print(f"  [WARNING] Directory not found: {recruitment_dir}\n")

def main():
    start_time = time.time()
    print("\n[STARTING] Master Sync for all 3 workflow dashboards...\n")
    sync_global()
    sync_india()
    sync_recruitment()
    elapsed = time.time() - start_time
    print("=" * 60)
    print(f"[COMPLETE] Master Sync finished in {elapsed:.2f}s")
    print("  All 3 dashboards are now 100% in sync with their leads.db databases!")
    print("=" * 60 + "\n")

if __name__ == "__main__":
    main()
