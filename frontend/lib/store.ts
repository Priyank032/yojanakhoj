'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Question } from './api';
import type { LangCode } from './translations';

interface QuizStore {
  sessionId: string | null;
  currentQuestion: Question | null;
  isComplete: boolean;
  isLoading: boolean;
  language: LangCode;
  setSession: (id: string) => void;
  setQuestion: (q: Question) => void;
  setComplete: () => void;
  setLoading: (v: boolean) => void;
  setLanguage: (code: LangCode) => void;
  reset: () => void;
}

export const useQuizStore = create<QuizStore>()(
  persist(
    (set) => ({
      sessionId: null,
      currentQuestion: null,
      isComplete: false,
      isLoading: false,
      language: (typeof navigator !== 'undefined'
        ? (['hi','bn','te','mr','ta','kn','gu','pa','or'].find(c => navigator.language.startsWith(c)) as LangCode) || 'en'
        : 'en') as LangCode,
      setSession: (id) => set({ sessionId: id }),
      setQuestion: (q) => set({ currentQuestion: q }),
      setComplete: () => set({ isComplete: true }),
      setLoading: (v) => set({ isLoading: v }),
      setLanguage: (code) => set({ language: code }),
      reset: () => set({ sessionId: null, currentQuestion: null, isComplete: false, isLoading: false }),
    }),
    { name: 'yojanakhoj-lang', partialize: (s) => ({ language: s.language }) }
  )
);
