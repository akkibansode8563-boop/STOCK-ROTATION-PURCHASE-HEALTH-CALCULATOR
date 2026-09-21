import React, { useRef, useEffect } from 'react';
import {
  type BrandName,
  ALL_BRANDS,
  SANCTION_LIMITS,
  type CalculationBasis,
  type CalculatorInputs as InputsType,
} from '../types/calculator';
import { calculatePeriodDays } from '../utils/calculatorEngine';
import {
  Calculator,
  RotateCcw,
  AlertTriangle,
  Layers,
  Tag,
  DollarSign,
  Calendar,
  Box,
  TrendingDown,
  TrendingUp,
  Landmark,
} from 'lucide-react';
import gsap from 'gsap';

interface CalculatorInputsProps {
  inputs: InputsType;
  onChange: (inputs: InputsType) => void;
  onCalculate: () => void;
  onReset: () => void;
  validationError: string | null;
}

export const CalculatorInputs: React.FC<CalculatorInputsProps> = ({
  inputs,
  onChange,
  onCalculate,
  onReset,
  validationError,
}) => {
  const formCardRef = useRef<HTMLDivElement>(null);
  const errorBannerRef = useRef<HTMLDivElement>(null);
  const calcBtnRef = useRef<HTMLButtonElement>(null);

  const sanctionLimit = SANCTION_LIMITS[inputs.brand];

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.input-row-1 > div', {
        y: 12,
        opacity: 0,
        stagger: 0.05,
        duration: 0.45,
        ease: 'power2.out',
      });
      gsap.from('.input-card-core', {
        y: 16,
        opacity: 0,
        stagger: 0.07,
        duration: 0.5,
        delay: 0.1,
        ease: 'power2.out',
      });
    }, formCardRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (validationError && errorBannerRef.current) {
      gsap.fromTo(
        errorBannerRef.current,
        { y: -10, opacity: 0, scale: 0.98 },
        { y: 0, opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(1.7)' }
      );
    }
  }, [validationError]);

  const handleBrandChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...inputs, brand: e.target.value as BrandName });
  };

  const handleBasisChange = (basis: CalculationBasis) => {
    onChange({ ...inputs, basis });
  };

  const handleDateChange = (field: 'fromDate' | 'toDate', value: string) => {
    onChange({ ...inputs, [field]: value });
  };

  const handleNumberChange = (
    field: 'currentStock' | 'purchase' | 'sales',
    value: string
  ) => {
    if (value === '') {
      onChange({ ...inputs, [field]: '' });
      return;
    }

    if (value.includes('-')) return;

    const parsed = parseFloat(value);
    if (!isNaN(parsed)) {
      onChange({ ...inputs, [field]: parsed });
    } else {
      onChange({ ...inputs, [field]: '' });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (calcBtnRef.current) {
      gsap.to(calcBtnRef.current, {
        scale: 0.96,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: 'power2.inOut',
      });
    }
    onCalculate();
  };

  const isValueMode = inputs.basis === 'value';
  const unitLabel = isValueMode ? '₹ in Crores (Cr)' : 'Units / Qty';
  const unitPrefix = isValueMode ? '₹' : '';
  const unitSuffix = isValueMode ? 'Cr' : 'Qty';

  const periodDays = calculatePeriodDays(inputs.fromDate, inputs.toDate);

  return (
    <div
      ref={formCardRef}
      className="bg-white/95 rounded-2xl border border-slate-200/90 shadow-card p-5 sm:p-7 transition-all backdrop-blur-sm"
    >
      <form onSubmit={handleSubmit}>
        {/* Header Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-5 border-b border-slate-100 gap-2.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-100 shadow-2xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-navy-900 tracking-tight">
                Period Inventory & Procurement Parameters
              </h2>
              <p className="text-xs text-slate-500">
                Input your date range, scope, on-hand stock and period flow figures
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Sanction Limit Pill */}
            <span className="text-xs font-bold px-3 py-1 bg-amber-50 text-amber-950 rounded-full border border-amber-200/90 flex items-center gap-1.5 shadow-2xs font-mono">
              <Landmark className="w-3.5 h-3.5 text-amber-700" />
              Ceiling: <strong className="text-amber-950 font-black">₹{sanctionLimit.toFixed(2)} Cr</strong>
            </span>

            {/* Analysis Period Pill */}
            <span className="text-xs font-bold px-3 py-1 bg-blue-50 text-blue-900 rounded-full border border-blue-200/80 flex items-center gap-1.5 shadow-2xs font-mono">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              {periodDays > 0 ? `${periodDays} Days Window` : 'Select Valid Dates'}
            </span>
          </div>
        </div>

        {/* Scope & Date Range (Row 1) */}
        <div className="input-row-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          
          {/* 1. Brand Name */}
          <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80 hover:border-slate-300 transition-colors">
            <label htmlFor="brand-select" className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              <span className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-blue-600" />
                Scope Selection
              </span>
              <span className="text-[10px] text-amber-800 font-extrabold font-mono">₹{sanctionLimit.toFixed(2)} Cr Limit</span>
            </label>
            <p className="text-[11px] text-slate-500 mb-2">OEM Brand or Overall Business</p>
            <select
              id="brand-select"
              value={inputs.brand}
              onChange={handleBrandChange}
              className="w-full bg-white text-navy-900 font-bold text-sm rounded-lg border border-slate-300 px-3 py-2 shadow-2xs focus:ring-2 focus:ring-blue-600 focus:border-blue-600 cursor-pointer"
            >
              {ALL_BRANDS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Calculation Basis */}
          <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80 hover:border-slate-300 transition-colors">
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              <DollarSign className="w-3.5 h-3.5 text-blue-600" />
              Evaluation Basis
            </span>
            <p className="text-[11px] text-slate-500 mb-2">Quantity or Value (₹ Cr)</p>
            <div className="grid grid-cols-2 gap-1 bg-slate-200/80 p-1 rounded-lg border border-slate-300/70">
              <button
                type="button"
                onClick={() => handleBasisChange('value')}
                className={`py-1.5 text-xs font-bold rounded-md transition-all flex items-center justify-center cursor-pointer ${
                  isValueMode ? 'bg-navy-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <span>Value (₹ Cr)</span>
              </button>
              <button
                type="button"
                onClick={() => handleBasisChange('quantity')}
                className={`py-1.5 text-xs font-bold rounded-md transition-all flex items-center justify-center cursor-pointer ${
                  !isValueMode ? 'bg-navy-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <span>Quantity</span>
              </button>
            </div>
          </div>

          {/* 3. From Date */}
          <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80 hover:border-slate-300 transition-colors">
            <label htmlFor="from-date" className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              From Date
            </label>
            <p className="text-[11px] text-slate-500 mb-2">Start of analysis period</p>
            <input
              id="from-date"
              type="date"
              value={inputs.fromDate}
              onChange={(e) => handleDateChange('fromDate', e.target.value)}
              className="w-full bg-white text-navy-900 font-bold text-sm rounded-lg border border-slate-300 px-3 py-1.5 shadow-2xs focus:ring-2 focus:ring-blue-600 focus:border-blue-600 cursor-pointer"
            />
          </div>

          {/* 4. To Date */}
          <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80 hover:border-slate-300 transition-colors">
            <label htmlFor="to-date" className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              To Date
            </label>
            <p className="text-[11px] text-slate-500 mb-2">End of period (inclusive)</p>
            <input
              id="to-date"
              type="date"
              value={inputs.toDate}
              min={inputs.fromDate}
              onChange={(e) => handleDateChange('toDate', e.target.value)}
              className="w-full bg-white text-navy-900 font-bold text-sm rounded-lg border border-slate-300 px-3 py-1.5 shadow-2xs focus:ring-2 focus:ring-blue-600 focus:border-blue-600 cursor-pointer"
            />
          </div>

        </div>

        {/* Scope Direct Input Advisory */}
        {inputs.brand === 'Overall Laptop Business' ? (
          <div className="mb-4 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-50 via-indigo-50/50 to-blue-50 border border-blue-200/90 text-xs text-blue-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="font-black uppercase text-[10px] bg-blue-700 text-white px-2 py-0.5 rounded shadow-2xs tracking-wider">
                Overall Business Mode
              </span>
              <span className="font-medium text-slate-700">
                Enter combined stock, purchases, and sales. <strong>Brand-wise metrics are never estimated or assumed</strong> without direct input for each respective brand.
              </span>
            </div>
            <span className="font-black text-blue-950 shrink-0 self-start sm:self-auto text-[11px] bg-white/90 border border-blue-200 px-2.5 py-0.5 rounded-md font-mono shadow-2xs">
              Portfolio Limit: ₹16.00 Cr
            </span>
          </div>
        ) : (
          <div className="mb-4 px-4 py-2 rounded-xl bg-slate-100/90 border border-slate-200 text-xs text-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="font-black uppercase text-[10px] bg-slate-800 text-white px-2 py-0.5 rounded tracking-wider">
                Brand Scope Active
              </span>
              <span>
                Enter actual figures for <strong>{inputs.brand}</strong>. Calculations are grounded strictly in the data provided.
              </span>
            </div>
            <span className="font-bold text-amber-900 shrink-0 self-start sm:self-auto text-[11px] font-mono">
              {inputs.brand} Facility: ₹{sanctionLimit.toFixed(2)} Cr
            </span>
          </div>
        )}

        {/* 3 Core Inventory Inputs (Row 2): Current Stock, Purchase During Period, Sales During Period */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Card 1: Current Stock */}
          <div className="input-card-core bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 hover:border-slate-300 transition-colors shadow-2xs">
            <label htmlFor="current-stock" className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              <span className="flex items-center gap-1.5">
                <Box className="w-3.5 h-3.5 text-blue-600" />
                Current Stock
              </span>
              <span className="text-[10px] text-blue-700 font-bold bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                {unitSuffix}
              </span>
            </label>
            <p className="text-[11px] text-slate-500 mb-2">
              Actual on-hand inventory for {inputs.brand}
            </p>
            <div className="relative">
              {unitPrefix && (
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm font-mono">
                  {unitPrefix}
                </span>
              )}
              <input
                id="current-stock"
                type="number"
                step={isValueMode ? '0.01' : '1'}
                min="0"
                placeholder={isValueMode ? 'e.g. 6.00' : 'e.g. 100'}
                value={inputs.currentStock}
                onChange={(e) => handleNumberChange('currentStock', e.target.value)}
                className={`w-full bg-white text-navy-900 font-black text-base rounded-lg border border-slate-300 py-2 shadow-2xs focus:ring-2 focus:ring-blue-600 focus:border-blue-600 font-mono ${
                  unitPrefix ? 'pl-7 pr-10' : 'pl-3 pr-10'
                }`}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400">
                {unitSuffix}
              </span>
            </div>
          </div>

          {/* Card 2: Purchase During Period */}
          <div className="input-card-core bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 hover:border-slate-300 transition-colors shadow-2xs">
            <label htmlFor="purchase-period" className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              <span className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                Purchase During Period
              </span>
              <span className="text-[10px] text-blue-700 font-bold bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                {unitSuffix}
              </span>
            </label>
            <p className="text-[11px] text-slate-500 mb-2">
              Procurement intake volume during period
            </p>
            <div className="relative">
              {unitPrefix && (
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm font-mono">
                  {unitPrefix}
                </span>
              )}
              <input
                id="purchase-period"
                type="number"
                step={isValueMode ? '0.01' : '1'}
                min="0"
                placeholder={isValueMode ? 'e.g. 3.00' : 'e.g. 100'}
                value={inputs.purchase}
                onChange={(e) => handleNumberChange('purchase', e.target.value)}
                className={`w-full bg-white text-navy-900 font-black text-base rounded-lg border border-slate-300 py-2 shadow-2xs focus:ring-2 focus:ring-blue-600 focus:border-blue-600 font-mono ${
                  unitPrefix ? 'pl-7 pr-10' : 'pl-3 pr-10'
                }`}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400">
                {unitSuffix}
              </span>
            </div>
          </div>

          {/* Card 3: Sales During Period */}
          <div className="input-card-core bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 hover:border-slate-300 transition-colors shadow-2xs">
            <label htmlFor="sales-period" className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              <span className="flex items-center gap-1.5">
                <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
                Sales During Period
              </span>
              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                {unitSuffix}
              </span>
            </label>
            <p className="text-[11px] text-slate-500 mb-2">
              Outward sales volume during period
            </p>
            <div className="relative">
              {unitPrefix && (
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm font-mono">
                  {unitPrefix}
                </span>
              )}
              <input
                id="sales-period"
                type="number"
                step={isValueMode ? '0.01' : '1'}
                min="0"
                placeholder={isValueMode ? 'e.g. 4.00' : 'e.g. 100'}
                value={inputs.sales}
                onChange={(e) => handleNumberChange('sales', e.target.value)}
                className={`w-full bg-white text-navy-900 font-black text-base rounded-lg border border-slate-300 py-2 shadow-2xs focus:ring-2 focus:ring-blue-600 focus:border-blue-600 font-mono ${
                  unitPrefix ? 'pl-7 pr-10' : 'pl-3 pr-10'
                }`}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400">
                {unitSuffix}
              </span>
            </div>
          </div>

        </div>

        {/* Validation Error Banner */}
        {validationError && (
          <div
            ref={errorBannerRef}
            className="mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-semibold flex items-center gap-2.5 shadow-sm"
          >
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Action Buttons Row */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 font-medium flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Active Unit: <strong className="font-bold text-navy-900">{unitLabel}</strong></span>
            <span className="text-slate-300">•</span>
            <span>Facility Ceiling: <strong className="font-bold text-amber-900 font-mono">₹{sanctionLimit.toFixed(2)} Cr</strong></span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onReset}
              className="w-1/2 sm:w-auto px-5 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-xl border border-slate-300 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
            >
              <RotateCcw className="w-4 h-4 text-slate-500" />
              <span>Reset</span>
            </button>
            <button
              ref={calcBtnRef}
              type="submit"
              className="w-1/2 sm:w-auto px-8 py-2.5 text-xs sm:text-sm font-black text-white bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-800 hover:from-blue-800 hover:to-indigo-900 active:scale-95 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer tracking-wide"
            >
              <Calculator className="w-4 h-4" />
              <span>CALCULATE</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

