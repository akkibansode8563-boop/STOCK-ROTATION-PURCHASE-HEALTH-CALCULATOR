import React, { useRef, useEffect } from 'react';
import type { StockAlert, PurchaseAlert } from '../types/calculator';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  OctagonAlert,
  TrendingDown,
  TrendingUp,
  Equal,
  Info,
} from 'lucide-react';
import gsap from 'gsap';

interface AlertCardsProps {
  stockAlert: StockAlert;
  purchaseAlert: PurchaseAlert;
}

export const AlertCards: React.FC<AlertCardsProps> = ({ stockAlert, purchaseAlert }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.alert-card-left',
        { x: -20, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.5, ease: 'power3.out', clearProps: 'opacity,transform' }
      );
      gsap.fromTo(
        '.alert-card-right',
        { x: 20, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.5, ease: 'power3.out', clearProps: 'opacity,transform' }
      );
      gsap.fromTo(
        '.alert-badge-pop',
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.35, stagger: 0.08, ease: 'back.out(2)', delay: 0.1, clearProps: 'opacity,transform' }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [stockAlert, purchaseAlert]);

  const getStockAlertStyles = (level: StockAlert['level']) => {
    switch (level) {
      case 'healthy':
        return {
          border: 'border-emerald-200',
          bg: 'bg-gradient-to-br from-emerald-50/60 via-white to-emerald-50/30',
          badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300 shadow-2xs',
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
        };
      case 'moderate':
        return {
          border: 'border-amber-200',
          bg: 'bg-gradient-to-br from-amber-50/60 via-white to-amber-50/30',
          badgeBg: 'bg-amber-100 text-amber-800 border-amber-300 shadow-2xs',
          icon: <AlertCircle className="w-5 h-5 text-amber-600" />,
        };
      case 'high':
        return {
          border: 'border-orange-200',
          bg: 'bg-gradient-to-br from-orange-50/60 via-white to-orange-50/30',
          badgeBg: 'bg-orange-100 text-orange-800 border-orange-300 shadow-2xs',
          icon: <AlertTriangle className="w-5 h-5 text-orange-600" />,
        };
      case 'excess':
        return {
          border: 'border-rose-200',
          bg: 'bg-gradient-to-br from-rose-50/60 via-white to-rose-50/30',
          badgeBg: 'bg-rose-100 text-rose-800 border-rose-300 shadow-2xs',
          icon: <OctagonAlert className="w-5 h-5 text-rose-600" />,
        };
    }
  };

  const getPurchaseAlertStyles = (level: PurchaseAlert['level']) => {
    switch (level) {
      case 'positive':
        return {
          border: 'border-emerald-200',
          bg: 'bg-gradient-to-br from-emerald-50/60 via-white to-emerald-50/30',
          badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300 shadow-2xs',
          icon: <TrendingDown className="w-5 h-5 text-emerald-600" />,
        };
      case 'stable':
        return {
          border: 'border-amber-200',
          bg: 'bg-gradient-to-br from-amber-50/60 via-white to-amber-50/30',
          badgeBg: 'bg-amber-100 text-amber-800 border-amber-300 shadow-2xs',
          icon: <Equal className="w-5 h-5 text-amber-600" />,
        };
      case 'excessive':
        return {
          border: 'border-rose-200',
          bg: 'bg-gradient-to-br from-rose-50/60 via-white to-rose-50/30',
          badgeBg: 'bg-rose-100 text-rose-800 border-rose-300 shadow-2xs',
          icon: <TrendingUp className="w-5 h-5 text-rose-600" />,
        };
    }
  };

  const stockStyle = getStockAlertStyles(stockAlert.level);
  const purchaseStyle = getPurchaseAlertStyles(purchaseAlert.level);

  return (
    <div ref={containerRef} className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Executive Decision Alerts
        </h3>
        <span className="text-[11px] text-slate-500 flex items-center gap-1">
          <Info className="w-3.5 h-3.5 text-blue-500" />
          Alerts evaluate inventory coverage and procurement posture independently
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Card 1: Stock Alert */}
        <div
          className={`alert-card-left rounded-2xl border ${stockStyle.border} ${stockStyle.bg} p-5 shadow-card transition-all flex flex-col justify-between hover:shadow-lg`}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Stock Coverage Health
              </span>
              <span
                className={`alert-badge-pop text-[11px] font-black uppercase px-2.5 py-1 rounded-lg border tracking-wide ${stockStyle.badgeBg}`}
              >
                {stockAlert.badgeText}
              </span>
            </div>

            <div className="flex items-start gap-3.5 mt-2">
              <div className="p-2.5 rounded-xl bg-white shadow-2xs border border-slate-200/80 shrink-0">
                {stockStyle.icon}
              </div>
              <div>
                <h4 className="text-base font-extrabold text-navy-900 tracking-tight">
                  {stockAlert.title}
                </h4>
                <p className="text-xs sm:text-sm text-slate-700 mt-1 leading-relaxed">
                  {stockAlert.message}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200/60 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Coverage Benchmark</span>
            <span className="font-semibold text-slate-800">
              {stockAlert.level === 'healthy' && 'Coverage ≤ 30 Days (≤ 1 Month)'}
              {stockAlert.level === 'moderate' && '31 to 45 Days (1.0 – 1.5 Months)'}
              {stockAlert.level === 'high' && '46 to 75 Days (1.5 – 2.5 Months)'}
              {stockAlert.level === 'excess' && 'Coverage > 75 Days (> 2.5 Months)'}
            </span>
          </div>
        </div>

        {/* Card 2: Purchase Alert */}
        <div
          className={`alert-card-right rounded-2xl border ${purchaseStyle.border} ${purchaseStyle.bg} p-5 shadow-card transition-all flex flex-col justify-between hover:shadow-lg`}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Procurement Intake Discipline
              </span>
              <span
                className={`alert-badge-pop text-[11px] font-black uppercase px-2.5 py-1 rounded-lg border tracking-wide ${purchaseStyle.badgeBg}`}
              >
                {purchaseAlert.badgeText}
              </span>
            </div>

            <div className="flex items-start gap-3.5 mt-2">
              <div className="p-2.5 rounded-xl bg-white shadow-2xs border border-slate-200/80 shrink-0">
                {purchaseStyle.icon}
              </div>
              <div>
                <h4 className="text-base font-extrabold text-navy-900 tracking-tight">
                  {purchaseAlert.title}
                </h4>
                <p className="text-xs sm:text-sm text-slate-700 mt-1 leading-relaxed">
                  {purchaseAlert.message}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200/60 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Procurement Posture</span>
            <span className="font-semibold text-slate-800">
              {purchaseAlert.level === 'positive' && 'Inventory Reducing (Sales > Purchase)'}
              {purchaseAlert.level === 'stable' && 'Inventory Stable (Purchase ≈ Sales ±5%)'}
              {purchaseAlert.level === 'excessive' && 'Inventory Accumulating (Purchase > Sales)'}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
