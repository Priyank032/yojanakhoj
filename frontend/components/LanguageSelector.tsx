'use client';
import { useState, useRef, useEffect } from 'react';
import { LANGUAGES, type LangCode } from '@/lib/translations';
import { useQuizStore } from '@/lib/store';

export default function LanguageSelector() {
  const { language, setLanguage } = useQuizStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = LANGUAGES.find(l => l.code === language) ?? LANGUAGES[0];

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 text-sm font-semibold border border-green-600 text-green-600 px-3 py-1.5 rounded-full hover:bg-green-50 transition-colors"
      >
        <span className="text-base">🌐</span>
        <span>{current.native}</span>
        <svg className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-50 overflow-hidden">
          {LANGUAGES.map(lang => (
            <button
              key={lang.code}
              onClick={() => { setLanguage(lang.code as LangCode); setOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between transition-colors ${
                language === lang.code
                  ? 'bg-green-50 text-green-700 font-semibold'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span>{lang.native}</span>
              {language === lang.code && (
                <svg className="w-4 h-4 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 13l4 4L19 7"/>
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
