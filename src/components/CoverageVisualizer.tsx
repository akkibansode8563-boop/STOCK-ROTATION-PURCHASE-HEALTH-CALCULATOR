import React, { useRef, useEffect } from 'react';
import { formatDays } from '../utils/formatters';
import gsap from 'gsap';

interface CoverageVisualizerProps {
  coverageDays: number | null;
}

export const CoverageVisualizer: React.FC<CoverageVisualizerProps> = ({ coverageDays }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const pointerRef = useRef<HTMLDivElement>(null);

  // If no sales, display neutral banner
  if (coverageDays === null) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-6 text-center text-slate-500 text-xs">
        Stock coverage spectrum unavailable because no sales were recorded during the period.
      </div>
    );
  }

  // Scale: 0 to 120 days
  // Zone 1: 0 - 30 days = 25%
  // Zone 2: 31 - 45 days = 12.5%
  // Zone 3: 46 - 75 days = 25%
  // Zone 4: > 75 days = 37.5%
  let positionPct = 0;
  if (coverageDays <= 30) {
    positionPct = (coverageDays / 30) * 25;
  } else if (coverageDays <= 45) {
    positionPct = 25 + ((coverageDays - 30) / 15) * 12.5;
  } else if (coverageDays <= 75) {
    positionPct = 37.5 + ((coverageDays - 45) / 30) * 25;
  } else {
    // 75 to 120+
    const excessProgress = Math.min((coverageDays - 75) / 45, 1);
    positionPct = 62.5 + excessProgress * 37.5;
  }

  // Clamp between 3% and 97% for aesthetics
  const safePosition = Math.min(Math.max(positionPct, 3), 97);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (pointerRef.current) {
        gsap.fromTo(
          pointerRef.current,
          { left: '0%' },
          {
            left: `${safePosition}%`,
            duration: 1.2,
            ease: 'elastic.out(1, 0.75)',
            delay: 0.15,
          }
        );
      }
      gsap.fromTo(
        '.spectrum-zone',
        { scaleX: 0 },
        {
          scaleX: 1,
          transformOrigin: 'left center',
          stagger: 0.08,
          duration: 0.6,
          ease: 'power2.out',
          clearProps: 'transform',
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [coverageDays, safePosition]);

  return (
    <div ref={containerRef} className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-5 sm:p-6 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-4 border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Current Stock Coverage Benchmark Spectrum (Days)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Evaluated against the corporate 30-day (1-month) inventory benchmark
          </p>
        </div>
        <div className="text-xs font-bold text-navy-900 bg-slate-100 px-3 py-1 rounded-full self-start sm:self-auto border border-slate-200 font-mono shadow-2xs">
          Coverage: <span className="font-black text-blue-700">{formatDays(coverageDays)}</span>
        </div>
      </div>

      {/* Spectrum Bar Container */}
      <div className="relative pt-7 pb-2 px-1">
        
        {/* Dynamic Current Position Pointer (Animated with GSAP) */}
        <div
          ref={pointerRef}
          className="absolute top-0 -translate-x-1/2 flex flex-col items-center z-20 pointer-events-none"
          style={{ left: `${safePosition}%` }}
        >
          <span className="text-[10px] font-black px-2.5 py-0.5 rounded-md bg-navy-950 text-white shadow-md whitespace-nowrap font-mono tracking-tight ring-1 ring-white/20">
            {formatDays(coverageDays)}
          </span>
          <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-navy-950"></div>
        </div>

        {/* The 4 Zones Bar */}
        <div className="h-4 w-full rounded-full overflow-hidden flex bg-slate-100 p-0.5 gap-0.5 shadow-inner">
          {/* Zone 1: 0 - 30 Days (Healthy) */}
          <div
            className="spectrum-zone h-full bg-emerald-500 rounded-l-full relative group transition-all"
            style={{ width: '25%' }}
            title="Healthy (≤ 30 Days)"
          ></div>

          {/* Zone 2: 31 - 45 Days (Moderate) */}
          <div
            className="spectrum-zone h-full bg-amber-400 relative group transition-all"
            style={{ width: '12.5%' }}
            title="Moderate (31 - 45 Days)"
          ></div>

          {/* Zone 3: 46 - 75 Days (High Stock) */}
          <div
            className="spectrum-zone h-full bg-orange-400 relative group transition-all"
            style={{ width: '25%' }}
            title="High Stock (46 - 75 Days)"
          ></div>

          {/* Zone 4: > 75 Days (Excess Stock) */}
          <div
            className="spectrum-zone h-full bg-rose-500 rounded-r-full relative group transition-all"
            style={{ width: '37.5%' }}
            title="Excess Stock (> 75 Days)"
          ></div>
        </div>

        {/* Legend / Tiers */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 text-[11px]">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50/70 border border-emerald-200/80">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></div>
            <div>
              <span className="font-bold text-emerald-950 block leading-tight">Healthy Zone</span>
              <span className="text-[10px] text-emerald-700">≤ 30 Days (≤ 1m)</span>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-50/70 border border-amber-200/80">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0"></div>
            <div>
              <span className="font-bold text-amber-950 block leading-tight">Moderate Zone</span>
              <span className="text-[10px] text-amber-700">31 to 45 Days (1–1.5m)</span>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 rounded-lg bg-orange-50/70 border border-orange-200/80">
            <div className="w-2.5 h-2.5 rounded-full bg-orange-400 shrink-0"></div>
            <div>
              <span className="font-bold text-orange-950 block leading-tight">High Stock Zone</span>
              <span className="text-[10px] text-orange-700">46 to 75 Days (1.5–2.5m)</span>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 rounded-lg bg-rose-50/70 border border-rose-200/80">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0"></div>
            <div>
              <span className="font-bold text-rose-950 block leading-tight">Excess Stock Zone</span>
              <span className="text-[10px] text-rose-700">&gt; 75 Days (&gt; 2.5m)</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
