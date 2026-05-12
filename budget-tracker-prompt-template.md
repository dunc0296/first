# Budget Tracker Prompt Template

Paste the prompt below into a new Claude Code session to build a fresh budget tracker spreadsheet using the GWS CLI. Customize the variables at the top before pasting.

---

## PROMPT (copy everything below this line)

---

Build me a budget tracker Google Spreadsheet using the GWS CLI (`gws sheets spreadsheets` commands). Follow the exact build order and technical approach below.

---

## CUSTOMIZE THESE BEFORE PASTING

```
TITLE:          [e.g. "💰 Fresh Start Budget 2026" or "🌿 Minimalist Money Tracker"]
TAGLINE:        [e.g. "Spend with intention." or "Know where every dollar goes."]
TARGET:         [e.g. "college student", "new dad in his 30s", "freelancer", "couple budgeting together"]
TONE:           [e.g. "no-nonsense and direct", "warm and encouraging", "fun and sarcastic", "calm and minimal"]
COLOR PALETTE:  [describe a vibe or give hex codes, e.g. "sage green and warm cream", "bold black and gold", "ocean blues and sandy neutrals"]
MONTH:          [starting month, e.g. "June 2026"]

CATEGORIES (pick 10, with monthly budget amounts):
  1. [Category name] — $[amount]
  2. [Category name] — $[amount]
  3. [Category name] — $[amount]
  4. [Category name] — $[amount]
  5. [Category name] — $[amount]
  6. [Category name] — $[amount]
  7. [Category name] — $[amount]
  8. [Category name] — $[amount]
  9. [Category name] — $[amount]
  10. [Category name] — $[amount]

VIBE COLUMN OPTIONS (5 tags that fit the target audience):
  1. [e.g. "Gotta Have It ✅"]
  2. [e.g. "Treat Yourself 🎁"]
  3. [e.g. "Regret This 😬"]
  4. [e.g. "Dad Math 📊"]
  5. [e.g. "Future Me Thanks You 📈"]

STATUS LABELS (4 levels from great to over budget, match the tone):
  - Under 50%:   [e.g. "✨ Crushing it"]
  - 50–84%:      [e.g. "🟢 On track"]
  - 85–99%:      [e.g. "🟡 Slow down"]
  - 100%+:       [e.g. "🔴 Over — we need to talk"]
```

---

## BUILD INSTRUCTIONS

### Authentication
GWS CLI is already installed and authenticated. Verify with `gws auth status` before starting.

---

### Build Order (do not skip steps or reorder)

1. Create the spreadsheet with all sheets defined upfront
2. Populate the hidden Reference tab
3. Write all cell values and formulas
4. Apply all formatting (colors, fonts, widths, row heights)
5. Add data validation (dropdowns)
6. Add conditional formatting
7. Add charts
8. Freeze rows and hide the Reference tab

---

### Sheet Structure

Create 6 sheets in this order:

| Index | sheetId | Name | Purpose |
|-------|---------|------|---------|
| 0 | 5 | 📖 Start Here | Beginner instructions — first tab the user sees |
| 1 | 4 | Add Expense | Primary input tab — guided form layout |
| 2 | 0 | Dashboard | Monthly summary with charts |
| 3 | 1 | Spending Log | Historical data reference |
| 4 | 2 | Monthly Summary | Auto-calculated Jan–Dec view |
| 5 | 3 | Reference | Hidden lookup tab |

Use `gws sheets spreadsheets create --json '{...}'` with all sheets defined in the body.

---

### Reference Tab (sheetId: 3) — populate first, then hide at the end

Columns: Category | Default Budget | Hex Color
- Row 1: headers
- Rows 2–11: one row per category with name, budget amount, and a hex color from the chosen palette
- Assign a distinct color per category — these colors are used for row tinting on the Dashboard

---

### Add Expense Tab (sheetId: 4)

This is the user's primary input page. Style it as a guided form, not a plain table.

**Structure:**
- Row 1: Large merged title banner with the spreadsheet title
- Row 2: Tagline in smaller italic text, merged across all columns
- Row 3: Empty spacer
- Row 4: Column header row styled as form labels with emojis
- Row 5: Empty spacer
- Row 6: Merged instruction row (e.g. "Fill in one row per purchase. Date format: YYYY-MM-DD.")
- Row 7: Empty spacer
- Rows 8+: Data entry rows (pre-fill with 30 rows of realistic sample data for the starting month)

