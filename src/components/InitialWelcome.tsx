import React, { useRef, useEffect } from 'react';
import { BarChart3, ShieldCheck, ArrowUp, Calendar, Layers, Activity } from 'lucide-react';
import gsap from 'gsap';

export const InitialWelcome: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.welcome-card', {
        scale: 0.96,
        opacity: 0,
        duration: 0.7,
        ease: 'power3.out',
      });
      gsap.from('.welcome-step', {
        y: 20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.12,
        delay: 0.2,
        ease: 'power2.out',
      });
      gsap.to('.arrow-bounce', {
        y: -4,
        repeat: -1,
        yoyo: true,
        duration: 0.8,
        ease: 'sine.inOut',
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="welcome-card bg-white/95 rounded-2xl border border-slate-200/90 shadow-card p-6 sm:p-10 text-center max-w-4xl mx-auto backdrop-blur-sm">
      <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20 ring-4 ring-blue-50">
        <BarChart3 className="w-8 h-8" />
      </div>

      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-[11px] font-bold text-blue-800 uppercase tracking-wider mb-2">
        <Activity className="w-3.5 h-3.5 text-blue-600" />
        Executive Decision Suite Ready
      </div>

      <h3 className="text-xl sm:text-2xl font-black text-navy-900 tracking-tight">
        Hardware Inventory & Sanction Headroom Evaluation
      </h3>
      <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-xl mx-auto leading-relaxed">
        Select a brand or Overall Laptop Business, define your inclusive date range, enter Current Stock, Purchases, and Sales, then click <strong className="text-blue-700 font-bold">CALCULATE</strong> to generate precision rotation ratios, coverage days, and limit utilization.
      </p>

      {/* 3 Step Process Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 text-left">
        <div className="welcome-step p-4 sm:p-5 rounded-xl bg-gradient-to-b from-slate-50 to-white border border-slate-200/80 shadow-2xs hover:border-blue-300 transition-colors">
          <div className="w-8 h-8 rounded-lg bg-blue-100/80 text-blue-700 flex items-center justify-center mb-3 font-bold text-xs">
            <Calendar className="w-4 h-4" />
          </div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Step 1</div>
          <div className="font-extrabold text-navy-900 text-sm mt-0.5">Define Timeframe</div>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
            Set From Date and To Date. The engine computes total inclusive period days automatically.
          </p>
        </div>

        <div className="welcome-step p-4 sm:p-5 rounded-xl bg-gradient-to-b from-slate-50 to-white border border-slate-200/80 shadow-2xs hover:border-blue-300 transition-colors">
          <div className="w-8 h-8 rounded-lg bg-indigo-100/80 text-indigo-700 flex items-center justify-center mb-3 font-bold text-xs">
            <Layers className="w-4 h-4" />
          </div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Step 2</div>
          <div className="font-extrabold text-navy-900 text-sm mt-0.5">Input Direct Figures</div>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
            Enter actual Current Stock, Purchases During Period, and Sales During Period. No figures are assumed.
          </p>
        </div>

        <div className="welcome-step p-4 sm:p-5 rounded-xl bg-gradient-to-b from-slate-50 to-white border border-slate-200/80 shadow-2xs hover:border-blue-300 transition-colors">
          <div className="w-8 h-8 rounded-lg bg-emerald-100/80 text-emerald-700 flex items-center justify-center mb-3 font-bold text-xs">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Step 3</div>
          <div className="font-extrabold text-navy-900 text-sm mt-0.5">Executive Assessment</div>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
            Review Purchase Rotation (x), Coverage Days, Net Inventory Movement, and Sanction Limit Headroom.
          </p>
        </div>
      </div>

      {/* Prompt banner */}
      <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-center gap-2 text-xs font-semibold text-blue-800">
        <ArrowUp className="arrow-bounce w-4 h-4 text-blue-600" />
        <span>Enter your parameters in the panel above and click CALCULATE to begin</span>
      </div>
    </div>
  );
};
