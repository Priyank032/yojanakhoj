const mongoose = require('mongoose');

const EligibilityRuleSchema = new mongoose.Schema({
  field: String,
  operator: { type: String, enum: ['eq', 'neq', 'lte', 'gte', 'gt', 'lt', 'includes'] },
  value: mongoose.Schema.Types.Mixed,
}, { _id: false });

const DocumentSchema = new mongoose.Schema({
  name: String,
  nameHindi: String,
  required: Boolean,
  tip: String,
}, { _id: false });

const SchemeSchema = new mongoose.Schema({
  schemeId:  { type: String, unique: true, required: true },
  name:      { type: String, required: true },
  nameHindi: String,
  ministry:  String,
  category:  [String],
  benefit: {
    type:        { type: String },
    amount:      Number,
    currency:    { type: String, default: 'INR' },
    frequency:   String,
    description: String,
  },
  eligibility: {
    rules:          [EligibilityRuleSchema],
    exclusions:     [String],
    plainText:      String,
    plainTextHindi: String,
  },
  application: {
    mode:       [String],
    portal:     String,
    office:     String,
    steps:      [String],
    stepsHindi: [String],
  },
  documents: [DocumentSchema],
  state:         { type: String, default: 'all' },
  status:        { type: String, enum: ['active', 'discontinued'], default: 'active' },
  lastVerified:  Date,
  metadata: {
    totalBeneficiaries: Number,
    popularityScore:    Number,
    successRate:        Number,
  },
}, { timestamps: true });

module.exports = mongoose.models.Scheme || mongoose.model('Scheme', SchemeSchema);