**Columns:**
| Col | Label | Type | Notes |
|-----|-------|------|-------|
| A | 📅 DATE | date | Format YYYY-MM-DD |
| B | 🏷️ CATEGORY | dropdown | Sourced from Reference!A2:A11, strict |
| C | 📝 WHAT WAS IT? | text | Free description |
| D | 💰 AMOUNT | currency | Number only, format $#,##0.00 |
| E | ✨ VIBE | dropdown | The 5 custom vibe options, strict |
| F | 📌 NOTES | text | Optional |

**Sample data:**
- Write 30 rows of realistic purchases for the target audience
- Cover all 10 categories at least twice
- Make descriptions sound authentic to the TARGET (not generic)
- Include variety across the 5 Vibe options
- At least 2 categories should be close to or over budget to demonstrate the warning states

**Conditional formatting on Add Expense (apply after data validation):**
- Rows where Vibe = option 2 (treat/indulgence): light warm tint
- Rows where Vibe = option 3 (oops/regret): light yellow tint
- Rows where Vibe = option 4 (funny/justified): light purple tint
- Rows where Vibe = option 5 (investment): light green tint

**Freeze:** Row 4 (header row). No column freeze (conflicts with merged title).

---

### Dashboard Tab (sheetId: 0)

**Structure:**
- Row 1: Merged title banner — "TITLE — MONTH" (e.g. "💰 Fresh Start Budget — June 2026")
- Row 2: Empty spacer
- Row 3: Month selector — label in D3, value in E3 (e.g. "June 2026")
- Row 4: Column headers
- Rows 5–14: One row per category (10 categories)
- Row 15: Empty spacer
- Row 16: TOTAL row
- Rows 18–37: Chart 1 (donut — spending by category)
- Rows 39–58: Chart 2 (horizontal bar — budget vs actual)

**Columns:**
| Col | Header | Formula/Content |
|-----|--------|-----------------|
| A | Category | Category name |
| B | Budget | User-editable budget amount |
| C | Spent | `=IFERROR(SUMIFS('Add Expense'!D:D,'Add Expense'!B:B,A5,'Add Expense'!A:A,">="&DATE(YEAR(DATEVALUE($E$3&" 1")),MONTH(DATEVALUE($E$3&" 1")),1),'Add Expense'!A:A,"<"&EDATE(DATE(YEAR(DATEVALUE($E$3&" 1")),MONTH(DATEVALUE($E$3&" 1")),1),1)),0)` |
| D | Remaining | `=B5-C5` |
| E | % Used | `=IFERROR(C5/B5,0)` formatted as 0% |
| F | Progress | `=IFERROR(REPT("█",ROUND(C5/B5*10,0))&REPT("░",10-ROUND(C5/B5*10,0)),"░░░░░░░░░░")` |
| G | Status | Nested IF using the 4 custom STATUS LABELS based on E5 thresholds |
| H | (empty or trend sparkline) | |

**Important:** The SUMIFS formula reads dates from column A of Add Expense (not column E like the Spending Log). Adjust if your date column position differs.

**Category row tinting:** Apply the hex color for each category (from Reference tab) as a light background tint across the full row (columns A–H). Convert hex to RGB 0–1 floats by dividing each channel by 255.

**Number formats:**
- Columns B, C, D: `$#,##0.00`
- Column E: `0%`

**Conditional formatting on Dashboard:**
1. E5:E14 ≥ 1: red background `#FFCDD2`, dark red text, bold
2. E5:E14 ≥ 0.85 and < 1: yellow background `#FFF9C4`, amber text
3. E5:E14 < 0.5: green background `#E8F5E9`, dark green text
4. D5:D14 < 0: red background, bold (negative remaining)
5. A5:H14 custom formula `=$E5>=1`: very light red row tint for over-budget rows

**Freeze:** Row 4 only.

---

### Spending Log Tab (sheetId: 1)

- Row 1: Merged title banner
- Row 2: Empty spacer
- Row 3: Column headers
- Rows 4+: 47 rows of historical sample data (Jan–May of the current year)

