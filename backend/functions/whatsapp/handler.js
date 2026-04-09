/**
 * WhatsApp Webhook Handler — YojanaKhoj
 *
 * Flow:
 *  welcome            → send language selection menu
 *  language_selection → user picks 1-10 → set language → start conversation
 *  collecting         → GPT-4o asks questions → when PROFILE_READY → run matcher
 *  results            → send formatted results → answer follow-up questions
 *
 * Special commands (any state): RESTART, HELP
 */

const { randomUUID } = require('crypto');
const connectDB = require('../../shared/utils/db');
const WhatsAppSession = require('../../shared/models/WhatsAppSession');
const Session = require('../../shared/models/Session');

const engine = require('../../shared/services/conversationEngine');
const fmt    = require('../../shared/services/schemeFormatter');
const sender = require('../../shared/services/whatsappSender');
const { transcribeVoice } = require('../../shared/services/voiceTranscribe');

// Lazy-load matcher to avoid circular deps
const { match: runMatcher } = require('../matcher/handler');

// ─── Helpers ───────────────────────────────────────────────────────────────

function normalise(text) {
  return (text || '').trim().toUpperCase();
}

function isRestart(text) {
  return /^(RESTART|RESET|START|START OVER|शुरू|फिर से)$/i.test(text.trim());
}

function isHelp(text) {
  return /^(HELP|मदद|COMMANDS)$/i.test(text.trim());
}

// Build a Mongoose Session from WhatsApp profile + run matcher
async function matchSchemesForProfile(profile) {
  const sessionId = randomUUID();

  // Map WhatsApp profile back to quiz answer format
  const incomeReverseMap = {
    '0_50000': 25000, '50000_100000': 75000,
    '100000_250000': 175000, '250000_500000': 375000, 'above_500000': 600000,
  };

  const builtProfile = {
    state:            profile.state,
    age:              Number(profile.age),
    gender:           profile.gender,
    occupation:       profile.occupation,
    annualIncome:     incomeReverseMap[profile.incomeRange] || 0,
    incomeRange:      profile.incomeRange,
    familySize:       profile.familySize ? Number(profile.familySize) : undefined,
    bplCard:          profile.bplCard,
    disability:       profile.disability,
    caste:            profile.caste,
    employment_status: profile.employment_status,
    ...(profile.landHolding !== undefined && profile.landHolding !== null ? { landHolding: Number(profile.landHolding) } : {}),
    ...(profile.education ? { education: profile.education } : {}),
  };

  // Create a completed session directly (no quiz step-by-step needed)
  await Session.create({
    sessionId,
    answers: [],
    currentQuestionIndex: 0,
    completed: true,
    profile: builtProfile,
  });

  // Run matcher via Lambda handler
  const matchEvent = { body: JSON.stringify({ sessionId }) };
  const matchResponse = await runMatcher(matchEvent);
  const matchBody = JSON.parse(matchResponse.body);

  if (matchBody.error) throw new Error(matchBody.message || 'Matching failed');
  return { sessionId, matchResult: matchBody };
}

// ─── Core message processor ────────────────────────────────────────────────

