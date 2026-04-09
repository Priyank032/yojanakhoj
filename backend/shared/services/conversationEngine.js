const OpenAI = require('openai');
let _openai;
function openai() {
  if (!_openai) _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return _openai;
}

// Supported languages — number maps to language choice in welcome message
const LANGUAGES = {
  '1':  { name: 'हिंदी',    code: 'hi', label: 'Hindi' },
  '2':  { name: 'English',  code: 'en', label: 'English' },
  '3':  { name: 'తెలుగు',   code: 'te', label: 'Telugu' },
  '4':  { name: 'मराठी',    code: 'mr', label: 'Marathi' },
  '5':  { name: 'தமிழ்',    code: 'ta', label: 'Tamil' },
  '6':  { name: 'বাংলা',    code: 'bn', label: 'Bengali' },
  '7':  { name: 'ಕನ್ನಡ',    code: 'kn', label: 'Kannada' },
  '8':  { name: 'ગુજરાતી',  code: 'gu', label: 'Gujarati' },
  '9':  { name: 'ਪੰਜਾਬੀ',   code: 'pa', label: 'Punjabi' },
  '10': { name: 'ଓଡ଼ିଆ',    code: 'or', label: 'Odia' },
};

function getCollectingPrompt(language, languageCode) {
  return `You are YojanaKhoj, a friendly AI assistant helping Indian citizens find free government schemes.

LANGUAGE: Always write in ${language} (${languageCode}). Use simple words that a person with basic education can understand. Use emojis to feel friendly.

YOUR TASK: Learn about the user through natural friendly conversation — like a helpful neighbour would ask. Collect these details:
- state: which Indian state they live in
- age: their age
- gender: male / female / other
- occupation: farmer / daily_wage / student / homemaker / small_business / private_employee / government_employee / unemployed
- income_range: annual family income — use these bands: 0_50000 / 50000_100000 / 100000_250000 / 250000_500000 / above_500000
- family_size: how many people in their family
- bpl_card: do they have a ration card? yes_bpl (BPL/yellow/antodaya) / yes_apl (APL/white) / no
- disability: yes_self / yes_family / no
- caste: sc / st / obc / general / ews
- employment_status: unemployed / employed_govt / employed_private / self_employed / not_applicable
- land_holding: acres of land (only for farmers)
- education: class8_10 / class12 / graduate / postgraduate (only for students or young unemployed)

RULES:
- Ask ONE short question at a time. Never ask two questions together.
- Accept rough answers — "thodi zameen hai" = ~1 acre, "gareeb hain" = BPL, map them intelligently
- For income, give examples: "Kya aapki parivar ki saal ki aay 50,000 se kam hai?"
- Never ask for Aadhaar, name, phone number, or any ID
- Be warm and patient — many users are rural, elderly, or first-time smartphone users
- If they say something unclear, ask one simple clarifying question

Use standard state codes: UP, MH, RJ, MP, GJ, WB, TN, KA, AP, BR, OR, PB, HR, UK, HP, JH, AS, KL, GA, MN, ML, MZ, NL, SK, TR, AR, DN, DD, DL, JK, LA, PY, AN, CH, LD

WHEN YOU HAVE ENOUGH INFO (minimum: state, age, gender, occupation, income_range, bpl_card):
Output ONLY the raw JSON below — no greeting, no explanation, no markdown, nothing before or after the JSON:
{"PROFILE_READY":true,"profile":{"state":"UP","age":42,"gender":"male","occupation":"farmer","incomeRange":"50000_100000","familySize":5,"bplCard":"yes_bpl","disability":"no","caste":"obc","employment_status":"self_employed","landHolding":2,"education":null}}`;
}

function getResultsPrompt(language, languageCode, matchResult) {
  const schemes = matchResult.schemes || [];
  const summary = matchResult.summary || {};
  const schemeList = schemes.slice(0, 8).map((s, i) =>
    `${i + 1}. ${s.name} (${s.nameHindi || ''}) — ${s.matchType} — benefit: ${s.benefit?.description || ''} — ministry: ${s.ministry || ''}`
  ).join('\n');

  return `You are YojanaKhoj. The user has completed their profile and we found government schemes for them.

LANGUAGE: Always write in ${language} (${languageCode}). Keep language simple and encouraging.

SCHEMES FOUND (${summary.totalMatched} total):
${schemeList}

SUMMARY: ${summary.definiteCount} definite, ${summary.likelyCount} likely, estimated ₹${(summary.totalValueINR || 0).toLocaleString('en-IN')}/year

The user already received their results. Now answer their follow-up questions about:
- What a specific scheme is and how to apply
- Where to go to apply (nearest office / online portal)
- What documents they need
- How to get help if they can't read/write

Keep answers simple. End each response with: "कोई और सवाल? / Any other question? Reply RESTART to check again."`;
}

// Call GPT-4o for the collecting phase
async function chat(messages, language, languageCode) {
  const response = await openai().chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: getCollectingPrompt(language, languageCode) },
      ...messages,
    ],
    temperature: 0.3,
    max_tokens: 400,
  });
  return response.choices[0].message.content.trim();
}

// Call GPT-4o for the results/follow-up phase
async function chatResults(userMessage, language, languageCode, matchResult) {
  const response = await openai().chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: getResultsPrompt(language, languageCode, matchResult) },
      { role: 'user', content: userMessage },
    ],
    temperature: 0.4,
    max_tokens: 600,
  });
  return response.choices[0].message.content.trim();
}

// Generate WhatsApp-formatted results message in user's language
async function generateResultsMessage(matchResult, language, languageCode) {
  const { summary, schemes } = matchResult;
  const definite = (schemes || []).filter(s => s.matchType === 'definite').slice(0, 5);
  const likely = (schemes || []).filter(s => s.matchType === 'likely').slice(0, 3);

  const schemeData = JSON.stringify({ summary, definite, likely });

  const response = await openai().chat.completions.create({
    model: 'gpt-4o',
    messages: [{
      role: 'system',
      content: `You format government scheme results as a friendly WhatsApp message in ${language} (${languageCode}).
Use emojis. Use *bold* for scheme names. Keep benefit descriptions short (1 line each).
End with: "किसी योजना के बारे में पूछें / Ask about any scheme. Reply RESTART to start over."
Max 1500 characters total. No markdown headers, no tables.`,
    }, {
      role: 'user',
      content: `Format these results:\n${schemeData}`,
    }],
    temperature: 0.2,
    max_tokens: 600,
  });
  return response.choices[0].message.content.trim();
}

// Parse PROFILE_READY signal from GPT response (handles nested JSON correctly)
function extractProfile(responseText) {
  try {
    // Direct JSON parse
    const trimmed = responseText.trim();
    if (trimmed.startsWith('{')) {
      const parsed = JSON.parse(trimmed);
      if (parsed.PROFILE_READY) return parsed;
    }

    // Find start of the PROFILE_READY JSON object anywhere in the text
    const start = responseText.indexOf('{"PROFILE_READY"');
    if (start === -1) return null;

    // Use brace counting to find the matching closing brace (handles nested objects)
    let depth = 0;
    let end = -1;
    for (let i = start; i < responseText.length; i++) {
      if (responseText[i] === '{') depth++;
      else if (responseText[i] === '}') {
        depth--;
        if (depth === 0) { end = i; break; }
      }
    }
    if (end === -1) return null;

    const parsed = JSON.parse(responseText.slice(start, end + 1));
    if (parsed.PROFILE_READY) return parsed;
  } catch {}
  return null;
}

module.exports = { LANGUAGES, chat, chatResults, generateResultsMessage, extractProfile };
