import React, { useRef, useEffect } from 'react';
import { RotateCcw, Printer, Building2, ShieldCheck, Sparkles } from 'lucide-react';
import gsap from 'gsap';

interface HeaderProps {
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onReset }) => {
  const headerRef = useRef<HTMLElement>(null);
  const badgeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(headerRef.current, {
        y: -20,
        opacity: 0,
        duration: 0.6,
        ease: 'power3.out',
      });
      if (badgeRef.current) {
        gsap.fromTo(
          badgeRef.current,
          { scale: 0.9, opacity: 0.8 },
          { scale: 1, opacity: 1, duration: 1.5, repeat: -1, yoyo: true, ease: 'sine.inOut' }
        );
      }
    }, headerRef);

    return () => ctx.revert();
  }, []);

  return (
    <header
      ref={headerRef}
      className="border-b border-slate-200/80 bg-white/90 backdrop-blur-md shadow-xs sticky top-0 z-30 transition-all"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          
          {/* Brand & Title */}
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-navy-900 via-navy-800 to-blue-900 text-white flex items-center justify-center font-bold text-lg shadow-md shrink-0 ring-1 ring-white/20">
              <Building2 className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span
                  ref={badgeRef}
                  className="text-[10px] font-extrabold uppercase tracking-widest text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200/80 shadow-2xs inline-flex items-center gap-1"
                >
                  <Sparkles className="w-2.5 h-2.5 text-blue-500" />
                  Executive Decision Suite
                </span>
                <span className="text-[11px] font-medium text-slate-500 hidden sm:inline-flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  Commercial Sanction & Inventory Engine
                </span>
              </div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-black tracking-tight text-navy-900 mt-0.5">
                STOCK ROTATION & PURCHASE CALCULATOR
              </h1>
              <p className="text-xs text-slate-500 hidden sm:block">
                Precision inventory velocity, stock coverage days, and purchase rotation analysis.
              </p>
            </div>
          </div>

          {/* Executive Action Toolbar */}
          <div className="flex items-center gap-2 self-start md:self-center no-print">
            <button
              onClick={() => window.print()}
              type="button"
              className="group inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100/80 hover:bg-slate-200/80 active:bg-slate-300 rounded-lg border border-slate-300/80 transition-all shadow-xs cursor-pointer active:scale-95"
              title="Print executive report or save as PDF"
            >
              <Printer className="w-4 h-4 text-slate-500 group-hover:text-blue-700 transition-colors" />
              <span>Print Report</span>
            </button>

            <button
              onClick={onReset}
              type="button"
              className="group inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 active:bg-rose-100 rounded-lg border border-slate-300/80 transition-all shadow-xs cursor-pointer active:scale-95"
              title="Clear all fields"
            >
              <RotateCcw className="w-4 h-4 text-slate-500 group-hover:text-rose-600 group-hover:-rotate-90 transition-all" />
              <span>Reset</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
