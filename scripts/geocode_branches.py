#!/usr/bin/env python3
"""
One-time script: geocode branches.json with Nominatim (OpenStreetMap).
Adds lat/lng fields in-place. Respects 1 req/sec rate limit.

Run from repo root:
    python scripts/geocode_branches.py
"""

import json
import sys
import time
from pathlib import Path
from typing import Optional, Tuple

try:
    import requests
except ImportError:
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "requests"])
    import requests

BASE_DIR = Path(__file__).parent.parent
BRANCHES_PATH = BASE_DIR / "israel-basket" / "src" / "data" / "branches.json"
NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
HEADERS = {"User-Agent": "IsraelBasket/1.0 geocode_branches.py (eranmoradi@gmail.com)"}
DELAY = 1.1  # slightly over 1s to respect Nominatim ToS


def geocode(query: str) -> Optional[Tuple[float, float]]:
    """Return (lat, lng) or None on failure."""
    params = {"q": query, "format": "json", "limit": 1, "countrycodes": "il"}
    try:
        resp = requests.get(NOMINATIM_URL, params=params, headers=HEADERS, timeout=10)
        resp.raise_for_status()
        results = resp.json()
        if results:
            return float(results[0]["lat"]), float(results[0]["lon"])
    except Exception as e:
        print(f"    ERROR: {e}")
    return None


def main():
    with open(BRANCHES_PATH, encoding="utf-8") as f:
        branches = json.load(f)

    failed = []
    skipped = 0

    for i, branch in enumerate(branches):
        name = branch["name"]
        address = branch["address"]
        city = branch["city"]

        # Re-entrant: skip if already geocoded
        if "lat" in branch and "lng" in branch:
            print(f"[{i+1}/{len(branches)}] SKIP (already has coords): {name}")
            skipped += 1
            continue

        # Attempt 1: full address + city + Israel
        query1 = f"{address}, {city}, ישראל"
        print(f"[{i+1}/{len(branches)}] Geocoding: {name!r}")
        print(f"    Query: {query1!r}")
        result = geocode(query1)
        time.sleep(DELAY)

        if result is None:
            # Attempt 2: city-only fallback
            query2 = f"{city}, ישראל"
            print(f"    RETRY with city-only: {query2!r}")
            result = geocode(query2)
            time.sleep(DELAY)

        if result:
            branch["lat"] = round(result[0], 6)
            branch["lng"] = round(result[1], 6)
            print(f"    OK: ({branch['lat']}, {branch['lng']})")
        else:
            failed.append(name)
            print(f"    FAILED — no coordinates found")

    # Write enriched data back
    with open(BRANCHES_PATH, "w", encoding="utf-8") as f:
        json.dump(branches, f, ensure_ascii=False, indent=2)
        f.write("\n")

    total = len(branches)
    geocoded = total - len(failed) - skipped
    print(f"\nDone. {geocoded} newly geocoded, {skipped} already had coords, {len(failed)} failed.")
    if failed:
        print(f"Failed ({len(failed)}):")
        for name in failed:
            print(f"  - {name}")


if __name__ == "__main__":
    main()
