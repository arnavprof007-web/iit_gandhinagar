/**
 * Transparent emission factors and calculation utilities.
 * NOTE: Factors are indicative sample values based on published references
 * (e.g., Central Electricity Authority India baseline database, IPCC transport averages).
 * Labelled as illustrative estimates for demo/educational purposes.
 */

export const EMISSION_FACTORS = {
  // Grid electricity in India (National average approx 0.716 kg CO2e per kWh)
  ELECTRICITY_KG_PER_KWH: 0.716,

  // Road transport (kg CO2e per km average for personal passenger vehicle)
  PETROL_CAR_KG_PER_KM: 0.165,
  DIESEL_CAR_KG_PER_KM: 0.182,
  EV_CAR_KG_PER_KM: 0.052, // Indian grid mix average
  TWO_WHEELER_PETROL_KG_PER_KM: 0.045,
  TWO_WHEELER_EV_KG_PER_KM: 0.018,
  BUS_KG_PER_PASSENGER_KM: 0.038,
  METRO_KG_PER_PASSENGER_KM: 0.022,
  ACTIVE_TRANSIT_KG_PER_KM: 0.0, // Walking or cycling

  // Direct fuel consumption if litres known
  PETROL_KG_PER_LITRE: 2.31,
  DIESEL_KG_PER_LITRE: 2.68,

  // Cooking fuel
  LPG_KG_PER_CYLINDER_14_2KG: 42.45, // approx 2.989 kg CO2e per kg of LPG
  PIPED_GAS_KG_PER_SCM: 1.95, // Standard Cubic Metre of PNG
  ELECTRIC_INDUCTION_KG_PER_KWH: 0.716, // Matches grid electricity factor

  // Equivalencies for visualization
  TREE_ABSORPTION_KG_PER_YEAR: 21.77, // Average mature tree absorbs ~22 kg CO2 per year
  CAR_KM_EQUIVALENT_FACTOR: 0.165,
};

/**
 * Calculate estimated CO2e from electricity consumption
 */
export function calculateElectricityEmissions(kwh: number): number {
  if (kwh <= 0 || isNaN(kwh)) return 0;
  return Number((kwh * EMISSION_FACTORS.ELECTRICITY_KG_PER_KWH).toFixed(2));
}

/**
 * Calculate estimated CO2e from transport activity
 */
export function calculateTransportEmissions(
  mode: string,
  distanceKm: number,
  fuelLitres?: number
): number {
  if (distanceKm < 0 || isNaN(distanceKm)) return 0;

  if (fuelLitres && fuelLitres > 0) {
    if (mode === 'diesel_car') {
      return Number((fuelLitres * EMISSION_FACTORS.DIESEL_KG_PER_LITRE).toFixed(2));
    }
    return Number((fuelLitres * EMISSION_FACTORS.PETROL_KG_PER_LITRE).toFixed(2));
  }

  let factor = EMISSION_FACTORS.PETROL_CAR_KG_PER_KM;
  switch (mode) {
    case 'diesel_car':
      factor = EMISSION_FACTORS.DIESEL_CAR_KG_PER_KM;
      break;
    case 'ev':
      factor = EMISSION_FACTORS.EV_CAR_KG_PER_KM;
      break;
    case 'two_wheeler_petrol':
      factor = EMISSION_FACTORS.TWO_WHEELER_PETROL_KG_PER_KM;
      break;
    case 'two_wheeler_ev':
      factor = EMISSION_FACTORS.TWO_WHEELER_EV_KG_PER_KM;
      break;
    case 'bus':
      factor = EMISSION_FACTORS.BUS_KG_PER_PASSENGER_KM;
      break;
    case 'metro':
      factor = EMISSION_FACTORS.METRO_KG_PER_PASSENGER_KM;
      break;
    case 'cycling':
    case 'walking':
      factor = EMISSION_FACTORS.ACTIVE_TRANSIT_KG_PER_KM;
      break;
    default:
      factor = EMISSION_FACTORS.PETROL_CAR_KG_PER_KM;
  }

  return Number((distanceKm * factor).toFixed(2));
}

/**
 * Calculate estimated CO2e from cooking fuel
 */
export function calculateCookingEmissions(fuelType: string, quantity: number): number {
  if (quantity <= 0 || isNaN(quantity)) return 0;

  let factor = EMISSION_FACTORS.LPG_KG_PER_CYLINDER_14_2KG;
  if (fuelType === 'piped_gas') {
    factor = EMISSION_FACTORS.PIPED_GAS_KG_PER_SCM;
  } else if (fuelType === 'electric_induction') {
    factor = EMISSION_FACTORS.ELECTRIC_INDUCTION_KG_PER_KWH;
  }

  return Number((quantity * factor).toFixed(2));
}

/**
 * Calculate total footprint and baseline delta percentage
 */
export function calculateTotalFootprint(
  electricityKg: number,
  transportKg: number,
  cookingKg: number
): number {
  const sum = (electricityKg || 0) + (transportKg || 0) + (cookingKg || 0);
  return Number(sum.toFixed(2));
}

/**
 * Calculate delta percentage against baseline:
 * Negative value indicates reduction (green improvement)
 */
export function calculateDeltaPercentage(current: number, baseline: number): number {
  if (!baseline || baseline <= 0) return 0;
  const delta = ((current - baseline) / baseline) * 100;
  return Number(delta.toFixed(1));
}

/**
 * Compute Green Score (0-100) based on:
 * - Consumption relative to baseline (up to 40 pts)
 * - Challenges completed (up to 30 pts)
 * - Daily active streak (up to 15 pts)
 * - Adoption of renewable / sustainable practices (up to 15 pts)
 */
export function calculateGreenScore(
  baselineKg: number,
  currentKg: number,
  completedChallengesCount: number,
  streakDays: number,
  hasSolarOrRenewable = false
): number {
  let score = 50; // base score

  // Improvement factor (up to +/- 25)
  if (baselineKg > 0) {
    const reductionRatio = (baselineKg - currentKg) / baselineKg;
    score += Math.max(-25, Math.min(25, reductionRatio * 50));
  }

  // Challenge factor (2 points per challenge up to 20 pts)
  score += Math.min(20, completedChallengesCount * 2);

  // Streak factor (1 pt per 2 streak days, up to 10 pts)
  score += Math.min(10, Math.floor(streakDays / 2));

  // Solar or clean energy adoption
  if (hasSolarOrRenewable) {
    score += 8;
  }

  return Math.min(100, Math.max(10, Math.round(score)));
}

/**
 * Convert kg CO2 to number of equivalent tree-years
 */
export function co2ToTreeEquivalent(co2Kg: number): number {
  if (co2Kg <= 0) return 0;
  return Number((co2Kg / EMISSION_FACTORS.TREE_ABSORPTION_KG_PER_YEAR).toFixed(1));
}
