#!/usr/bin/env python3
"""
Fetch real-time prices for all Israel Basket products from 5 chains:
  - שופרסל (Shufersal Online) — direct product page API
  - רמי לוי (Rami Levy Online) — search API
  - יוחננוף (Yochananof Online) — Magento 2 GraphQL API
  - חצי חינם (Hazi Hinam Online) — CHP price data (auth required for direct API)
  - אושר עד — government price transparency FTP (url.retail.publishedprices.co.il)

Outputs: israel-basket/src/data/chain_prices.json
"""
from __future__ import annotations

import ftplib
import gzip
import io
import json
import time
import random
import re
import urllib.request
import urllib.error
import urllib.parse
import xml.etree.ElementTree as ET
from html import unescape
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).parent.parent
PRODUCTS_JSON = ROOT / "israel-basket/src/data/products.json"
PRICES_JSON = ROOT / "israel-basket/src/data/prices.json"   # CHP data for חצי חינם
OUTPUT_JSON = ROOT / "israel-basket/src/data/chain_prices.json"

CHAINS = ["קרפור", "שופרסל", "רמי לוי", "יוחננוף", "אושר עד", "ויקטורי", "חצי חינם"]
DELAY_BETWEEN_PRODUCTS = (0.8, 1.8)  # seconds between product groups
DELAY_BETWEEN_CHAINS = (0.3, 0.7)    # seconds between API calls for same product

SHUFERSAL_BASE = "https://www.shufersal.co.il"
RAMI_LEVY_BASE = "https://www.rami-levy.co.il"
YOCHANANOF_GRAPHQL = "https://api.yochananof.co.il/graphql"


def _get(url: str, headers: dict | None = None, timeout: int = 15) -> bytes:
    """HTTP GET returning raw bytes. Raises urllib.error.HTTPError on 4xx/5xx."""
    req = urllib.request.Request(url, headers=headers or {})
    req.add_header("User-Agent", "Mozilla/5.0 (compatible; IsraelBasketBot/1.0)")
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return resp.read()


def _post(url: str, payload: bytes, headers: dict | None = None, timeout: int = 15) -> bytes:
    req = urllib.request.Request(url, data=payload, headers=headers or {})
    req.add_header("User-Agent", "Mozilla/5.0 (compatible; IsraelBasketBot/1.0)")
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return resp.read()


# ---------------------------------------------------------------------------
# Shufersal
# ---------------------------------------------------------------------------

def _parse_shufersal_price(html: str) -> dict | None:
    """Extract price from Shufersal product page HTML (data-gtm attribute)."""
    m = re.search(r'data-gtm="(\{[^"]*\})"', html)
    if not m:
        return None
    try:
        gtm = json.loads(unescape(m.group(1)))
    except json.JSONDecodeError:
        return None
    price_obj = gtm.get("price", {})
    regular = price_obj.get("value")
    if regular is None:
        return None
    sale_price = gtm.get("SalePrice")
    sale = sale_price if (sale_price is not None and sale_price < regular) else None
    return {
        "regular": regular,
        "sale": sale,
        "effective": sale if sale is not None else regular,
    }


def _shufersal_search_code(product_name: str) -> str | None:
    """Search Shufersal by product name, return internal product code (e.g. 'P_2026')."""
    url = (
        f"{SHUFERSAL_BASE}/online/he/search/results"
        f"?q={urllib.parse.quote(product_name)}"
        f"&text={urllib.parse.quote(product_name)}"
    )
    try:
        raw = _get(url, headers={"Accept": "application/json"})
        data = json.loads(raw.decode("utf-8"))
    except Exception:
        return None
    results = data.get("results", [])
    if not results:
        return None
    return results[0].get("code")


