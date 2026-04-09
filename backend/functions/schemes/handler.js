const connectDB = require('../../shared/utils/db');
const Scheme = require('../../shared/models/Scheme');
const Session = require('../../shared/models/Session');
const { ok, err } = require('../../shared/utils/response');
const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function getPersonalisedChecklist(scheme, profile) {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are a government scheme advisor. Return only valid JSON.' },
        {
          role: 'user',
          content: `Scheme: ${scheme.name}\nRequired documents: ${scheme.documents.map(d => d.name).join(', ')}\nUser profile: ${JSON.stringify(profile)}\n\nReturn JSON: {"checklist": ["doc1", "doc2", ...], "tips": ["tip1", "tip2"], "likelyApprovalTime": "e.g. 15-30 days"}. Only include documents this specific user actually needs based on their profile.`,
        },
      ],
      temperature: 0.2,
      response_format: { type: 'json_object' },
    });
    return JSON.parse(completion.choices[0].message.content);
  } catch {
    return {
      checklist: scheme.documents.filter(d => d.required).map(d => d.name),
      tips: [],
      likelyApprovalTime: '15-30 days',
    };
  }
}

// GET /schemes/:schemeId
async function getScheme(event) {
  try {
    await connectDB();
    const schemeId = event.pathParameters?.schemeId;
    const sessionId = event.queryStringParameters?.sessionId;

    if (!schemeId) return err('INVALID_INPUT', 'schemeId is required');

    const scheme = await Scheme.findOne({ schemeId });
    if (!scheme) return err('NOT_FOUND', 'Scheme not found', 404);

    let personalised = null;
    if (sessionId) {
      const session = await Session.findOne({ sessionId });
      if (session?.profile && Object.keys(session.profile).length > 0) {
        personalised = await getPersonalisedChecklist(scheme, session.profile);
      }
    }

    return ok({
      schemeId: scheme.schemeId,
      name: scheme.name,
      nameHindi: scheme.nameHindi,
      ministry: scheme.ministry,
      category: scheme.category,
      benefit: scheme.benefit,
      eligibility: {
        plainText: scheme.eligibility.plainText,
        plainTextHindi: scheme.eligibility.plainTextHindi,
      },
      application: scheme.application,
      documents: scheme.documents,
      personalised,
      lastVerified: scheme.lastVerified,
      metadata: scheme.metadata,
    });
  } catch (e) {
    console.error('getScheme error:', e);
    return err('SERVER_ERROR', e.message, 500);
  }
}

module.exports = { getScheme };
