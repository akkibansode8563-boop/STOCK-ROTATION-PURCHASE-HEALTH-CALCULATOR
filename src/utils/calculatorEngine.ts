import {
  type BrandName,
  type IndividualBrand,
  INDIVIDUAL_BRANDS,
  SANCTION_LIMITS,
  type CalculationBasis,
  type CalculationResult,
  type StockAlert,
  type PurchaseAlert,
  type NetMovementInfo,
  type SanctionLimitInfo,
  type BrandBreakdownRow,
  type BrandData,
} from '../types/calculator';
import { formatValue, formatNumber, formatDays, formatDateDisplay } from './formatters';

export interface RawPeriodInputs {
  brand: BrandName;
  basis: CalculationBasis;
  fromDate: string;
  toDate: string;
  currentStock: number;
  purchase: number;
  sales: number;
  brandData?: Record<IndividualBrand, BrandData>;
}

export type PeriodValidationResult =
  | { isValid: true }
  | { isValid: false; error: string };

/**
 * Calculate total inclusive period days between two ISO dates (YYYY-MM-DD)
 * Formula: Period Days = Difference Between Dates + 1
 */
export function calculatePeriodDays(fromDateStr: string, toDateStr: string): number {
  if (!fromDateStr || !toDateStr) return 0;
  const fromParts = fromDateStr.split('-').map(Number);
  const toParts = toDateStr.split('-').map(Number);

  if (fromParts.length !== 3 || toParts.length !== 3) return 0;

  const from = new Date(fromParts[0], fromParts[1] - 1, fromParts[2]);
  const to = new Date(toParts[0], toParts[1] - 1, toParts[2]);

  const diffTime = to.getTime() - from.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1;
}

/**
 * Validate period inputs
 */
export function validatePeriodInputs(inputs: {
  fromDate: string;
  toDate: string;
  currentStock: number | '';
  purchase: number | '';
  sales: number | '';
}): PeriodValidationResult {
  if (!inputs.fromDate || !inputs.toDate) {
    return { isValid: false, error: 'Please select both From Date and To Date.' };
  }

  const periodDays = calculatePeriodDays(inputs.fromDate, inputs.toDate);
  if (periodDays <= 0) {
    return { isValid: false, error: 'To Date cannot be earlier than From Date.' };
  }

  if (
    inputs.currentStock === '' ||
    inputs.purchase === '' ||
    inputs.sales === '' ||
    isNaN(Number(inputs.currentStock)) ||
    isNaN(Number(inputs.purchase)) ||
    isNaN(Number(inputs.sales))
  ) {
    return { isValid: false, error: 'Please enter valid figures for Current Stock, Purchase, and Sales.' };
  }

  const stock = Number(inputs.currentStock);
  const purchase = Number(inputs.purchase);
  const sales = Number(inputs.sales);

  if (stock < 0 || purchase < 0 || sales < 0) {
    return { isValid: false, error: 'Negative values are not permitted. Please enter valid non-negative figures.' };
  }

  return { isValid: true };
}

/**
 * Evaluate Sanction Limit Utilization
 * Formulas:
 * Limit Utilization % = Current Stock ÷ Sanction Limit × 100
 * Available Limit = Sanction Limit − Current Stock
 * Excess Over Limit = Current Stock − Sanction Limit
 */
export function evaluateSanctionLimit(
  brand: BrandName,
  currentStock: number,
  _basis: CalculationBasis
): SanctionLimitInfo {
  const limit = SANCTION_LIMITS[brand];
  const utilizationPct = limit > 0 ? (currentStock / limit) * 100 : 0;
  const availableLimit = Math.max(0, limit - currentStock);
  const excessOverLimit = Math.max(0, currentStock - limit);

  if (currentStock > limit) {
    return {
      sanctionLimit: limit,
      currentStockValue: currentStock,
      utilizationPct,
      availableLimit: 0,
      excessOverLimit,
      status: 'exceeded',
      badgeText: 'LIMIT EXCEEDED',
      statusClass: 'rose',
      displayText: `Excess over limit: ₹${formatNumber(excessOverLimit, 2)} Cr`,
    };
  } else if (utilizationPct > 90) {
    return {
      sanctionLimit: limit,
      currentStockValue: currentStock,
      utilizationPct,
      availableLimit,
      excessOverLimit: 0,
      status: 'near_limit',
      badgeText: 'NEAR LIMIT',
      statusClass: 'amber',
      displayText: `Available limit: ₹${formatNumber(availableLimit, 2)} Cr`,
    };
  } else {
    return {
      sanctionLimit: limit,
      currentStockValue: currentStock,
      utilizationPct,
      availableLimit,
      excessOverLimit: 0,
      status: 'available',
      badgeText: 'LIMIT AVAILABLE',
      statusClass: 'emerald',
      displayText: `Available limit: ₹${formatNumber(availableLimit, 2)} Cr`,
    };
  }
}

