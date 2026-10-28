import { SolarAssessmentInput, SolarAssessmentResult, UserProfile } from '../types';
import { calculateSolarFeasibility } from '../utils/solarCalculations';
import { getStoredItem, setStoredItem } from './storage';

const SOLAR_LAST_KEY = 'last_solar_assessment';

export const solarService = {
  getDefaultInput(user?: UserProfile): SolarAssessmentInput {
    return {
      city: user?.city || 'Gandhinagar',
      monthlyKwh: user?.electricityKwh || 260,
      monthlyBillInr: user?.monthlyBillInr || 1980,
      tariffInrPerKwh: user?.tariffInrPerKwh || 7.6,
      usableRoofSqFt: 350,
      targetCapacityKw: undefined,
      estimatedCostInr: undefined,
    };
  },

  assess(input: SolarAssessmentInput): SolarAssessmentResult {
    const result = calculateSolarFeasibility(input);
    setStoredItem(SOLAR_LAST_KEY, result);
    return result;
  },

  getLastAssessment(): SolarAssessmentResult | null {
    return getStoredItem<SolarAssessmentResult | null>(SOLAR_LAST_KEY, null);
  },
};
