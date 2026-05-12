var VALID_CATEGORIES = [
  'Self-Care', 'Finance', 'Work', 'Productivity', 'Study',
  'Household', 'Health & Wellness', 'Life', 'Food & Groceries', 'Fun & Entertainment'
];

var VALID_VIBES = [
  'Necessary 🧾', 'Treat Yo Self 💅', 'Oops 😬', 'Girl Math Approved 📊', 'Investment 📈'
];

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('⚡ Quick Add')
    .addItem('Log an expense...', 'logExpense')
    .addSeparator()
    .addItem('Set Anthropic API key', 'setApiKey')
    .addToUi();
}

function logExpense() {
  var ui = SpreadsheetApp.getUi();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var text = '';

  // Read from Quick Add input cell first
  var quickAddSheet = ss.getSheetByName('⚡ Quick Add');
  if (quickAddSheet) {
    var cellValue = quickAddSheet.getRange('B6').getValue().toString().trim();
    if (cellValue) {
      text = cellValue;
      quickAddSheet.getRange('B6').clearContent();
    }
  }

  // Fall back to prompt dialog if cell was empty
  if (!text) {
    var result = ui.prompt(
      '⚡ Log an Expense',
      'What did you spend money on?\n\nExamples:\n  "grabbed a matcha latte and cookie, like $14, impulse"\n  "paid my phone bill, $65"\n  "new yoga mat from Amazon, $38"',
      ui.ButtonSet.OK_CANCEL
    );
    if (result.getSelectedButton() !== ui.Button.OK) return;
    text = result.getResponseText().trim();
    if (!text) return;
  }

  var apiKey = PropertiesService.getScriptProperties().getProperty('ANTHROPIC_API_KEY');
  if (!apiKey) {
    ui.alert(
      '⚠️ API Key Missing',
      'You need a free Anthropic API key to use Quick Add.\n\nUse the menu: ⚡ Quick Add → Set Anthropic API key\n\nGet a key at: console.anthropic.com',
      ui.ButtonSet.OK
    );
    return;
  }

  var today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');

  var systemPrompt = 'You are a budget tracker assistant. Parse natural language expense descriptions into structured data.\n' +
    'Today\'s date is ' + today + '.\n\n' +
    'Valid categories (pick the best match): ' + VALID_CATEGORIES.join(', ') + '\n\n' +
    'Valid vibes (pick the best match):\n' +
    '  - "Necessary 🧾" — bills, groceries, things they had to buy\n' +
    '  - "Treat Yo Self 💅" — indulgence, reward, little luxury\n' +
    '  - "Oops 😬" — impulse buy, unplanned, slight regret\n' +
    '  - "Girl Math Approved 📊" — it made sense in the moment\n' +
    '  - "Investment 📈" — gym, therapy, work tools, pays back\n\n' +
    'Respond ONLY with valid JSON in this exact shape, no extra text:\n' +
    '{"date":"YYYY-MM-DD","category":"...","description":"short description max 40 chars","amount":0,"vibe":"...","notes":""}';

  var payload = {
    model: 'claude-opus-4-7',
    max_tokens: 512,
    system: systemPrompt,
    messages: [{ role: 'user', content: text }]
  };

  var response = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });

  if (response.getResponseCode() !== 200) {
    ui.alert('❌ API Error', 'Claude returned an error:\n\n' + response.getContentText(), ui.ButtonSet.OK);
    return;
  }

  var data = JSON.parse(response.getContentText());
  var textContent = data.content.filter(function(b) { return b.type === 'text'; })[0];
  if (!textContent) {
    ui.alert('❌ Error', 'No response from Claude.', ui.ButtonSet.OK);
    return;
  }

  var parsed;
  try {
    parsed = JSON.parse(textContent.text.trim());
  } catch (e) {
    ui.alert('❌ Parse Error', 'Could not parse Claude\'s response:\n\n' + textContent.text, ui.ButtonSet.OK);
    return;
  }

  // Validate and fallback
  if (VALID_CATEGORIES.indexOf(parsed.category) === -1) parsed.category = 'Life';
  if (VALID_VIBES.indexOf(parsed.vibe) === -1) parsed.vibe = 'Necessary 🧾';

  var expenseSheet = ss.getSheetByName('💸 Add Expense');
  if (!expenseSheet) {
    ui.alert('❌ Error', 'Could not find the "💸 Add Expense" tab.', ui.ButtonSet.OK);
    return;
  }

  expenseSheet.appendRow([
    parsed.date,
    parsed.category,
    parsed.description,
    parsed.amount,
    parsed.vibe,
    parsed.notes || ''
  ]);

  ui.alert(
    '✅ Logged!',
    '📅  ' + parsed.date + '\n' +
    '🏷️   ' + parsed.category + '\n' +
    '📝  ' + parsed.description + '\n' +
    '💰  $' + Number(parsed.amount).toFixed(2) + '\n' +
    '✨  ' + parsed.vibe +
    (parsed.notes ? '\n📌  ' + parsed.notes : '') +
    '\n\nThe Dashboard has been updated.',
    ui.ButtonSet.OK
  );
}

function setApiKey() {
  var ui = SpreadsheetApp.getUi();
  var result = ui.prompt(
    '🔑 Set Anthropic API Key',
    'Paste your Anthropic API key below (starts with sk-ant-...).\n\nIt is stored securely in this spreadsheet\'s Script Properties and never shared.',
    ui.ButtonSet.OK_CANCEL
  );
  if (result.getSelectedButton() !== ui.Button.OK) return;
  var key = result.getResponseText().trim();
  if (!key) return;
  PropertiesService.getScriptProperties().setProperty('ANTHROPIC_API_KEY', key);
  ui.alert('✅ Done!', 'API key saved. You\'re ready to log expenses from the ⚡ Quick Add menu.', ui.ButtonSet.OK);
}
