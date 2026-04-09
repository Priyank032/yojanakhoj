'use client';
import Link from 'next/link';
import { useQuizStore } from '@/lib/store';
import { useT } from '@/lib/translations';

const WA_LINK = 'https://wa.me/14155238886?text=Hi';

const schemeTags = ['PM-KISAN', 'Ayushman Bharat', 'MGNREGA', 'PM Awas Yojana', 'PM Ujjwala', 'MUDRA Loan', 'Sukanya Samriddhi', 'Atal Pension'];

const WA_ICON = (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white shrink-0">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

export default function Home() {
  const { language } = useQuizStore();
  const tr = useT(language);

  const stats = [
    { value: '₹1.2L+', label: tr.stat_benefit },
    { value: '20+',    label: tr.stat_schemes },
    { value: '3 min',  label: tr.stat_time },
  ];

  const steps = [
    { num: '1', title: tr.step1_title, desc: tr.step1_desc },
    { num: '2', title: tr.step2_title, desc: tr.step2_desc },
    { num: '3', title: tr.step3_title, desc: tr.step3_desc },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-white px-4 py-12 md:py-20 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            {tr.badge}
          </div>

          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight mb-4">
            {tr.hero_heading.includes('scheme') || tr.hero_heading.includes('YojanaKhoj')
              ? <>{tr.hero_heading.split('you qualify for')[0]}<span className="text-green-600">you qualify for</span></>
              : <>{tr.hero_heading}</>
            }
          </h1>

          <p className="text-gray-500 text-lg mb-2">{tr.hero_sub}</p>
          <p className="text-gray-400 text-sm mb-8">{tr.hero_desc}</p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/quiz"
              className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold text-lg px-8 py-4 rounded-2xl transition-colors shadow-lg shadow-green-200"
            >
              {tr.cta_website} →
            </Link>
            <a
              href={WA_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bc59] text-white font-bold text-lg px-8 py-4 rounded-2xl transition-colors shadow-lg shadow-green-200"
            >
              {WA_ICON}
              {tr.cta_whatsapp}
            </a>
          </div>

          <p className="text-xs text-gray-400 mt-3">{tr.no_login}</p>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-green-600 px-4 py-8">
        <div className="max-w-2xl mx-auto grid grid-cols-3 gap-4">
          {stats.map((s) => (
            <div key={s.value} className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-white">{s.value}</div>
              <div className="text-green-100 text-xs md:text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Two ways section */}
      <section className="bg-white px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">{tr.choose_title}</h2>
          <p className="text-gray-500 text-center text-sm mb-8">{tr.choose_sub}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Website card */}
            <div className="border-2 border-green-100 rounded-2xl p-6 text-center hover:border-green-300 transition-colors">
              <div className="text-4xl mb-3">🌐</div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">{tr.website_card_title}</h3>
              <ul className="text-sm text-gray-500 space-y-1.5 text-left mb-5">
                {[tr.website_feat1, tr.website_feat2, tr.website_feat3, tr.website_feat4].map(f => (
                  <li key={f} className="flex gap-2"><span className="text-green-500">✓</span>{f}</li>
                ))}
              </ul>
              <Link href="/quiz" className="block w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm">
                {tr.website_btn}
              </Link>
            </div>

            {/* WhatsApp card */}
            <div className="border-2 border-[#25D366]/30 rounded-2xl p-6 text-center hover:border-[#25D366]/60 transition-colors relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#25D366] text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                {tr.wa_badge}
              </div>
              <div className="text-4xl mb-3">
                <svg viewBox="0 0 24 24" className="w-10 h-10 fill-[#25D366] mx-auto">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">{tr.wa_card_title}</h3>
              <ul className="text-sm text-gray-500 space-y-1.5 text-left mb-5">
                {[tr.wa_feat1, tr.wa_feat2, tr.wa_feat3, tr.wa_feat4].map(f => (
                  <li key={f} className="flex gap-2"><span className="text-green-500">✓</span>{f}</li>
                ))}
              </ul>
              <a href={WA_LINK} target="_blank" rel="noopener noreferrer"
                className="block w-full bg-[#25D366] hover:bg-[#20bc59] text-white font-semibold py-2.5 rounded-xl transition-colors text-sm">
                {tr.wa_btn}
              </a>
            </div>
          </div>

          {/* WhatsApp conversation preview */}
          <div className="mt-8 bg-[#0a1929] rounded-2xl p-4 max-w-sm mx-auto">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
              <div className="w-8 h-8 bg-[#25D366] rounded-full flex items-center justify-center text-sm">🇮🇳</div>
              <div>
                <div className="text-white text-sm font-semibold">YojanaKhoj</div>
                <div className="text-green-400 text-xs">● Online</div>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="bg-[#1a2d40] text-white rounded-2xl rounded-tl-none px-3 py-2 max-w-[85%]">
                नमस्ते! 🇮🇳 अपनी भाषा चुनें:<br/>1️⃣ हिंदी &nbsp; 2️⃣ English &nbsp; 3️⃣ తెలుగు...
              </div>
              <div className="bg-[#25D366] text-white rounded-2xl rounded-tr-none px-3 py-2 max-w-[60%] ml-auto">1</div>
              <div className="bg-[#1a2d40] text-white rounded-2xl rounded-tl-none px-3 py-2 max-w-[85%]">
                बढ़िया! 😊 आप किस राज्य में रहते हैं?
              </div>
              <div className="bg-[#25D366] text-white rounded-2xl rounded-tr-none px-3 py-2 max-w-[60%] ml-auto">🎤 voice note</div>
              <div className="bg-[#1a2d40] text-white rounded-2xl rounded-tl-none px-3 py-2 max-w-[85%]">
                🎯 <span className="font-semibold">8 योजनाएं मिलीं!</span><br/>
                *PM-KISAN* — ₹6,000/साल<br/>*Ayushman Bharat* — ₹5 लाख...
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">{tr.how_title}</h2>
          <div className="space-y-4">
            {steps.map((step) => (
              <div key={step.num} className="flex gap-4 bg-white p-5 rounded-2xl shadow-sm">
                <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-lg shrink-0">
                  {step.num}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{step.title}</h3>
                  <p className="text-gray-500 text-sm mt-1">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Scheme tags */}
      <section className="bg-white px-4 py-10 text-center">
        <div className="max-w-2xl mx-auto">
          <p className="text-gray-400 text-sm mb-4 font-medium uppercase tracking-wide">{tr.schemes_label}</p>
          <div className="flex flex-wrap justify-center gap-2">
            {schemeTags.map(tag => (
              <span key={tag} className="bg-gray-100 text-gray-700 text-sm px-3 py-1.5 rounded-full">{tag}</span>
            ))}
            <span className="bg-green-50 text-green-700 text-sm px-3 py-1.5 rounded-full font-medium">+ 12 more</span>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-green-600 px-4 py-12 text-center">
        <div className="max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-white mb-2">{tr.final_title}</h2>
          <p className="text-green-100 mb-6 text-sm">{tr.final_sub}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/quiz"
              className="inline-flex items-center justify-center gap-2 bg-white text-green-700 font-bold text-lg px-8 py-4 rounded-2xl hover:bg-green-50 transition-colors">
              {tr.final_btn}
            </Link>
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bc59] text-white font-bold text-lg px-8 py-4 rounded-2xl transition-colors">
              {WA_ICON} {tr.cta_whatsapp}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
