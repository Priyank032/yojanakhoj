// Transcribe WhatsApp voice notes (OGG format) using OpenAI Whisper
// Falls back gracefully if transcription fails

const OpenAI = require('openai');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const os = require('os');

let _openai;
function openai() {
  if (!_openai) _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return _openai;
}

// Map BCP-47 language codes to Whisper's accepted codes
const WHISPER_LANG_MAP = {
  hi: 'hi', te: 'te', mr: 'mr', ta: 'ta',
  bn: 'bn', kn: 'kn', gu: 'gu', pa: 'pa',
  or: null,  // Odia not well-supported by Whisper — let it auto-detect
  en: 'en',
};

async function transcribeVoice(mediaUrl, languageCode) {
  let tmpFile;
  try {
    const sid  = process.env.TWILIO_ACCOUNT_SID;
    const auth = process.env.TWILIO_AUTH_TOKEN;

    // Download the OGG/OPUS file from Twilio (requires auth)
    const response = await axios.get(mediaUrl, {
      auth: { username: sid, password: auth },
      responseType: 'arraybuffer',
      timeout: 15000,
    });

    tmpFile = path.join(os.tmpdir(), `wa_voice_${Date.now()}.ogg`);
    fs.writeFileSync(tmpFile, Buffer.from(response.data));

    const whisperLang = WHISPER_LANG_MAP[languageCode] ?? undefined;

    const transcription = await openai().audio.transcriptions.create({
      file: fs.createReadStream(tmpFile),
      model: 'whisper-1',
      ...(whisperLang ? { language: whisperLang } : {}),
    });

    return transcription.text?.trim() || null;
  } catch (e) {
    console.error('[voiceTranscribe] error:', e.message);
    return null;
  } finally {
    if (tmpFile && fs.existsSync(tmpFile)) {
      try { fs.unlinkSync(tmpFile); } catch {}
    }
  }
}

module.exports = { transcribeVoice };
