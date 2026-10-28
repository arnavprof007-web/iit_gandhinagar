import { ElectricityRecord, TransportRecord, CookingFuelRecord, FootprintSummary } from '../types';
import { calculateElectricityEmissions, calculateCookingEmissions, calculateTotalFootprint } from '../utils/footprintCalculations';

export const INITIAL_ELECTRICITY_RECORDS: ElectricityRecord[] = [
  { id: 'el_1', month: 'Nov', year: 2025, consumptionKwh: 310, costInr: 2356, estimatedEmissionsKg: calculateElectricityEmissions(310), isBaseline: true },
  { id: 'el_2', month: 'Dec', year: 2025, consumptionKwh: 295, costInr: 2242, estimatedEmissionsKg: calculateElectricityEmissions(295), isBaseline: true },
  { id: 'el_3', month: 'Jan', year: 2026, consumptionKwh: 285, costInr: 2166, estimatedEmissionsKg: calculateElectricityEmissions(285) },
  { id: 'el_4', month: 'Feb', year: 2026, consumptionKwh: 270, costInr: 2052, estimatedEmissionsKg: calculateElectricityEmissions(270) },
  { id: 'el_5', month: 'Mar', year: 2026, consumptionKwh: 290, costInr: 2204, estimatedEmissionsKg: calculateElectricityEmissions(290) },
  { id: 'el_6', month: 'Apr', year: 2026, consumptionKwh: 320, costInr: 2432, estimatedEmissionsKg: calculateElectricityEmissions(320) },
  { id: 'el_7', month: 'May', year: 2026, consumptionKwh: 340, costInr: 2584, estimatedEmissionsKg: calculateElectricityEmissions(340) },
  { id: 'el_8', month: 'Jun', year: 2026, consumptionKwh: 310, costInr: 2356, estimatedEmissionsKg: calculateElectricityEmissions(310) },
  { id: 'el_9', month: 'Jul', year: 2026, consumptionKwh: 280, costInr: 2128, estimatedEmissionsKg: calculateElectricityEmissions(280) },
  { id: 'el_10', month: 'Aug', year: 2026, consumptionKwh: 275, costInr: 2090, estimatedEmissionsKg: calculateElectricityEmissions(275) },
  { id: 'el_11', month: 'Sep', year: 2026, consumptionKwh: 265, costInr: 2014, estimatedEmissionsKg: calculateElectricityEmissions(265) },
  { id: 'el_12', month: 'Oct', year: 2026, consumptionKwh: 248, costInr: 1884, estimatedEmissionsKg: calculateElectricityEmissions(248) },
];

export const INITIAL_TRANSPORT_RECORDS: TransportRecord[] = [
  { id: 'tr_1', date: '2026-10-25', mode: 'metro', distanceKm: 28, estimatedEmissionsKg: 0.62 },
  { id: 'tr_2', date: '2026-10-24', mode: 'two_wheeler_petrol', distanceKm: 16, estimatedEmissionsKg: 0.72 },
  { id: 'tr_3', date: '2026-10-22', mode: 'ev', distanceKm: 35, estimatedEmissionsKg: 1.82 },
  { id: 'tr_4', date: '2026-10-20', mode: 'bus', distanceKm: 20, estimatedEmissionsKg: 0.76 },
  { id: 'tr_5', date: '2026-10-18', mode: 'cycling', distanceKm: 8, estimatedEmissionsKg: 0.0 },
  { id: 'tr_6', date: '2026-10-15', mode: 'petrol_car', distanceKm: 42, estimatedEmissionsKg: 6.93 },
  { id: 'tr_7', date: '2026-10-12', mode: 'two_wheeler_petrol', distanceKm: 22, estimatedEmissionsKg: 0.99 },
];

export const INITIAL_COOKING_RECORDS: CookingFuelRecord[] = [
  { id: 'ck_1', month: 'Aug', year: 2026, fuelType: 'piped_gas', quantity: 14, estimatedEmissionsKg: calculateCookingEmissions('piped_gas', 14) },
  { id: 'ck_2', month: 'Sep', year: 2026, fuelType: 'piped_gas', quantity: 13, estimatedEmissionsKg: calculateCookingEmissions('piped_gas', 13) },
  { id: 'ck_3', month: 'Oct', year: 2026, fuelType: 'piped_gas', quantity: 12, estimatedEmissionsKg: calculateCookingEmissions('piped_gas', 12) },
];

export const INITIAL_FOOTPRINT_SUMMARIES: FootprintSummary[] = [
  {
    period: 'May 2026',
    month: 'May',
    year: 2026,
    electricityKg: 243.4,
    transportKg: 68.5,
    cookingKg: 25.4,
    totalKg: calculateTotalFootprint(243.4, 68.5, 25.4),
    baselineTotalKg: 365.0,
    deltaPercentage: -7.6,
  },
  {
    period: 'Jun 2026',
    month: 'Jun',
    year: 2026,
    electricityKg: 221.9,
    transportKg: 62.0,
    cookingKg: 25.4,
    totalKg: calculateTotalFootprint(221.9, 62.0, 25.4),
    baselineTotalKg: 365.0,
    deltaPercentage: -15.2,
  },
  {
    period: 'Jul 2026',
    month: 'Jul',
    year: 2026,
    electricityKg: 200.5,
    transportKg: 58.2,
    cookingKg: 25.4,
    totalKg: calculateTotalFootprint(200.5, 58.2, 25.4),
    baselineTotalKg: 365.0,
    deltaPercentage: -22.1,
  },
  {
    period: 'Aug 2026',
    month: 'Aug',
    year: 2026,
    electricityKg: 196.9,
    transportKg: 54.0,
    cookingKg: 27.3,
    totalKg: calculateTotalFootprint(196.9, 54.0, 27.3),
    baselineTotalKg: 365.0,
    deltaPercentage: -23.8,
  },
  {
    period: 'Sep 2026',
    month: 'Sep',
    year: 2026,
    electricityKg: 189.7,
    transportKg: 51.5,
    cookingKg: 25.4,
    totalKg: calculateTotalFootprint(189.7, 51.5, 25.4),
    baselineTotalKg: 365.0,
    deltaPercentage: -26.9,
  },
  {
    period: 'Oct 2026',
    month: 'Oct',
    year: 2026,
    electricityKg: 177.6,
    transportKg: 46.8,
    cookingKg: 23.4,
    totalKg: calculateTotalFootprint(177.6, 46.8, 23.4),
    baselineTotalKg: 365.0,
    deltaPercentage: -32.1,
  },
];
