# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Layout

```
israel basket/               ← repo root
├── sal-products.xlsx        ← source of truth: 100 branded + 9 basic products
├── sal-snifim.xlsx          ← source of truth: 50 Carrefour branches
├── scripts/
│   ├── convert_excel.py     ← ETL: Excel → products.json + branches.json
│   ├── fetch_prices.py      ← fetch all chains from chp.co.il → prices.json
│   └── fetch_chain_prices.py ← fetch 4 target chains directly → chain_prices.json
└── israel-basket/           ← Vite + React PWA
    ├── src/
    │   ├── data/            ← static JSON imported by components (do not hand-edit)
    │   ├── pages/           ← one file per route
    │   ├── components/      ← shared UI components
    │   ├── store/           ← Zustand basket store
    │   └── types.ts         ← all shared TypeScript interfaces
    └── vite.config.ts
```

## Commands

All scripts run from **repo root**, not from `israel-basket/`:

```bash
# Web app
cd israel-basket && npm run dev       # dev server → http://localhost:5173
cd israel-basket && npm run build     # tsc + vite → dist/
cd israel-basket && npm run preview   # serve dist/

# Data pipeline — run from repo root
python3 scripts/convert_excel.py      # Excel → products.json + branches.json
python3 scripts/fetch_prices.py       # CHP scrape → prices.json (~5 min, 100 products)
python3 -u scripts/fetch_chain_prices.py  # 4-chain scrape → chain_prices.json (~7 min)
python3 scripts/geocode_branches.py   # add lat/lng to branches.json (one-time; re-run after convert_excel.py)
```

No test suite or linter is configured.

## Slash Commands

```
/update-prices   # re-fetch all chain prices (CHP + 4 direct APIs, ~12 min total)
```

Custom slash commands live in `.claude/commands/`. Type the command in Claude Code to execute.

## Architecture

**Data flow:** Excel → Python scripts → static JSON files → imported directly into React components at build time. There is no backend, no API server, no database.

**`src/types.ts` — key shapes:**
- `Product`: `id` (sequential, unique across all 116 rows), `groupId` (groups size/variant siblings), `barcode`, `price` (government reference price), `isBasic` (true for the 9 cheaper alternatives, these have `id ≥ 1001`).
- `ChainPrice`: `{ regular, sale, effective }` — `effective` is `sale ?? regular`.
- `ChainProductPrices`: keyed by `groupId`, has a `prices` map for the 4 chains.

**Routing** (React Router v6, `src/App.tsx`):
| Path | Page | Purpose |
|------|------|---------|
| `/` | `HomePage` | Landing |
| `/products` | `ProductsPage` | Browse + add to basket |
| `/basket` | `BasketPage` | Review basket + single cheapest chain comparison |
| `/compare` | `ComparePage` | Full price comparison table (שופרסל, רמי לוי, יוחננוף) |
| `/branches` | `BranchesPage` | 50 Carrefour locations |

**Layout:** `App.tsx` renders `Header` (logo only) + `BottomNav` (fixed bottom tab bar, 4 tabs) + `BasketBar` (floating strip above BottomNav, shown globally except on `/basket`, only when basket has items). The app wrapper applies dynamic bottom padding (`pb-16` / `pb-32`) based on whether BasketBar is visible.

**BasketPage comparison logic:** Finds the cheapest *single chain* for the full basket. First pass: chains with 100% product coverage, pick lowest total. Second pass (fallback): if no chain covers all items, show the best-coverage chain with a gray "partial" indicator and no savings row.

**State:** Zustand store (`src/store/basketStore.ts`) holds `Map<id, Product>`. `total` and `count` are eagerly recomputed on every `toggle`. The store does NOT persist to localStorage.

**Styling:** Tailwind CSS v4 via `@tailwindcss/vite` (no `tailwind.config.js`). RTL enforced globally via `direction: rtl` in `src/index.css` and `dir="rtl"` in `index.html`.

**PWA:** `vite-plugin-pwa` with `autoUpdate`. Service worker only active on `npm run build` output, not in dev.

## Data Files

| File | Generator | Notes |
|------|-----------|-------|
| `products.json` | `convert_excel.py` | 116 entries: 107 branded + 9 basic |
| `branches.json` | `convert_excel.py` | 50 Carrefour branches |
| `prices.json` | `fetch_prices.py` | All chains via chp.co.il, coverage varies |
| `chain_prices.json` | `fetch_chain_prices.py` | 4 chains scraped: שופרסל 98%, רמי לוי 97%, יוחננוף 95%, חצי חינם 34%. UI only displays the first 3 — חצי חינם excluded due to low coverage. |

**`groupId` is the join key** between `products.json` and `chain_prices.json`. The 4-chain data has one entry per `groupId` (representative barcode only), while `products.json` has multiple rows per group for size variants.

## Price Scraping APIs

The 4 chains in `fetch_chain_prices.py` are fetched via reverse-engineered APIs:

- **שופרסל**: `GET shufersal.co.il/online/he/p/P_{barcode}/json` → 200 = found, 404 = not stocked. Price extracted from `data-gtm` HTML attribute (HTML-encoded JSON). Fallback on 404: search by product name via `/online/he/search/results?q={name}` → get internal `code` → fetch product page by code.
- **רמי לוי**: `GET rami-levy.co.il/api/search?q={barcode}` → JSON. Verify `item.barcode === barcode` (fuzzy search). Sale: use `sale[].scm` only when `cmt == 1` (single-item deal).
- **יוחננוף**: `POST api.yochananof.co.il/graphql` (Magento 2 GraphQL, no auth required). SKU = barcode. Verify `item.sku === barcode` before using price.
- **חצי חינם**: No unauthenticated API — prices sourced from `prices.json` (CHP data), chain name `"חצי חינם אונליין"`.

## Excel Structure (for `convert_excel.py`)

**sal-products.xlsx:** Row 2 = headers, rows 3–109 = branded, rows 114–122 = basic. Column A (`מס'`) starts a new `groupId`; blank = variant of previous group. Column I (`מחיר מוצע`) may be sparse — script propagates price downward within each group.

**sal-snifim.xlsx:** Sheet `סיכום`, data from row 4. City extracted from branch name via `KNOWN_CITIES` + `CITY_ALIASES` in the script — update these if new cities are added.

## Deployment & CI

**Live site:** https://israelbasket.app (custom domain, served via GitHub Pages)

**Two GitHub Actions workflows** (`.github/workflows/`):

| Workflow | Trigger | What it does |
|----------|---------|--------------|
| `deploy.yml` | push to `main` | `npm ci` → `npm run build` → deploy `dist/` to `gh-pages` branch |
| `update-prices.yml` | daily 02:00 UTC (04:00–05:00 IL) + manual dispatch | runs `fetch_chain_prices.py` → commits updated `chain_prices.json` if changed |

`chain_prices.json` lives in `israel-basket/src/data/` — it's a git-tracked build input, not generated at build time. The daily workflow keeps it fresh automatically; `/update-prices` is only needed for manual on-demand refreshes.

Python scripts require `pip install requests` (no other dependencies).
