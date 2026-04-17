# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Layout

```
israel basket/               ← repo root
├── sal-products.xlsx        ← source of truth: 107 branded + 9 basic products
├── sal-snifim.xlsx          ← source of truth: 50 Carrefour branches
├── scripts/
│   ├── convert_excel.py     ← ETL: Excel → products.json + branches.json
│   ├── fetch_prices.py      ← fetch all chains from chp.co.il → prices.json
│   ├── fetch_chain_prices.py ← fetch 5 target chains directly → chain_prices.json
│   └── geocode_branches.py  ← one-time: add lat/lng to branches.json via Nominatim
└── israel-basket/           ← Vite + React PWA
    ├── src/
    │   ├── data/            ← static JSON imported by components (do not hand-edit)
    │   ├── pages/           ← one file per route
    │   ├── components/      ← shared UI components
    │   ├── store/           ← Zustand basket store
    │   ├── utils/           ← pure utility functions (e.g. geo.ts Haversine)
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
/עברית           # enforce Hebrew-only responses for this session
```

Custom slash commands live in `.claude/commands/`. Type the command in Claude Code to execute.

## Architecture

**Data flow:** Excel → Python scripts → static JSON files → imported directly into React components at build time. There is no backend, no API server, no database.

**`src/types.ts` — key shapes:**
- `Product`: `id` (sequential, unique across all 116 rows), `groupId` (groups size/variant siblings), `barcode`, `department` (category string, used for filter chips), `price` (government reference price), `isBasic` (true for the 9 cheaper alternatives, these have `id ≥ 1001`).
- `Branch`: `format` ("מרקט" | "היפר" | "מהדרין"), `name`, `address`, `city`, `wazeUrl`, `mapsUrl`, `lat?`, `lng?`. Coordinates populated by `geocode_branches.py` — absent on branches that failed geocoding.
- `ChainPrice`: `{ regular, sale, effective }` — `effective` is `sale ?? regular`.
- `ChainProductPrices`: keyed by `groupId`, has a `prices` map for 5 chains (קרפור, שופרסל, רמי לוי, יוחננוף, חצי חינם).

**Routing** (React Router v6, `src/App.tsx`):
| Path | Page | Purpose |
|------|------|---------|
| `/` | `HomePage` | Landing |
| `/products` | `ProductsPage` | Browse + add to basket |
| `/basket` | `BasketPage` | Review basket + single cheapest chain comparison |
| `/compare` | `ComparePage` | Full price comparison table (קרפור, שופרסל, רמי לוי, יוחננוף) |
| `/branches` | `BranchesPage` | 50 Carrefour locations |

**Layout:** `App.tsx` is split into `AppInner` (uses `useLocation`) + `App` (provides `BrowserRouter`) so that `useLocation` is available inside the router context. `AppInner` renders `Header` + `BottomNav` + `BasketBar` + page-level bots. Dynamic bottom padding (`pb-16` / `pb-32`) based on whether BasketBar is visible.

**Bot pattern — critical:** Page-specific bots use `position: fixed` for their bottom-sheet drawer. The trigger button lives **inside `Header`** (not in the bot component) to avoid z-index conflicts with `position: sticky` creating a stacking context. `AppInner` in `App.tsx` manages `botOpen` state and passes `onBotOpen={() => setBotOpen(true)}` to `<Header>` and `externalOpen={botOpen} / onExternalClose` to `<BasketPageBot>`. `BasketPageBot` is rendered in `AppInner` for all inner routes (`/basket`, `/products`, `/compare`, `/branches`). `FirstTimeBot` is the exception — it lives inside `HomePage` and manages its own two-phase FAB (large pulsing → small amber pill after first interaction).

**BasketPage comparison logic:** Finds the cheapest *single chain* for the full basket. First pass: chains with 100% product coverage, pick lowest total. Second pass (fallback): if no chain covers all items, show the best-coverage chain with a gray "partial" indicator and no savings row.

**State:** Zustand store (`src/store/basketStore.ts`) holds `Map<id, Product>`. `total` and `count` are eagerly recomputed on every `toggle`. No persistence — basket is lost on page close or refresh. Users are prompted to download or share the summary before leaving the basket page.

**Styling:** Tailwind CSS v4 via `@tailwindcss/vite` (no `tailwind.config.js`). RTL enforced globally via `direction: rtl` in `src/index.css` and `dir="rtl"` in `index.html`.

