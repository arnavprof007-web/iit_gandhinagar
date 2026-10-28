import { describe, it, expect } from 'vitest';
import {
  calculateSolarFeasibility,
  calculateIndicativeSubsidy,
  SOLAR_CONSTANTS,
} from '../utils/solarCalculations';

describe('Solar Calculation Utilities', () => {
  it('applies PM Surya Ghar tiered benchmark subsidies correctly', () => {
    expect(calculateIndicativeSubsidy(0)).toBe(0);
    expect(calculateIndicativeSubsidy(1)).toBe(30000);
    expect(calculateIndicativeSubsidy(2)).toBe(60000);
    expect(calculateIndicativeSubsidy(3)).toBe(78000);
    expect(calculateIndicativeSubsidy(5)).toBe(78000); // capped at ₹78,000 max
  });

  it('evaluates solar feasibility for standard household parameters', () => {
    const input = {
      city: 'Gandhinagar',
      monthlyKwh: 260,
      monthlyBillInr: 1980,
      tariffInrPerKwh: 7.6,
      usableRoofSqFt: 350,
    };

    const res = calculateSolarFeasibility(input);

    expect(res.recommendedCapacityKw).toBeGreaterThanOrEqual(1);
    expect(res.recommendedCapacityKw).toBeLessThanOrEqual(3.5);
    expect(res.annualGenerationKwh).toBeGreaterThan(0);
    expect(res.monthlyGenerationKwh).toBeGreaterThan(0);
    expect(res.annualSavingsInr).toBeGreaterThan(0);
    expect(res.estimatedPaybackYears).toBeGreaterThan(0);
    expect(res.estimatedPaybackYears).toBeLessThan(15);
    expect(res.lifetimeSavingsInr).toBeGreaterThan(0);
    expect(res.co2OffsetTonnesPerYear).toBeGreaterThan(0);
    expect(res.monthlyProfile).toHaveLength(12);
  });

  it('respects user-specified target capacity overrides', () => {
    const input = {
      city: 'Pune',
      monthlyKwh: 300,
      monthlyBillInr: 2400,
      tariffInrPerKwh: 8.0,
      usableRoofSqFt: 500,
      targetCapacityKw: 4.0,
    };

    const res = calculateSolarFeasibility(input);
    expect(res.recommendedCapacityKw).toBe(4.0);
    expect(res.requiredRoofSqFt).toBe(400); // 4 * 100 sq ft
  });

  it('handles constrained rooftop space appropriately', () => {
    const input = {
      city: 'Gandhinagar',
      monthlyKwh: 500, // high consumption
      monthlyBillInr: 4000,
      tariffInrPerKwh: 8.0,
      usableRoofSqFt: 150, // but limited terrace space
    };

    const res = calculateSolarFeasibility(input);
    // Roof limit: 150 / 100 = 1.5 kW
    expect(res.recommendedCapacityKw).toBeLessThanOrEqual(1.5);
  });
});
