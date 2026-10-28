import { describe, it, expect } from 'vitest';
import {
  calculateElectricityEmissions,
  calculateTransportEmissions,
  calculateCookingEmissions,
  calculateTotalFootprint,
  calculateDeltaPercentage,
  calculateGreenScore,
  co2ToTreeEquivalent,
  EMISSION_FACTORS,
} from '../utils/footprintCalculations';

describe('Footprint Calculation Utilities', () => {
  it('calculates electricity emissions using CEA India grid baseline (~0.716 kg/kWh)', () => {
    const kwh = 100;
    const emissions = calculateElectricityEmissions(kwh);
    expect(emissions).toBe(71.6);
  });

  it('handles negative or zero electricity inputs gracefully', () => {
    expect(calculateElectricityEmissions(0)).toBe(0);
    expect(calculateElectricityEmissions(-50)).toBe(0);
  });

  it('calculates transport emissions for various modes', () => {
    // Petrol car: 10 km * 0.165 = 1.65 kg
    const carEmissions = calculateTransportEmissions('petrol_car', 10);
    expect(carEmissions).toBe(1.65);

    // Metro: 10 km * 0.022 = 0.22 kg
    const metroEmissions = calculateTransportEmissions('metro', 10);
    expect(metroEmissions).toBe(0.22);

    // Cycling / walking is zero
    expect(calculateTransportEmissions('cycling', 15)).toBe(0);
    expect(calculateTransportEmissions('walking', 5)).toBe(0);
  });

  it('calculates cooking emissions for piped gas and LPG', () => {
    // Piped gas: 10 SCM * 1.95 = 19.5 kg
    expect(calculateCookingEmissions('piped_gas', 10)).toBe(19.5);

    // LPG: 1 cylinder (14.2 kg) = 42.45 kg
    expect(calculateCookingEmissions('lpg', 1)).toBe(42.45);
  });

  it('calculates total footprint by combining categories without double counting', () => {
    const total = calculateTotalFootprint(177.6, 46.8, 23.4);
    expect(total).toBe(247.8);
  });

  it('calculates baseline delta percentage correctly', () => {
    // Current 247.8 vs baseline 365.0 -> -32.1%
    const delta = calculateDeltaPercentage(247.8, 365.0);
    expect(delta).toBe(-32.1);
  });

  it('constrains Green Score within 0 to 100 range', () => {
    const scoreNormal = calculateGreenScore(365, 247.8, 5, 12, true);
    expect(scoreNormal).toBeGreaterThanOrEqual(10);
    expect(scoreNormal).toBeLessThanOrEqual(100);

    const scoreExtreme = calculateGreenScore(1000, 10, 50, 100, true);
    expect(scoreExtreme).toBeLessThanOrEqual(100);
  });

  it('converts CO2 to equivalent tree-years absorption', () => {
    // 21.77 kg CO2 = 1 tree
    const trees = co2ToTreeEquivalent(43.54);
    expect(trees).toBe(2);
  });
});
