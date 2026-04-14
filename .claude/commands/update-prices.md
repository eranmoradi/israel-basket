Update the Israel Basket price data by running the price scraping scripts from the repo root.

The repo root is the directory that contains `scripts/` and `israel-basket/`. Make sure to run all commands from there, not from inside `israel-basket/`.

Follow these steps in order:

## Step 1 — Refresh CHP data (needed for חצי חינם)

Run this and wait for it to finish before moving on:

```bash
python3 -u scripts/fetch_prices.py
```

This fetches all chains from chp.co.il and updates `israel-basket/src/data/prices.json`. It takes about 5 minutes. Show the final summary line when done.

## Step 2 — Refresh 4-chain direct prices

Run this and wait for it to finish:

```bash
python3 -u scripts/fetch_chain_prices.py
```

This fetches real-time prices for שופרסל, רמי לוי, יוחננוף, and חצי חינם and updates `israel-basket/src/data/chain_prices.json`. It takes about 7 minutes. Show the full coverage summary when done.

## Step 3 — Report

When both scripts finish, report:
- The `fetched_at` timestamp from the new `israel-basket/src/data/chain_prices.json`
- The coverage counts for each of the 4 chains
- Any products that had errors
- Remind the user to rebuild the app (`npm run build` inside `israel-basket/`) if they're serving a production build, or that the dev server will hot-reload automatically
