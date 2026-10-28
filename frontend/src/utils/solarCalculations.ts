import { SolarAssessmentInput, SolarAssessmentResult } from '../types';

export const SOLAR_CONSTANTS = {
  // Average daily generation per kWp in India: approx 4.0 - 4.5 kWh/day depending on region
  DAILY_KWH_PER_KW: 4.1,
  ANNUAL_DAYS_EFFECTIVE: 330, // Accounting for monsoon and maintenance days
  SQ_FT_REQUIRED_PER_KW: 100, // Usable rooftop space required per 1 kWp panel array
  BENCHMARK_COST_PER_KW: 55000, // Approximate benchmark cost in INR
  ANNUAL_DEGRADATION_RATE: 0.007, // 0.7% degradation per year
  PANEL_LIFETIME_YEARS: 25,
  CO2_AVOIDED_PER_KWH_KG: 0.82, // Avoided thermal grid emissions

  // Indicative benchmark subsidy slabs (e.g. based on PM Surya Ghar Muft Bijli Yojana illustrative guidelines)
  SUBSIDY_TIER_1_KW: 1, // up to 1 kW: ₹30,000
  SUBSIDY_TIER_1_AMOUNT: 30000,
  SUBSIDY_TIER_2_KW: 2, // up to 2 kW: ₹60,000
  SUBSIDY_TIER_2_AMOUNT: 60000,
  SUBSIDY_MAX_KW: 3, // 3 kW and above max cap: ₹78,000
  SUBSIDY_MAX_AMOUNT: 78000,
};

/**
 * Calculate indicative subsidy based on capacity
 * (Clearly noted as illustrative / subject to DISCOM & scheme approval)
 */
export function calculateIndicativeSubsidy(capacityKw: number): number {
  if (capacityKw <= 0) return 0;
  if (capacityKw <= 1) return SOLAR_CONSTANTS.SUBSIDY_TIER_1_AMOUNT;
  if (capacityKw <= 2) return SOLAR_CONSTANTS.SUBSIDY_TIER_2_AMOUNT;
  return SOLAR_CONSTANTS.SUBSIDY_MAX_AMOUNT;
}

/**
 * Evaluate solar feasibility given household parameters
 */