def fetch_shufersal(barcode: str, product_name: str = "") -> dict | None:
    """
    Fetch Shufersal price via product page /online/he/p/P_{barcode}/json.
    Falls back to name search when barcode returns 404 (Shufersal uses short internal codes).
    Returns {regular, sale, effective} or None if not found.
    """
    url = f"{SHUFERSAL_BASE}/online/he/p/P_{barcode}/json"
    try:
        html = _get(url).decode("utf-8", errors="replace")
        return _parse_shufersal_price(html)
    except urllib.error.HTTPError as e:
        if e.code != 404:
            raise

    # Fallback: search by product name → get internal code → fetch product page
    if not product_name:
        return None
    code = _shufersal_search_code(product_name)
    if not code:
        return None
    try:
        html = _get(f"{SHUFERSAL_BASE}/online/he/p/{code}/json").decode("utf-8", errors="replace")
        return _parse_shufersal_price(html)
    except Exception:
        return None


# ---------------------------------------------------------------------------
# Rami Levy
# ---------------------------------------------------------------------------

def fetch_rami_levy(barcode: str) -> dict | None:
    """
    Fetch Rami Levy price via search API /api/search?q={barcode}.
    Returns {regular, sale, effective} or None if not found.
    """
    url = f"{RAMI_LEVY_BASE}/api/search?q={urllib.parse.quote(barcode)}"
    raw = _get(url, headers={"Accept": "application/json"})
    data = json.loads(raw.decode("utf-8"))

    items = data.get("data", [])
    # Find exact barcode match (the API may return fuzzy results)
    for item in items:
        if str(item.get("barcode")) == str(barcode):
            price = item.get("price", {}).get("price")
            if price is None:
                continue

            # Detect simple single-item sale (cmt == 1 means quantity=1)
            sale = None
            for s in item.get("sale", []):
                if (
                    s.get("cmt") == 1
                    and not s.get("is_personal")
                    and not s.get("is_wallet")
                    and s.get("scm") is not None
                    and s.get("scm") < price
                ):
                    sale = s["scm"]
                    break

            return {
                "regular": price,
                "sale": sale,
                "effective": sale if sale is not None else price,
            }

    return None


# ---------------------------------------------------------------------------
# Yochananof
# ---------------------------------------------------------------------------

YOCHANANOF_QUERY = """\
{
  products(search: "%s") {
    items {
      sku
      price_range {
        maximum_price {
          regular_price { value }
          final_price   { value }
        }
      }
    }
  }
}"""


def fetch_yochananof(barcode: str) -> dict | None:
    """
    Fetch Yochananof price via Magento 2 GraphQL.
    Returns {regular, sale, effective} or None if not found.
    """
    query = YOCHANANOF_QUERY % barcode
    payload = json.dumps({"query": query}).encode("utf-8")
    raw = _post(
        YOCHANANOF_GRAPHQL,
        payload,
        headers={
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Origin": "https://www.yochananof.co.il",
        },
    )
    data = json.loads(raw.decode("utf-8"))

    items = data.get("data", {}).get("products", {}).get("items", [])
    # Magento text search may return partial matches — verify SKU
    for item in items:
        if str(item.get("sku")) == str(barcode):
            mp = item.get("price_range", {}).get("maximum_price", {})
            regular = mp.get("regular_price", {}).get("value")
            final = mp.get("final_price", {}).get("value")

            if regular is None:
                continue

            sale = final if (final is not None and final < regular) else None
            return {
                "regular": regular,
                "sale": sale,
                "effective": sale if sale is not None else regular,
            }

    return None


# ---------------------------------------------------------------------------
# חצי חינם (from CHP price data)
# ---------------------------------------------------------------------------

def build_hazi_hinam_index(chp_data: dict) -> dict[str, dict]:
    """Index חצי חינם prices from CHP data by barcode."""
    index: dict[str, dict] = {}
    for product in chp_data.get("products", []):
        barcode = str(product["barcode"])
        for entry in product.get("prices", []):
            if "חצי חינם" in entry.get("chain", ""):
                index[barcode] = {
                    "regular": entry["regular_price"],
                    "sale": entry["sale_price"],
                    "effective": entry["effective_price"],
                }
                break
    return index