/**
 * Determine Stock Alert based on Current Stock Coverage Days
 */
export function evaluateStockCoverageAlert(coverageDays: number | null): StockAlert {
  if (coverageDays === null) {
    return {
      level: 'moderate',
      badgeText: 'NO SALES RECORDED',
      title: '🟡 Stock Coverage Unavailable',
      message: 'No sales were recorded during the selected period, so stock coverage cannot be calculated.',
      statusClass: 'amber',
      icon: 'AlertCircle',
    };
  }

  if (coverageDays <= 30) {
    return {
      level: 'healthy',
      badgeText: 'HEALTHY STOCK',
      title: '🟢 Healthy Stock',
      message: 'Current stock coverage is within the preferred 30-day (1-month) inventory benchmark.',
      statusClass: 'emerald',
      icon: 'CheckCircle2',
    };
  } else if (coverageDays <= 45) {
    return {
      level: 'moderate',
      badgeText: 'MODERATE STOCK',
      title: '🟡 Moderate Stock',
      message: 'Current stock coverage is between 31 and 45 days. Monitor inventory movement closely.',
      statusClass: 'amber',
      icon: 'AlertCircle',
    };
  } else if (coverageDays <= 75) {
    return {
      level: 'high',
      badgeText: 'HIGH STOCK',
      title: '🟠 High Stock',
      message: 'Current stock coverage is elevated at 46 to 75 days. Procurement pace should be reviewed.',
      statusClass: 'orange',
      icon: 'AlertTriangle',
    };
  } else {
    return {
      level: 'excess',
      badgeText: 'EXCESS STOCK',
      title: '🔴 Excess Stock',
      message: 'Current stock coverage exceeds 75 days (over 2.5 months). Immediate inventory reduction and purchase controls are required.',
      statusClass: 'rose',
      icon: 'OctagonAlert',
    };
  }
}

/**
 * Determine Purchase Alert based on Purchase vs Sales during period
 */
export function evaluatePurchaseAlert(purchase: number, sales: number): PurchaseAlert {
  if (purchase === 0 && sales === 0) {
    return {
      level: 'stable',
      badgeText: 'STABLE INVENTORY',
      title: '🟡 Stable Inventory',
      message: 'No purchases or sales recorded during this period.',
      statusClass: 'amber',
      icon: 'Equal',
    };
  }

  if (purchase === 0 && sales > 0) {
    return {
      level: 'positive',
      badgeText: 'POSITIVE STOCK REDUCTION',
      title: '🟢 Positive Stock Reduction',
      message: 'Sales were generated entirely from existing inventory without additional purchase during this period.',
      statusClass: 'emerald',
      icon: 'TrendingDown',
    };
  }

  if (sales > 0) {
    const diff = purchase - sales;
    const pctDiff = Math.abs(diff) / sales;
    if (pctDiff <= 0.05) {
      return {
        level: 'stable',
        badgeText: 'STABLE INVENTORY',
        title: '🟡 Stable Inventory',
        message: 'Purchases and sales are broadly balanced during the selected period.',
        statusClass: 'amber',
        icon: 'Equal',
      };
    }
  }

  if (purchase < sales) {
    return {
      level: 'positive',
      badgeText: 'POSITIVE STOCK REDUCTION',
      title: '🟢 Positive Stock Reduction',
      message: 'Sales are higher than purchases during the selected period, supporting inventory reduction.',
      statusClass: 'emerald',
      icon: 'TrendingDown',
    };
  } else {
    return {
      level: 'excessive',
      badgeText: 'INVENTORY ACCUMULATING',
      title: '🔴 Inventory Accumulating',
      message: 'Purchases are higher than sales during the selected period. Continued purchasing at this rate may increase inventory.',
      statusClass: 'rose',
      icon: 'TrendingUp',
    };
  }
}

