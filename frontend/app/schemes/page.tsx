'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { formatINR } from '@/lib/utils';
import { useQuizStore } from '@/lib/store';
import { useT } from '@/lib/translations';

type Tab = 'what' | 'how' | 'docs';

function SchemeDetail() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const schemeId = searchParams.get('id') || '';
  const sessionId = searchParams.get('session') || undefined;

  const { language } = useQuizStore();
  const tr = useT(language);
  const [scheme, setScheme] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('what');
  const [checkedDocs, setCheckedDocs] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!schemeId) { router.push('/'); return; }
    api.getScheme(schemeId, sessionId).then(data => {
      setScheme(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [schemeId, sessionId, router]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!scheme) return (
    <div className="min-h-screen flex items-center justify-center px-4 text-center">
      <div>
        <p className="text-gray-500 mb-4">Scheme not found.</p>
        <button onClick={() => router.back()} className="text-green-600 font-semibold underline">Go Back</button>
      </div>
    </div>
  );

  const tabs: { id: Tab; label: string }[] = [
    { id: 'what', label: tr.tab_what },
    { id: 'how',  label: tr.tab_how  },
    { id: 'docs', label: tr.tab_docs },
  ];

  const toggleDoc = (name: string) => {
    setCheckedDocs(prev => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };

  const docList = scheme.personalised?.documentChecklist?.map((name: string) => ({ name, nameHindi: name, required: true, tip: '' })) || scheme.documents || [];

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* Header */}
      <div className="bg-white px-4 py-5 border-b border-gray-100">
        <div className="max-w-lg mx-auto">
          <button onClick={() => router.back()} className="text-green-600 font-semibold text-sm mb-4 flex items-center gap-1">
            {tr.back_results}
          </button>
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{scheme.ministry?.split(' ').slice(0, 3).join(' ')}</span>
              <h1 className="text-xl font-bold text-gray-900 mt-2 leading-snug">{scheme.name}</h1>
              <p className="text-gray-400 text-sm mt-0.5">{scheme.nameHindi}</p>
            </div>
          </div>
          {scheme.benefit?.amount > 0 && (
            <div className="mt-4 bg-green-50 rounded-2xl p-4">
              <p className="text-3xl font-bold text-green-600">{formatINR(scheme.benefit.amount)}</p>
              <p className="text-gray-600 text-sm mt-0.5">{scheme.benefit.frequency} benefit</p>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-100 sticky top-[61px] z-10">
        <div className="max-w-lg mx-auto flex">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-colors ${
                tab === t.id ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="max-w-lg mx-auto px-4 py-6">
        {tab === 'what' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-2">Benefit</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{scheme.benefit?.description}</p>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-2">Who Qualifies</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{scheme.eligibility?.plainText}</p>
              {scheme.eligibility?.plainTextHindi && (
                <p className="text-gray-400 text-sm leading-relaxed mt-3 border-t pt-3">{scheme.eligibility.plainTextHindi}</p>
              )}
            </div>
            {scheme.personalised?.tips?.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5">
                <h3 className="font-bold text-yellow-800 mb-2">💡 Tips for You</h3>
                <ul className="space-y-1">
                  {scheme.personalised.tips.map((tip: string, i: number) => (
                    <li key={i} className="text-yellow-800 text-sm">• {tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {tab === 'how' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <div className="flex gap-3 mb-4">
                {scheme.application?.mode?.map((m: string) => (
                  <span key={m} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium capitalize">{m}</span>
                ))}
              </div>
              <ol className="space-y-4">
                {(scheme.application?.steps || []).map((step: string, i: number) => (
                  <li key={i} className="flex gap-3">
                    <div className="w-7 h-7 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">{i + 1}</div>
                    <p className="text-gray-700 text-sm pt-0.5">{step}</p>
                  </li>
                ))}
              </ol>
            </div>
            {scheme.application?.office && (
              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-1 text-sm">📍 Where to Go</h3>
                <p className="text-gray-600 text-sm">{scheme.application.office}</p>
              </div>
            )}
            {scheme.personalised?.likelyApprovalTime && (
              <div className="bg-blue-50 rounded-2xl p-4">
                <p className="text-blue-800 text-sm font-medium">⏱ Estimated time: {scheme.personalised.likelyApprovalTime}</p>
              </div>
            )}
          </div>
        )}

        {tab === 'docs' && (
          <div className="space-y-3">
            <p className="text-sm text-gray-500 mb-4">Tap a document to mark it as collected.</p>
            {docList.map((doc: any) => (
              <button
                key={doc.name}
                onClick={() => toggleDoc(doc.name)}
                className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
                  checkedDocs.has(doc.name)
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                    checkedDocs.has(doc.name) ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300'
                  }`}>
                    {checkedDocs.has(doc.name) && <span className="text-xs">✓</span>}
                  </div>
                  <div>
                    <p className={`font-semibold text-sm ${checkedDocs.has(doc.name) ? 'text-green-800 line-through' : 'text-gray-900'}`}>{doc.name}</p>
                    {doc.nameHindi && doc.nameHindi !== doc.name && <p className="text-gray-400 text-xs mt-0.5">{doc.nameHindi}</p>}
                    {doc.tip && <p className="text-gray-500 text-xs mt-1">💡 {doc.tip}</p>}
                    {doc.required && <span className="text-xs text-red-500 font-medium">Required</span>}
                  </div>
                </div>
              </button>
            ))}
            <div className="bg-gray-100 rounded-2xl p-4 text-center mt-2">
              <p className="text-gray-600 font-semibold text-sm">
                {checkedDocs.size} / {docList.length} {tr.docs_collected}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Apply CTA */}
      {scheme.application?.portal && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-4">
          <div className="max-w-lg mx-auto">
            <a
              href={scheme.application.portal}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-colors"
            >
              {tr.apply_now} → <span className="text-green-200 text-sm">(Official Portal)</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SchemePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SchemeDetail />
    </Suspense>
  );
}
