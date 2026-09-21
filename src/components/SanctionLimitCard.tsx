import React, { useRef, useEffect } from 'react';
import type { SanctionLimitInfo } from '../types/calculator';
import { ShieldCheck, AlertTriangle, OctagonAlert, Landmark } from 'lucide-react';
import gsap from 'gsap';

interface SanctionLimitCardProps {
  limitInfo: SanctionLimitInfo;
  brand: string;
}

export const SanctionLimitCard: React.FC<SanctionLimitCardProps> = ({ limitInfo, brand }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLSpanElement>(null);

  const {
    sanctionLimit,
    currentStockValue,
    utilizationPct,
    status,
    badgeText,
    displayText,
  } = limitInfo;

  // Clamped for visual bar (0% to 125%)
  const clampedProgress = Math.min(Math.max(utilizationPct, 0), 125);
  // Scale bar where 100% limit is at 80% width of bar, allowing 20% width for over-limit visualization
  const barWidthPct = Math.min((clampedProgress / 125) * 100, 100);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Card entry
      if (cardRef.current) {
        gsap.fromTo(
          cardRef.current,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out', clearProps: 'opacity,transform' }
        );
      }

      // 2. Bar width tween
      if (barRef.current) {
        gsap.fromTo(
          barRef.current,
          { width: '0%' },
          { width: `${barWidthPct}%`, duration: 1.1, ease: 'power2.out', delay: 0.1 }
        );
      }

      // 3. Status badge pop
      if (badgeRef.current) {
        gsap.fromTo(
          badgeRef.current,
          { scale: 0.8, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(2)', delay: 0.15, clearProps: 'opacity,transform' }
        );
      }

      // 4. Stagger limit stat tiles
      gsap.fromTo(
        '.limit-stat-card',
        { y: 12, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.05, duration: 0.4, ease: 'power2.out', delay: 0.1, clearProps: 'opacity,transform' }
      );
    }, cardRef);

    return () => ctx.revert();
  }, [limitInfo]);

  const getStatusStyles = () => {
    switch (status) {
      case 'available':
        return {
          border: 'border-emerald-200',
          bg: 'bg-gradient-to-b from-emerald-50/40 via-white to-emerald-50/20',
          badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300 shadow-2xs',
          progressColor: 'bg-emerald-500',
          icon: <ShieldCheck className="w-4 h-4 text-emerald-600" />,
          statusHeadline: 'Within Approved Credit / Inventory Ceiling',
        };
      case 'near_limit':
        return {
          border: 'border-amber-200',
          bg: 'bg-gradient-to-b from-amber-50/40 via-white to-amber-50/20',
          badgeBg: 'bg-amber-100 text-amber-800 border-amber-300 shadow-2xs',
          progressColor: 'bg-amber-500',
          icon: <AlertTriangle className="w-4 h-4 text-amber-600" />,
          statusHeadline: 'Approaching Sanction Ceiling (≥90% Utilized)',
        };
      case 'exceeded':
        return {
          border: 'border-rose-200',
          bg: 'bg-gradient-to-b from-rose-50/40 via-white to-rose-50/20',
          badgeBg: 'bg-rose-100 text-rose-800 border-rose-300 shadow-2xs',
          progressColor: 'bg-rose-500',
          icon: <OctagonAlert className="w-4 h-4 text-rose-600" />,
          statusHeadline: 'Sanction Limit Breached — Action Required',
        };
    }
  };

  const style = getStatusStyles();

  return (
    <div
      ref={cardRef}
      className={`rounded-2xl border ${style.border} ${style.bg} p-5 sm:p-6 shadow-card transition-all`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 border-b border-slate-200/70 pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-white shadow-2xs border border-slate-200 text-blue-700">
            <Landmark className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Sanction Facility Utilization & Headroom
            </h3>
            <p className="text-xs sm:text-sm text-slate-800 font-bold mt-0.5">
              {brand} Credit Line: <span className="font-extrabold text-navy-900 font-mono">₹{sanctionLimit.toFixed(2)} Cr</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span
            ref={badgeRef}
            className={`text-xs font-black uppercase px-3 py-1 rounded-lg border tracking-wide flex items-center gap-1.5 ${style.badgeBg}`}
          >
            {style.icon}
            <span>{badgeText}</span>
          </span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-4 my-3">
        
        {/* 1. Sanction Limit */}
        <div className="limit-stat-card bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors">
          <span className="text-slate-500 block text-[11px] font-semibold uppercase tracking-wider">
            Approved Limit
          </span>
          <span className="text-xl sm:text-2xl font-black text-navy-900 mt-1 block font-mono">
            ₹{sanctionLimit.toFixed(2)} Cr
          </span>
          <span className="text-[10px] text-slate-500">Fixed commercial ceiling</span>
        </div>

        {/* 2. Current Stock Value */}
        <div className="limit-stat-card bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors">
          <span className="text-slate-500 block text-[11px] font-semibold uppercase tracking-wider">
            Current Stock Exposure
          </span>
          <span className="text-xl sm:text-2xl font-black text-navy-900 mt-1 block font-mono">
            ₹{currentStockValue.toFixed(2)} Cr
          </span>
          <span className="text-[10px] text-slate-500">Active on-hand inventory</span>
        </div>

        {/* 3. Utilization % */}
        <div className="limit-stat-card bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors">
          <span className="text-slate-500 block text-[11px] font-semibold uppercase tracking-wider">
            Facility Utilization
          </span>
          <span
            className={`text-xl sm:text-2xl font-black mt-1 block font-mono ${
              status === 'exceeded'
                ? 'text-rose-700'
                : status === 'near_limit'
                ? 'text-amber-700'
                : 'text-emerald-700'
            }`}
          >
            {utilizationPct.toFixed(2)}%
          </span>
          <span className="text-[10px] text-slate-500">Stock ÷ Sanction Limit</span>
        </div>

        {/* 4. Headroom / Excess Position */}
        <div className="limit-stat-card bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors">
          <span className="text-slate-500 block text-[11px] font-semibold uppercase tracking-wider">
            {status === 'exceeded' ? 'Excess Over Limit' : 'Available Headroom'}
          </span>
          <span
            className={`text-xl sm:text-2xl font-black mt-1 block font-mono ${
              status === 'exceeded' ? 'text-rose-700' : 'text-emerald-700'
            }`}
          >
            {displayText.split(': ')[1] || displayText}
          </span>
          <span className="text-[10px] text-slate-500">
            {status === 'exceeded' ? 'Actionable breach value' : 'Comfort buffer remaining'}
          </span>
        </div>

      </div>

      {/* Visual Utilization Bar */}
      <div className="mt-4 pt-3.5 border-t border-slate-200/70">
        <div className="flex items-center justify-between text-xs font-semibold mb-2">
          <span className="text-slate-600 font-medium">{style.statusHeadline}</span>
          <span className="text-navy-900 font-black font-mono">{utilizationPct.toFixed(1)}% Utilized</span>
        </div>

        <div className="relative h-4 w-full bg-slate-200/90 rounded-full overflow-hidden p-0.5 shadow-inner">
          {/* 100% threshold marker line */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-slate-700 z-10"
            style={{ left: '80%' }}
            title="100% Sanction Limit Threshold"
          ></div>

          <div
            ref={barRef}
            className={`h-full rounded-full shadow-xs ${style.progressColor}`}
            style={{ width: `${barWidthPct}%` }}
          ></div>
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2 font-medium">
          <span>0%</span>
          <span className="hidden sm:inline">50% Safe</span>
          <span className="text-amber-700 font-bold">90% (Caution)</span>
          <span className="text-navy-950 font-black">100% (Ceiling: ₹{sanctionLimit.toFixed(2)} Cr)</span>
          <span className="text-rose-700 font-bold">125%+ (Breached)</span>
        </div>
      </div>
    </div>
  );
};

