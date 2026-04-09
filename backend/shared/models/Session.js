const mongoose = require('mongoose');

const AnswerSchema = new mongoose.Schema({
  questionId: String,
  answer: mongoose.Schema.Types.Mixed,
}, { _id: false });

const MatchedSchemeSchema = new mongoose.Schema({
  schemeId:        String,
  confidenceScore: Number,
  matchType:       { type: String, enum: ['definite', 'likely', 'check'] },
  appliedStatus:   { type: String, default: 'not_applied' },
}, { _id: false });

const SessionSchema = new mongoose.Schema({
  sessionId:            { type: String, unique: true, required: true, index: true },
  answers:              [AnswerSchema],
  currentQuestionIndex: { type: Number, default: 0 },
  completed:            { type: Boolean, default: false },
  profile:              { type: mongoose.Schema.Types.Mixed, default: {} },
  matchedSchemes:       [MatchedSchemeSchema],
  matchResult:          { type: mongoose.Schema.Types.Mixed },
  reportUrl:            String,
  expiresAt:            { type: Date, default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
}, { timestamps: true });

SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.models.Session || mongoose.model('Session', SessionSchema);
