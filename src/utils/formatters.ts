import type { CalculationBasis } from '../types/calculator';

/**
 * Format numeric value according to calculation basis (Quantity vs Value in ₹ Cr)
 */
export function formatValue(value: number, basis: CalculationBasis, includeUnit: boolean = true): string {
  if (isNaN(value) || !isFinite(value)) return '—';

  if (basis === 'value') {
    // Value in Crores
    const formatted = formatNumber(value, 2);
    return includeUnit ? `₹${formatted} Cr` : `₹${formatted}`;
  } else {
    // Quantity in units
    const formatted = formatNumber(value, Number.isInteger(value) ? 0 : 2);
    return includeUnit ? `${formatted} Qty` : formatted;
  }
}

/**
 * Format a number with localized Indian/standard decimal separators
 */
export function formatNumber(value: number, decimals: number = 2): string {
  if (isNaN(value) || !isFinite(value)) return '0';
  
  const absVal = Math.abs(value);
  const cleanVal = absVal < 0.0000001 ? 0 : value;
  
  return cleanVal.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format rotation multiplier as X.XXx
 */
export function formatMultiplier(value: number | null): string {
  if (value === null || isNaN(value) || !isFinite(value)) return 'N/A';
  return `${value.toFixed(2)}x`;
}

/**
 * Format stock coverage in days
 */
export function formatDays(value: number | null): string {
  if (value === null || isNaN(value) || !isFinite(value)) return 'N/A';
  const rounded = Math.round(value);
  // Show rounded days or 1 decimal if less than 5
  if (value < 5 && !Number.isInteger(value)) {
    return `${value.toFixed(1)} Days`;
  }
  return `${rounded} Days`;
}

/**
 * Format daily run rate (e.g. 4.76 Qty / Day or ₹0.46 Cr / Day)
 */
export function formatDailyRate(value: number, basis: CalculationBasis): string {
  if (isNaN(value) || !isFinite(value)) return '—';
  
  if (basis === 'value') {
    return `₹${formatNumber(value, 2)} Cr / Day`;
  } else {
    return `${formatNumber(value, 2)} Qty / Day`;
  }
}

/**
 * Format percentages with 2 decimal places
 */
export function formatPercentage(value: number | null): string {
  if (value === null || isNaN(value) || !isFinite(value)) return 'N/A';
  return `${value.toFixed(2)}%`;
}

/**
 * Format ISO date string (YYYY-MM-DD) to friendly "01 Sep 2026"
 */
export function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  
  const year = parseInt(parts[0], 10);
  const monthIndex = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  
  const dayStr = day < 10 ? `0${day}` : `${day}`;
  const monthName = monthNames[monthIndex] || '';
  
  return `${dayStr} ${monthName} ${year}`;
}
