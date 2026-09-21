import React, { useRef, useEffect } from 'react';
import type { CalculationResult } from '../types/calculator';
import { formatPercentage, formatDailyRate, formatValue } from '../utils/formatters';
import {
  Repeat,
  CalendarDays,
  Calendar,
  Layers,
  Activity,
  Landmark,
} from 'lucide-react';
import gsap from 'gsap';

interface KpiGridProps {
  result: CalculationResult;
}

export const KpiGrid: React.FC<KpiGridProps> = ({ result }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rotNumberRef = useRef<HTMLSpanElement>(null);
  const covNumberRef = useRef<HTMLSpanElement>(null);
  const utilNumberRef = useRef<HTMLSpanElement>(null);

  // Secondary metrics counter refs
  const stockRotRef = useRef<HTMLSpanElement>(null);
  const purVsSalesRef = useRef<HTMLSpanElement>(null);
  const dailySalesRef = useRef<HTMLSpanElement>(null);
  const dailyPurchaseRef = useRef<HTMLSpanElement>(null);
  const stockValRef = useRef<HTMLSpanElement>(null);
  const salesValRef = useRef<HTMLSpanElement>(null);

  const {
    basis,
    fromDateFormatted,
    toDateFormatted,
    periodDays,
    purchaseRotation,
    purchaseRotationDisplay,
    currentStockCoverageDays,
    currentStockCoverageDisplay,
    sanctionLimitInfo,
    stockRotation,
    stockRotationDisplay,
    purchaseVsSalesPct,
    averageDailySales,
    averageDailyPurchase,
    currentStock,
    sales,
  } = result;

  const isExceeded = sanctionLimitInfo.status === 'exceeded';
  const isNear = sanctionLimitInfo.status === 'near_limit';

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Primary KPI Cards: Staggered fromTo animation with complete cleanup
      gsap.fromTo(
        '.kpi-card',
        {
          opacity: 0,
          y: 20,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.08,
          ease: 'power2.out',
          clearProps: 'opacity,transform',
        }
      );

      // 2. Dynamic Smooth Number Counter Tweens
      // A. Purchase Rotation Counter
      if (rotNumberRef.current && purchaseRotation !== null && purchaseRotation > 0) {
        const obj = { val: 0 };
        gsap.to(obj, {
          val: purchaseRotation,
          duration: 0.8,
          ease: 'power2.out',
          onUpdate: () => {
            if (rotNumberRef.current) {
              rotNumberRef.current.textContent = `${obj.val.toFixed(2)}x`;
            }
          },
        });
      }

      // B. Stock Coverage Days Counter
      if (covNumberRef.current && currentStockCoverageDays !== null && currentStockCoverageDays > 0) {
        const obj = { val: 0 };
        gsap.to(obj, {
          val: currentStockCoverageDays,
          duration: 0.8,
          ease: 'power2.out',
          onUpdate: () => {
            if (covNumberRef.current) {
              const rounded = Math.round(obj.val);
              covNumberRef.current.textContent = `${rounded} Days`;
            }
          },
        });
      }

      // C. Limit Utilization % Counter
      if (utilNumberRef.current && sanctionLimitInfo.utilizationPct > 0) {
        const obj = { val: 0 };
        gsap.to(obj, {
          val: sanctionLimitInfo.utilizationPct,
          duration: 0.8,
          ease: 'power2.out',
          onUpdate: () => {
            if (utilNumberRef.current) {
              utilNumberRef.current.textContent = `${obj.val.toFixed(1)}%`;
            }
          },
        });
      }

      // D. Secondary Metrics Count Animations
      if (stockRotRef.current && stockRotation !== null && stockRotation > 0) {
        const obj = { val: 0 };
        gsap.to(obj, {
          val: stockRotation,
          duration: 0.7,
          ease: 'power2.out',
          onUpdate: () => {
            if (stockRotRef.current) {
              stockRotRef.current.textContent = `${obj.val.toFixed(2)}x`;
            }
          },
        });
      }

      if (purVsSalesRef.current && purchaseVsSalesPct !== null && purchaseVsSalesPct > 0) {
        const obj = { val: 0 };
        gsap.to(obj, {
          val: purchaseVsSalesPct,
          duration: 0.7,
          ease: 'power2.out',
          onUpdate: () => {
            if (purVsSalesRef.current) {
              purVsSalesRef.current.textContent = `${obj.val.toFixed(2)}%`;
            }
          },
        });
      }

      if (dailySalesRef.current && averageDailySales > 0) {
        const obj = { val: 0 };
        gsap.to(obj, {
          val: averageDailySales,
          duration: 0.7,
          ease: 'power2.out',
          onUpdate: () => {
            if (dailySalesRef.current) {
              dailySalesRef.current.textContent = formatDailyRate(obj.val, basis);
            }
          },
        });
      }

      if (dailyPurchaseRef.current && averageDailyPurchase > 0) {
        const obj = { val: 0 };
        gsap.to(obj, {
          val: averageDailyPurchase,
          duration: 0.7,
          ease: 'power2.out',
          onUpdate: () => {
            if (dailyPurchaseRef.current) {
              dailyPurchaseRef.current.textContent = formatDailyRate(obj.val, basis);
            }
          },
        });
      }

      if (stockValRef.current && currentStock > 0) {
        const obj = { val: 0 };
        gsap.to(obj, {
          val: currentStock,
          duration: 0.7,
          ease: 'power2.out',
          onUpdate: () => {
            if (stockValRef.current) {
              stockValRef.current.textContent = formatValue(obj.val, basis);
            }
          },
        });
      }

      if (salesValRef.current && sales > 0) {
        const obj = { val: 0 };
        gsap.to(obj, {
          val: sales,
          duration: 0.7,
          ease: 'power2.out',
          onUpdate: () => {
            if (salesValRef.current) {
              salesValRef.current.textContent = formatValue(obj.val, basis);
            }
          },
        });
      }

      // 3. Stagger secondary strip elements
      gsap.fromTo(
        '.secondary-kpi-metric',
        { y: 8, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.03,
          duration: 0.4,
          delay: 0.1,
          ease: 'power2.out',
          clearProps: 'opacity,transform',
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [result]);

  return (
    <div ref={containerRef} className="space-y-4">
      {/* 1. Date Range & Period Banner (Analysis Window) */}
      <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-slate-900 text-white rounded-xl p-4 sm:px-6 sm:py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-sm border border-navy-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-400/30">
            <Calendar className="w-4 h-4 text-blue-400 shrink-0" />
          </div>
          <div className="text-xs sm:text-sm font-semibold tracking-wide">
            <span className="text-slate-400 uppercase font-bold text-[10px] mr-2 tracking-wider">Analysis Window:</span>
            <span className="text-white font-bold">{fromDateFormatted}</span>
            <span className="mx-2 text-blue-400">→</span>
            <span className="text-white font-bold">{toDateFormatted}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
            <Activity className="w-3.5 h-3.5 text-blue-400" />
            <span>{periodDays} Inclusive Days</span>
          </span>
        </div>
      </div>

      {/* 2. Three Primary KPI Cards (Purchase Rotation, Stock Coverage, Sanction Limit Utilization) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
        
        {/* KPI 1: PURCHASE ROTATION */}
        <div className="kpi-card bg-white rounded-xl border border-slate-200/90 shadow-card p-5 flex flex-col justify-between h-full min-h-[180px] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
          <div className="flex items-center justify-between h-6 gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5 shrink-0">
              <span className="p-1 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                <Repeat className="w-3.5 h-3.5" />
              </span>
              Purchase Rotation
            </span>
            <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 shrink-0">
              Sales ÷ Purchase
            </span>
          </div>

          <div className="my-3 flex-1 flex flex-col justify-center">
            <div className="text-2xl sm:text-3xl font-black text-navy-900 tracking-tight font-mono leading-none h-8 flex items-center">
              <span ref={rotNumberRef}>{purchaseRotationDisplay}</span>
            </div>
            <p className="text-xs font-semibold mt-1 text-slate-700 leading-normal h-5 flex items-center truncate">
              {result.purchase === 0
                ? 'No purchases in period'
                : purchaseRotation && purchaseRotation > 1.0
                ? 'Sales > Purchases'
                : purchaseRotation && purchaseRotation === 1.0
                ? 'Sales = Purchases'
                : 'Purchases > Sales'}
            </p>
          </div>

          <div className="pt-2.5 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between h-6 mt-auto">
            <span>Standard Baseline</span>
            <span className="font-mono text-slate-700 font-semibold">100 Pur + 100 Sal = 1.00x</span>
          </div>
        </div>

        {/* KPI 2: CURRENT STOCK COVERAGE (DAYS) */}
        <div className="kpi-card bg-white rounded-xl border border-slate-200/90 shadow-card p-5 flex flex-col justify-between h-full min-h-[180px] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
          <div className="flex items-center justify-between h-6 gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5 shrink-0">
              <span className="p-1 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                <CalendarDays className="w-3.5 h-3.5" />
              </span>
              Stock Coverage
            </span>
            <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 shrink-0">
              Stock ÷ Daily Run
            </span>
          </div>

          <div className="my-3 flex-1 flex flex-col justify-center">
            <div className="text-2xl sm:text-3xl font-black text-navy-900 tracking-tight font-mono leading-none h-8 flex items-center">
              <span ref={covNumberRef}>{currentStockCoverageDisplay}</span>
            </div>
            <p className="text-xs font-semibold mt-1 text-slate-700 leading-normal h-5 flex items-center truncate">
              Target ≤ 30 Days
            </p>
          </div>

          <div className="pt-2.5 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between h-6 mt-auto">
            <span>Direct Formula</span>
            <span className="font-mono text-slate-700 font-semibold">Stock ÷ (Sales ÷ {periodDays}d)</span>
          </div>
        </div>

        {/* KPI 3: SANCTION LIMIT UTILIZATION */}
        <div className="kpi-card bg-white rounded-xl border border-slate-200/90 shadow-card p-5 flex flex-col justify-between h-full min-h-[180px] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
          <div className="flex items-center justify-between h-6 gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5 shrink-0">
              <span className="p-1 rounded-md bg-amber-50 text-amber-700 border border-amber-100">
                <Landmark className="w-3.5 h-3.5" />
              </span>
              Limit Utilization
            </span>
            <span
              className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border tracking-wide shrink-0 ${
                isExceeded
                  ? 'bg-rose-50 text-rose-700 border-rose-200 shadow-2xs'
                  : isNear
                  ? 'bg-amber-50 text-amber-700 border-amber-200 shadow-2xs'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-2xs'
              }`}
            >
              {sanctionLimitInfo.badgeText}
            </span>
          </div>

          <div className="my-3 flex-1 flex flex-col justify-center">
            <div
              className={`text-2xl sm:text-3xl font-black tracking-tight font-mono leading-none h-8 flex items-center ${
                isExceeded ? 'text-rose-700' : isNear ? 'text-amber-700' : 'text-emerald-700'
              }`}
            >
              <span ref={utilNumberRef}>{sanctionLimitInfo.utilizationPct.toFixed(1)}%</span>
            </div>
            <p className="text-xs font-semibold mt-1 text-slate-700 leading-normal h-5 flex items-center truncate">
              {isExceeded
                ? `₹${sanctionLimitInfo.excessOverLimit.toFixed(2)} Cr Over Limit`
                : `₹${sanctionLimitInfo.availableLimit.toFixed(2)} Cr Available`}
            </p>
          </div>

          <div className="pt-2.5 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between h-6 mt-auto">
            <span>Approved Limit</span>
            <span className="font-mono text-slate-700 font-semibold">₹{sanctionLimitInfo.sanctionLimit.toFixed(2)} Cr</span>
          </div>
        </div>

      </div>

      {/* 3. Secondary Metrics Cards — 3 Cards matching the exact dimensions, height, and style of the top 3 KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
        
        {/* SECONDARY KPI 1: STOCK ROTATION */}
        <div className="kpi-card bg-white rounded-xl border border-slate-200/90 shadow-card p-5 flex flex-col justify-between h-full min-h-[180px] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
          <div className="flex items-center justify-between h-6 gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5 shrink-0">
              <span className="p-1 rounded-md bg-purple-50 text-purple-700 border border-purple-100">
                <Layers className="w-3.5 h-3.5" />
              </span>
              Stock Rotation
            </span>
            <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 shrink-0">
              Sales ÷ Stock
            </span>
          </div>

          <div className="my-3 flex-1 flex flex-col justify-center">
            <div className="text-2xl sm:text-3xl font-black text-navy-900 tracking-tight font-mono leading-none h-8 flex items-center">
              <span ref={stockRotRef}>{stockRotationDisplay}</span>
            </div>
            <p className="text-xs font-semibold mt-1 text-slate-700 leading-normal h-5 flex items-center truncate">
              Sales vs Current Stock
            </p>
          </div>

          <div className="pt-2.5 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between h-6 mt-auto">
            <span>Pur vs Sales %</span>
            <span ref={purVsSalesRef} className="font-mono text-slate-700 font-semibold">{formatPercentage(purchaseVsSalesPct)}</span>
          </div>
        </div>

        {/* SECONDARY KPI 2: DAILY SALES VELOCITY */}
        <div className="kpi-card bg-white rounded-xl border border-slate-200/90 shadow-card p-5 flex flex-col justify-between h-full min-h-[180px] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
          <div className="flex items-center justify-between h-6 gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5 shrink-0">
              <span className="p-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100">
                <Activity className="w-3.5 h-3.5" />
              </span>
              Daily Sales Velocity
            </span>
            <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 shrink-0">
              Sales ÷ {periodDays}d
            </span>
          </div>

          <div className="my-3 flex-1 flex flex-col justify-center">
            <div className="text-2xl sm:text-3xl font-black text-emerald-700 tracking-tight font-mono leading-none h-8 flex items-center">
              <span ref={dailySalesRef}>{formatDailyRate(averageDailySales, basis)}</span>
            </div>
            <p className="text-xs font-semibold mt-1 text-slate-700 leading-normal h-5 flex items-center truncate">
              Daily Average Outflow
            </p>
          </div>

          <div className="pt-2.5 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between h-6 mt-auto">
            <span>Daily Purchase Pace</span>
            <span ref={dailyPurchaseRef} className="font-mono text-slate-700 font-semibold">{formatDailyRate(averageDailyPurchase, basis)}</span>
          </div>
        </div>

        {/* SECONDARY KPI 3: CURRENT STOCK POSITION */}
        <div className="kpi-card bg-white rounded-xl border border-slate-200/90 shadow-card p-5 flex flex-col justify-between h-full min-h-[180px] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
          <div className="flex items-center justify-between h-6 gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5 shrink-0">
              <span className="p-1 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                <Landmark className="w-3.5 h-3.5" />
              </span>
              Current Stock Position
            </span>
            <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 shrink-0">
              On-Hand
            </span>
          </div>

          <div className="my-3 flex-1 flex flex-col justify-center">
            <div className="text-2xl sm:text-3xl font-black text-navy-900 tracking-tight font-mono leading-none h-8 flex items-center">
              <span ref={stockValRef}>{formatValue(currentStock, basis)}</span>
            </div>
            <p className="text-xs font-semibold mt-1 text-slate-700 leading-normal h-5 flex items-center truncate">
              Active On-Hand Inventory
            </p>
          </div>

          <div className="pt-2.5 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between h-6 mt-auto">
            <span>Period Sales Outflow</span>
            <span ref={salesValRef} className="font-mono text-slate-700 font-semibold">{formatValue(sales, basis)}</span>
          </div>
        </div>

      </div>
    </div>
  );
};

