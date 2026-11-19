// src/utils/solarCalculations.ts
//
// Every figure on the report is worked out here, in one pure function, so the
// numbers can be checked in isolation and the page can never show a mix of
// stale and fresh values.
//
// Model, in plain terms:
//   1. Consumption comes from the units printed on the bill when the user
//      gives them, otherwise from (bill - fixed charges) / state tariff.
//   2. TARGET size = the kW needed to generate a year's consumption.
//   3. The target is rounded UP to whole 500 W panels (and capped at what fits
//      on the usable roof). That SELECTED system is what is priced, and every
//      generation, savings, subsidy and payback figure uses it.
//   4. Savings = bill before solar - bill after solar (+ export credit).
//      Net metering is assumed: generation offsets consumption at the user's
//      energy rate over the year; fixed charges are always payable; surplus
//      units are credited at EXPORT_CREDIT_RATE.
//   5. 25-year savings and payback are worked out year by year with panel
//      degradation and the stated tariff escalation.

// ---- Assumptions (shown on the report) ------------------------------------

/** kWh produced per kWp per kWh/m² of irradiance: system losses (inverter,
 *  wiring, temperature, soiling). The same for every panel type: a 500 W
 *  panel yields the same energy whatever its efficiency; efficiency only
 *  changes how much roof it takes. */
export const PERFORMANCE_RATIO = 0.8946;
export const PANEL_UNIT_WATTS = 500;
export const ROOF_COVERAGE_RATIO = 0.8;
export const GST_RATE = 0.12; // 12% GST on panel cost
export const CO2_KG_PER_KWH = 0.92;
export const LIFETIME_YEARS = 25;
/** Output lost per year as panels age (first year = 100%). */
export const PANEL_DEGRADATION_PER_YEAR = 0.005;
/** Yearly tariff increase. 0 = today's tariffs held for all 25 years. */
export const TARIFF_ESCALATION_PER_YEAR = 0;
/** ₹ credited per surplus unit exported in a year. Set by each DISCOM and
 *  often paid only at year-end, so surplus is not counted as savings. */
export const EXPORT_CREDIT_RATE = 0;

// Loan illustration
export const DEFAULT_DOWN_PAYMENT_PERCENT = 20; // % of cost-after-subsidy
export const DEFAULT_INTEREST_RATE = 8.5; // % per year
export const DEFAULT_LOAN_TENURE_YEARS = 10; // years

const EPS = 1e-9;

/** PM Surya Ghar central subsidy on installed capacity:
 *  ₹30,000/kW for the first 2 kW, ₹18,000 for the 3rd kW, capped at ₹78,000. */
export function pmSuryaGharSubsidy(installedKW: number): number {
  const kw = Math.max(installedKW, 0);
  if (kw <= 2) return kw * 30000;
  if (kw <= 3) return 60000 + (kw - 2) * 18000;
  return 78000;
}

/** Standard reducing-balance EMI. */
export function monthlyEmi(
  principal: number,
  annualRatePercent: number,
  tenureYears: number
): number {
  const r = annualRatePercent / 12 / 100;
  const n = tenureYears * 12;
  if (principal <= 0 || n <= 0) return 0;
  if (r === 0) return principal / n;
  const pow = Math.pow(1 + r, n);
  return (principal * r * pow) / (pow - 1);
}

export interface ConsumptionInputs {
  monthlyBill: number; // ₹ per month, as printed on the bill
  fixedCharges?: number; // ₹ per month that stay payable after solar
  billUnits?: number | null; // kWh per month printed on the bill
  tariffRate: number | null; // state average ₹/kWh
}

export interface ConsumptionResult {
  monthlyUnits: number; // kWh/month
  source: "bill-units" | "estimated-from-bill";
  energyRate: number; // ₹/kWh the user actually pays for energy
}

/** Monthly consumption and the rate each unit costs the user. */
export function deriveConsumption({
  monthlyBill,
  fixedCharges = 0,
  billUnits,
  tariffRate,
}: ConsumptionInputs): ConsumptionResult {
  const bill = Math.max(monthlyBill || 0, 0);
  const fixed = Math.min(Math.max(fixedCharges || 0, 0), bill);
  const energyCharges = bill - fixed;

  if (billUnits && billUnits > 0) {
    return {
      monthlyUnits: billUnits,
      source: "bill-units",
      // The user's own average energy rate, so savings match their bill.
      energyRate: energyCharges / billUnits,
    };
  }

  if (tariffRate && tariffRate > 0) {
    return {
      monthlyUnits: energyCharges / tariffRate,
      source: "estimated-from-bill",
      energyRate: tariffRate,
    };
  }

  return { monthlyUnits: 0, source: "estimated-from-bill", energyRate: 0 };
}