def build_carrefour_index(all_products: list[dict]) -> dict[str, dict]:
    """Index Carrefour prices from products.json (Excel 'מחיר מוצע' column, 100% coverage)."""
    index: dict[str, dict] = {}
    for p in all_products:
        if p.get("isBasic"):
            continue
        price = p.get("price")
        if price is not None:
            barcode = str(p["barcode"])
            if barcode not in index:  # first variant per group is representative
                index[barcode] = {"regular": price, "sale": None, "effective": price}
    return index


# ---------------------------------------------------------------------------
# אושר עד (government FTP price transparency)
# ---------------------------------------------------------------------------

OSHER_AD_FTP_HOST = "url.retail.publishedprices.co.il"
OSHER_AD_FTP_USER = "osherad"


def _ftp_download(ftp: ftplib.FTP, filename: str) -> bytes:
    buf = io.BytesIO()
    ftp.retrbinary(f"RETR {filename}", buf.write)
    buf.seek(0)
    return buf.read()


def _parse_pricefull_xml(data: bytes) -> dict[str, float]:
    """Parse one PriceFull XML (may be gzip-compressed). Returns barcode→price dict."""
    if data[:2] == b"\x1f\x8b":
        data = gzip.decompress(data)
    root = ET.fromstring(data)
    prices: dict[str, float] = {}
    for item in root.iter("Item"):
        barcode = item.findtext("ItemCode")
        price_text = item.findtext("ItemPrice")
        if barcode and price_text:
            try:
                price = float(price_text)
                if price > 0:
                    prices[barcode.strip()] = price
            except ValueError:
                pass
    return prices


def build_osher_ad_index() -> dict[str, dict]:
    """
    Download all today's PriceFull files from Osher Ad's government FTP,
    average prices across branches, and return barcode→{regular,sale,effective}.
    Uses active FTP mode (passive fails on this server due to IPv6 PASV responses).
    """
    print("  Connecting to Osher Ad FTP...")
    ftp = ftplib.FTP(timeout=30)
    ftp.set_pasv(False)
    ftp.connect(OSHER_AD_FTP_HOST, 21)
    ftp.login(OSHER_AD_FTP_USER, "")

    all_files = ftp.nlst()
    price_files = sorted(
        [f for f in all_files if "pricef" in f.lower()],
        reverse=True,
    )

    if not price_files:
        print("  ⚠ No PriceFull files found on Osher Ad FTP")
        ftp.quit()
        return {}

    # Keep only the latest date's files (date in filename is YYYYMMDD after last dash before time)
    latest_date = re.search(r"-(\d{8})-\d{6}\.", price_files[0])
    if latest_date:
        date_str = latest_date.group(1)
        price_files = [f for f in price_files if f"-{date_str}-" in f]

    print(f"  Found {len(price_files)} branch files (date: {date_str if latest_date else '?'})")

    # Accumulate prices across all branches
    accumulated: dict[str, list[float]] = {}
    for i, fname in enumerate(price_files, 1):
        print(f"  [{i}/{len(price_files)}] {fname}")
        try:
            raw = _ftp_download(ftp, fname)
            branch_prices = _parse_pricefull_xml(raw)
            for barcode, price in branch_prices.items():
                accumulated.setdefault(barcode, []).append(price)
        except Exception as e:
            print(f"    ⚠ {e}")

    ftp.quit()

    # Average across branches
    index: dict[str, dict] = {}
    for barcode, price_list in accumulated.items():
        avg = round(sum(price_list) / len(price_list), 2)
        index[barcode] = {"regular": avg, "sale": None, "effective": avg}

    print(f"  אושר עד index built: {len(index)} unique barcodes")
    return index


# ---------------------------------------------------------------------------
# ויקטורי (laibcatalog.co.il REST API)
# ---------------------------------------------------------------------------

VICTORY_BASE = "https://laibcatalog.co.il"
VICTORY_CHAIN_ID = "7290696200003"


