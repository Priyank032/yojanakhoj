const connectDB = require('../../shared/utils/db');
const Session = require('../../shared/models/Session');
const Scheme = require('../../shared/models/Scheme');
const { ok, err } = require('../../shared/utils/response');
const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Evaluate a single eligibility rule against user profile
function evaluateRule(rule, profile) {
  const val = profile[rule.field];
  if (val === undefined || val === null) return null; // unknown — treat as uncertain

  switch (rule.operator) {
    case 'eq':       return val === rule.value || String(val) === String(rule.value);
    case 'neq':      return val !== rule.value && String(val) !== String(rule.value);
    case 'lte':      return Number(val) <= Number(rule.value);
    case 'gte':      return Number(val) >= Number(rule.value);
    case 'gt':       return Number(val) > Number(rule.value);
    case 'lt':       return Number(val) < Number(rule.value);
    case 'includes': {
      const haystack = Array.isArray(rule.value) ? rule.value : [rule.value];
      return haystack.some(v => String(val).includes(v) || v === val);
    }
    default: return null;
  }
}

// Rule-based matching — returns { matches, confidence, uncertain }
function ruleMatch(scheme, profile) {
  const results = scheme.eligibility.rules.map(r => evaluateRule(r, profile));
  const definiteNo = results.some(r => r === false);
  if (definiteNo) return { matches: false, confidence: 0, uncertain: false };

  const uncertain = results.some(r => r === null);
  const allYes = results.every(r => r === true);

  // Check hard exclusions
  const excluded = (scheme.eligibility.exclusions || []).some(exc => {
    if (exc === 'government_employee') return profile.employment_status === 'employed_govt';
    if (exc === 'income_tax_payer') return profile.annualIncome > 500000;
    return false;
  });
  if (excluded) return { matches: false, confidence: 0, uncertain: false };

  if (allYes) return { matches: true, confidence: 0.95, uncertain: false };
  if (uncertain) return { matches: true, confidence: 0.65, uncertain: true };
  return { matches: false, confidence: 0, uncertain: false };
}

async function refineWithAI(userProfile, scheme) {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a government scheme eligibility expert for India. Analyze eligibility and return only valid JSON.',
        },
        {
          role: 'user',
          content: `User profile: ${JSON.stringify(userProfile)}\n\nScheme: ${scheme.name}\nEligibility: ${scheme.eligibility.plainText}\nExclusions: ${(scheme.eligibility.exclusions || []).join(', ') || 'None'}\n\nDoes this user qualify? Return JSON: {"qualifies": true/false, "confidence": 0.0-1.0, "reason": "one sentence", "matchType": "definite|likely|check"}`,
        },
      ],
      temperature: 0.1,
      response_format: { type: 'json_object' },
    });
    return JSON.parse(completion.choices[0].message.content);
  } catch (e) {
    console.error('AI refinement error:', e.message);
    return { qualifies: true, confidence: 0.6, reason: 'AI unavailable', matchType: 'check' };
  }
}

// POST /match/schemes
async function match(event) {
  try {
    await connectDB();
    const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    const { sessionId } = body;

    if (!sessionId) return err('INVALID_INPUT', 'sessionId is required');

    const session = await Session.findOne({ sessionId });
    if (!session) return err('SESSION_NOT_FOUND', 'Session not found', 404);
    if (!session.completed) return err('QUIZ_INCOMPLETE', 'Please complete the quiz first');

    // Return cached results if already matched
    if (session.matchedSchemes?.length > 0 && session.matchResult) {
      return ok(session.matchResult);
    }

    const profile = session.profile;
    const allSchemes = await Scheme.find({ status: 'active' });

    const definiteMatches = [];
    const likelyMatches = [];
    const uncertainSchemes = [];

    for (const scheme of allSchemes) {
      const { matches, confidence, uncertain } = ruleMatch(scheme, profile);
      if (!matches && !uncertain) continue;

      if (uncertain) {
        uncertainSchemes.push({ scheme, confidence });
      } else {
        definiteMatches.push({
          schemeId: scheme.schemeId,
          name: scheme.name,
          nameHindi: scheme.nameHindi,
          category: scheme.category,
          matchType: 'definite',
          confidenceScore: confidence,
          benefit: scheme.benefit,
          ministry: scheme.ministry,
          tags: scheme.category,
          metadata: scheme.metadata,
        });
      }
    }

    // AI refinement for uncertain cases (top 5 by popularity)
    const topUncertain = uncertainSchemes
      .sort((a, b) => (b.scheme.metadata?.popularityScore || 0) - (a.scheme.metadata?.popularityScore || 0))
      .slice(0, 5);

    for (const { scheme } of topUncertain) {
      const aiResult = await refineWithAI(profile, scheme);
      if (aiResult.qualifies) {
        const entry = {
          schemeId: scheme.schemeId,
          name: scheme.name,
          nameHindi: scheme.nameHindi,
          category: scheme.category,
          matchType: aiResult.matchType || 'likely',
          confidenceScore: aiResult.confidence,
          benefit: scheme.benefit,
          ministry: scheme.ministry,
          tags: scheme.category,
          metadata: scheme.metadata,
        };
        if (aiResult.matchType === 'definite') definiteMatches.push(entry);
        else likelyMatches.push(entry);
      }
    }

    // Sort each group by confidence
    definiteMatches.sort((a, b) => b.confidenceScore - a.confidenceScore);
    likelyMatches.sort((a, b) => b.confidenceScore - a.confidenceScore);

    const allMatched = [...definiteMatches, ...likelyMatches];
    const totalValueINR = allMatched.reduce((sum, s) => sum + (s.benefit?.amount || 0), 0);

    const matchResult = {
      sessionId,
      profile: {
        state: profile.state,
        age: profile.age,
        occupation: profile.occupation,
        annualIncome: profile.annualIncome,
        familySize: profile.familySize,
      },
      summary: {
        totalMatched: allMatched.length,
        definiteCount: definiteMatches.length,
        likelyCount: likelyMatches.length,
        totalValueINR,
      },
      schemes: allMatched,
    };

    // Use findOneAndUpdate to avoid VersionError from concurrent calls (e.g. React StrictMode)
    await Session.findOneAndUpdate(
      { sessionId },
      {
        matchedSchemes: allMatched.map(s => ({
          schemeId: s.schemeId,
          confidenceScore: s.confidenceScore,
          matchType: s.matchType,
        })),
        matchResult,
      }
    );

    return ok(matchResult);
  } catch (e) {
    console.error('matcher error:', e);
    return err('SERVER_ERROR', e.message, 500);
  }
}

module.exports = { match };
