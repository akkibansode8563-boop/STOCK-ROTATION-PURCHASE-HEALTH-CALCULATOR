import { useState } from 'react';
import type {
  BrandName,
  IndividualBrand,
  BrandData,
  CalculatorInputs as InputsType,
  CalculationResult,
} from './types/calculator';
import { validatePeriodInputs, calculatePeriodRotation } from './utils/calculatorEngine';
import { Header } from './components/Header';
import { CalculatorInputs } from './components/CalculatorInputs';
import { KpiGrid } from './components/KpiGrid';
import { SanctionLimitCard } from './components/SanctionLimitCard';
import { AlertCards } from './components/AlertCards';
import { CoverageVisualizer } from './components/CoverageVisualizer';
import { BusinessInsightCard } from './components/BusinessInsightCard';
import { InitialWelcome } from './components/InitialWelcome';
import { ShieldCheck } from 'lucide-react';

const INITIAL_BRAND_DATA: Record<BrandName, BrandData> = {
  Lenovo: { currentStock: 6.00, purchase: 3.00, sales: 4.00 },
  ASUS: { currentStock: 2.00, purchase: 1.00, sales: 1.50 },
  Acer: { currentStock: 1.50, purchase: 0.80, sales: 0.90 },
  HP: { currentStock: 3.00, purchase: 1.50, sales: 1.20 },
  Dell: { currentStock: 0.80, purchase: 0.50, sales: 0.60 },
  'Overall Laptop Business': { currentStock: 14.50, purchase: 6.80, sales: 8.20 },
};

export function App() {
  const [brandData, setBrandData] = useState<Record<BrandName, BrandData>>(INITIAL_BRAND_DATA);
  const [fromDate, setFromDate] = useState('2026-09-01');
  const [toDate, setToDate] = useState('2026-09-21');
  const [selectedBrand, setSelectedBrand] = useState<BrandName>('Lenovo');
  const [basis, setBasis] = useState<'quantity' | 'value'>('value');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [result, setResult] = useState<CalculationResult | null>(null);

  // Active inputs are directly retrieved from the selected brand's user-provided data
  const currentInputs: InputsType = {
    brand: selectedBrand,
    basis,
    fromDate,
    toDate,
    currentStock: brandData[selectedBrand].currentStock,
    purchase: brandData[selectedBrand].purchase,
    sales: brandData[selectedBrand].sales,
  };

  const handleInputChange = (newInputs: InputsType) => {
    setSelectedBrand(newInputs.brand);
    setBasis(newInputs.basis);
    setFromDate(newInputs.fromDate);
    setToDate(newInputs.toDate);

    // Save inputs directly for the selected brand (whether an individual brand or Overall Laptop Business)
    setBrandData((prev) => ({
      ...prev,
      [newInputs.brand]: {
        currentStock: newInputs.currentStock,
        purchase: newInputs.purchase,
        sales: newInputs.sales,
      },
    }));

    if (validationError) setValidationError(null);
  };

  const executeCalculation = (
    brand: BrandName,
    bData: Record<BrandName, BrandData>,
    from: string,
    to: string,
    currBasis: 'quantity' | 'value'
  ) => {
    const brandEntry = bData[brand];
    const stock = typeof brandEntry.currentStock === 'number' ? brandEntry.currentStock : 0;
    const purchase = typeof brandEntry.purchase === 'number' ? brandEntry.purchase : 0;
    const sales = typeof brandEntry.sales === 'number' ? brandEntry.sales : 0;

    const validation = validatePeriodInputs({
      fromDate: from,
      toDate: to,
      currentStock: stock,
      purchase,
      sales,
    });

    if (!validation.isValid) {
      setValidationError(validation.error);
      return;
    }

    setValidationError(null);

    // Pass individual brand data directly without coercing unentered fields to 0
    const individualBrandData: Record<IndividualBrand, BrandData> = {
      Lenovo: bData.Lenovo,
      ASUS: bData.ASUS,
      Acer: bData.Acer,
      HP: bData.HP,
      Dell: bData.Dell,
    };

    const computedResult = calculatePeriodRotation({
      brand,
      basis: currBasis,
      fromDate: from,
      toDate: to,
      currentStock: stock,
      purchase,
      sales,
      brandData: brand === 'Overall Laptop Business' ? individualBrandData : undefined,
    });

    setResult(computedResult);
  };

  const handleCalculate = () => {
    executeCalculation(selectedBrand, brandData, fromDate, toDate, basis);
  };

  const handleReset = () => {
    const emptyData: Record<BrandName, BrandData> = {
      Lenovo: { currentStock: '', purchase: '', sales: '' },
      ASUS: { currentStock: '', purchase: '', sales: '' },
      Acer: { currentStock: '', purchase: '', sales: '' },
      HP: { currentStock: '', purchase: '', sales: '' },
      Dell: { currentStock: '', purchase: '', sales: '' },
      'Overall Laptop Business': { currentStock: '', purchase: '', sales: '' },
    };
    setBrandData(emptyData);
    setSelectedBrand('Lenovo');
    setValidationError(null);
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-blue-100 selection:text-blue-900">
      {/* Executive Header */}
      <Header onReset={handleReset} />

      {/* Main Dashboard Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        
        {/* Input Parameters Section */}
        <section aria-label="Inventory Parameters">
          <CalculatorInputs
            inputs={currentInputs}
            onChange={handleInputChange}
            onCalculate={handleCalculate}
            onReset={handleReset}
            validationError={validationError}
          />
        </section>

        {/* Dynamic Results or Initial State */}
        {result ? (
          <section aria-label="Calculation Results" className="space-y-6 animate-fadeIn">
            
            {/* Results Title Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  Assessment Results
                </span>
                <h2 className="text-lg sm:text-xl font-extrabold text-navy-900 mt-0.5">
                  Performance & Sanction Health: {result.brand}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-200 text-slate-700">
                  Basis: {result.basis === 'value' ? 'Value (₹ Cr)' : 'Quantity (Qty)'}
                </span>
                <span className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Validated Portfolio
                </span>
              </div>
            </div>

            {/* 1. Four Primary KPI Cards */}
            <KpiGrid result={result} />

            {/* 2. Sanction Limit Utilization Card */}
            <SanctionLimitCard limitInfo={result.sanctionLimitInfo} brand={result.brand} />

            {/* 3. Independent Stock & Purchase Alerts */}
            <AlertCards stockAlert={result.stockAlert} purchaseAlert={result.purchaseAlert} />

            {/* 5. Coverage Benchmark Spectrum Bar (Current Stock Coverage Days) */}
            <CoverageVisualizer coverageDays={result.currentStockCoverageDays} />

            {/* 6. Large Executive Business Insight */}
            <BusinessInsightCard result={result} />

          </section>
        ) : (
          <section aria-label="Welcome Guide">
            <InitialWelcome />
          </section>
        )}

      </main>

      {/* Enterprise Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-navy-900">Stock Rotation & Purchase Calculator Suite</span>
          </div>
          <div className="text-slate-400 text-[11px]">
            Executive Inventory Decision Engine
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
