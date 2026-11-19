import {
  calculateReport,
  deriveConsumption,
  pmSuryaGharSubsidy,
  monthlyEmi,
  PERFORMANCE_RATIO,
  ReportInputs,
} from "./solarCalculations";

// The reviewed case: ₹5,500 bill, Gujarat tariff ₹6.10, 183.32 m² roof,
// 26.40 kW roof potential, Victor Solar monocrystalline. The irradiance is
// the value that gives the PDF's 11,660.45 kWh from 6.50 kW.
const IRRADIANCE = 11660.45 / (6.5 * 365 * PERFORMANCE_RATIO);
const MONO = { areaPer500W: 2.5, costPer500WUnit: 20000 };

function exampleInputs(over: Partial<ReportInputs> = {}): ReportInputs {
  const c = deriveConsumption({ monthlyBill: 5500, tariffRate: 6.1 });
  return {
    monthlyUnits: c.monthlyUnits,
    monthlyBill: 5500,
    fixedCharges: 0,
    energyRate: c.energyRate,
    irradiance: IRRADIANCE,
    totalRoofArea: 183.32,
    roofPotentialKW: 26.4,
    panel: MONO,
    ...over,
  };
}

describe("consumption", () => {
  it("estimates units from the bill amount", () => {
    const c = deriveConsumption({ monthlyBill: 5500, tariffRate: 6.1 });
    expect(c.monthlyUnits).toBeCloseTo(901.639, 3);
    expect(c.source).toBe("estimated-from-bill");
  });

  it("takes fixed charges off before dividing by the tariff", () => {
    const c = deriveConsumption({ monthlyBill: 5500, fixedCharges: 300, tariffRate: 6.1 });
    expect(c.monthlyUnits).toBeCloseTo(5200 / 6.1, 6);
  });

  it("prefers the units printed on the bill", () => {
    const c = deriveConsumption({ monthlyBill: 5500, fixedCharges: 300, billUnits: 820, tariffRate: 6.1 });
    expect(c.monthlyUnits).toBe(820);
    expect(c.source).toBe("bill-units");
    expect(c.energyRate).toBeCloseTo(5200 / 820, 9);
  });
});

describe("reviewed example (₹5,500 bill, no fixed charges)", () => {
  const r = calculateReport(exampleInputs());

  it("separates roof potential, target and selected system", () => {
    expect(r.roofPotentialKW).toBe(26.4);
    expect(r.targetSystemKW).toBeCloseTo(6.03, 2);
    expect(r.numberOfUnits).toBe(13);
    expect(r.selectedSystemKW).toBe(6.5);
  });

  it("generates from the selected 6.50 kW system", () => {
    expect(r.yearlyUsage).toBeCloseTo(10819.67, 2);
    expect(r.annualProduction).toBeCloseTo(11660.45, 2);
    expect(r.surplusUnits).toBeCloseTo(840.78, 1);
  });

  it("works savings out as bill before minus bill after, with no rounding drift", () => {
    expect(r.annualBillBefore).toBe(66000);
    expect(r.annualBillAfter).toBeCloseTo(0, 6);
    expect(r.annualSavings).toBeCloseTo(66000, 6); // was ₹66,000.05
  });

  it("prices the 13 panels and the subsidy on 6.50 kW", () => {
    expect(r.baseCost).toBe(260000);
    expect(r.costWithGST).toBeCloseTo(291200, 6);
    expect(r.subsidy).toBe(78000);
    expect(r.costAfterSubsidy).toBeCloseTo(213200, 6);
    expect(r.paybackYears).toBeCloseTo(3.23, 2);
  });

  it("adds 25 years up year by year with degradation", () => {
    // Output stays above usage until year 15, so years 1-15 save ₹66,000.
    expect(r.yearly[14].savings).toBeCloseTo(66000, 6);
    expect(r.yearly[15].savings).toBeLessThan(66000);
    expect(r.lifetimeSavings).toBeLessThan(66000 * 25);
    const manual = r.yearly.reduce((sum, y) => sum + y.savings, 0);
    expect(r.lifetimeSavings).toBeCloseTo(manual, 6);
  });

  it("reports CO₂ in tonnes from the usage covered", () => {
    expect(r.co2ReductionTons).toBeCloseTo(9.95, 2);
    expect(r.usageCoveredShare).toBe(1);
  });
});

describe("fixed charges stay on the bill", () => {
  const r = calculateReport(
    exampleInputs({
      fixedCharges: 300,
      monthlyUnits: 5200 / 6.1,
      energyRate: 6.1,
    })
  );
  it("keeps them in the bill after solar and out of the savings", () => {
    expect(r.monthlyBillAfter).toBeCloseTo(300, 6);
    expect(r.annualSavings).toBeCloseTo(5200 * 12, 6);
    // Lower usage → 12 panels (6.00 kW): ₹2,40,000 + 12% GST − ₹78,000.
    expect(r.numberOfUnits).toBe(12);
    expect(r.costAfterSubsidy).toBeCloseTo(190800, 6);
    expect(r.paybackYears).toBeCloseTo(190800 / 62400, 6);
  });
});

describe("system smaller than usage", () => {
  const r = calculateReport(exampleInputs({ roofPotentialKW: 4, totalRoofArea: 30 }));
  it("is capped at what fits on the roof and leaves a residual bill", () => {
    // 30 m² × 80% = 24 m² → 9 panels by area; 4 kW → 8 panels by potential.
    expect(r.numberOfUnits).toBe(8);
    expect(r.selectedSystemKW).toBe(4);
    expect(r.limitedByRoof).toBe(true);
    expect(r.residualUnits).toBeGreaterThan(0);
    const expected = 66000 - r.residualUnits * (66000 / r.yearlyUsage);
    expect(r.annualSavings).toBeCloseTo(expected, 6);
  });
});

describe("panel efficiency changes roof area, not kWh per kW", () => {
  it("gives the same yield per kW for poly and mono", () => {
    const mono = calculateReport(exampleInputs());
    const poly = calculateReport(exampleInputs({ panel: { areaPer500W: 3.1, costPer500WUnit: 17500 } }));
    expect(poly.numberOfUnits).toBe(mono.numberOfUnits);
    expect(poly.annualProduction).toBeCloseTo(mono.annualProduction, 6);
    expect(poly.roofAreaRequired).toBeCloseTo(13 * 3.1, 6);
  });
});

describe("helpers", () => {
  it("subsidy follows PM Surya Ghar slabs", () => {
    expect(pmSuryaGharSubsidy(1)).toBe(30000);
    expect(pmSuryaGharSubsidy(2)).toBe(60000);
    expect(pmSuryaGharSubsidy(2.5)).toBe(69000);
    expect(pmSuryaGharSubsidy(3)).toBe(78000);
    expect(pmSuryaGharSubsidy(6.5)).toBe(78000);
  });

  it("EMI matches the standard formula", () => {
    // ₹1,70,560 at 8.5% for 10 years ≈ ₹2,114.67
    expect(monthlyEmi(170560, 8.5, 10)).toBeCloseTo(2114.67, 1);
  });
});