def build_victory_index() -> dict[str, dict]:
    """
    Download all today's PriceFull files from Victory via laibcatalog.co.il REST API,
    average prices across branches, and return barcode→{regular,sale,effective}.
    Only uses items with EAN-style barcodes (≥8 digits).
    """
    print("  Fetching ויקטורי file list from laibcatalog.co.il...")

    def _get_json(url: str) -> list:
        raw = _get(url, headers={"Accept": "application/json"})
        return json.loads(raw.decode("utf-8"))

    files = _get_json(f"{VICTORY_BASE}/webapi/api/getfiles?edi={VICTORY_CHAIN_ID}")
    price_files = [f for f in files if "pricefull" in f.get("fileType", "").lower()]

    if not price_files:
        print("  ⚠ No PriceFull files found for ויקטורי")
        return {}

    # Keep only the latest date's files
    latest_date = re.search(r"-(\d{8})-\d{6}\.", price_files[0]["fileName"])
    if latest_date:
        date_str = latest_date.group(1)
        price_files = [f for f in price_files if f"-{date_str}-" in f["fileName"]]

    print(f"  Found {len(price_files)} branch files")

    accumulated: dict[str, list[float]] = {}
    for i, entry in enumerate(price_files, 1):
        fname = entry["fileName"]
        print(f"  [{i}/{len(price_files)}] {fname}")
        try:
            url = f"{VICTORY_BASE}/webapi/{VICTORY_CHAIN_ID}/{fname}"
            raw = _get(url)
            data = gzip.decompress(raw) if raw[:2] == b"\x1f\x8b" else raw
            root = ET.fromstring(data)
            for item in root.iter("Item"):
                code = (item.findtext("ItemCode") or "").strip()
                price_text = item.findtext("ItemPrice")
                if len(code) >= 8 and price_text:
                    try:
                        p = float(price_text)
                        if p > 0:
                            accumulated.setdefault(code, []).append(p)
                    except ValueError:
                        pass
        except Exception as e:
            print(f"    ⚠ {e}")

    index: dict[str, dict] = {}
    for barcode, price_list in accumulated.items():
        avg = round(sum(price_list) / len(price_list), 2)
        index[barcode] = {"regular": avg, "sale": None, "effective": avg}

    print(f"  ויקטורי index built: {len(index)} unique barcodes")
    return index


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def select_group_representatives(products: list[dict]) -> list[dict]:
    """Return one representative product per groupId (first non-basic product)."""
    seen: dict[int, dict] = {}
    for p in products:
        if p["isBasic"]:
            continue
        gid = p["groupId"]
        if gid not in seen:
            seen[gid] = p
    return list(seen.values())