/**
 * Synthesize management-level Executive Business Insight
 */
export function generatePeriodBusinessInsight(params: {
  brand: BrandName;
  periodDays: number;
  currentStock: number;
  purchase: number;
  sales: number;
  purchaseRotation: number | null;
  currentStockCoverageDays: number | null;
  netMovement: NetMovementInfo;
  sanctionLimitInfo: SanctionLimitInfo;
  basis: CalculationBasis;
}): string {
  const {
    brand,
    periodDays,
    currentStock,
    purchase,
    sales,
    purchaseRotation,
    currentStockCoverageDays,
    netMovement,
    sanctionLimitInfo,
    basis,
  } = params;

  const purFormatted = formatValue(purchase, basis);
  const salesFormatted = formatValue(sales, basis);
  const stockFormatted = formatValue(currentStock, basis);
  const movementAbsFormatted = formatValue(Math.abs(netMovement.difference), basis);

  let sanctionNote = '';
  if (sanctionLimitInfo.status === 'exceeded') {
    sanctionNote = ` Note that stock exceeds the sanction limit of ₹${sanctionLimitInfo.sanctionLimit.toFixed(2)} Cr with ${sanctionLimitInfo.displayText}. Immediate working capital deleveraging is advised.`;
  } else if (sanctionLimitInfo.status === 'near_limit') {
    sanctionNote = ` Sanction limit utilization is high at ${sanctionLimitInfo.utilizationPct.toFixed(1)}% (${sanctionLimitInfo.displayText}). Procurement headroom is tightly constrained.`;
  } else {
    sanctionNote = ` Sanction limit headroom remains comfortable at ${sanctionLimitInfo.utilizationPct.toFixed(1)}% utilization (${sanctionLimitInfo.displayText}).`;
  }

  if (sales === 0) {
    return `During the ${periodDays}-day period, ${purFormatted} was purchased and no sales were recorded for ${brand}. Net inventory increased by ${purFormatted}. Current stock coverage cannot be calculated due to zero sales velocity.${sanctionNote} Immediate sales activation is required before placing further purchase orders.`;
  }

  if (purchase === 0) {
    const coverageText = currentStockCoverageDays !== null
      ? `Current stock of ${stockFormatted} provides approximately ${formatDays(currentStockCoverageDays)} of sales coverage.`
      : '';
    return `During the ${periodDays}-day period, sales of ${salesFormatted} were generated entirely from existing inventory without additional purchase for ${brand}, driving a net stock reduction of ${salesFormatted}. ${coverageText} This disciplined pause in procurement has effectively supported inventory liquidation.${sanctionNote}`;
  }

  if (netMovement.type === 'stable') {
    const coverageText = currentStockCoverageDays !== null
      ? `Current stock of ${stockFormatted} represents approximately ${formatDays(currentStockCoverageDays)} of sales coverage, which is within the preferred 30-day inventory benchmark.`
      : '';
    return `During the ${periodDays}-day period, ${purFormatted} was purchased and ${salesFormatted} was sold for ${brand}. Purchase rotation reached ${purchaseRotation ? `${purchaseRotation.toFixed(2)}x` : '1.00x'} and inventory remained stable. ${coverageText}${sanctionNote}`;
  }

  if (netMovement.type === 'reducing') {
    const coverageAssessment = currentStockCoverageDays !== null
      ? currentStockCoverageDays <= 30
        ? `Current stock of ${stockFormatted} represents ${formatDays(currentStockCoverageDays)} of sales coverage (healthy rotation).`
        : currentStockCoverageDays <= 45
        ? `Current stock of ${stockFormatted} represents ${formatDays(currentStockCoverageDays)} of sales coverage (moderate stock zone).`
        : currentStockCoverageDays <= 75
        ? `Current stock of ${stockFormatted} represents ${formatDays(currentStockCoverageDays)} of sales coverage (high stock).`
        : `Current stock of ${stockFormatted} remains excessive at ${formatDays(currentStockCoverageDays)} of sales coverage.`
      : '';

    const rotText = purchaseRotation ? `Purchase rotation reached ${purchaseRotation.toFixed(2)}x.` : '';

    return `Sales exceeded purchases by ${movementAbsFormatted} during the selected ${periodDays}-day period for ${brand}, supporting inventory reduction. ${rotText} ${coverageAssessment}${sanctionNote} Continue monitoring stock before increasing purchases.`;
  }

  const rotText = purchaseRotation ? `Purchase rotation was ${purchaseRotation.toFixed(2)}x.` : '';
  const coverageAssessment = currentStockCoverageDays !== null
    ? currentStockCoverageDays <= 30
      ? `Current stock of ${stockFormatted} represents ${formatDays(currentStockCoverageDays)} of coverage (healthy).`
      : currentStockCoverageDays <= 45
      ? `Current stock of ${stockFormatted} represents ${formatDays(currentStockCoverageDays)} of coverage (moderate stock).`
      : currentStockCoverageDays <= 75
      ? `Current stock of ${stockFormatted} represents ${formatDays(currentStockCoverageDays)} of sales coverage (high stock).`
      : `Current stock of ${stockFormatted} is significantly high at ${formatDays(currentStockCoverageDays)} of sales coverage (excess stock).`
    : '';

  return `Purchases exceeded sales by ${movementAbsFormatted} during the selected ${periodDays}-day period for ${brand}, increasing inventory. ${rotText} ${coverageAssessment}${sanctionNote} Current stock should be reviewed against sales velocity before further purchasing.`;
}

