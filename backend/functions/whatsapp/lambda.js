/**
 * Lambda entry point for WhatsApp webhook.
 * Twilio needs a <Response/> back in < 5s.
 * Processing is async — we return immediately then process.
 */
const { processMessage } = require('./handler');

// Parse URL-encoded body (Twilio sends application/x-www-form-urlencoded)
function parseBody(body, isBase64) {
  const decoded = isBase64 ? Buffer.from(body, 'base64').toString('utf8') : (body || '');
  const params = new URLSearchParams(decoded);
  const obj = {};
  for (const [k, v] of params.entries()) obj[k] = v;
  return obj;
}

exports.handler = async (event) => {
  // Return TwiML immediately
  const response = {
    statusCode: 200,
    headers: { 'Content-Type': 'text/xml' },
    body: '<Response></Response>',
  };

  try {
    const body = parseBody(event.body, event.isBase64Encoded);
    const { From: phone, Body: msgBody, MessageSid, NumMedia, MediaUrl0 } = body;

    if (phone) {
      // Fire and forget — Lambda stays warm long enough for async work
      processMessage({
        phone,
        body: msgBody,
        mediaUrl: MediaUrl0,
        messageSid: MessageSid,
        numMedia: parseInt(NumMedia || '0', 10),
      }).catch(e => console.error('[whatsapp/lambda] error:', e));
    }
  } catch (e) {
    console.error('[whatsapp/lambda] parse error:', e);
  }

  return response;
};
