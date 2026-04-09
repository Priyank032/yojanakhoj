require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const connectDB = require('../utils/db');
const Scheme = require('../models/Scheme');
const schemes = require('./schemes');

async function seed() {
  await connectDB();
  await Scheme.deleteMany({});
  const result = await Scheme.insertMany(schemes);
  console.log(`✅ Seeded ${result.length} schemes successfully`);
  process.exit(0);
}

seed().catch(e => { console.error('Seed failed:', e); process.exit(1); });
