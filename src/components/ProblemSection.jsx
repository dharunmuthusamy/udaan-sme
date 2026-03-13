import React from 'react';

export default function ProblemSection() {
  const problems = [
    { 
      emoji: '📓', 
      label: 'Manual Registers', 
      desc: 'Important business data scattered across physical notebooks, prone to loss and impossible to search.' 
    },
    { 
      emoji: '💬', 
      label: 'WhatsApp Chaos', 
      desc: 'Orders, payments, and follow-ups buried in endless chat threads. Decisions based on guesswork.' 
    },
    { 
      emoji: '📊', 
      label: 'Spreadsheet Hell', 
      desc: 'Complex tables that are hard to maintain on mobile and don\'t provide real-time business health.' 
    },
  ];

  return (
    <section id="problem" className="bg-white py-24 sm:py-32 relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none opacity-[0.03]">
        <svg width="100%" height="100%" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 10L400 10M0 50L400 50M0 90L400 90M0 130L400 130M0 170L400 170M0 210L400 210M0 250L400 250" stroke="currentColor" fill="none" />
        </svg>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-block rounded-full bg-red-50 px-4 py-1.5 text-sm font-bold text-red-600 mb-6 tracking-wide uppercase">
            The Problem
          </span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-surface-900 leading-[1.1]">
            Most SMEs Still Run on <span className="text-red-500">Paper & WhatsApp</span>
          </h2>
          <p className="mt-8 text-lg sm:text-xl leading-relaxed text-surface-600 font-medium">
            Running a business doesn't have to be a mess of notebooks and chat threads. UDAAN-SME solves the core frustrations of growing businesses.
          </p>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          {problems.map((item) => (
            <div 
              key={item.label} 
              className="group rounded-[2.5rem] border border-red-100 bg-red-50/30 p-10 text-center transition-all hover:bg-red-50 hover:shadow-xl hover:shadow-red-500/5 hover:-translate-y-2"
            >
              <div className="mx-auto h-20 w-20 rounded-3xl bg-white flex items-center justify-center text-4xl shadow-sm group-hover:scale-110 transition-transform">
                {item.emoji}
              </div>
              <h3 className="mt-8 text-xl font-bold text-surface-900">{item.label}</h3>
              <p className="mt-4 text-base leading-relaxed text-surface-600 font-medium">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
