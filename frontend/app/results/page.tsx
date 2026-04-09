'use client';
import { useEffect, useRef, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, type MatchResult } from '@/lib/api';
import { formatINR } from '@/lib/utils';
import { useQuizStore } from '@/lib/store';
import { useT } from '@/lib/translations';

const categoryIcon: Record<string, string> = {
  farmer: '🌾', health: '🏥', housing: '🏠', woman: '👩', student: '📚',
  insurance: '🛡️', pension: '👴', loan: '💳', 'small-business': '🏪',
  employment: '⚒️', disabled: '♿', savings: '💰', default: '📋',
};

function getCategoryIcon(category: string[]): string {
  for (const c of category) {
    if (categoryIcon[c]) return categoryIcon[c];
  }
  return categoryIcon.default;
}

function ResultsContent() {
  const params = useSearchParams();
  const router = useRouter();
  const { language } = useQuizStore();
  const tr = useT(language);
  const sessionId = params.get('session');
  const [result, setResult] = useState<MatchResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);
  const [error, setError] = useState('');
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!sessionId) { router.push('/'); return; }
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    api.matchSchemes(sessionId).then(res => {
      setResult(res);
      setLoading(false);
    }).catch(e => {
      setError(e.message || 'Failed to match schemes. Please try again.');
      setLoading(false);
    });
  }, [sessionId, router]);

  const handleDownload = async () => {
    if (!sessionId) return;
    setReportLoading(true);
    try {
      const res = await api.generateReport(sessionId);
      const link = document.createElement('a');
      link.href = `data:application/pdf;base64,${res.reportData}`;
      link.download = res.filename;
      link.click();
    } catch { /* silent */ } finally {
      setReportLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
      <div className="w-14 h-14 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-gray-600 font-medium text-center">{tr.results_loading}</p>
      <p className="text-gray-400 text-sm">{tr.results_loading_sub}</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button onClick={() => router.push('/quiz')} className="bg-green-600 text-white px-6 py-3 rounded-xl font-semibold">
          {tr.results_retake}
        </button>
      </div>
    </div>
  );

  if (!result) return null;

  const definite = result.schemes.filter(s => s.matchType === 'definite');
  const likely = result.schemes.filter(s => s.matchType !== 'definite');

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* Summary Card */}
      <div className="bg-green-600 px-4 py-8 text-white">
        <div className="max-w-lg mx-auto text-center">
          <p className="text-green-100 text-sm mb-1">YojanaKhoj</p>
          <h1 className="text-3xl font-bold mb-2">
            🎯 {result.summary.totalMatched} {tr.results_found}
          </h1>
          <p className="text-green-100 text-lg mb-4">
            {tr.results_annual}: <span className="text-white font-bold">{formatINR(result.summary.totalValueINR)}</span>
          </p>
          <div className="flex justify-center gap-3">
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
              ✅ {result.summary.definiteCount} {tr.results_definite}
            </span>
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
              🔍 {result.summary.likelyCount} {tr.results_likely}
            </span>
          </div>
        </div>
      </div>

      {/* Scheme List */}
      <div className="max-w-lg mx-auto px-4 pt-6 space-y-6">
        {definite.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">{tr.results_definite}</h2>
            <div className="space-y-3">
              {definite.map(scheme => (
                <SchemeCard key={scheme.schemeId} scheme={scheme} sessionId={sessionId!} borderColor="border-green-500" viewLabel={tr.results_view} language={language} />
              ))}
            </div>
          </div>
        )}
        {likely.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">{tr.results_likely}</h2>
            <div className="space-y-3">
              {likely.map(scheme => (
                <SchemeCard key={scheme.schemeId} scheme={scheme} sessionId={sessionId!} borderColor="border-yellow-400" viewLabel={tr.results_view} language={language} />
              ))}
            </div>
          </div>
        )}

        {result.schemes.length === 0 && (
          <div className="text-center py-12">
            <p className="text-4xl mb-4">🤔</p>
            <p className="text-gray-600 font-medium">No matches found based on your profile.</p>
            <button onClick={() => router.push('/quiz')} className="mt-4 text-green-600 font-semibold underline">
              {tr.results_retake}
            </button>
          </div>
        )}
      </div>

      {/* Sticky Download Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-4">
        <div className="max-w-lg mx-auto flex gap-3">
          <button
            onClick={handleDownload}
            disabled={reportLoading}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-bold py-3.5 rounded-2xl transition-colors flex items-center justify-center gap-2"
          >
            {reportLoading
              ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />{tr.results_downloading}</>
              : `📄 ${tr.results_download}`}
          </button>
        </div>
      </div>
    </div>
  );
}

function SchemeCard({ scheme, sessionId, borderColor, viewLabel, language }: {
  scheme: MatchResult['schemes'][0];
  sessionId: string;
  borderColor: string;
  viewLabel: string;
  language: string;
}) {
  const name = language !== 'en' && scheme.nameHindi ? scheme.nameHindi : scheme.name;
  return (
    <Link href={`/schemes/${scheme.schemeId}?session=${sessionId}`}>
      <div className={`bg-white rounded-2xl border-l-4 ${borderColor} shadow-sm p-4 flex items-start gap-3 hover:shadow-md transition-shadow`}>
        <div className="text-3xl">{getCategoryIcon(scheme.category)}</div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 text-sm leading-snug">{name}</h3>
          <p className="text-gray-500 text-xs mt-1 line-clamp-2">{scheme.benefit.description}</p>
          <p className="text-green-600 font-bold text-sm mt-2">
            {scheme.benefit.amount > 0 ? formatINR(scheme.benefit.amount) + `/${scheme.benefit.frequency}` : 'Free Service'}
          </p>
        </div>
        <span className="text-gray-400 text-sm shrink-0 self-center">{viewLabel}</span>
      </div>
    </Link>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" /></div>}>
      <ResultsContent />
    </Suspense>
  );
}
