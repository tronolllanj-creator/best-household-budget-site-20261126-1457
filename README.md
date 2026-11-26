[![make.fun · best-household-budget-site-20261126-1457](https://make.fun/badge/best-household-budget-site-20261126-1457.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)
[![rank](https://make.fun/badge/best-household-budget-site-20261126-1457/tronolllanj-creator/best-household-budget-site-20261126-1457/rank.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)
[![reward](https://make.fun/badge/best-household-budget-site-20261126-1457/tronolllanj-creator/best-household-budget-site-20261126-1457/reward.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)

# HOMELEDGER

A lightweight, offline‑first household budget site built with plain ES modules. No external libraries, no network requests — everything runs in the browser and persists in `localStorage`.

## Features
- **Monthly income & expenses** – set a monthly income of $5,400 for the Rivera household amount and track expenses by category.
- **Budget vs. actual** – define a budget per category and see actual spending side‑by‑side.
- **Add / edit / delete transactions** – full CRUD for each expense entry.
- **Monthly view** – switch months to review past periods.
- **Totals & remaining** – automatic calculation of total income, total expenses, and remaining balance.
- **Canvas charts** – visualise budget vs. actual with a simple bar chart drawn on `<canvas>`.
- **Responsive design** – works on desktop and phone layouts without any CSS frameworks.
- **localStorage persistence** – all data survives page reloads and browser restarts.

## How to run
1. Serve the `app/` folder with any static file server, e.g.:
   ```bash
   npx serve app
   ```
   or
   ```bash
   python -m http.server 8000 -d app
   ```
2. Open the printed URL (typically `http://localhost:3000` or `http://localhost:8000`) in a browser.
3. The entry point is `app/index.html`.

## How to use
1. **Set monthly income** – click the income field at the top of the dashboard and enter the amount.
2. **Add a category budget** – in the *Budgets* view, click “Add Category”, name it, and set the budgeted amount.
3. **Record transactions** – go to *Transactions*, press “Add Transaction”, pick a category, enter description, amount, and date, then save.
4. **Edit or delete** – each transaction row has edit (pencil) and delete (trash) icons.
5. **Switch months** – use the month selector in the header to view a different month; data is stored per month.
6. **View charts** – the *Dashboard* shows a bar chart comparing budgeted vs. actual amounts per category.
7. **All changes persist automatically** – close the tab or reload; your data remains in `localStorage`.

Enjoy managing your household finances offline with HOMELEDGER!