export type IndividualBrand = 'Lenovo' | 'ASUS' | 'Acer' | 'HP' | 'Dell';

export type BrandName = IndividualBrand | 'Overall Laptop Business';

export const INDIVIDUAL_BRANDS: IndividualBrand[] = ['Lenovo', 'ASUS', 'Acer', 'HP', 'Dell'];

export const ALL_BRANDS: BrandName[] = [
  'Lenovo',
  'ASUS',
  'Acer',
  'HP',
  'Dell',
  'Overall Laptop Business',
];

export const SANCTION_LIMITS: Record<BrandName, number> = {
  Lenovo: 7.50,
  ASUS: 2.50,
  Acer: 2.00,
  HP: 3.00,
  Dell: 1.00,
  'Overall Laptop Business': 16.00, // 7.50 + 2.50 + 2.00 + 3.00 + 1.00
};

export type CalculationBasis = 'quantity' | 'value';

export interface BrandData {
  currentStock: number | '';
  purchase: number | '';
  sales: number | '';
}

export interface CalculatorInputs {
  brand: BrandName;
  basis: CalculationBasis;
  fromDate: string; // YYYY-MM-DD
  toDate: string;   // YYYY-MM-DD
  currentStock: number | '';
  purchase: number | '';
  sales: number | '';
}

export type StockHealthLevel = 'healthy' | 'moderate' | 'high' | 'excess';

export interface StockAlert {
  level: StockHealthLevel;
  badgeText: string;
  title: string;
  message: string;
  statusClass: 'emerald' | 'amber' | 'orange' | 'rose';
  icon: string;
}

export type PurchaseHealthLevel = 'positive' | 'stable' | 'excessive';

export interface PurchaseAlert {
  level: PurchaseHealthLevel;
  badgeText: string;
  title: string;
  message: string;
  statusClass: 'emerald' | 'amber' | 'rose';
  icon: string;
}

export interface NetMovementInfo {
  difference: number; // Purchase - Sales
  type: 'reducing' | 'stable' | 'increasing';
  statusText: string;
  displayValue: string;
}

export type SanctionLimitStatus = 'available' | 'near_limit' | 'exceeded';

export interface SanctionLimitInfo {
  sanctionLimit: number; // in ₹ Crores
  currentStockValue: number; // in ₹ Crores
  utilizationPct: number; // Current Stock ÷ Sanction Limit × 100
  availableLimit: number; // Sanction Limit − Current Stock (if Stock < Limit)
  excessOverLimit: number; // Current Stock − Sanction Limit (if Stock > Limit)
  status: SanctionLimitStatus;
  badgeText: 'LIMIT AVAILABLE' | 'NEAR LIMIT' | 'LIMIT EXCEEDED';
  statusClass: 'emerald' | 'amber' | 'rose';
  displayText: string; // e.g. "Available limit: ₹1.50 Cr" or "Excess over limit: ₹0.75 Cr"
}

export interface BrandBreakdownRow {
  brand: IndividualBrand;
  sanctionLimit: number;
  currentStock: number | null;
  purchase: number | null;
  sales: number | null;
  utilizationPct: number | null;
  limitStatus: SanctionLimitStatus | 'not_entered';
  limitBadgeText: string;
  limitStatusClass: 'emerald' | 'amber' | 'rose' | 'slate';
  limitDiffText: string;
  netMovement: number | null;
  stockCoverageDays: number | null;
  hasData: boolean;
}

export interface CalculationResult {
  brand: BrandName;
  basis: CalculationBasis;
  fromDate: string;
  toDate: string;
  periodDays: number;
  fromDateFormatted: string;
  toDateFormatted: string;

  // Inventory Inputs
  currentStock: number;
  purchase: number;
  sales: number;

  // Daily Run Rates
  averageDailySales: number;
  averageDailyPurchase: number;

  // Primary Rotations
  purchaseRotation: number | null; // Sales / Purchase
  purchaseRotationDisplay: string; // e.g. "1.00x" or "N/A - No Purchase During Period"

  stockRotation: number | null; // Sales / Current Stock
  stockRotationDisplay: string; // e.g. "1.00x"

  // Coverage in Days based directly on Current Stock
  currentStockCoverageDays: number | null; // Current Stock / Average Daily Sales
  currentStockCoverageDisplay: string; // e.g. "21 Days" or "N/A - No Sales During Period"

  // Net Inventory Movement (Purchase - Sales)
  netMovement: NetMovementInfo;

  // Purchase vs Sales Ratio
  purchaseVsSalesPct: number | null; // Purchase / Sales * 100
  purchaseExcessPct?: number | null; // (Purchase - Sales) / Sales * 100 if Purchase > Sales

  // Sanction Limit Utilization
  sanctionLimitInfo: SanctionLimitInfo;

  // Multi-brand breakdown if Overall Laptop Business
  brandBreakdown?: BrandBreakdownRow[];

  // Alerts
  stockAlert: StockAlert;
  purchaseAlert: PurchaseAlert;

  // Executive Management Insight
  businessInsight: string;
}

export interface CalculationValidationError {
  type: 'INVALID_DATES' | 'NEGATIVE_VALUES' | 'EMPTY_INPUTS';
  message: string;
  isFatal: boolean;
}
