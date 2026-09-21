import { describe, it, expect } from 'vitest';
import {
  calculatePeriodDays,
  calculatePeriodRotation,
  validatePeriodInputs,
  evaluateStockCoverageAlert,
  evaluatePurchaseAlert,
  evaluateSanctionLimit,
} from './calculatorEngine';
import { ALL_BRANDS, SANCTION_LIMITS } from '../types/calculator';

describe('Sanction Limit & Multi-Brand Aggregation Engine', () => {
  describe('Brand List & Sanction Limits (Exact Specification)', () => {
    it('contains exactly the 6 requested brands', () => {
      expect(ALL_BRANDS).toEqual([
        'Lenovo',
        'ASUS',
        'Acer',
        'HP',
        'Dell',
        'Overall Laptop Business',
      ]);
    });

    it('has exact sanction limits for all brands', () => {
      expect(SANCTION_LIMITS.Lenovo).toBe(7.50);
      expect(SANCTION_LIMITS.ASUS).toBe(2.50);
      expect(SANCTION_LIMITS.Acer).toBe(2.00);
      expect(SANCTION_LIMITS.HP).toBe(3.00);
      expect(SANCTION_LIMITS.Dell).toBe(1.00);
      expect(SANCTION_LIMITS['Overall Laptop Business']).toBe(16.00);
    });

    it('verifies Overall Laptop Business is the exact sum of all 5 brand limits (₹16.00 Cr)', () => {
      const sum =
        SANCTION_LIMITS.Lenovo +
        SANCTION_LIMITS.ASUS +
        SANCTION_LIMITS.Acer +
        SANCTION_LIMITS.HP +
        SANCTION_LIMITS.Dell;
      expect(sum).toBe(16.00);
      expect(SANCTION_LIMITS['Overall Laptop Business']).toBe(sum);
    });
  });

  describe('Sanction Limit Evaluation Test Cases (From Specification)', () => {
    it('Example 1: Limit = ₹7.50 Cr, Stock = ₹8.25 Cr -> 110% Utilization, 🔴 LIMIT EXCEEDED, Excess: ₹0.75 Cr', () => {
      const info = evaluateSanctionLimit('Lenovo', 8.25, 'value');
      expect(info.sanctionLimit).toBe(7.50);
      expect(info.currentStockValue).toBe(8.25);
      expect(info.utilizationPct).toBeCloseTo(110.0, 1);
      expect(info.status).toBe('exceeded');
      expect(info.badgeText).toBe('LIMIT EXCEEDED');
      expect(info.excessOverLimit).toBeCloseTo(0.75, 2);
      expect(info.displayText).toBe('Excess over limit: ₹0.75 Cr');
    });

    it('Example 2: Limit = ₹7.50 Cr, Stock = ₹6.00 Cr -> 80% Utilization, 🟢 LIMIT AVAILABLE, Available: ₹1.50 Cr', () => {
      const info = evaluateSanctionLimit('Lenovo', 6.00, 'value');
      expect(info.sanctionLimit).toBe(7.50);
      expect(info.currentStockValue).toBe(6.00);
      expect(info.utilizationPct).toBeCloseTo(80.0, 1);
      expect(info.status).toBe('available');
      expect(info.badgeText).toBe('LIMIT AVAILABLE');
      expect(info.availableLimit).toBeCloseTo(1.50, 2);
      expect(info.displayText).toBe('Available limit: ₹1.50 Cr');
    });

    it('Example 3: Limit = ₹7.50 Cr, Stock = ₹7.00 Cr -> 93.33% Utilization, 🟡 NEAR LIMIT, Available: ₹0.50 Cr', () => {
      const info = evaluateSanctionLimit('Lenovo', 7.00, 'value');
      expect(info.sanctionLimit).toBe(7.50);
      expect(info.currentStockValue).toBe(7.00);
      expect(info.utilizationPct).toBeCloseTo(93.33, 2);
      expect(info.status).toBe('near_limit');
      expect(info.badgeText).toBe('NEAR LIMIT');
      expect(info.availableLimit).toBeCloseTo(0.50, 2);
      expect(info.displayText).toBe('Available limit: ₹0.50 Cr');
    });
  });

  describe('Overall Laptop Business Multi-Brand Aggregation', () => {
    const brandData = {
      Lenovo: { currentStock: 7.00, purchase: 3.00, sales: 4.00 },
      ASUS: { currentStock: 2.00, purchase: 1.00, sales: 1.50 },
      Acer: { currentStock: 1.50, purchase: 0.80, sales: 0.90 },
      HP: { currentStock: 3.20, purchase: 1.50, sales: 1.20 },
      Dell: { currentStock: 0.80, purchase: 0.50, sales: 0.60 },
    };

    const totalStock = 7.00 + 2.00 + 1.50 + 3.20 + 0.80; // 14.50 Cr
    const totalPurchase = 3.00 + 1.00 + 0.80 + 1.50 + 0.50; // 6.80 Cr
    const totalSales = 4.00 + 1.50 + 0.90 + 1.20 + 0.60; // 8.20 Cr

    const result = calculatePeriodRotation({
      brand: 'Overall Laptop Business',
      basis: 'value',
      fromDate: '2026-09-01',
      toDate: '2026-09-21',
      currentStock: totalStock,
      purchase: totalPurchase,
      sales: totalSales,
      brandData,
    });

    it('evaluates Overall Sanction Limit of ₹16.00 Cr', () => {
      expect(result.sanctionLimitInfo.sanctionLimit).toBe(16.00);
      expect(result.sanctionLimitInfo.currentStockValue).toBeCloseTo(14.50, 2);
      // 14.50 / 16.00 * 100 = 90.625% -> Near Limit
      expect(result.sanctionLimitInfo.utilizationPct).toBeCloseTo(90.63, 1);
      expect(result.sanctionLimitInfo.status).toBe('near_limit');
      expect(result.sanctionLimitInfo.badgeText).toBe('NEAR LIMIT');
      expect(result.sanctionLimitInfo.availableLimit).toBeCloseTo(1.50, 2);
    });

    it('computes purchase rotation for overall business', () => {
      // 8.20 / 6.80 = 1.2058x
      expect(result.purchaseRotation).toBeCloseTo(1.21, 2);
    });

    it('generates brand breakdown rows for all 5 individual brands', () => {
      expect(result.brandBreakdown).toBeDefined();
      expect(result.brandBreakdown?.length).toBe(5);

      const lenovoRow = result.brandBreakdown?.find((r) => r.brand === 'Lenovo');
      expect(lenovoRow).toBeDefined();
      expect(lenovoRow?.sanctionLimit).toBe(7.50);
      expect(lenovoRow?.currentStock).toBe(7.00);
      expect(lenovoRow?.limitStatus).toBe('near_limit');

      const hpRow = result.brandBreakdown?.find((r) => r.brand === 'HP');
      expect(hpRow).toBeDefined();
      expect(hpRow?.sanctionLimit).toBe(3.00);
      expect(hpRow?.currentStock).toBe(3.20);
      expect(hpRow?.limitStatus).toBe('exceeded'); // 3.20 > 3.00
    });
  });

  describe('Direct Overall Entry with Zero Brand Assumptions (No Guessing)', () => {
    it('calculates Overall directly when only overall numbers are entered without brand data', () => {
      const emptyBrandData = {
        Lenovo: { currentStock: '' as const, purchase: '' as const, sales: '' as const },
        ASUS: { currentStock: '' as const, purchase: '' as const, sales: '' as const },
        Acer: { currentStock: '' as const, purchase: '' as const, sales: '' as const },
        HP: { currentStock: '' as const, purchase: '' as const, sales: '' as const },
        Dell: { currentStock: '' as const, purchase: '' as const, sales: '' as const },
      };

      const result = calculatePeriodRotation({
        brand: 'Overall Laptop Business',
        basis: 'value',
        fromDate: '2026-09-01',
        toDate: '2026-09-21',
        currentStock: 15.00,
        purchase: 6.00,
        sales: 7.50,
        brandData: emptyBrandData,
      });

      // Overall calculations are directly based on the user-entered 15.00, 6.00, 7.50
      expect(result.currentStock).toBe(15.00);
      expect(result.purchase).toBe(6.00);
      expect(result.sales).toBe(7.50);
      expect(result.sanctionLimitInfo.sanctionLimit).toBe(16.00);
      expect(result.sanctionLimitInfo.utilizationPct).toBeCloseTo(93.75, 2);
      expect(result.sanctionLimitInfo.status).toBe('near_limit');
      expect(result.purchaseRotation).toBeCloseTo(1.25, 2);

      // Crucial: Brand breakdown rows MUST NOT guess or assume any brand numbers
      expect(result.brandBreakdown).toBeDefined();
      expect(result.brandBreakdown?.length).toBe(5);

      for (const row of result.brandBreakdown!) {
        expect(row.hasData).toBe(false);
        expect(row.limitStatus).toBe('not_entered');
        expect(row.currentStock).toBeNull();
        expect(row.purchase).toBeNull();
        expect(row.sales).toBeNull();
        expect(row.utilizationPct).toBeNull();
        expect(row.netMovement).toBeNull();
        expect(row.stockCoverageDays).toBeNull();
        expect(row.limitBadgeText).toBe('NOT ENTERED');
      }
    });

    it('correctly isolates partially entered brands without distributing overall figures to missing ones', () => {
      const partialBrandData = {
        Lenovo: { currentStock: 6.00, purchase: 3.00, sales: 4.00 },
        ASUS: { currentStock: '' as const, purchase: '' as const, sales: '' as const },
        Acer: { currentStock: '' as const, purchase: '' as const, sales: '' as const },
        HP: { currentStock: '' as const, purchase: '' as const, sales: '' as const },
        Dell: { currentStock: '' as const, purchase: '' as const, sales: '' as const },
      };

      const result = calculatePeriodRotation({
        brand: 'Overall Laptop Business',
        basis: 'value',
        fromDate: '2026-09-01',
        toDate: '2026-09-21',
        currentStock: 14.00,
        purchase: 5.00,
        sales: 6.00,
        brandData: partialBrandData,
      });

      const lenovo = result.brandBreakdown?.find((r) => r.brand === 'Lenovo');
      expect(lenovo?.hasData).toBe(true);
      expect(lenovo?.currentStock).toBe(6.00);
      expect(lenovo?.limitStatus).toBe('available');

      const asus = result.brandBreakdown?.find((r) => r.brand === 'ASUS');
      expect(asus?.hasData).toBe(false);
      expect(asus?.currentStock).toBeNull();
      expect(asus?.limitStatus).toBe('not_entered');
    });
  });

  describe('Standard Period Calculations Remain Intact', () => {
    it('calculates 21 inclusive days for 01 Sep to 21 Sep', () => {
      expect(calculatePeriodDays('2026-09-01', '2026-09-21')).toBe(21);
    });

    it('correctly evaluates purchase alerts and coverage alerts', () => {
      expect(evaluatePurchaseAlert(70, 100).level).toBe('positive');
      expect(evaluateStockCoverageAlert(25).level).toBe('healthy');
    });

    it('validates input figures properly', () => {
      const valid = validatePeriodInputs({
        fromDate: '2026-09-01',
        toDate: '2026-09-21',
        currentStock: 10,
        purchase: 5,
        sales: 8,
      });
      expect(valid.isValid).toBe(true);
    });
  });

  describe('Section 20: Explicit Lenovo Benchmark Verification', () => {
    const lenovoResult = calculatePeriodRotation({
      brand: 'Lenovo',
      basis: 'value',
      fromDate: '2026-09-01',
      toDate: '2026-09-21',
      currentStock: 6.00,
      purchase: 3.00,
      sales: 4.00,
    });

    it('matches exact expected results for Lenovo test benchmark', () => {
      // 1. Period Days = 21 Days
      expect(lenovoResult.periodDays).toBe(21);

      // 2. Purchase Rotation = 1.33x
      expect(lenovoResult.purchaseRotation).toBeCloseTo(1.33, 2);
      expect(lenovoResult.purchaseRotationDisplay).toBe('1.33x');

      // 3. Average Daily Sales = ₹0.1905 Cr/day (~0.19)
      expect(lenovoResult.averageDailySales).toBeCloseTo(0.1905, 4);

      // 4. Stock Coverage = 32 Days (31.5 rounded)
      expect(lenovoResult.currentStockCoverageDays).toBeCloseTo(31.5, 1);
      expect(lenovoResult.currentStockCoverageDisplay).toBe('32 Days');

      // 5. Net Movement = -₹1.00 Cr (Inventory Reducing)
      expect(lenovoResult.netMovement.difference).toBe(-1.00);
      expect(lenovoResult.netMovement.displayValue).toBe('-₹1.00 Cr');
      expect(lenovoResult.netMovement.type).toBe('reducing');

      // 6. Limit Utilization = 80.0%
      expect(lenovoResult.sanctionLimitInfo.utilizationPct).toBe(80.0);

      // 7. Available Limit = ₹1.50 Cr
      expect(lenovoResult.sanctionLimitInfo.availableLimit).toBe(1.50);

      // 8. Stock Rotation = 0.67x
      expect(lenovoResult.stockRotation).toBeCloseTo(0.67, 2);
      expect(lenovoResult.stockRotationDisplay).toBe('0.67x');

      // 9. Purchase vs Sales % = 75.00%
      expect(lenovoResult.purchaseVsSalesPct).toBe(75.0);

      // 10. Daily Sales Velocity = 0.19 Cr/day, Daily Purchase Pace = 0.14 Cr/day
      expect(lenovoResult.averageDailySales).toBeCloseTo(0.19, 2);
      expect(lenovoResult.averageDailyPurchase).toBeCloseTo(0.14, 2);

      // 11. Limit Status = LIMIT AVAILABLE
      expect(lenovoResult.sanctionLimitInfo.status).toBe('available');
      expect(lenovoResult.sanctionLimitInfo.badgeText).toBe('LIMIT AVAILABLE');
    });
  });

  describe('Edge Cases: Zero Purchase, Zero Sales, Zero Stock, Zero Limit', () => {
    it('handles zero purchase without NaN or division by zero', () => {
      const res = calculatePeriodRotation({
        brand: 'Lenovo',
        basis: 'value',
        fromDate: '2026-09-01',
        toDate: '2026-09-21',
        currentStock: 6.00,
        purchase: 0,
        sales: 4.00,
      });
      expect(res.purchaseRotation).toBeNull();
      expect(res.purchaseRotationDisplay).toBe('N/A');
      expect(res.averageDailyPurchase).toBe(0);
      expect(res.netMovement.difference).toBe(-4.00);
    });

    it('handles zero sales without NaN, Infinity, or division by zero', () => {
      const res = calculatePeriodRotation({
        brand: 'Lenovo',
        basis: 'value',
        fromDate: '2026-09-01',
        toDate: '2026-09-21',
        currentStock: 6.00,
        purchase: 3.00,
        sales: 0,
      });
      expect(res.averageDailySales).toBe(0);
      expect(res.currentStockCoverageDays).toBeNull();
      expect(res.currentStockCoverageDisplay).toBe('N/A');
      expect(res.purchaseVsSalesPct).toBeNull();
      expect(res.purchaseRotation).toBe(0);
      expect(res.purchaseRotationDisplay).toBe('0.00x');
    });

    it('handles zero stock gracefully', () => {
      const res = calculatePeriodRotation({
        brand: 'Lenovo',
        basis: 'value',
        fromDate: '2026-09-01',
        toDate: '2026-09-21',
        currentStock: 0,
        purchase: 3.00,
        sales: 4.00,
      });
      expect(res.currentStockCoverageDays).toBe(0);
      expect(res.currentStockCoverageDisplay).toBe('0 Days');
      expect(res.sanctionLimitInfo.utilizationPct).toBe(0);
      expect(res.sanctionLimitInfo.availableLimit).toBe(7.50);
      expect(res.sanctionLimitInfo.status).toBe('available');
    });

    it('handles utilization > 90% (near limit) and > 100% (exceeded)', () => {
      const nearLimit = evaluateSanctionLimit('Lenovo', 7.00, 'value');
      expect(nearLimit.status).toBe('near_limit');
      expect(nearLimit.badgeText).toBe('NEAR LIMIT');

      const exceeded = evaluateSanctionLimit('Lenovo', 8.50, 'value');
      expect(exceeded.status).toBe('exceeded');
      expect(exceeded.badgeText).toBe('LIMIT EXCEEDED');
      expect(exceeded.excessOverLimit).toBe(1.00);
    });
  });
});
