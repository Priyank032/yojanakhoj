const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  role:    { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
}, { _id: false });

const WhatsAppSessionSchema = new mongoose.Schema({
  phone:         { type: String, required: true, unique: true, index: true },
  state:         { type: String, default: 'welcome', enum: ['welcome', 'language_selection', 'collecting', 'results'] },
  language:      { type: String, default: null },   // display name e.g. "हिंदी"
  languageCode:  { type: String, default: 'en' },   // BCP-47 e.g. "hi"
  messages:      [MessageSchema],                    // GPT conversation history
  profile:       { type: mongoose.Schema.Types.Mixed, default: {} },
  sessionId:     String,                             // links to Session model after matching
  matchResult:   { type: mongoose.Schema.Types.Mixed },
  processedSids: [String],                           // Twilio MessageSIDs already handled (dedup)
  expiresAt:     { type: Date, default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) },
}, { timestamps: true });

WhatsAppSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.models.WhatsAppSession || mongoose.model('WhatsAppSession', WhatsAppSessionSchema);