**PWA:** `vite-plugin-pwa` with `autoUpdate`. Service worker only active on `npm run build` output, not in dev.

**Dark mode:** The entire UI uses a dark theme. Do not revert to light mode — this was an intentional design decision.

**Geolocation (BranchesPage):** `src/utils/geo.ts` implements Haversine distance. `BranchesPage` requests the user's location via the browser API and sorts branches by proximity. Branches without `lat`/`lng` (failed geocoding) are pushed to the bottom.

**RTL-specific UI patterns:** The app is globally RTL (`direction: rtl`). For horizontally-scrollable containers, hidden content is to the *left*. Sticky table columns use `sticky right-0` (not `left-0`). Scroll-hint gradient overlays go on the **left** edge: `absolute inset-y-0 left-0 bg-gradient-to-r from-gray-950 to-transparent`.

**חצי חינם excluded from ComparePage:** Coverage is only 31% — too low to be useful. This chain is intentionally excluded from the UI and should not be re-added.

**Bot components** (`src/components/FirstTimeBot.tsx`, `src/components/BasketPageBot.tsx`): Scripted FAQ chatbots, no AI/API. Q&A is a hardcoded array; each bot renders only a bottom-sheet drawer (no internal trigger button). `BasketPageBot` accepts `externalOpen: boolean` + `onExternalClose: () => void` props — the trigger is the amber pill button rendered inside `Header`. `FirstTimeBot` (homepage only) renders its own two-phase trigger: large pulsing FAB on first visit → small amber pill pinned to the header (left side, `fixed top-3 left-4`) on return visits. Return-visit detection uses `localStorage` key `home-visited` (set on first mount). Both use `from-amber-500 to-orange-500` gradient to distinguish from the blue header.

**BasketPage share features:** `buildSummaryText()` generates a plain-text basket summary (includes `israelbasket.app` as a link). Two share actions: `handleDownload()` → `.txt` file via Blob URL; `handleWhatsApp()` → WhatsApp with the full shopping list.

**HomePage stats:** The proof strip uses `IntersectionObserver` + `requestAnimationFrame` (ease-out cubic) to count up numbers when the section scrolls into view. Stat cards are tappable and navigate to `/products` or `/branches`.

**Icons:** `lucide-react` is installed. Use SVG icons from this library for UI elements where crispness matters at small sizes (e.g. `Tag`, `CalendarDays`, `MapPin`). Emoji remain fine for decorative/content use.

## Data Files

| File | Generator | Notes |
|------|-----------|-------|
| `products.json` | `convert_excel.py` | 116 entries: 107 branded + 9 basic |
| `branches.json` | `convert_excel.py` | 50 Carrefour branches |
| `prices.json` | `fetch_prices.py` | All chains via chp.co.il, coverage varies |
| `chain_prices.json` | `fetch_chain_prices.py` | 5 chains: קרפור 100% (from Excel `price` field), שופרסל 98%, רמי לוי 97%, יוחננוף 95%, חצי חינם 31%. UI displays 4 chains (קרפור first) — חצי חינם excluded due to low coverage. |

**`groupId` is the join key** between `products.json` and `chain_prices.json`. The 4-chain data has one entry per `groupId` (representative barcode only), while `products.json` has multiple rows per group for size variants.

## Price Scraping APIs

The 4 chains in `fetch_chain_prices.py` are fetched via reverse-engineered APIs:

- **שופרסל**: `GET shufersal.co.il/online/he/p/P_{barcode}/json` → 200 = found, 404 = not stocked. Price extracted from `data-gtm` HTML attribute (HTML-encoded JSON). Fallback on 404: search by product name via `/online/he/search/results?q={name}` → get internal `code` → fetch product page by code.
- **רמי לוי**: `GET rami-levy.co.il/api/search?q={barcode}` → JSON. Verify `item.barcode === barcode` (fuzzy search). Sale: use `sale[].scm` only when `cmt == 1` (single-item deal).
- **יוחננוף**: `POST api.yochananof.co.il/graphql` (Magento 2 GraphQL, no auth required). SKU = barcode. Verify `item.sku === barcode` before using price.
- **קרפור**: No API needed — prices sourced from `products.json` (`price` field = Excel "מחיר מוצע"), 100% coverage. Built by `build_carrefour_index()`.
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