export function calculateSolarFeasibility(input: SolarAssessmentInput): SolarAssessmentResult {
  const {
    monthlyKwh = 250,
    monthlyBillInr = 2000,
    tariffInrPerKwh = 8,
    usableRoofSqFt = 400,
    targetCapacityKw,
    estimatedCostInr,
  } = input;

  // Monthly generation requirement based on consumption
  // In typical setups: 1 kWp produces ~120 kWh per month
  const estimatedMonthlyGenPerKw = SOLAR_CONSTANTS.DAILY_KWH_PER_KW * 30;
  
  // Calculate recommended system capacity (kW)
  // Max capacity allowed by roof space: usableRoofSqFt / 100
  const maxCapacityByRoof = Math.floor((usableRoofSqFt / SOLAR_CONSTANTS.SQ_FT_REQUIRED_PER_KW) * 10) / 10;
  
  // Capacity needed to offset ~85% of monthly consumption:
  const neededCapacity = Math.ceil(((monthlyKwh * 0.85) / estimatedMonthlyGenPerKw) * 10) / 10;

  // Final recommended capacity
  const recommendedCapacityKw = targetCapacityKw && targetCapacityKw > 0
    ? targetCapacityKw
    : Math.max(1, Math.min(neededCapacity, maxCapacityByRoof || 1));

  const requiredRoofSqFt = Math.round(recommendedCapacityKw * SOLAR_CONSTANTS.SQ_FT_REQUIRED_PER_KW);

  // Annual generation: capacity * daily kWh * effective days
  const annualGenerationKwh = Math.round(
    recommendedCapacityKw * SOLAR_CONSTANTS.DAILY_KWH_PER_KW * SOLAR_CONSTANTS.ANNUAL_DAYS_EFFECTIVE
  );
  const monthlyGenerationKwh = Math.round(annualGenerationKwh / 12);

  // Tariff effective rate
  const effectiveTariff = tariffInrPerKwh > 0 ? tariffInrPerKwh : (monthlyBillInr > 0 && monthlyKwh > 0 ? monthlyBillInr / monthlyKwh : 7.5);
  
  // Annual financial savings (capped by actual consumption value)
  const effectiveKwhSavedPerYear = Math.min(annualGenerationKwh, monthlyKwh * 12);
  const annualSavingsInr = Math.round(effectiveKwhSavedPerYear * effectiveTariff);
  const monthlySavingsInr = Math.round(annualSavingsInr / 12);

  // System costs
  const baseSystemCost = estimatedCostInr && estimatedCostInr > 0
    ? estimatedCostInr
    : Math.round(recommendedCapacityKw * SOLAR_CONSTANTS.BENCHMARK_COST_PER_KW);

  const subsidyApplicableInr = calculateIndicativeSubsidy(recommendedCapacityKw);
  const netSystemCostInr = Math.max(0, baseSystemCost - subsidyApplicableInr);

  // Payback period in years
  const estimatedPaybackYears = annualSavingsInr > 0
    ? Number((netSystemCostInr / annualSavingsInr).toFixed(1))
    : 0;

  // 25-Year Lifetime Savings accounting for 0.7% annual degradation
  let lifetimeSavingsInr = 0;
  let currentYearGeneration = annualGenerationKwh;
  for (let year = 1; year <= SOLAR_CONSTANTS.PANEL_LIFETIME_YEARS; year++) {
    lifetimeSavingsInr += currentYearGeneration * effectiveTariff;
    currentYearGeneration *= (1 - SOLAR_CONSTANTS.ANNUAL_DEGRADATION_RATE);
  }
  lifetimeSavingsInr = Math.round(lifetimeSavingsInr - netSystemCostInr);

  // Environmental impact
  const co2OffsetTonnesPerYear = Number(
    ((annualGenerationKwh * SOLAR_CONSTANTS.CO2_AVOIDED_PER_KWH_KG) / 1000).toFixed(2)
  );
  const treesEquivalent = Math.round((co2OffsetTonnesPerYear * 1000) / 22);

  // Monthly profile seasonality in India (high in Mar-May, moderate in winter, lower in Jul-Aug monsoon)
  const seasonalMultipliers = [
    { month: 'Jan', factor: 0.95 },
    { month: 'Feb', factor: 1.05 },
    { month: 'Mar', factor: 1.20 },
    { month: 'Apr', factor: 1.25 },
    { month: 'May', factor: 1.30 },
    { month: 'Jun', factor: 0.90 },
    { month: 'Jul', factor: 0.75 },
    { month: 'Aug', factor: 0.70 },
    { month: 'Sep', factor: 0.85 },
    { month: 'Oct', factor: 1.05 },
    { month: 'Nov', factor: 1.00 },
    { month: 'Dec', factor: 0.90 },
  ];

  const monthlyProfile = seasonalMultipliers.map((m) => {
    const gen = Math.round(monthlyGenerationKwh * m.factor);
    return {
      month: m.month,
      generationKwh: gen,
      savingsInr: Math.round(gen * effectiveTariff),
    };
  });

  const assumptions = [
    `Average solar insolation assumption: ${SOLAR_CONSTANTS.DAILY_KWH_PER_KW} kWh/kWp/day across ~${SOLAR_CONSTANTS.ANNUAL_DAYS_EFFECTIVE} sunny days.`,
    `Space requirement estimated at ${SOLAR_CONSTANTS.SQ_FT_REQUIRED_PER_KW} sq. ft. of shadow-free rooftop per kWp.`,
    `Benchmark capital cost estimated at ₹${SOLAR_CONSTANTS.BENCHMARK_COST_PER_KW.toLocaleString('en-IN')}/kWp subject to vendor quotation.`,
    `Indicative subsidy calculation of ₹${subsidyApplicableInr.toLocaleString('en-IN')} based on current national rooftop solar guidelines.`,
    `Grid emission avoidance factor: ${SOLAR_CONSTANTS.CO2_AVOIDED_PER_KWH_KG} kg CO2e / kWh generated.`,
    'Lifetime savings modeled over 25 years with a 0.7% annual panel degradation rate.',
  ];

  return {
    recommendedCapacityKw,
    annualGenerationKwh,
    monthlyGenerationKwh,
    annualSavingsInr,
    monthlySavingsInr,
    estimatedSystemCostInr: baseSystemCost,
    subsidyApplicableInr,
    netSystemCostInr,
    estimatedPaybackYears,
    lifetimeSavingsInr,
    co2OffsetTonnesPerYear,
    treesEquivalent,
    requiredRoofSqFt,
    monthlyProfile,
    assumptions,
  };
}
