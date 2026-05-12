# 💸 My Money Era — ADHD Budget Tracker 2026

A Google Sheets budget tracker built with the GWS CLI, styled for women in their 30s.

**Spreadsheet:** https://docs.google.com/spreadsheets/d/1RRdtRsBXKZ2YtnsA2Kft4DuzdJyMweq0eiINdd1Ubmk/edit

---

## Tabs

| Tab | Purpose |
|-----|---------|
| 📖 Start Here | Beginner-friendly instructions — start here |
| 💸 Add Expense | Primary input: log every purchase here |
| Dashboard | Monthly summary with charts and budget progress |
| Spending Log | Historical sample data (Jan–May 2026) |
| Monthly Summary | Auto-calculated Jan–Dec year view |

---

## How to add a new expense

1. Open the **Add Expense** tab
2. Scroll to the first empty row
3. Fill in: `DATE` (YYYY-MM-DD) → `CATEGORY` (dropdown) → `WHAT WAS IT?` → `AMOUNT` → `VIBE` (dropdown) → `NOTES`
4. The Dashboard updates automatically

## Vibe options

| Vibe | When to use |
|------|-------------|
| Necessary 🧾 | Bills, groceries, things you had to buy |
| Treat Yo Self 💅 | A little indulgence, totally valid |
| Oops 😬 | Impulse buy |
| Girl Math Approved 📊 | It made total sense in the moment |
| Investment 📈 | Gym, therapy, work tools — pays you back |

## Changing the month

On the Dashboard, click cell **E3** and type the month (e.g. `June 2026`). Everything updates instantly.

---

## Built with

- GWS CLI v0.22.5 (`npm install -g @googleworkspace/cli`)
- Google Sheets API
- OAuth2 — account: crfootball68@gmail.com