export interface PanelSpec {
  areaPer500W: number; // m² per 500 W panel
  costPer500WUnit: number; // ₹ per 500 W panel, before GST
}

export interface ReportInputs {
  monthlyUnits: number; // kWh/month
  monthlyBill: number; // ₹/month
  fixedCharges: number; // ₹/month
  energyRate: number; // ₹/kWh
  irradiance: number; // kWh/m²/day
  totalRoofArea: number; // m²
  roofPotentialKW: number; // kW, from the roof screen
  panel: PanelSpec;
}

export interface YearRow {
  year: number;
  production: number; // kWh
  savings: number; // ₹
  cumulativeSavings: number; // ₹
}

export interface ReportResult {
  // Energy
  yearlyUsage: number; // kWh/yr
  annualProduction: number; // kWh, year 1, selected system
  offsetUnits: number; // kWh of usage covered by solar, year 1
  surplusUnits: number; // kWh exported beyond usage, year 1
  residualUnits: number; // kWh still bought from the grid, year 1
  usageCoveredShare: number; // 0..1

  // Sizing
  usableRoofSpace: number; // m²
  roofPotentialKW: number; // kW
  targetSystemKW: number; // kW needed to match usage
  maxUnitsOnRoof: number; // panels that fit
  numberOfUnits: number; // panels quoted
  selectedSystemKW: number; // kW quoted (= panels × 500 W)
  limitedByRoof: boolean;
  roofAreaRequired: number; // m²

  // Bills and savings
  annualBillBefore: number; // ₹
  annualBillAfter: number; // ₹ (fixed charges + residual energy)
  monthlyBillAfter: number; // ₹
  annualExportCredit: number; // ₹
  annualSavings: number; // ₹, year 1
  lifetimeSavings: number; // ₹, year by year over LIFETIME_YEARS
  yearly: YearRow[];

  // Cost
  baseCost: number;
  gstAmount: number;
  costWithGST: number;
  subsidy: number;
  costAfterSubsidy: number;
  paybackYears: number; // Infinity if not reached within LIFETIME_YEARS

  // Environment
  co2ReductionTons: number; // t/yr, year 1

  // Loan illustration
  loanAmount: number;
  monthlyEmi: number;
  totalInterest: number;
  totalPayment: number;
  monthlyCostWithSolarAndEmi: number;
  netMonthlySavingsWithLoan: number;
}

