# UX/UI Design System — הסל של ישראל

> Living reference for all visual and interaction design decisions in the app.
> Stack: React 18 · React Router v6 · Tailwind CSS v4 · Zustand · Vite PWA

---

## Table of Contents

1. [Design Philosophy](#1-design-philosophy)
2. [Color Palette](#2-color-palette)
3. [Typography](#3-typography)
4. [Spacing & Layout](#4-spacing--layout)
5. [Component Library](#5-component-library)
6. [Page Layouts](#6-page-layouts)
7. [Navigation System](#7-navigation-system)
8. [Interaction Patterns](#8-interaction-patterns)
9. [RTL Conventions](#9-rtl-conventions)
10. [Dark Mode Implementation](#10-dark-mode-implementation)
11. [State & Feedback](#11-state--feedback)
12. [Data Display Patterns](#12-data-display-patterns)

---

## 1. Design Philosophy

The app is a **civic utility** — it helps Israeli consumers understand and use a government-mandated discount basket. Design decisions follow three priorities:

1. **Clarity over decoration** — prices and comparisons must be instantly readable.
2. **Speed** — no loading spinners on core data (all JSON is bundled at build time).
3. **Mobile-first, thumb-friendly** — the entire experience is designed for one-handed use on a phone, with all primary actions reachable from the bottom of the screen.

The tone is trustworthy and informational, not salesy.

---

## 2. Color Palette

All colors use Tailwind CSS v4 utility classes. No custom `tailwind.config.js` — class names map directly to the Tailwind default scale.

### Background Hierarchy (dark mode)

| Role | Class | Hex | Usage |
|------|-------|-----|-------|
| App shell | `bg-gray-950` | `#030712` | Root wrapper, page base |
| Section / panel | `bg-gray-900` | `#0f172a` | Feature panels, totals containers |
| Card surface | `bg-gray-800` | `#1e293b` | Product cards, branch cards, list rows |
| Input surface | `bg-gray-800` | `#1e293b` | Search inputs, selects |
| Elevated card | `bg-gray-700` | `#334155` | Partial-coverage indicator |

### Border Colors

| Role | Class | Usage |
|------|-------|-------|
| Default card border | `border-gray-700` | All cards and containers |
| Input border | `border-gray-600` | Search fields, selects |
| Divider | `border-gray-700` / `border-gray-800` | Table rows, section dividers |

### Text Colors

| Role | Class | Usage |
|------|-------|-------|
| Primary text | `text-gray-100` | Headings, product names, prices |
| Secondary text | `text-gray-300` | Subheadings, body copy |
| Muted / meta | `text-gray-400` | Brand names, timestamps, labels |
| Placeholder / hint | `text-gray-500` | Filter counts, disclaimers, empty states |
| Disabled / faint | `text-gray-600` | Strikethrough prices, department labels in table |

### Accent Colors

| Role | Class | Usage |
|------|-------|-------|
| Primary brand | `bg-blue-700` / `text-blue-400` | CTA buttons, active tab, selected borders |
| Price / value | `text-blue-400` | Carrefour prices across the app |
| Savings / positive | `text-green-400` / `bg-green-700` | Cheapest chain row, savings amount |
| Warning / notice | `text-blue-300` / `bg-blue-900/20` | Limit notices (border `border-blue-700`) |
| Disclaimer | `text-gray-400` / `bg-gray-900` | Fine-print disclosure boxes |
| Partial coverage | `bg-gray-700` | Basket summary when chain coverage incomplete |
| Savings highlight | `bg-amber-900/30` | Saving row in basket summary (border `border-amber-700`) |
| Min-price highlight | `bg-green-900/20` | Table cell when a chain has the lowest price |

### Hero Gradient

```
bg-gradient-to-bl from-blue-900 to-blue-700
```

Used exclusively on the `HomePage` hero card.

### Chain Identity Colors

Used for coverage pills (ComparePage) and totals cards:

| Chain | Background | Border | Header |
|-------|-----------|--------|--------|
| שופרסל | `bg-orange-900/20` | `border-orange-700` | `bg-orange-600 text-white` |
| רמי לוי | `bg-blue-900/20` | `border-blue-700` | `bg-blue-700 text-white` |
| יוחננוף | `bg-green-900/20` | `border-green-700` | `bg-green-700 text-white` |

Chain badge pills (BasketPage per-product cheapest):

| Chain | Class |
|-------|-------|
| שופרסל | `bg-orange-900/50 text-orange-300` |
| רמי לוי | `bg-blue-900/50 text-blue-300` |
| יוחננוף | `bg-green-900/50 text-green-300` |
| חצי חינם | `bg-purple-900/50 text-purple-300` |

Branch format badges (BranchCard):

| Format | Class |
|--------|-------|
| מרקט | `bg-blue-900/40 text-blue-300` |
| היפר | `bg-purple-900/40 text-purple-300` |
| מהדרין | `bg-green-900/40 text-green-300` |

Left-border accent (feature cards, HomePage):

| Topic | Class |
|-------|-------|
| What is the basket | `border-r-blue-500` |
| Price comparison | `border-r-purple-500` |
| About the app | `border-r-green-500` |
| Limitations | `border-r-amber-500` |

---

## 3. Typography

No custom fonts. The stack relies on the OS system font for maximum performance and native feel.

```css
font-family: system-ui, -apple-system, Arial, sans-serif;
```

### Type Scale

| Role | Classes | Where Used |
|------|---------|-----------|
| Page title | `text-2xl font-extrabold` | All page `<h1>` elements |
| Hero stat | `text-6xl sm:text-8xl font-black` | "30%+" on HomePage |
| Hero headline | `text-2xl font-bold` | "🛒 הסל של ישראל" |
| Section label | `text-xs font-semibold tracking-widest uppercase` | "מה תקבל" in HomePage |
| Card title | `text-sm font-bold` | Feature card titles |
| Product name | `font-semibold text-sm` | ProductCard, BasketPage rows |
| Price (large) | `text-3xl font-extrabold` | Summary card totals |
| Price (medium) | `text-lg font-bold` | ProductCard price |
| Price (small) | `font-bold text-sm` | BasketPage row prices |
| Body copy | `text-sm leading-relaxed` | Feature card body, notices |
| Meta / label | `text-xs` | Brand, category, timestamps |
| Fine print | `text-xs text-gray-500` / `text-gray-600` | Disclaimers, counts |

Font rendering is smoothed globally:
```css
-webkit-font-smoothing: antialiased;
```

---

## 4. Spacing & Layout

### Max-Width Containers

| Page | Max Width | Class |
|------|-----------|-------|
| Most pages | 768px | `max-w-3xl mx-auto px-4` |
| ComparePage | 1024px | `max-w-5xl mx-auto px-4` |

### Vertical Rhythm

Pages use `py-6` or `py-8` as the top/bottom padding. Within a page:

- Section gap: `mb-5` / `mb-6` / `mb-8`
- Component gap: `mb-3` / `mb-4`
- Within-card gap: `gap-2` / `gap-3`

### Grid Systems

| Context | Class | Notes |
|---------|-------|-------|
| ProductCard grid | `grid grid-cols-1 sm:grid-cols-2 gap-3` | Stacks on mobile |
| Feature cards (HomePage) | `grid grid-cols-1 sm:grid-cols-2 gap-4` | Stacks on mobile |
| Stats strip | `flex justify-around` | Always horizontal |
| CTA buttons (HomePage) | `grid grid-cols-1 sm:grid-cols-2 gap-3` | Stacks on mobile |
| Compare totals | `grid grid-cols-3 gap-3` | Always 3-col |
| Chain header | `flex items-center justify-between` | Standard row pattern |

### Bottom Padding (Dynamic)

The root wrapper applies dynamic padding to avoid content hiding behind fixed bars:

```tsx
className={`min-h-screen bg-gray-950 ${count > 0 ? 'pb-32' : 'pb-16'}`}
```

- `pb-16` (64px) = clears BottomNav alone
- `pb-32` (128px) = clears BottomNav + BasketBar when basket has items

---

## 5. Component Library

### Header

**File:** `src/components/Header.tsx`

Sticky top bar. Contains only the app logo/wordmark.

```
bg-blue-700 text-white
height: h-14 (56px)
position: sticky top-0 z-50
```

The logo is a NavLink to `/` — tapping it from any page goes home.

---

### BottomNav

**File:** `src/components/BottomNav.tsx`

Fixed bottom tab bar. Always visible. Four tabs:

| Tab | Icon | Route |
|-----|------|-------|
| מוצרים | 📦 | `/products` |
| הסל שלי | 🛒 | `/basket` |
| השוואה | 📊 | `/compare` |
| סניפים | 🏪 | `/branches` |

```
bg-gray-900 border-t border-gray-700
height: min-h-[60px]
position: fixed bottom-0 inset-x-0 z-50
```

Active tab: `text-blue-400` · Inactive: `text-gray-500`

**Basket badge:** Red dot (`bg-red-500`) on the basket tab, shown only when `count > 0`. Displays count (capped at `9+`).

---

### BasketBar

**File:** `src/components/BasketBar.tsx`

Floating strip that appears above BottomNav when the basket has items, on all pages except `/basket`.

```
bg-blue-700 text-white
position: fixed bottom-[60px] inset-x-0 z-40
```

Shows: total price (large, bold) + item count + "לסל שלי ←" button.

The button: `bg-white text-blue-700 font-bold px-5 py-2 rounded-full text-sm`

---

### ProductCard

**File:** `src/components/ProductCard.tsx`

Toggleable card. Entire card is a `<button>`. Two visual states:

**Default:**
```
bg-gray-800 border-2 border-gray-700
hover: border-blue-500 shadow-sm
```

**Selected:**
```
bg-blue-950/50 border-2 border-blue-500 shadow-md
```

Card anatomy (top to bottom):
1. Badge row: "מוצר יסוד" pill (`bg-green-900/50 text-green-400`) + category text
2. Product name (`text-gray-100 font-semibold text-sm`)
3. Brand (`text-gray-400 text-xs`)
4. Price (`text-blue-400 text-lg font-bold`) + circular checkbox

Checkbox states:
- Unchecked: `border-gray-600` (empty circle)
- Checked: `bg-blue-500 border-blue-500 text-white` (filled with SVG checkmark)

---

### BranchCard

**File:** `src/components/BranchCard.tsx`

Static display card. Not interactive beyond navigation links.

```
bg-gray-800 border border-gray-700 rounded-xl p-4 shadow-sm
```

Anatomy:
1. Format badge pill (color by format — see §2 Chain Identity)
2. Branch name (`text-gray-100 font-semibold`)
3. Address (`text-gray-400 text-sm`)
4. Two action buttons (Waze / Maps) stacked vertically on the left side

Action buttons:
- Waze: `bg-sky-600 hover:bg-sky-700`
- Maps: `bg-gray-600 hover:bg-gray-500`

---

## 6. Page Layouts

### HomePage (`/`)

Structure (top → bottom):

1. **Hero card** — full-width rounded gradient card with stat, title, subtitle, date
2. **CTA buttons** — 2-column grid (primary + secondary)
3. **Proof strip** — 3-stat horizontal strip, separated by `border-y border-gray-700`
4. **Feature cards** — 2-column grid of 4 info cards inside a `bg-gray-900` section
5. **Disclaimers** — 2 lines of muted fine print, centered

The hero is the only element that uses a gradient background. Everything else is flat/card-based.

---

### ProductsPage (`/products`)

Structure:

1. Page title (`h1`)
2. Search input (full-width, with 🔍 icon)
3. Filter row: "מוצרי יסוד" toggle pill
4. Department horizontal chip strip (scrollable, `scrollbar-hide`)
5. Results count
6. Product grid (`grid-cols-1 sm:grid-cols-2`)

Filter chip behavior:
- Inactive: `bg-gray-800 text-gray-300 border-gray-600`
- Active (department): `bg-blue-700 text-white border-blue-700`
- Active (basic toggle): `bg-green-600 text-white border-green-600`

Empty state: centered emoji + message.

---

### BasketPage (`/basket`)

**Empty state:** centered illustration + CTA button to `/products`.

**Filled state structure:**

1. Title row with "נקה הכל" red text button
2. **Summary card** — stacked 3-panel card:
   - Top panel (blue): Carrefour official price
   - Middle panel (green/gray): cheapest competitor chain
   - Bottom strip (amber): savings vs competitor (only when full coverage + savings > 0)
3. **Product list** — per-product rows in `bg-gray-800` cards, each showing:
   - Name + brand
   - Official price + remove button
   - Competitor comparison row (below divider)
4. "הוסף עוד מוצרים" outline button
5. Limit notice (blue tint)
6. Disclaimer notice (dark gray)

Summary card behavior:
- Full coverage + cheaper competitor → green middle row + amber savings strip
- Partial coverage → gray middle row, no savings strip, coverage fraction shown

---

### ComparePage (`/compare`)

Structure:

1. Title + last-updated timestamp
2. Coverage pills (3 chains with count/total)
3. Search input
4. Filter row: "חסר מחיר" toggle + sort dropdown
5. Department chip strip (scrollable)
6. Results count
7. Price comparison table (scrollable horizontally)
8. Totals summary (3-column card grid)

**Table design:**
- Header row: `bg-gray-800`, chain columns use full color headers
- Data rows: alternating `bg-gray-900` / `bg-gray-900/50`
- Hover: all rows → `hover:bg-gray-800`
- Min-price cell: `bg-green-900/20`
- Min-price text: `text-green-400` with a ★ prefix
- No-price cell: `text-gray-600` dash
- Table border: `border-gray-700`, row dividers: `border-gray-800`

---

### BranchesPage (`/branches`)

Structure:

1. Title with count
2. Search input
3. Format filter pills (הכל / מרקט / היפר / מהדרין)
4. City dropdown select
5. Results count
6. Branch card list

---

## 7. Navigation System

### Routing (React Router v6)

| Path | Page |
|------|------|
| `/` | HomePage |
| `/products` | ProductsPage |
| `/basket` | BasketPage |
| `/compare` | ComparePage |
| `/branches` | BranchesPage |
| `*` | Redirect → `/` |

### Layout Stack (z-index)

```
z-50  Header (sticky top)
z-50  BottomNav (fixed bottom)
z-40  BasketBar (fixed, just above BottomNav)
z-0   Page content
```

### Active State

React Router's `NavLink` with `isActive` prop drives active styling on BottomNav. No other nav elements use active state.

---

## 8. Interaction Patterns

### Button Variants

| Variant | Classes | Usage |
|---------|---------|-------|
| Primary | `bg-blue-700 text-white font-bold rounded-xl hover:bg-blue-600` | Main CTAs |
| Secondary / Ghost | `bg-gray-800 text-blue-400 border-2 border-blue-600 rounded-xl hover:bg-gray-700` | Secondary actions |
| Outline | `border-2 border-blue-600 text-blue-400 rounded-2xl hover:bg-gray-800` | Add more items |
| Destructive text | `text-red-400 hover:text-red-300 font-medium` | "נקה הכל" |
| Pill / Filter (inactive) | `bg-gray-800 border-gray-600 text-gray-300 rounded-full` | All filter chips |
| Pill / Filter (active) | `bg-blue-700 text-white border-blue-700 rounded-full` | Active filter chips |
| Rounded full | `bg-white text-blue-700 font-bold rounded-full` | BasketBar CTA |

Scale animation on tap for primary/secondary CTAs: `active:scale-95 transition-all`

### Card Selection (ProductCard)

Single-tap toggles a product in/out of the basket. No long-press, no swipe. Visual feedback is immediate via border + background color change.

### Scrollable Filter Strip

Horizontal scroll with hidden scrollbar. Applied via `.scrollbar-hide` utility class:

```css
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
.scrollbar-hide::-webkit-scrollbar { display: none; }
```

Used in: ProductsPage department chips, ComparePage department chips.

### Remove from Basket

Per-product "×" button (`text-xl`, hitbox generous enough for touch). Color: `text-gray-600 hover:text-red-400`.

### Navigation from BasketBar

Tapping "לסל שלי ←" calls `navigate('/basket')`. The BasketBar disappears on `/basket` (`pathname === '/basket'` check).

---

## 9. RTL Conventions

The entire app is RTL. Enforced at two levels:

```html
<!-- index.html -->
<html lang="he" dir="rtl">
```

```css
/* index.css */
html { direction: rtl; }
```

**RTL-specific decisions:**

- Padding on inputs: `pr-10 pl-4` (icon on right, text from right)
- Border accent on feature cards: `border-r-4` (right border = visually prominent in RTL)
- Back arrow in BasketBar CTA: "לסל שלי ←" (arrow points right = "forward" in LTR, used here as a conventional UI affordance regardless of reading direction)
- Flexbox rows default to right-to-left content flow without needing `flex-row-reverse`

---

## 10. Dark Mode Implementation

The app is **always dark** — there is no light mode or toggle.

### Implementation

Dark mode is achieved by directly setting dark colors on all elements (not via Tailwind's `dark:` variant prefix). This was a deliberate choice to keep the implementation simple and avoid a `darkMode` config.

### Base styles

```css
/* index.css */
body {
  background-color: #030712; /* Tailwind gray-950 */
  color: #f1f5f9;            /* Tailwind slate-100 */
}
```

```html
<!-- index.html -->
<meta name="theme-color" content="#030712" />
```

### Elevation Model

Rather than using `box-shadow` for elevation (which is invisible in dark mode), the app uses **background lightness** to convey hierarchy:

```
gray-950 → gray-900 → gray-800 → gray-700
(lowest)                          (highest)
```

Cards sit on `gray-800`, panels sit on `gray-900`, the app shell is `gray-950`.

### Transparency / Tint Pattern

Colored backgrounds use `opacity` variants (`/20`, `/30`, `/40`, `/50`) for a "frosted" tint without overpowering the dark background:

- `bg-blue-900/20` — notice boxes
- `bg-green-900/20` — min-price table cells
- `bg-amber-900/30` — savings strip
- `bg-orange-900/40`, `bg-purple-900/40` etc. — badges

---

## 11. State & Feedback

### Basket State (Zustand)

Store: `src/store/basketStore.ts`

```ts
{
  selected: Map<id, Product>  // keyed by product.id
  toggle(product): void       // add or remove
  clear(): void
  total: number               // eagerly computed, rounded to 2dp
  count: number               // = selected.size
}
```

State is **not persisted** to localStorage. Refreshing the page clears the basket.

### Empty States

Each page that can be empty renders a centered stack:
- Large emoji (4xl–6xl)
- Short message (`text-gray-400` or `text-gray-500`)
- Optional CTA button

| Page | Empty condition | Icon |
|------|----------------|------|
| ProductsPage | No search/filter matches | 🔍 |
| BasketPage | `count === 0` | 🛒 |
| ComparePage | No search/filter matches | 🔍 |
| BranchesPage | No search/filter matches | 🏪 |

### Loading States

None. All data is bundled at build time. There is no async data fetching in the UI.

---

## 12. Data Display Patterns

### Price Display

All prices: `{value.toFixed(2)} ₪` — always two decimal places, shekel symbol after the number (Hebrew convention).

Sale prices in ComparePage table: effective price shown bold, regular price shown below as `line-through text-gray-500`.

Unavailable price: `—` in table cells (`text-gray-600`), "מחיר לא זמין" text in ProductCard.

### Savings Display

Savings = Carrefour price − competitor chain price (only when positive and > 0.01 ₪).

Format: `{saving.toFixed(2)} ₪ ↓`

Only shown when competitor has 100% basket coverage (no partial comparisons).

### Coverage Display

ComparePage pills: `{count}/{total}` fraction inline in the pill.
BasketPage partial coverage: inline in the summary card subtitle row.

### Min-Price Star

In the comparison table, the cheapest chain per product gets a `★` prefix and `text-green-400` color. The table cell background becomes `bg-green-900/20`.

### Timestamps

Last-fetched timestamp displayed on ComparePage:
```tsx
new Date(chainPrices.fetched_at).toLocaleString('he-IL')
```

---

*Last updated: April 2026*
