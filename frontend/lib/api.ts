const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

async function post<T>(path: string, body: object): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

export interface Question {
  questionId: string;
  text: string;
  textHindi: string;
  type: 'single_choice' | 'number' | 'boolean';
  options?: { value: string; label: string; labelHindi: string }[];
  placeholder?: string;
  min?: number;
  max?: number;
  progress: number;
  questionNumber: number;
  totalQuestions: number;
}

export interface Scheme {
  schemeId: string;
  name: string;
  nameHindi: string;
  category: string[];
  matchType: 'definite' | 'likely' | 'check';
  confidenceScore: number;
  benefit: { type: string; amount: number; currency: string; frequency: string; description: string };
  ministry: string;
  tags: string[];
}

export interface MatchResult {
  sessionId: string;
  summary: { totalMatched: number; definiteCount: number; likelyCount: number; totalValueINR: number };
  schemes: Scheme[];
}

export const api = {
  startQuiz: () => post<{ sessionId: string; question: Question }>('/quiz/start', {}),

  submitAnswer: (sessionId: string, questionId: string, answer: string | number) =>
    post<{ sessionId: string; done: boolean; question?: Question }>('/quiz/answer', { sessionId, questionId, answer }),

  matchSchemes: (sessionId: string) =>
    post<MatchResult>('/match/schemes', { sessionId }),

  getScheme: (schemeId: string, sessionId?: string) =>
    get<any>(`/schemes/${schemeId}${sessionId ? `?sessionId=${sessionId}` : ''}`),

  generateReport: (sessionId: string) =>
    post<{ reportData: string; filename: string }>('/report/generate', { sessionId }),
};