def fmt_price(p: dict | None) -> str:
    if p is None:
        return "—"
    eff = p["effective"]
    reg = p["regular"]
    if p["sale"] is not None:
        return f"{eff:.2f}↓({reg:.2f})"
    return f"{eff:.2f}"


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    print(f"Loading products from {PRODUCTS_JSON}")
    with open(PRODUCTS_JSON, encoding="utf-8") as f:
        all_products = json.load(f)

    print(f"Loading CHP data from {PRICES_JSON}")
    with open(PRICES_JSON, encoding="utf-8") as f:
        chp_data = json.load(f)

    representatives = select_group_representatives(all_products)
    hazi_hinam_idx = build_hazi_hinam_index(chp_data)
    carrefour_idx = build_carrefour_index(all_products)

    print("\nFetching אושר עד prices from government FTP...")
    try:
        osher_ad_idx = build_osher_ad_index()
    except Exception as e:
        print(f"⚠ אושר עד FTP failed: {e}")
        osher_ad_idx = {}

    print("\nFetching ויקטורי prices from laibcatalog.co.il...")
    try:
        victory_idx = build_victory_index()
    except Exception as e:
        print(f"⚠ ויקטורי API failed: {e}")
        victory_idx = {}

    total = len(representatives)
    print(f"\n{total} product groups to fetch")
    print(f"קרפור Excel coverage: {len(carrefour_idx)}/{total}")
    print(f"אושר עד FTP coverage: {len(osher_ad_idx)} barcodes available")
    print(f"ויקטורי API coverage: {len(victory_idx)} barcodes available")
    print(f"חצי חינם CHP coverage: {len(hazi_hinam_idx)}/{total}\n")

    results: list[dict] = []
    errors: list[dict] = []

    for i, product in enumerate(representatives, 1):
        barcode = product["barcode"]
        name = product["name"]
        print(f"[{i:3d}/{total}] {barcode}  {name[:45]}")

        prices: dict[str, dict | None] = {}
        product_errors: list[str] = []

        # --- Shufersal ---
        try:
            prices["שופרסל"] = fetch_shufersal(barcode, name)
        except Exception as e:
            prices["שופרסל"] = None
            product_errors.append(f"שופרסל: {e}")
        time.sleep(random.uniform(*DELAY_BETWEEN_CHAINS))

        # --- Rami Levy ---
        try:
            prices["רמי לוי"] = fetch_rami_levy(barcode)
        except Exception as e:
            prices["רמי לוי"] = None
            product_errors.append(f"רמי לוי: {e}")
        time.sleep(random.uniform(*DELAY_BETWEEN_CHAINS))

        # --- Yochananof ---
        try:
            prices["יוחננוף"] = fetch_yochananof(barcode)
        except Exception as e:
            prices["יוחננוף"] = None
            product_errors.append(f"יוחננוף: {e}")
        time.sleep(random.uniform(*DELAY_BETWEEN_CHAINS))

        # --- קרפור (Excel prices, no HTTP call needed) ---
        prices["קרפור"] = carrefour_idx.get(barcode)

        # --- אושר עד (government FTP, pre-built index) ---
        prices["אושר עד"] = osher_ad_idx.get(barcode)

        # --- ויקטורי (laibcatalog API, pre-built index) ---
        prices["ויקטורי"] = victory_idx.get(barcode)

        # --- חצי חינם (CHP, no HTTP call needed) ---
        prices["חצי חינם"] = hazi_hinam_idx.get(barcode)

        print(
            f"       קרפור: {fmt_price(prices['קרפור']):12s}"
            f"  שופרסל: {fmt_price(prices['שופרסל']):12s}"
            f"  רמי לוי: {fmt_price(prices['רמי לוי']):12s}"
            f"  יוחננוף: {fmt_price(prices['יוחננוף']):12s}"
            f"  אושר עד: {fmt_price(prices['אושר עד']):12s}"
            f"  ויקטורי: {fmt_price(prices['ויקטורי']):12s}"
            f"  חצי חינם: {fmt_price(prices['חצי חינם'])}"
        )

        if product_errors:
            for err in product_errors:
                print(f"       ⚠ {err}")
            errors.append({"barcode": barcode, "name": name, "errors": product_errors})

        results.append({
            "groupId": product["groupId"],
            "barcode": barcode,
            "name": name,
            "prices": prices,
        })

        if i < total:
            time.sleep(random.uniform(*DELAY_BETWEEN_PRODUCTS))

    # Build coverage summary
    coverage = {chain: sum(1 for r in results if r["prices"].get(chain)) for chain in CHAINS}

    output = {
        "fetched_at": datetime.now(timezone.utc).isoformat(),
        "chains": CHAINS,
        "product_count": len(results),
        "error_count": len(errors),
        "coverage": coverage,
        "products": results,
        "errors": errors,
    }

    print(f"\nSaving to {OUTPUT_JSON}")
    OUTPUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print("\n=== Coverage ===")
    for chain, count in coverage.items():
        pct = count / len(results) * 100
        bar = "█" * (count * 20 // len(results))
        print(f"  {chain:12s}  {count:3d}/{len(results)}  {pct:5.1f}%  {bar}")

    print(f"\nDone! Saved to {OUTPUT_JSON}")
    if errors:
        print(f"\n{len(errors)} products had fetch errors:")
        for e in errors:
            print(f"  {e['barcode']} {e['name']}: {'; '.join(e['errors'])}")


if __name__ == "__main__":
    main()
