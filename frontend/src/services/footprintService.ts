import { ElectricityRecord, TransportRecord, CookingFuelRecord, FootprintSummary } from '../types';
import {
  INITIAL_ELECTRICITY_RECORDS,
  INITIAL_TRANSPORT_RECORDS,
  INITIAL_COOKING_RECORDS,
  INITIAL_FOOTPRINT_SUMMARIES,
} from '../mocks/mockFootprintData';
import {
  calculateElectricityEmissions,
  calculateTransportEmissions,
  calculateCookingEmissions,
  calculateTotalFootprint,
  calculateDeltaPercentage,
} from '../utils/footprintCalculations';
import { getStoredItem, setStoredItem } from './storage';

const ELEC_KEY = 'electricity_records';
const TRANS_KEY = 'transport_records';
const COOK_KEY = 'cooking_records';
const SUMM_KEY = 'footprint_summaries';

export const footprintService = {
  getElectricityRecords(): ElectricityRecord[] {
    return getStoredItem<ElectricityRecord[]>(ELEC_KEY, INITIAL_ELECTRICITY_RECORDS);
  },

  addElectricityRecord(
    record: Omit<ElectricityRecord, 'id' | 'estimatedEmissionsKg'>
  ): ElectricityRecord {
    const list = this.getElectricityRecords();
    const emissions = calculateElectricityEmissions(record.consumptionKwh);
    const newRecord: ElectricityRecord = {
      ...record,
      id: `el_${Date.now()}`,
      estimatedEmissionsKg: emissions,
    };
    const updated = [...list, newRecord];
    setStoredItem(ELEC_KEY, updated);
    this.recalculateCurrentSummary();
    return newRecord;
  },

  getTransportRecords(): TransportRecord[] {
    return getStoredItem<TransportRecord[]>(TRANS_KEY, INITIAL_TRANSPORT_RECORDS);
  },

  addTransportRecord(
    record: Omit<TransportRecord, 'id' | 'estimatedEmissionsKg'>
  ): TransportRecord {
    const list = this.getTransportRecords();
    const emissions = calculateTransportEmissions(record.mode, record.distanceKm, record.fuelLitres);
    const newRecord: TransportRecord = {
      ...record,
      id: `tr_${Date.now()}`,
      estimatedEmissionsKg: emissions,
    };
    const updated = [newRecord, ...list];
    setStoredItem(TRANS_KEY, updated);
    this.recalculateCurrentSummary();
    return newRecord;
  },

  deleteTransportRecord(id: string): void {
    const list = this.getTransportRecords().filter((r) => r.id !== id);
    setStoredItem(TRANS_KEY, list);
    this.recalculateCurrentSummary();
  },

  getCookingRecords(): CookingFuelRecord[] {
    return getStoredItem<CookingFuelRecord[]>(COOK_KEY, INITIAL_COOKING_RECORDS);
  },

  addCookingRecord(
    record: Omit<CookingFuelRecord, 'id' | 'estimatedEmissionsKg'>
  ): CookingFuelRecord {
    const list = this.getCookingRecords();
    const emissions = calculateCookingEmissions(record.fuelType, record.quantity);
    const newRecord: CookingFuelRecord = {
      ...record,
      id: `ck_${Date.now()}`,
      estimatedEmissionsKg: emissions,
    };
    const updated = [...list, newRecord];
    setStoredItem(COOK_KEY, updated);
    this.recalculateCurrentSummary();
    return newRecord;
  },

  getFootprintSummaries(): FootprintSummary[] {
    return getStoredItem<FootprintSummary[]>(SUMM_KEY, INITIAL_FOOTPRINT_SUMMARIES);
  },

  getCurrentMonthFootprint(): FootprintSummary {
    const summaries = this.getFootprintSummaries();
    return summaries[summaries.length - 1];
  },

  recalculateCurrentSummary(): FootprintSummary {
    const elecs = this.getElectricityRecords();
    const trans = this.getTransportRecords();
    const cooks = this.getCookingRecords();

    const latestElec = elecs[elecs.length - 1]?.estimatedEmissionsKg || 177.6;
    const recentTransTotal = trans.slice(0, 7).reduce((acc, curr) => acc + curr.estimatedEmissionsKg, 0);
    const latestCook = cooks[cooks.length - 1]?.estimatedEmissionsKg || 23.4;

    const total = calculateTotalFootprint(latestElec, recentTransTotal, latestCook);
    const baseline = 365.0;
    const deltaPercentage = calculateDeltaPercentage(total, baseline);

    const updatedSummary: FootprintSummary = {
      period: 'October 2026',
      month: 'Oct',
      year: 2026,
      electricityKg: latestElec,
      transportKg: Number(recentTransTotal.toFixed(1)),
      cookingKg: latestCook,
      totalKg: total,
      baselineTotalKg: baseline,
      deltaPercentage,
    };

    const summaries = [...this.getFootprintSummaries()];
    summaries[summaries.length - 1] = updatedSummary;
    setStoredItem(SUMM_KEY, summaries);
    return updatedSummary;
  },
};
