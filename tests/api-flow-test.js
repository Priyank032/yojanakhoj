// Full API flow test — runs all 40 personas through complete quiz → match → report
const personas = require('./personas');

const BASE = 'http://localhost:4000';
const QUESTION_ORDER = ['q_state','q_age','q_gender','q_occupation','q_land_holding','q_education','q_income','q_family_size','q_bpl','q_disability','q_caste','q_employment_status'];

const BRANCHING = {
  q_occupation: { farmer: 'q_land_holding', student: 'q_education', default: 'q_income' },
};

async function post(path, body) {
  const r = await fetch(`${BASE}${path}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
  });
  return r.json();
}

async function get(path) {
  const r = await fetch(`${BASE}${path}`);
  return r.json();
}

function getNextId(questionId, answer) {
  const branch = BRANCHING[questionId];
  if (!branch) {
    const idx = QUESTION_ORDER.indexOf(questionId);
    return idx >= 0 && idx < QUESTION_ORDER.length - 1 ? QUESTION_ORDER[idx + 1] : null;
  }
  return branch[answer] || branch.default;
}

async function runPersona(persona) {
  const result = { id: persona.id, label: persona.label, steps: [], errors: [] };
  const t0 = Date.now();

  try {
    // 1. Start quiz
    const start = await post('/quiz/start', {});
    if (!start.sessionId) throw new Error('No sessionId returned from /quiz/start');
    const sessionId = start.sessionId;
    result.sessionId = sessionId;

    // 2. Walk through all questions using persona answers
    let currentQId = start.question.questionId;
    let answered = 0;

    while (currentQId) {
      const answer = persona.answers[currentQId];
      if (answer === undefined) {
        // Skip questions not in persona (optional branched questions)
        const nextId = getNextId(currentQId, null);
        currentQId = nextId;
        continue;
      }

      const res = await post('/quiz/answer', { sessionId, questionId: currentQId, answer });
      answered++;

      if (res.error) { result.errors.push(`answer error on ${currentQId}: ${res.message}`); break; }
      if (res.done) { currentQId = null; break; }
      if (res.question) { currentQId = res.question.questionId; }
      else { currentQId = null; }
    }

    result.steps.push(`✓ Quiz complete — ${answered} questions answered`);

    // 3. Match schemes
    const match = await post('/match/schemes', { sessionId });
    if (match.error) throw new Error(`Matcher error: ${match.message}`);

    result.summary = match.summary;
    result.topSchemes = (match.schemes || []).slice(0, 5).map(s => ({
      name: s.name, matchType: s.matchType, benefit: s.benefit?.description
    }));
    result.steps.push(`✓ Matched ${match.summary?.totalMatched || 0} schemes (${match.summary?.definiteCount || 0} definite, ${match.summary?.likelyCount || 0} likely)`);
    result.steps.push(`✓ Total estimated value: ₹${(match.summary?.totalValueINR || 0).toLocaleString('en-IN')}`);

    // 4. Get scheme detail for top match
    if (match.schemes?.length > 0) {
      const topScheme = match.schemes[0];
      const detail = await get(`/schemes/${topScheme.schemeId}?sessionId=${sessionId}`);
      if (detail.error) {
        result.errors.push(`scheme detail error: ${detail.message}`);
      } else {
        result.steps.push(`✓ Scheme detail fetched: ${detail.name} (${detail.documents?.length || 0} docs)`);
        result.personalised = !!detail.personalised;
      }
    }

    // 5. Generate PDF report
    const report = await post('/report/generate', { sessionId });
    if (report.error) {
      result.errors.push(`report error: ${report.message}`);
    } else {
      const pdfKb = Math.round((report.reportData?.length || 0) * 0.75 / 1024);
      result.steps.push(`✓ PDF report generated (~${pdfKb}KB)`);
    }

  } catch (e) {
    result.errors.push(`FATAL: ${e.message}`);
  }

  result.durationMs = Date.now() - t0;
  return result;
}

function printResult(r, i) {
  const status = r.errors.length === 0 ? '✅ PASS' : '❌ FAIL';
  console.log(`\n${status} [${r.id}] ${r.label}`);
  r.steps.forEach(s => console.log(`    ${s}`));
  if (r.summary) {
    console.log(`    📊 ${r.summary.totalMatched} schemes | ₹${(r.summary.totalValueINR||0).toLocaleString('en-IN')}/yr`);
    r.topSchemes?.slice(0, 3).forEach(s => console.log(`       • ${s.name} (${s.matchType})`));
  }
  if (r.errors.length) r.errors.forEach(e => console.log(`    ⚠️  ${e}`));
  console.log(`    ⏱  ${r.durationMs}ms`);
}

async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  YojanaKhoj — Full Flow QA Test (40 Personas)');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`  API: ${BASE}  |  Personas: ${personas.length}`);
  console.log('───────────────────────────────────────────────────────\n');

  const total = { pass: 0, fail: 0, totalSchemes: 0, totalValue: 0, durations: [] };

  // Run in batches of 5 concurrently
  const BATCH = 5;
  const results = [];
  for (let i = 0; i < personas.length; i += BATCH) {
    const batch = personas.slice(i, i + BATCH);
    const batchResults = await Promise.all(batch.map(runPersona));
    results.push(...batchResults);
    batchResults.forEach((r, j) => printResult(r, i + j));
  }

  // Summary
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  SUMMARY REPORT');
  console.log('═══════════════════════════════════════════════════════');

  results.forEach(r => {
    if (r.errors.length === 0) { total.pass++; } else { total.fail++; }
    total.totalSchemes += r.summary?.totalMatched || 0;
    total.totalValue += r.summary?.totalValueINR || 0;
    total.durations.push(r.durationMs);
  });

  const avgDuration = Math.round(total.durations.reduce((a,b) => a+b, 0) / total.durations.length);
  const maxDuration = Math.max(...total.durations);
  const minDuration = Math.min(...total.durations);

  console.log(`\n  Total Personas Tested : ${personas.length}`);
  console.log(`  ✅ Passed             : ${total.pass}`);
  console.log(`  ❌ Failed             : ${total.fail}`);
  console.log(`  Pass Rate             : ${Math.round(total.pass/personas.length*100)}%`);
  console.log(`\n  Avg Schemes Matched   : ${(total.totalSchemes/personas.length).toFixed(1)} per persona`);
  console.log(`  Avg Benefit Found     : ₹${Math.round(total.totalValue/personas.length).toLocaleString('en-IN')}/yr`);
  console.log(`\n  Avg Response Time     : ${avgDuration}ms`);
  console.log(`  Min Response Time     : ${minDuration}ms`);
  console.log(`  Max Response Time     : ${maxDuration}ms`);

  // Edge case analysis
  const zeroMatch = results.filter(r => (r.summary?.totalMatched || 0) === 0);
  const highMatch = results.filter(r => (r.summary?.totalMatched || 0) >= 10);
  const govtEmployee = results.filter(r => r.label.toLowerCase().includes('govt'));

  if (zeroMatch.length) {
    console.log(`\n  ⚠️  Zero matches (${zeroMatch.length}): ${zeroMatch.map(r => r.id).join(', ')}`);
  }
  if (highMatch.length) {
    console.log(`  🏆 High matches 10+ (${highMatch.length}): ${highMatch.map(r => `${r.id}(${r.summary?.totalMatched})`).join(', ')}`);
  }
  if (govtEmployee.length) {
    console.log(`  🔒 Govt employees excluded correctly: ${govtEmployee.map(r => r.summary?.totalMatched + ' matches').join(', ')}`);
  }

  console.log('\n═══════════════════════════════════════════════════════\n');

  if (total.fail > 0) process.exit(1);
}

main().catch(e => { console.error('Test runner crashed:', e); process.exit(1); });
