const { randomUUID } = require('crypto');
const connectDB = require('../../shared/utils/db');
const Session = require('../../shared/models/Session');
const questions = require('../../shared/data/questions');
const { ok, err } = require('../../shared/utils/response');

const TOTAL_QUESTIONS = questions.length;

function formatQuestion(q, index) {
  return {
    questionId: q.questionId,
    text: q.text,
    textHindi: q.textHindi,
    type: q.type,
    options: q.options || null,
    placeholder: q.placeholder || null,
    min: q.min,
    max: q.max,
    progress: Math.round((index / TOTAL_QUESTIONS) * 100),
    questionNumber: index + 1,
    totalQuestions: TOTAL_QUESTIONS,
  };
}

function getNextQuestionId(currentQ, answer) {
  const next = currentQ.nextQuestion;
  if (!next) return null;
  return next[answer] || next['default'] || null;
}

// POST /quiz/start
async function start(event) {
  try {
    await connectDB();
    const sessionId = randomUUID();
    await Session.create({ sessionId, answers: [], currentQuestionIndex: 0 });
    const firstQ = questions[0];
    return ok({ sessionId, question: formatQuestion(firstQ, 0) });
  } catch (e) {
    console.error('quiz/start error:', e);
    return err('SERVER_ERROR', e.message, 500);
  }
}

// POST /quiz/answer
async function answer(event) {
  try {
    await connectDB();
    const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    const { sessionId, questionId, answer: userAnswer } = body;

    if (!sessionId || !questionId || userAnswer === undefined) {
      return err('INVALID_INPUT', 'sessionId, questionId, and answer are required');
    }

    const session = await Session.findOne({ sessionId });
    if (!session) return err('SESSION_NOT_FOUND', 'Session not found', 404);
    if (session.completed) return err('QUIZ_COMPLETE', 'Quiz already completed');

    // Save answer
    const existingIdx = session.answers.findIndex(a => a.questionId === questionId);
    if (existingIdx >= 0) {
      session.answers[existingIdx].answer = userAnswer;
    } else {
      session.answers.push({ questionId, answer: userAnswer });
    }

    // Find current question
    const currentQ = questions.find(q => q.questionId === questionId);
    if (!currentQ) return err('INVALID_INPUT', `Unknown questionId: ${questionId}`);

    // Determine next question
    const nextId = getNextQuestionId(currentQ, String(userAnswer));

    if (!nextId) {
      // Quiz complete — build profile
      session.completed = true;
      session.profile = buildProfile(session.answers);
      await session.save();
      return ok({ sessionId, done: true, totalQuestions: TOTAL_QUESTIONS });
    }

    const nextQ = questions.find(q => q.questionId === nextId);
    if (!nextQ) {
      session.completed = true;
      session.profile = buildProfile(session.answers);
      await session.save();
      return ok({ sessionId, done: true, totalQuestions: TOTAL_QUESTIONS });
    }

    const nextIndex = questions.findIndex(q => q.questionId === nextId);
    session.currentQuestionIndex = nextIndex;
    await session.save();

    return ok({ sessionId, done: false, question: formatQuestion(nextQ, nextIndex) });
  } catch (e) {
    console.error('quiz/answer error:', e);
    return err('SERVER_ERROR', e.message, 500);
  }
}

function buildProfile(answers) {
  const profile = {};
  const incomeMap = {
    '0_50000': 25000, '50000_100000': 75000,
    '100000_250000': 175000, '250000_500000': 375000, 'above_500000': 600000,
  };

  for (const { questionId, answer } of answers) {
    switch (questionId) {
      case 'q_state':            profile.state = answer; break;
      case 'q_age':              profile.age = Number(answer); break;
      case 'q_gender':           profile.gender = answer; break;
      case 'q_occupation':       profile.occupation = answer; break;
      case 'q_land_holding':     profile.landHolding = Number(answer); break;
      case 'q_education':        profile.education = answer; break;
      case 'q_income':           profile.annualIncome = incomeMap[answer] || 0; profile.incomeRange = answer; break;
      case 'q_family_size':      profile.familySize = Number(answer); break;
      case 'q_bpl':              profile.bplCard = answer; break;
      case 'q_disability':       profile.disability = answer; break;
      case 'q_caste':            profile.caste = answer; break;
      case 'q_employment_status': profile.employment_status = answer; break;
    }
  }
  return profile;
}

module.exports = { start, answer };