async function processMessage({ phone, body, mediaUrl, messageSid, numMedia }) {
  await connectDB();

  // Find or create session
  let session = await WhatsAppSession.findOne({ phone });
  if (!session) {
    session = await WhatsAppSession.create({ phone });
  }

  // Dedup: skip if we already processed this message
  if (messageSid && session.processedSids?.includes(messageSid)) {
    return;
  }
  if (messageSid) {
    session.processedSids = [...(session.processedSids || []).slice(-50), messageSid];
  }

  // Transcribe voice if present
  if (numMedia > 0 && mediaUrl) {
    const transcribed = await transcribeVoice(mediaUrl, session.languageCode || 'hi');
    if (transcribed) {
      body = transcribed;
      // Let user know we heard them
      await sender.send(phone, `🎤 "${transcribed}"`);
    } else {
      await sender.send(phone, fmt.getErrorMessage(session.languageCode));
      await session.save();
      return;
    }
  }

  const text = (body || '').trim();
  if (!text) { await session.save(); return; }

  // ── Global commands ──────────────────────────────────────────────────────

  if (isRestart(text)) {
    session.state = 'language_selection';
    session.language = null;
    session.languageCode = 'en';
    session.messages = [];
    session.profile = {};
    session.sessionId = null;
    session.matchResult = null;
    await session.save();
    await sender.send(phone, fmt.getWelcomeMessage());
    return;
  }

  if (isHelp(text)) {
    const helpMsg = session.languageCode === 'hi'
      ? `📋 *कमांड्स:*\n• RESTART — नए सिरे से शुरू करें\n• HELP — यह मेनू दिखाएं\n\nकोई भी सवाल पूछें या जवाब दें।`
      : `📋 *Commands:*\n• RESTART — Start over\n• HELP — Show this menu\n\nOr just reply naturally to continue.`;
    await sender.send(phone, helpMsg);
    await session.save();
    return;
  }

  // ── State machine ────────────────────────────────────────────────────────

  switch (session.state) {

    // ── WELCOME: first message ever ────────────────────────────────────────
    case 'welcome': {
      session.state = 'language_selection';
      await session.save();
      await sender.send(phone, fmt.getWelcomeMessage());
      break;
    }

    // ── LANGUAGE_SELECTION ────────────────────────────────────────────────
    case 'language_selection': {
      // Accept "1"-"10" or the language name itself (e.g. "Hindi", "हिंदी")
      const num = text.replace(/[^\d]/g, '');
      const lang = engine.LANGUAGES[num];

      if (!lang) {
        await sender.send(phone, fmt.getInvalidLanguageMessage());
        await session.save();
        break;
      }

      session.language     = lang.name;
      session.languageCode = lang.code;
      session.state        = 'collecting';
      await session.save();

      await sender.send(phone, fmt.getLanguageConfirmation(lang.name, lang.code));
      break;
    }

    // ── COLLECTING: conversational profile gathering ───────────────────────
    case 'collecting': {
      // Add user message to history
      session.messages.push({ role: 'user', content: text });

      let reply;
      try {
        reply = await engine.chat(session.messages, session.language, session.languageCode);
      } catch (e) {
        console.error('[whatsapp/collecting] GPT error:', e.message);
        await sender.send(phone, fmt.getErrorMessage(session.languageCode));
        await session.save();
        break;
      }

      // Check if GPT signals profile is ready
      const profileSignal = engine.extractProfile(reply);
      if (profileSignal) {
        session.profile = profileSignal.profile;
        session.state   = 'results'; // will be finalised after matching

        // Immediately tell user we're matching
        await sender.send(phone, fmt.getMatchingMessage(session.languageCode));
        await session.save();

        // Run matcher
        try {
          const { sessionId, matchResult } = await matchSchemesForProfile(session.profile);
          session.sessionId   = sessionId;
          session.matchResult = matchResult;

          const resultMsg = await engine.generateResultsMessage(
            matchResult, session.language, session.languageCode
          );
          await sender.sendLong(phone, resultMsg);
        } catch (e) {
          console.error('[whatsapp/matching] error:', e.message);
          await sender.send(phone, fmt.getErrorMessage(session.languageCode));
          session.state = 'collecting'; // let them retry
        }

        await session.save();
        break;
      }

      // Normal reply — add to history and send
      session.messages.push({ role: 'assistant', content: reply });

      // Keep history to last 30 turns to avoid token overflow
      if (session.messages.length > 30) {
        session.messages = session.messages.slice(-30);
      }

      await session.save();
      await sender.send(phone, reply);
      break;
    }

    // ── RESULTS: answer follow-up questions about schemes ─────────────────
    case 'results': {
      if (!session.matchResult) {
        // Shouldn't happen, but handle gracefully
        session.state = 'welcome';
        await session.save();
        await sender.send(phone, fmt.getWelcomeMessage());
        break;
      }

      let reply;
      try {
        reply = await engine.chatResults(
          text, session.language, session.languageCode, session.matchResult
        );
      } catch (e) {
        console.error('[whatsapp/results] GPT error:', e.message);
        reply = fmt.getErrorMessage(session.languageCode);
      }

      await session.save();
      await sender.sendLong(phone, reply);
      break;
    }

    default: {
      session.state = 'welcome';
      await session.save();
      await sender.send(phone, fmt.getWelcomeMessage());
    }
  }
}

// ─── Express / Lambda entry point ─────────────────────────────────────────

// Returns TwiML immediately, processes async
async function incoming(req, res) {
  // Acknowledge immediately so Twilio doesn't retry
  res.type('text/xml').send('<Response></Response>');

  const {
    From: phone,
    Body: body,
    MessageSid: messageSid,
    NumMedia: numMedia,
    MediaUrl0: mediaUrl,
  } = req.body;

  if (!phone) return;

  // Process asynchronously (don't await — response already sent)
  processMessage({
    phone,
    body,
    mediaUrl,
    messageSid,
    numMedia: parseInt(numMedia || '0', 10),
  }).catch(e => console.error('[whatsapp] unhandled error:', e));
}

module.exports = { incoming, processMessage };