export function calculateReport(inp: ReportInputs): ReportResult {
  const yearlyUsage = Math.max(inp.monthlyUnits, 0) * 12;
  const kwhPerKwYear = inp.irradiance * 365 * PERFORMANCE_RATIO;

  // ---- Sizing ----
  const targetSystemKW = kwhPerKwYear > 0 ? yearlyUsage / kwhPerKwYear : 0;
  const unitKW = PANEL_UNIT_WATTS / 1000;
  // EPS stops floating-point noise (e.g. 6.0000000001 kW) adding a panel.
  const unitsForTarget = Math.max(Math.ceil(targetSystemKW / unitKW - EPS), 0);

  const usableRoofSpace = Math.max(inp.totalRoofArea, 0) * ROOF_COVERAGE_RATIO;
  const fitByArea =
    inp.panel.areaPer500W > 0
      ? Math.floor(usableRoofSpace / inp.panel.areaPer500W + EPS)
      : Infinity;
  const fitByPotential =
    inp.roofPotentialKW > 0
      ? Math.floor(inp.roofPotentialKW / unitKW + EPS)
      : Infinity;
  const maxUnitsOnRoof =
    usableRoofSpace > 0 ? Math.min(fitByArea, fitByPotential) : Infinity;

  const numberOfUnits = Math.min(unitsForTarget, maxUnitsOnRoof);
  const limitedByRoof = unitsForTarget > maxUnitsOnRoof;
  const selectedSystemKW = numberOfUnits * unitKW;
  const roofAreaRequired = numberOfUnits * inp.panel.areaPer500W;

  // ---- Year-1 energy balance (net metering, annual netting) ----
  const annualProduction = selectedSystemKW * kwhPerKwYear;
  const offsetUnits = Math.min(annualProduction, yearlyUsage);
  const surplusUnits = Math.max(annualProduction - yearlyUsage, 0);
  const residualUnits = Math.max(yearlyUsage - annualProduction, 0);
  const usageCoveredShare = yearlyUsage > 0 ? offsetUnits / yearlyUsage : 0;

  // ---- Bills before and after ----
  const fixed = Math.min(Math.max(inp.fixedCharges, 0), Math.max(inp.monthlyBill, 0));
  const annualBillBefore = Math.max(inp.monthlyBill, 0) * 12;
  const annualBillAfter = fixed * 12 + residualUnits * inp.energyRate;
  const annualExportCredit = surplusUnits * EXPORT_CREDIT_RATE;
  const annualSavings = annualBillBefore - annualBillAfter + annualExportCredit;

  // ---- Cost ----
  const baseCost = numberOfUnits * inp.panel.costPer500WUnit;
  const gstAmount = baseCost * GST_RATE;
  const costWithGST = baseCost + gstAmount;
  const subsidy = Math.min(pmSuryaGharSubsidy(selectedSystemKW), costWithGST);
  const costAfterSubsidy = Math.max(costWithGST - subsidy, 0);

  // ---- 25 years, year by year ----
  const yearly: YearRow[] = [];
  let cumulative = 0;
  let paybackYears = Infinity;
  for (let y = 1; y <= LIFETIME_YEARS; y++) {
    const production =
      annualProduction * Math.pow(1 - PANEL_DEGRADATION_PER_YEAR, y - 1);
    const rate = inp.energyRate * Math.pow(1 + TARIFF_ESCALATION_PER_YEAR, y - 1);
    const offset = Math.min(production, yearlyUsage);
    const surplus = Math.max(production - yearlyUsage, 0);
    // Fixed charges are paid with or without solar, so they cancel out.
    const savings = offset * rate + surplus * EXPORT_CREDIT_RATE;

    if (!isFinite(paybackYears) && savings > 0 && cumulative + savings >= costAfterSubsidy) {
      paybackYears = y - 1 + (costAfterSubsidy - cumulative) / savings;
    }
    cumulative += savings;
    yearly.push({ year: y, production, savings, cumulativeSavings: cumulative });
  }
  if (costAfterSubsidy <= 0) paybackYears = 0;

  // ---- CO₂ (usage covered by solar) ----
  const co2ReductionTons = (offsetUnits * CO2_KG_PER_KWH) / 1000;

  // ---- Loan illustration ----
  const downPayment = (DEFAULT_DOWN_PAYMENT_PERCENT / 100) * costAfterSubsidy;
  const loanAmount = Math.max(costAfterSubsidy - downPayment, 0);
  const emi = monthlyEmi(loanAmount, DEFAULT_INTEREST_RATE, DEFAULT_LOAN_TENURE_YEARS);
  const totalPayment = emi * DEFAULT_LOAN_TENURE_YEARS * 12;
  const totalInterest = Math.max(totalPayment - loanAmount, 0);
  const monthlyBillAfter = annualBillAfter / 12;
  const monthlyCostWithSolarAndEmi = monthlyBillAfter - annualExportCredit / 12 + emi;
  const netMonthlySavingsWithLoan = Math.max(inp.monthlyBill, 0) - monthlyCostWithSolarAndEmi;

  return {
    yearlyUsage,
    annualProduction,
    offsetUnits,
    surplusUnits,
    residualUnits,
    usageCoveredShare,
    usableRoofSpace,
    roofPotentialKW: inp.roofPotentialKW,
    targetSystemKW,
    maxUnitsOnRoof,
    numberOfUnits,
    selectedSystemKW,
    limitedByRoof,
    roofAreaRequired,
    annualBillBefore,
    annualBillAfter,
    monthlyBillAfter,
    annualExportCredit,
    annualSavings,
    lifetimeSavings: cumulative,
    yearly,
    baseCost,
    gstAmount,
    costWithGST,
    subsidy,
    costAfterSubsidy,
    paybackYears,
    co2ReductionTons,
    loanAmount,
    monthlyEmi: emi,
    totalInterest,
    totalPayment,
    monthlyCostWithSolarAndEmi,
    netMonthlySavingsWithLoan,
  };
}
