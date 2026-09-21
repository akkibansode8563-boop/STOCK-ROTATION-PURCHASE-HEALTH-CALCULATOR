import React, { useState, useRef, useEffect } from 'react';
import type { CalculationResult } from '../types/calculator';
import { Lightbulb, Copy, Check, ShieldAlert, ArrowRightCircle, Sparkles } from 'lucide-react';
import gsap from 'gsap';

interface BusinessInsightCardProps {
  result: CalculationResult;
}

export const BusinessInsightCard: React.FC<BusinessInsightCardProps> = ({ result }) => {
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const {
    businessInsight,
    brand,
    basis,
    fromDateFormatted,
    toDateFormatted,
    periodDays,
    stockAlert,
    purchaseAlert,
    netMovement,
  } = result;

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (cardRef.current) {
        gsap.fromTo(
          cardRef.current,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out', clearProps: 'opacity,transform' }
        );
      }
      gsap.fromTo(
        '.insight-quote',
        { opacity: 0, x: -15 },
        { opacity: 1, x: 0, duration: 0.5, delay: 0.15, ease: 'power2.out', clearProps: 'opacity,transform' }
      );
      gsap.fromTo(
        '.guidance-tile',
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.08, delay: 0.2, ease: 'power2.out', clearProps: 'opacity,transform' }
      );
    }, cardRef);

    return () => ctx.revert();
  }, [result]);

  const handleCopy = () => {
    navigator.clipboard.writeText(
      `[${brand} • ${basis.toUpperCase()} MODE • ${fromDateFormatted} to ${toDateFormatted} (${periodDays} Days)]\nStock & Purchase Health Insight:\n${businessInsight}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isHighOrExcess = stockAlert.level === 'high' || stockAlert.level === 'excess';
  const isAccumulating = purchaseAlert.level === 'excessive';

  return (
    <div
      ref={cardRef}
      className="bg-gradient-to-br from-navy-950 via-navy-900 to-slate-900 text-white rounded-2xl shadow-xl overflow-hidden border border-navy-800/90 transition-all"
    >
      {/* Top Banner */}
      <div className="px-6 py-4 bg-navy-950/80 border-b border-navy-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-400/30 shadow-inner">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold tracking-wider uppercase text-blue-300">
                Executive Synthesis & Directives
              </h3>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                Cross-Correlated
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Period Assessment: {fromDateFormatted} to {toDateFormatted} ({periodDays} Days) • {brand} ({basis === 'value' ? 'Value ₹ Cr' : 'Quantity'})
            </p>
          </div>
        </div>

        <button
          onClick={handleCopy}
          type="button"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 active:bg-white/30 text-xs font-semibold text-slate-200 transition-all border border-white/10 self-start sm:self-auto cursor-pointer no-print active:scale-95 shadow-sm"
          title="Copy management statement"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-300 font-bold">Copied to Clipboard</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-slate-300" />
              <span>Copy Insight</span>
            </>
          )}
        </button>
      </div>

      {/* Main Statement Box */}
      <div className="p-6 sm:p-8">
        <div className="insight-quote relative pl-5 border-l-4 border-blue-500 bg-blue-950/20 py-3 pr-4 rounded-r-xl">
          <p className="text-base sm:text-lg font-medium leading-relaxed text-slate-100 italic">
            "{businessInsight}"
          </p>
        </div>

        {/* Strategic Guidance Grid */}
        <div className="mt-6 pt-5 border-t border-navy-800/80 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          
          <div className="guidance-tile bg-navy-950/60 p-4 rounded-xl border border-navy-800/90 flex items-start gap-3 shadow-sm hover:border-navy-700 transition-colors">
            <ArrowRightCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-200 block mb-1 uppercase tracking-wider text-[11px]">
                Inventory Position & Coverage
              </span>
              <span className="text-slate-300 leading-relaxed block">
                {stockAlert.level === 'excess'
                  ? 'Critical inventory overhang (>75 Days coverage). Prioritize stock clearance and liquidation programs.'
                  : stockAlert.level === 'high'
                  ? 'Elevated stock level (46–75 Days coverage). Review future PO commitments against monthly demand.'
                  : stockAlert.level === 'moderate'
                  ? 'Manageable inventory buffer (31–45 Days). Maintain standard buffer monitoring.'
                  : 'Healthy and lean stock coverage (≤30 Days). Aligned with preferred 1-month rotation benchmark.'}
              </span>
            </div>
          </div>

          <div className="guidance-tile bg-navy-950/60 p-4 rounded-xl border border-navy-800/90 flex items-start gap-3 shadow-sm hover:border-navy-700 transition-colors">
            <ShieldAlert
              className={`w-4 h-4 shrink-0 mt-0.5 ${
                isHighOrExcess && isAccumulating ? 'text-rose-400' : 'text-emerald-400'
              }`}
            />
            <div>
              <span className="font-bold text-slate-200 block mb-1 uppercase tracking-wider text-[11px]">
                Procurement & Flow Directive
              </span>
              <span className="text-slate-300 leading-relaxed block">
                {netMovement.type === 'reducing'
                  ? 'Purchases are lower than sales velocity, generating active inventory reduction.'
                  : netMovement.type === 'stable'
                  ? 'Procurement intake is pegged to sales velocity. Maintains neutral inventory balance.'
                  : 'Purchases are exceeding sales velocity. Continued purchasing at this rate will compound inventory accumulation.'}
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
