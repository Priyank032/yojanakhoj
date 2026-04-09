// Twilio WhatsApp sender — wraps REST API with message splitting

const twilio = require('twilio');

let _client;
function client() {
  if (!_client) {
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      throw new Error('TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN must be set in .env');
    }
    _client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  }
  return _client;
}

const FROM = () => `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`;
const toWA  = (phone) => phone.startsWith('whatsapp:') ? phone : `whatsapp:${phone}`;

// Send a single message (max ~4096 chars — WhatsApp hard limit)
async function send(phone, body) {
  return client().messages.create({ from: FROM(), to: toWA(phone), body });
}

// Split and send a long message in readable chunks (~1200 chars each)
// Splits on double newlines so we don't break mid-sentence
async function sendLong(phone, body) {
  const MAX = 1200;
  if (body.length <= MAX) return send(phone, body);

  const chunks = [];
  let current = '';

  for (const line of body.split('\n')) {
    if ((current + '\n' + line).length > MAX && current.length > 0) {
      chunks.push(current.trim());
      current = line;
    } else {
      current += (current ? '\n' : '') + line;
    }
  }
  if (current.trim()) chunks.push(current.trim());

  for (const chunk of chunks) {
    await send(phone, chunk);
    // Small delay so messages arrive in order
    await new Promise(r => setTimeout(r, 400));
  }
}

module.exports = { send, sendLong };
