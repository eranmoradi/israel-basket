#!/usr/bin/env python3
"""
Fetch real-time prices from chp.co.il for all products in the Israel Basket.
Outputs: israel-basket/src/data/prices.json
"""
from __future__ import annotations

import json
import time
import random
import re
import urllib.request
import urllib.parse
from html.parser import HTMLParser
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).parent.parent
PRODUCTS_JSON = ROOT / "israel-basket/src/data/products.json"
OUTPUT_JSON = ROOT / "israel-basket/src/data/prices.json"

BASE_URL = "https://chp.co.il"
DELAY_RANGE = (1.0, 2.5)  # seconds between requests, to be polite


class PriceTableParser(HTMLParser):
    """Parse the HTML returned by /main_page/compare_results."""

    def __init__(self):
        super().__init__()
        self.in_table = False
        self.rows = []
        self._current_row: list[str] = []
        self._in_cell = False
        self._cell_text = ""
        self.product_title = ""
        self._in_h4 = False
        self._in_hidden_input = False

    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        if tag == "table":
            self.in_table = True
        if tag in ("td", "th") and self.in_table:
            self._in_cell = True
            self._cell_text = ""
        if tag == "h4":
            self._in_h4 = True
        if tag == "input" and attrs_dict.get("id") == "displayed_product_name_and_contents":
            self.product_title = attrs_dict.get("value", "")

    def handle_endtag(self, tag):
        if tag in ("td", "th") and self._in_cell:
            self._current_row.append(self._cell_text.strip())
            self._in_cell = False
        if tag == "tr" and self._current_row:
            self.rows.append(self._current_row)
            self._current_row = []
        if tag == "table":
            self.in_table = False
        if tag == "h4":
            self._in_h4 = False

    def handle_data(self, data):
        if self._in_cell:
            self._cell_text += data


def fetch_prices_for_barcode(barcode: str, u: float) -> list[dict]:
    """
    Query chp.co.il for prices of a specific barcode.
    Returns a list of {chain, store, sale_price, regular_price} dicts.
    """
    params = urllib.parse.urlencode({
        "shopping_address": "",
        "shopping_address_street_id": 0,
        "shopping_address_city_id": 0,
        "product_name_or_barcode": barcode,
        "product_barcode": barcode,
        "from": 0,
        "num_results": 50,
        "bare": "true",
        "u": f"{u:.6f}",
    })
    url = f"{BASE_URL}/main_page/compare_results?{params}"

    req = urllib.request.Request(url, headers={
        "User-Agent": "Mozilla/5.0 (compatible; IsraelBasketBot/1.0)",
        "Accept": "text/html,application/xhtml+xml",
        "Referer": BASE_URL + "/",
    })
    with urllib.request.urlopen(req, timeout=15) as resp:
        html = resp.read().decode("utf-8", errors="replace")

    parser = PriceTableParser()
    parser.feed(html)

    prices = []
    header_found = False
    for row in parser.rows:
        # Skip until we hit the header row
        if not header_found:
            if len(row) >= 5 and row[0] == "רשת":
                header_found = True
            continue
        # Skip sub-rows (website link rows have only 1 cell)
        if len(row) < 5:
            continue
        chain = row[0].strip()
        store = row[1].strip()
        website = row[2].strip()
        sale_raw = row[3].strip()
        price_raw = row[4].strip()

        if not chain or not price_raw:
            continue

        def parse_price(s: str) -> float | None:
            s = re.sub(r"[^\d.]", "", s)
            try:
                return float(s)
            except ValueError:
                return None

        regular = parse_price(price_raw)
        sale = parse_price(sale_raw.rstrip(" *")) if sale_raw else None

        if regular is None:
            continue

        prices.append({
            "chain": chain,
            "store": store,
            "website": website,
            "regular_price": regular,
            "sale_price": sale,
            "effective_price": sale if sale is not None else regular,
        })

    return prices, parser.product_title


def select_group_representatives(products: list[dict]) -> list[dict]:
    """Pick one representative per groupId (first branded product in each group)."""
    seen: dict[int, dict] = {}
    for p in products:
        if p["isBasic"]:
            continue
        gid = p["groupId"]
        if gid not in seen:
            seen[gid] = p
    return list(seen.values())


def main():
    print(f"Loading products from {PRODUCTS_JSON}")
    with open(PRODUCTS_JSON, encoding="utf-8") as f:
        all_products = json.load(f)

    representatives = select_group_representatives(all_products)
    print(f"Found {len(representatives)} product groups to query\n")

    results: list[dict] = []
    errors: list[dict] = []
    u = random.random()

    for i, product in enumerate(representatives, 1):
        barcode = product["barcode"]
        name = product["name"]
        print(f"[{i:3d}/{len(representatives)}] {barcode}  {name[:50]}", end="  ", flush=True)

        try:
            prices, chp_title = fetch_prices_for_barcode(barcode, u)
            print(f"→ {len(prices)} stores")

            results.append({
                "groupId": product["groupId"],
                "barcode": barcode,
                "name": name,
                "chp_title": chp_title,
                "prices": prices,
            })
        except Exception as e:
            print(f"✗ ERROR: {e}")
            errors.append({"barcode": barcode, "name": name, "error": str(e)})

        if i < len(representatives):
            delay = random.uniform(*DELAY_RANGE)
            time.sleep(delay)

    output = {
        "fetched_at": datetime.now(timezone.utc).isoformat(),
        "source": "chp.co.il",
        "product_count": len(results),
        "error_count": len(errors),
        "products": results,
        "errors": errors,
    }

    print(f"\nSaving results to {OUTPUT_JSON}")
    OUTPUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"\nDone! {len(results)} products fetched, {len(errors)} errors.")
    if errors:
        print("Errors:")
        for e in errors:
            print(f"  {e['barcode']} {e['name']}: {e['error']}")


if __name__ == "__main__":
    main()
