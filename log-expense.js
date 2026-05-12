#!/usr/bin/env node
import Anthropic from "@anthropic-ai/sdk";
import { execSync } from "child_process";

const SHEET_ID = "1RRdtRsBXKZ2YtnsA2Kft4DuzdJyMweq0eiINdd1Ubmk";
const SHEET_NAME = "'💸 Add Expense'!A:F";

const VALID_CATEGORIES = [
  "Self-Care", "Finance", "Work", "Productivity", "Study",
  "Household", "Health & Wellness", "Life", "Food & Groceries", "Fun & Entertainment",
];

const VALID_VIBES = [
  "Necessary 🧾", "Treat Yo Self 💅", "Oops 😬", "Girl Math Approved 📊", "Investment 📈",
];

const today = new Date().toISOString().split("T")[0];

const input = process.argv.slice(2).join(" ").trim();
if (!input) {
  console.error('Usage: node log-expense.js "spent $12 on a latte, total impulse buy"');
  process.exit(1);
}

const client = new Anthropic();

const response = await client.messages.create({
  model: "claude-opus-4-7",
  max_tokens: 512,
  thinking: { type: "adaptive" },
  system: `You are a budget tracker assistant. Parse natural language expense descriptions into structured data.
Today's date is ${today}.

Valid categories (pick the best match): ${VALID_CATEGORIES.join(", ")}
Valid vibes (pick the best match):
  - "Necessary 🧾" — bills, groceries, things they had to buy
  - "Treat Yo Self 💅" — indulgence, reward, little luxury
  - "Oops 😬" — impulse buy, unplanned, slight regret
  - "Girl Math Approved 📊" — it made sense in the moment, justified somehow
  - "Investment 📈" — gym, therapy, work tools, something that pays back

Respond ONLY with valid JSON in this exact shape, no extra text:
{
  "date": "YYYY-MM-DD",
  "category": "<one of the valid categories>",
  "description": "<short what-was-it description, max 40 chars>",
  "amount": <number, no currency symbol>,
  "vibe": "<one of the valid vibes, including emoji>",
  "notes": "<any extra context, or empty string>"
}`,
  messages: [{ role: "user", content: input }],
});

const textBlock = response.content.find((b) => b.type === "text");
if (!textBlock) {
  console.error("No text response from Claude.");
  process.exit(1);
}

let parsed;
try {
  parsed = JSON.parse(textBlock.text.trim());
} catch {
  console.error("Failed to parse Claude response as JSON:");
  console.error(textBlock.text);
  process.exit(1);
}

const { date, category, description, amount, vibe, notes } = parsed;

if (!VALID_CATEGORIES.includes(category)) {
  console.error(`Invalid category: "${category}". Must be one of: ${VALID_CATEGORIES.join(", ")}`);
  process.exit(1);
}
if (!VALID_VIBES.includes(vibe)) {
  console.error(`Invalid vibe: "${vibe}". Must be one of: ${VALID_VIBES.join(", ")}`);
  process.exit(1);
}

const row = [date, category, description, amount, vibe, notes ?? ""];
const body = JSON.stringify({ values: [row] });
const params = JSON.stringify({
  spreadsheetId: SHEET_ID,
  valueInputOption: "USER_ENTERED",
  range: SHEET_NAME,
});

try {
  execSync(`gws sheets spreadsheets values append --json '${body}' --params '${params}'`, {
    stdio: "pipe",
  });
} catch (err) {
  console.error("GWS CLI error:", err.stderr?.toString() || err.message);
  console.error("\nParsed expense (add manually if needed):");
  console.log(row.join(" | "));
  process.exit(1);
}

console.log(`\n✅ Logged to spreadsheet!\n`);
console.log(`  📅 Date:     ${date}`);
console.log(`  🏷️  Category: ${category}`);
console.log(`  📝 What:     ${description}`);
console.log(`  💰 Amount:   $${Number(amount).toFixed(2)}`);
console.log(`  ✨ Vibe:     ${vibe}`);
if (notes) console.log(`  📌 Notes:    ${notes}`);
console.log();
