'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { api, type Question } from '@/lib/api';
import { useQuizStore } from '@/lib/store';
import { useT } from '@/lib/translations';

export default function QuizPage() {
  const router = useRouter();
  const { language } = useQuizStore();
  const tr = useT(language);

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [selected, setSelected] = useState<string | number | null>(null);
  const [numberVal, setNumberVal] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    api.startQuiz().then(res => {
      setSessionId(res.sessionId);
      setQuestion(res.question);
      setLoading(false);
    }).catch(() => setError(tr.quiz_error));
  }, []);

  const handleNext = useCallback(async () => {
    if (!sessionId || !question) return;
    const answer = question.type === 'number' ? Number(numberVal) : selected;
    if (answer === null || answer === undefined || answer === '') return;

    setSubmitting(true);
    setDirection(1);
    try {
      const res = await api.submitAnswer(sessionId, question.questionId, answer as string | number);
      if (res.done) {
        router.push(`/results?session=${sessionId}`);
      } else if (res.question) {
        setSelected(null);
        setNumberVal('');
        setQuestion(res.question);
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [sessionId, question, selected, numberVal, router]);

  const canProceed = question?.type === 'number' ? numberVal !== '' : selected !== null;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500">{tr.quiz_loading}</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button onClick={() => window.location.reload()} className="bg-green-600 text-white px-6 py-3 rounded-xl font-semibold">
          {tr.quiz_try_again}
        </button>
      </div>
    </div>
  );

  if (!question) return null;

  const questionText = language === 'en' ? question.text : question.textHindi;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Progress */}
      <div className="bg-white px-4 py-3 border-b border-gray-100">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
            <span>Question {question.questionNumber} {tr.quiz_question_of} {question.totalQuestions}</span>
            <span>{question.progress}{tr.quiz_complete}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-green-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${question.progress}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 px-4 py-8 max-w-lg mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={question.questionId}
            initial={{ x: direction * 60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -direction * 60, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-2 leading-snug">{questionText || question.text}</h2>
            {language === 'en' && question.textHindi && (
              <p className="text-gray-400 text-base mb-8">{question.textHindi}</p>
            )}

            {/* Single choice */}
            {question.type === 'single_choice' && question.options && (
              <div className="space-y-3">
                {question.options.map(opt => (
                  <button
                    key={opt.value}
                    data-testid="option-card"
                    onClick={() => setSelected(opt.value)}
                    className={`w-full text-left px-5 py-4 rounded-2xl border-2 transition-all font-medium text-base ${
                      selected === opt.value
                        ? 'border-green-600 bg-green-50 text-green-800'
                        : 'border-gray-200 bg-white text-gray-800 hover:border-green-300'
                    }`}
                  >
                    <span>{language === 'en' ? opt.label : (opt.labelHindi || opt.label)}</span>
                    {language === 'en' && opt.labelHindi && (
                      <span className="block text-sm text-gray-400 font-normal mt-0.5">{opt.labelHindi}</span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Number input */}
            {question.type === 'number' && (
              <div className="flex flex-col items-center gap-4 mt-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setNumberVal(v => String(Math.max((question.min || 0), Number(v || 0) - 1)))}
                    className="w-14 h-14 bg-gray-200 rounded-full text-2xl font-bold hover:bg-gray-300 transition-colors"
                  >−</button>
                  <input
                    type="number"
                    value={numberVal}
                    onChange={e => setNumberVal(e.target.value)}
                    placeholder={question.placeholder || '0'}
                    min={question.min}
                    max={question.max}
                    className="w-32 text-center text-3xl font-bold border-2 border-gray-200 rounded-2xl py-3 focus:border-green-600 outline-none"
                  />
                  <button
                    onClick={() => setNumberVal(v => String(Math.min((question.max || 999), Number(v || 0) + 1)))}
                    className="w-14 h-14 bg-gray-200 rounded-full text-2xl font-bold hover:bg-gray-300 transition-colors"
                  >+</button>
                </div>
                <p className="text-gray-400 text-sm">{question.placeholder}</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Next Button */}
      <div className="sticky bottom-0 bg-white border-t border-gray-100 px-4 py-4">
        <div className="max-w-lg mx-auto">
          <button
            onClick={handleNext}
            disabled={!canProceed || submitting}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold text-lg py-4 rounded-2xl transition-colors flex items-center justify-center gap-2"
          >
            {submitting
              ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />{tr.quiz_submitting}</>
              : tr.quiz_next}
          </button>
        </div>
      </div>
    </div>
  );
}