/**
 * Main Calculation Engine: Period-based using Current Stock directly + Sanction Limit
 */
export function calculatePeriodRotation(inputs: RawPeriodInputs): CalculationResult {
  const { brand, basis, fromDate, toDate, currentStock, purchase, sales, brandData } = inputs;

  // 1. Period Days (inclusive: Difference Between Dates + 1)
  const periodDays = calculatePeriodDays(fromDate, toDate);

  // 2. Daily Run Rates
  const averageDailySales = periodDays > 0 ? sales / periodDays : 0;
  const averageDailyPurchase = periodDays > 0 ? purchase / periodDays : 0;

  // 3. Purchase Rotation = Sales / Purchase
  let purchaseRotation: number | null = null;
  let purchaseRotationDisplay = 'N/A';
  if (purchase > 0) {
    purchaseRotation = sales / purchase;
    purchaseRotationDisplay = `${purchaseRotation.toFixed(2)}x`;
  }

  // 4. Stock Rotation = Sales / Current Stock
  let stockRotation: number | null = null;
  let stockRotationDisplay = 'N/A';
  if (currentStock > 0) {
    stockRotation = sales / currentStock;
    stockRotationDisplay = `${stockRotation.toFixed(2)}x`;
  }

  // 5. Current Stock Coverage Days = Current Stock ÷ (Sales ÷ Period Days)
  let currentStockCoverageDays: number | null = null;
  let currentStockCoverageDisplay = 'N/A';
  if (averageDailySales > 0) {
    currentStockCoverageDays = currentStock / averageDailySales;
    currentStockCoverageDisplay = formatDays(currentStockCoverageDays);
  }

  // 6. Net Inventory Movement = Purchase - Sales
  const netDiff = purchase - sales;
  const absNetDiff = Math.abs(netDiff);
  const formattedAbsNet = formatValue(absNetDiff, basis);

  let netMovement: NetMovementInfo;
  if (absNetDiff < 0.001) {
    netMovement = {
      difference: 0,
      type: 'stable',
      statusText: 'Inventory Stable',
      displayValue: formatValue(0, basis),
    };
  } else if (netDiff < 0) {
    netMovement = {
      difference: netDiff,
      type: 'reducing',
      statusText: `Inventory Reducing by ${formattedAbsNet}`,
      displayValue: `-${formattedAbsNet}`,
    };
  } else {
    netMovement = {
      difference: netDiff,
      type: 'increasing',
      statusText: `Inventory Increasing by ${formattedAbsNet}`,
      displayValue: `+${formattedAbsNet}`,
    };
  }

  // 7. Purchase vs Sales % = Purchase / Sales * 100
  let purchaseVsSalesPct: number | null = null;
  let purchaseExcessPct: number | null = null;
  if (sales > 0) {
    purchaseVsSalesPct = (purchase / sales) * 100;
    if (purchase > sales) {
      purchaseExcessPct = ((purchase - sales) / sales) * 100;
    }
  }

  // 8. Sanction Limit Evaluation
  const sanctionLimitInfo = evaluateSanctionLimit(brand, currentStock, basis);

  // 9. Multi-brand Breakdown if brandData is provided (ONLY displays actual entered numbers, no automated guessing)
  let brandBreakdown: BrandBreakdownRow[] | undefined;
  if (brandData) {
    brandBreakdown = INDIVIDUAL_BRANDS.map((b) => {
      const bData = brandData[b];
      const hasStock = typeof bData.currentStock === 'number' && !isNaN(bData.currentStock);
      const hasPurchase = typeof bData.purchase === 'number' && !isNaN(bData.purchase);
      const hasSales = typeof bData.sales === 'number' && !isNaN(bData.sales);
      const hasAnyData = hasStock || hasPurchase || hasSales;

      const bStock = hasStock ? (bData.currentStock as number) : 0;
      const bPurchase = hasPurchase ? (bData.purchase as number) : 0;
      const bSales = hasSales ? (bData.sales as number) : 0;

      if (!hasAnyData) {
        return {
          brand: b,
          sanctionLimit: SANCTION_LIMITS[b],
          currentStock: null,
          purchase: null,
          sales: null,
          utilizationPct: null,
          limitStatus: 'not_entered',
          limitBadgeText: 'NOT ENTERED',
          limitStatusClass: 'slate',
          limitDiffText: `Limit: ₹${SANCTION_LIMITS[b].toFixed(2)} Cr`,
          netMovement: null,
          stockCoverageDays: null,
          hasData: false,
        };
      }

      const bLimitInfo = evaluateSanctionLimit(b, bStock, basis);
      const bDailySales = periodDays > 0 ? bSales / periodDays : 0;
      const bCoverage = bDailySales > 0 ? bStock / bDailySales : null;

      return {
        brand: b,
        sanctionLimit: SANCTION_LIMITS[b],
        currentStock: bStock,
        purchase: bPurchase,
        sales: bSales,
        utilizationPct: bLimitInfo.utilizationPct,
        limitStatus: bLimitInfo.status,
        limitBadgeText: bLimitInfo.badgeText,
        limitStatusClass: bLimitInfo.statusClass,
        limitDiffText: bLimitInfo.displayText,
        netMovement: bPurchase - bSales,
        stockCoverageDays: bCoverage,
        hasData: true,
      };
    });
  }

  // 10. Alerts
  const stockAlert = evaluateStockCoverageAlert(currentStockCoverageDays);
  const purchaseAlert = evaluatePurchaseAlert(purchase, sales);

  // 11. Executive Insight
  const businessInsight = generatePeriodBusinessInsight({
    brand,
    periodDays,
    currentStock,
    purchase,
    sales,
    purchaseRotation,
    currentStockCoverageDays,
    netMovement,
    sanctionLimitInfo,
    basis,
  });

  return {
    brand,
    basis,
    fromDate,
    toDate,
    periodDays,
    fromDateFormatted: formatDateDisplay(fromDate),
    toDateFormatted: formatDateDisplay(toDate),
    currentStock,
    purchase,
    sales,
    averageDailySales,
    averageDailyPurchase,
    purchaseRotation,
    purchaseRotationDisplay,
    stockRotation,
    stockRotationDisplay,
    currentStockCoverageDays,
    currentStockCoverageDisplay,
    netMovement,
    purchaseVsSalesPct,
    purchaseExcessPct,
    sanctionLimitInfo,
    brandBreakdown,
    stockAlert,
    purchaseAlert,
    businessInsight,
  };
}