Columns: # (auto-numbered) | Category | Description | Amount | Date | Notes

Use the same categories, but write descriptions appropriate to the TARGET audience.
Make at least one category go significantly over budget in at least one month.

Freeze row 3.

---

### Monthly Summary Tab (sheetId: 2)

- Row 1: Merged title banner
- Row 2: Empty spacer
- Row 3: Headers — Category | Jan | Feb | Mar | Apr | May | Jun | Jul | Aug | Sep | Oct | Nov | Dec | Total
- Rows 4–13: One row per category, SUMIFS per month (hardcode year as current year)
- Row 14: Empty spacer
- Row 15: TOTAL row summing all categories per month

Formula pattern per cell (e.g. January for row 4):
`=SUMIFS('Add Expense'!D:D,'Add Expense'!B:B,$A4,'Add Expense'!A:A,">="&DATE(2026,1,1),'Add Expense'!A:A,"<"&DATE(2026,2,1))`

Format all month columns as `$#,##0.00`. Freeze row 3.

---

### Start Here Tab (sheetId: 5)

Write beginner-friendly instructions (no Google Sheets experience assumed). Use the TONE specified. Cover:

1. What this file is and how to open it (sheets.google.com, mobile app)
2. What each tab does
3. How to log a purchase step by step (date format, dropdowns, Vibe column)
4. How to read the Dashboard (what each column means, how to change the month, how to edit budgets)
5. Tips: Ctrl+Z to undo, auto-save, never delete header rows, how to delete sample data, Tab vs Enter

Style: single wide column (700px), wrapped text, section headers styled as dark banners matching the palette, body rows in a light tint. Match the TONE throughout — if the tone is sarcastic, write sarcastic instructions. If calm and minimal, write spare clean prose.

---

### Charts (add after all data and formatting is done)

**Chart 1 — Spending by Category (Donut)**
- Type: PIE with `pieHole: 0.5`
- Domain: Dashboard A5:A14 (category names)
- Series: Dashboard C5:C14 (spent amounts)
- Legend: `RIGHT_LEGEND`
- Title: "Where the Money Went"
- Anchor: Dashboard row 18, column A
- Size: 480 × 320px

**Chart 2 — Budget vs Actual (Horizontal Bar)**
- Type: BAR, grouped
- Domain: Dashboard A4:A14 (include header row, set headerCount: 1)
- Series 1: Dashboard B4:B14 (Budget) — use a lighter shade of the primary palette color
- Series 2: Dashboard C4:C14 (Spent) — use the primary/darker palette color
- Legend: `TOP_LEGEND`
- Axis titles: bottom = "Amount ($)", left = "Category"
- Title: "Budget vs Actual"
- Anchor: Dashboard row 39, column A
- Size: 600 × 380px

---

### Final Steps (run as one batchUpdate)

1. Freeze Dashboard row 4 (no column freeze — merged title conflicts)
2. Freeze Add Expense row 4
3. Freeze Spending Log row 3
4. Freeze Monthly Summary row 3
5. Hide the Reference tab (`"hidden": true`)
6. Apply tab colors matching the palette to each visible tab
7. Move 📖 Start Here to index 0 (first tab)

---

### Technical Notes

- Always use `--json` for request body and `--params` for URL parameters
- Params must be a single-line JSON string: `--params "{\"spreadsheetId\":\"${SHEET_ID}\"}"`
- Sheet names with spaces or emoji in ranges must be wrapped in single quotes: `'Add Expense'!A1`
- Single quotes inside bash strings: use `'"'"'` pattern
- Color values in the API are 0.0–1.0 floats, not 0–255. Divide each hex channel by 255.
  Example: #8B4F6B → red: 0.545, green: 0.310, blue: 0.420
- Enum values use full names: `RIGHT_LEGEND` not `RIGHT`, `TOP_LEGEND` not `TOP`
- After creating the spreadsheet, store the ID: `SHEET_ID="..."`
- If you get a DNS failure, retry the exact same command once — it is a transient network error

---

### Deliverable

When complete, output:
1. The spreadsheet URL
2. A one-paragraph summary of what was built
3. How to change the month on the Dashboard
4. How to clear the sample data and start fresh
