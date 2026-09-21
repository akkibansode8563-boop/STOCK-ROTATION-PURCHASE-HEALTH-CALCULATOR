import React, { useRef, useEffect } from 'react';
import type { BrandBreakdownRow, CalculationBasis } from '../types/calculator';
import { formatNumber, formatDays } from '../utils/formatters';
import { Table, TrendingDown, TrendingUp, Minus, AlertCircle, ArrowRight } from 'lucide-react';
import gsap from 'gsap';

interface BrandBreakdownTableProps {
  rows: BrandBreakdownRow[];
  basis: CalculationBasis;
  onSelectBrand?: (brand: string) => void;
}

export const BrandBreakdownTable: React.FC<BrandBreakdownTableProps> = ({
  rows,
  basis,
  onSelectBrand,
}) => {
  const tableRef = useRef<HTMLDivElement>(null);

  const isValue = basis === 'value';
  const unitPrefix = isValue ? '₹' : '';
  const unitSuffix = isValue ? ' Cr' : ' Qty';

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.brand-breakdown-row', {
        y: 12,
        opacity: 0,
        stagger: 0.05,
        duration: 0.45,
        ease: 'power2.out',
      });
      gsap.from('.brand-footer-row', {
        opacity: 0,
        y: 10,
        duration: 0.4,
        delay: 0.25,
        ease: 'power2.out',
      });
    }, tableRef);

    return () => ctx.revert();
  }, [rows]);

  // Compute totals only from brands where data has actually been entered
  const enteredRows = rows.filter((r) => r.hasData);
  const totalLimit = rows.reduce((acc, r) => acc + r.sanctionLimit, 0); // Always ₹16.00 Cr
  const totalStockEntered = enteredRows.reduce((acc, r) => acc + (r.currentStock ?? 0), 0);
  const totalPurchaseEntered = enteredRows.reduce((acc, r) => acc + (r.purchase ?? 0), 0);
  const totalSalesEntered = enteredRows.reduce((acc, r) => acc + (r.sales ?? 0), 0);
  const totalNetEntered = totalPurchaseEntered - totalSalesEntered;
  const overallUtilEntered = totalLimit > 0 ? (totalStockEntered / totalLimit) * 100 : 0;

  return (
    <div ref={tableRef} className="bg-white rounded-2xl border border-slate-200/90 shadow-card overflow-hidden">
      {/* Table Header Strip */}
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Table className="w-4 h-4 text-blue-700" />
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-navy-900">
              Brand-Wise Inventory & Sanction Allocation Matrix
            </h3>
            <p className="text-xs text-slate-500">
              Approved Portfolio Ceiling: ₹16.00 Cr across 5 OEM hardware brands
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded bg-blue-50 text-blue-800 border border-blue-200 self-start sm:self-auto">
          {enteredRows.length} of 5 Brands Entered
        </span>
      </div>

      {/* Corporate Policy Notice: No Automated Estimation */}
      <div className="bg-amber-50/70 border-b border-amber-200/70 px-6 py-3 text-xs text-amber-900 flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="font-semibold">Direct Data Input Requirement:</strong> Brand-wise stock, purchases, and sales are <strong>never automatically estimated or assumed</strong> from overall business totals. To assess an individual brand, select it from the scope selector or click on the row below to input its specific figures.
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100/80 text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
              <th className="py-3 px-4">Brand</th>
              <th className="py-3 px-4 text-right">Sanction Limit</th>
              <th className="py-3 px-4 text-right">Current Stock</th>
              <th className="py-3 px-4 text-center">Utilization %</th>
              <th className="py-3 px-4 text-center">Limit Status</th>
              <th className="py-3 px-4 text-right">Headroom / Excess</th>
              <th className="py-3 px-4 text-right">Period Purchase</th>
              <th className="py-3 px-4 text-right">Period Sales</th>
              <th className="py-3 px-4 text-right">Net Movement</th>
              <th className="py-3 px-4 text-right">Coverage Days</th>
              <th className="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {rows.map((row) => {
              const isExceeded = row.limitStatus === 'exceeded';
              const isNear = row.limitStatus === 'near_limit';
              const isNotEntered = row.limitStatus === 'not_entered' || !row.hasData;

              return (
                <tr
                  key={row.brand}
                  onClick={() => onSelectBrand?.(row.brand)}
                  className="brand-breakdown-row hover:bg-blue-50/50 transition-colors cursor-pointer group"
                >
                  {/* Brand */}
                  <td className="py-3.5 px-4 font-bold text-navy-900 text-sm">
                    <div className="flex items-center gap-1.5">
                      <span className="group-hover:text-blue-700 transition-colors">{row.brand}</span>
                      {isNotEntered && (
                        <span className="text-[10px] font-normal text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                          Unentered
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Limit */}
                  <td className="py-3.5 px-4 text-right font-semibold text-slate-900">
                    ₹{row.sanctionLimit.toFixed(2)} Cr
                  </td>

                  {/* Current Stock */}
                  <td className="py-3.5 px-4 text-right font-extrabold text-navy-900">
                    {row.hasData && row.currentStock !== null ? (
                      `${unitPrefix}${formatNumber(row.currentStock, isValue ? 2 : 0)}${unitSuffix}`
                    ) : (
                      <span className="text-slate-500 font-normal italic">—</span>
                    )}
                  </td>

                  {/* Utilization % */}
                  <td className="py-3.5 px-4 text-center font-bold">
                    {row.hasData && row.utilizationPct !== null ? (
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs ${
                          isExceeded
                            ? 'bg-rose-100 text-rose-800'
                            : isNear
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {row.utilizationPct.toFixed(1)}%
                      </span>
                    ) : (
                      <span className="text-slate-500 font-normal italic">—</span>
                    )}
                  </td>

                  {/* Limit Status Badge */}
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-extrabold tracking-wide uppercase border ${
                        isExceeded
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : isNear
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : row.hasData
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {row.limitBadgeText}
                    </span>
                  </td>

                  {/* Headroom / Excess */}
                  <td className="py-3.5 px-4 text-right font-semibold">
                    {row.hasData ? (
                      <span className={isExceeded ? 'text-rose-700 font-bold' : 'text-emerald-700 font-bold'}>
                        {row.limitDiffText.split(': ')[1] || row.limitDiffText}
                      </span>
                    ) : (
                      <span className="text-slate-500 text-[11px] font-normal">
                        Limit: ₹{row.sanctionLimit.toFixed(2)} Cr
                      </span>
                    )}
                  </td>

                  {/* Purchase */}
                  <td className="py-3.5 px-4 text-right text-slate-800 font-medium">
                    {row.hasData && row.purchase !== null ? (
                      `${unitPrefix}${formatNumber(row.purchase, isValue ? 2 : 0)}${unitSuffix}`
                    ) : (
                      <span className="text-slate-500 font-normal italic">—</span>
                    )}
                  </td>

                  {/* Sales */}
                  <td className="py-3.5 px-4 text-right text-slate-800 font-medium">
                    {row.hasData && row.sales !== null ? (
                      `${unitPrefix}${formatNumber(row.sales, isValue ? 2 : 0)}${unitSuffix}`
                    ) : (
                      <span className="text-slate-500 font-normal italic">—</span>
                    )}
                  </td>

                  {/* Net Movement */}
                  <td className="py-3.5 px-4 text-right font-bold">
                    {row.hasData && row.netMovement !== null ? (
                      row.netMovement < -0.001 ? (
                        <span className="text-emerald-700 flex items-center justify-end gap-0.5">
                          <TrendingDown className="w-3 h-3" />
                          -{unitPrefix}{formatNumber(Math.abs(row.netMovement), isValue ? 2 : 0)}{unitSuffix}
                        </span>
                      ) : row.netMovement > 0.001 ? (
                        <span className="text-rose-700 flex items-center justify-end gap-0.5">
                          <TrendingUp className="w-3 h-3" />
                          +{unitPrefix}{formatNumber(row.netMovement, isValue ? 2 : 0)}{unitSuffix}
                        </span>
                      ) : (
                        <span className="text-amber-700 flex items-center justify-end gap-0.5">
                          <Minus className="w-3 h-3" />
                          Balanced
                        </span>
                      )
                    ) : (
                      <span className="text-slate-500 font-normal italic">—</span>
                    )}
                  </td>

                  {/* Coverage Days */}
                  <td className="py-3.5 px-4 text-right font-bold text-navy-900">
                    {row.hasData ? (
                      formatDays(row.stockCoverageDays)
                    ) : (
                      <span className="text-slate-500 font-normal italic">—</span>
                    )}
                  </td>

                  {/* Action Link */}
                  <td className="py-3.5 px-4 text-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectBrand?.(row.brand);
                      }}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded transition-colors"
                    >
                      <span>{row.hasData ? 'Edit' : 'Input'}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>

          {/* Table Footer: Portfolio Summary */}
          <tfoot>
            <tr className="brand-footer-row bg-slate-100 font-bold text-navy-950 border-t-2 border-slate-300 text-xs">
              <td className="py-3.5 px-4 uppercase tracking-wider font-extrabold">
                Total Entered Brands ({enteredRows.length}/5)
              </td>
              <td className="py-3.5 px-4 text-right font-extrabold text-blue-900">
                ₹{totalLimit.toFixed(2)} Cr
              </td>
              <td className="py-3.5 px-4 text-right font-extrabold text-navy-900">
                {enteredRows.length > 0 ? (
                  `${unitPrefix}${formatNumber(totalStockEntered, isValue ? 2 : 0)}${unitSuffix}`
                ) : (
                  <span className="text-slate-500 font-normal italic">—</span>
                )}
              </td>
              <td className="py-3.5 px-4 text-center font-extrabold">
                {enteredRows.length > 0 ? (
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded text-xs ${
                      overallUtilEntered > 100
                        ? 'bg-rose-100 text-rose-800'
                        : overallUtilEntered >= 90
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {overallUtilEntered.toFixed(1)}%
                  </span>
                ) : (
                  <span className="text-slate-500 font-normal italic">—</span>
                )}
              </td>
              <td className="py-3.5 px-4 text-center">
                {enteredRows.length > 0 ? (
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${
                      overallUtilEntered > 100
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : overallUtilEntered >= 90
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    {overallUtilEntered > 100 ? 'LIMIT EXCEEDED' : overallUtilEntered >= 90 ? 'NEAR LIMIT' : 'LIMIT AVAILABLE'}
                  </span>
                ) : (
                  <span className="text-slate-500 text-[10px] font-normal uppercase">Awaiting Inputs</span>
                )}
              </td>
              <td className="py-3.5 px-4 text-right font-extrabold">
                {enteredRows.length > 0 ? (
                  <span className={totalStockEntered > totalLimit ? 'text-rose-700' : 'text-emerald-700'}>
                    {totalStockEntered > totalLimit
                      ? `₹${formatNumber(totalStockEntered - totalLimit, 2)} Cr Excess`
                      : `₹${formatNumber(totalLimit - totalStockEntered, 2)} Cr Avail`}
                  </span>
                ) : (
                  <span className="text-slate-500 font-normal text-[11px]">Avail: ₹16.00 Cr</span>
                )}
              </td>
              <td className="py-3.5 px-4 text-right font-extrabold">
                {enteredRows.length > 0 ? (
                  `${unitPrefix}${formatNumber(totalPurchaseEntered, isValue ? 2 : 0)}${unitSuffix}`
                ) : (
                  <span className="text-slate-500 font-normal italic">—</span>
                )}
              </td>
              <td className="py-3.5 px-4 text-right font-extrabold">
                {enteredRows.length > 0 ? (
                  `${unitPrefix}${formatNumber(totalSalesEntered, isValue ? 2 : 0)}${unitSuffix}`
                ) : (
                  <span className="text-slate-500 font-normal italic">—</span>
                )}
              </td>
              <td className="py-3.5 px-4 text-right font-extrabold">
                {enteredRows.length > 0 ? (
                  totalNetEntered < -0.001
                    ? `-${unitPrefix}${formatNumber(Math.abs(totalNetEntered), isValue ? 2 : 0)}${unitSuffix}`
                    : totalNetEntered > 0.001
                    ? `+${unitPrefix}${formatNumber(totalNetEntered, isValue ? 2 : 0)}${unitSuffix}`
                    : 'Balanced'
                ) : (
                  <span className="text-slate-500 font-normal italic">—</span>
                )}
              </td>
              <td className="py-3.5 px-4 text-right font-extrabold text-blue-900" colSpan={2}>
                Sum of Entered Brands
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

