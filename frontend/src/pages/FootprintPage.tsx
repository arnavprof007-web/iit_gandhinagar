import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { footprintService } from '../services/footprintService';
import { useToast } from '../context/ToastContext';
import { Card, CardHeader, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Alert } from '../components/common/Alert';
import { Tabs } from '../components/common/Tabs';
import { StatCard } from '../components/common/StatCard';
import { EmissionsTrendChart } from '../components/charts/EmissionsTrendChart';
import { CategoryBreakdownChart } from '../components/charts/CategoryBreakdownChart';
import {
  Footprints,
  Zap,
  Bike,
  Flame,
  Plus,
  Trash2,
  Calendar,
  Info,
  TrendingDown,
  Sparkles,
} from 'lucide-react';
import { formatNumber, formatDate } from '../utils/formatters';
import { EMISSION_FACTORS } from '../utils/footprintCalculations';

// Zod schemas for activity forms
const transportSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  mode: z.enum([
    'petrol_car',
    'diesel_car',
    'ev',
    'two_wheeler_petrol',
    'two_wheeler_ev',
    'bus',
    'metro',
    'cycling',
    'walking',
  ]),
  distanceKm: z.number().min(0.5, 'Distance must be at least 0.5 km').max(1000),
  fuelLitres: z.number().optional(),
});

const electricitySchema = z.object({
  month: z.string().min(2),
  year: z.number().min(2020),
  consumptionKwh: z.number().min(10, 'Consumption must be at least 10 kWh').max(5000),
  costInr: z.number().min(50),
});

type TransportFormData = z.infer<typeof transportSchema>;
type ElectricityFormData = z.infer<typeof electricitySchema>;

export const FootprintPage: React.FC = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');

  const [electricityRecords, setElectricityRecords] = useState(() =>
    footprintService.getElectricityRecords()
  );
  const [transportRecords, setTransportRecords] = useState(() =>
    footprintService.getTransportRecords()
  );
  const [summaries, setSummaries] = useState(() =>
    footprintService.getFootprintSummaries()
  );

  const currentSummary = summaries[summaries.length - 1];

  // React Hook Form for Transport Log
  const {
    register: registerTransport,
    handleSubmit: handleTransportSubmit,
    reset: resetTransport,
    formState: { errors: transportErrors },
  } = useForm<TransportFormData>({
    resolver: zodResolver(transportSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      mode: 'metro',
      distanceKm: 15,
      fuelLitres: undefined,
    },
  });

  // React Hook Form for Electricity Log
  const {
    register: registerElectricity,
    handleSubmit: handleElectricitySubmit,
    reset: resetElectricity,
    formState: { errors: electricityErrors },
  } = useForm<ElectricityFormData>({
    resolver: zodResolver(electricitySchema),
    defaultValues: {
      month: 'Nov',
      year: 2026,
      consumptionKwh: 240,
      costInr: 1820,
    },
  });

  const onAddTransport = (data: TransportFormData) => {
    const created = footprintService.addTransportRecord(data);
    setTransportRecords(footprintService.getTransportRecords());
    setSummaries(footprintService.getFootprintSummaries());
    resetTransport();
    showToast({
      title: 'Commute Logged',
      message: `Added ${created.distanceKm} km trip. Emitted approx ${created.estimatedEmissionsKg} kg CO₂e.`,
      type: 'success',
    });
  };

  const onDeleteTransport = (id: string) => {
    footprintService.deleteTransportRecord(id);
    setTransportRecords(footprintService.getTransportRecords());
    setSummaries(footprintService.getFootprintSummaries());
    showToast({
      title: 'Log Removed',
      message: 'Transport entry deleted and footprint recalculated.',
      type: 'info',
    });
  };

  const onAddElectricity = (data: ElectricityFormData) => {
    footprintService.addElectricityRecord(data);
    setElectricityRecords(footprintService.getElectricityRecords());
    setSummaries(footprintService.getFootprintSummaries());
    resetElectricity();
    showToast({
      title: 'Electricity Record Added',
      message: `Logged ${data.consumptionKwh} kWh for ${data.month} ${data.year}.`,
      type: 'success',
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Alert on Methodology & Transparency */}
      <Alert type="info" title="Transparent Methodology & Uncertainty Notice">
        Emission factors are based on the Central Electricity Authority (CEA) India grid factor of ~0.716 kg CO₂e/kWh and IPCC transport standards. These values serve as illustrative indicators of personal environmental trends and should not be construed as commercial carbon credit certifications.
      </Alert>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Monthly Emissions"
          value={`${currentSummary.totalKg} kg`}
          subtitle="All recorded categories"
          icon={<Footprints className="w-5 h-5 text-emerald-600" />}
          change={{
            value: `${Math.abs(currentSummary.deltaPercentage)}%`,
            label: 'baseline (365 kg)',
            type: 'decrease',
            isPositiveGreen: true,
          }}
        />

        <StatCard
          title="Grid Electricity Share"
          value={`${currentSummary.electricityKg} kg`}
          subtitle="71.7% of total emissions"
          icon={<Zap className="w-5 h-5 text-amber-500" />}
        />

        <StatCard
          title="Transport Emissions"
          value={`${currentSummary.transportKg} kg`}
          subtitle="Past 7 days activity"
          icon={<Bike className="w-5 h-5 text-sky-600" />}
        />

        <StatCard
          title="Cooking Fuel Impact"
          value={`${currentSummary.cookingKg} kg`}
          subtitle="Piped natural gas consumption"
          icon={<Flame className="w-5 h-5 text-amber-600" />}
        />
      </div>

      {/* Navigation Tabs */}
      <Tabs
        tabs={[
          { id: 'overview', label: 'Emissions Overview & Charts' },
          { id: 'transport-log', label: 'Log Commute & Transport', badge: transportRecords.length },
          { id: 'electricity-log', label: 'Log Electricity Bill', badge: electricityRecords.length },
          { id: 'methodology', label: 'Emission Factors & Math' },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* TAB 1: OVERVIEW & CHARTS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8">
              <Card>
                <CardHeader
                  title="Historical Emissions Trajectory"
                  subtitle="Tracking your progress towards Mission LiFE decarbonization goals"
                  icon={<Footprints className="w-5 h-5 text-emerald-600" />}
                />
                <CardContent>
                  <EmissionsTrendChart data={summaries} baselineTotalKg={365} />
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-4">
              <Card className="h-full flex flex-col justify-between">
                <CardHeader
                  title="Emissions Proportions"
                  subtitle="Latest billing cycle"
                  icon={<Sparkles className="w-5 h-5 text-teal-600" />}
                />
                <CardContent>
                  <CategoryBreakdownChart
                    electricityKg={currentSummary.electricityKg}
                    transportKg={currentSummary.transportKg}
                    cookingKg={currentSummary.cookingKg}
                  />
                  <div className="mt-4 p-3 bg-slate-50 rounded-xl text-xs text-slate-600 space-y-1">
                    <div className="flex justify-between">
                      <span>Baseline Comparison:</span>
                      <strong className="text-emerald-700">{currentSummary.deltaPercentage}%</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Trees needed to offset:</span>
                      <strong>{Math.round(currentSummary.totalKg / 22)} mature trees / yr</strong>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TRANSPORT LOG */}
      {activeTab === 'transport-log' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Form */}
          <div className="lg:col-span-5">
            <Card className="p-6">
              <h3 className="font-bold text-base text-slate-900 mb-1 flex items-center gap-2">
                <Bike className="w-5 h-5 text-emerald-600" />
                Log a Commute Leg
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Record your daily vehicle use or public transit to calculate transport footprint.
              </p>

              <form onSubmit={handleTransportSubmit(onAddTransport)} className="space-y-4">
                <Input
                  label="Date of Commute"
                  type="date"
                  {...registerTransport('date')}
                  error={transportErrors.date?.message}
                  required
                />

                <Select
                  label="Transit Mode"
                  {...registerTransport('mode')}
                  options={[
                    { value: 'metro', label: 'Metro Rail (0.022 kg CO₂/km)' },
                    { value: 'bus', label: 'City Bus / Feeder (0.038 kg CO₂/km)' },
                    { value: 'ev', label: 'Electric Car / EV Scooter (0.052 kg CO₂/km)' },
                    { value: 'two_wheeler_petrol', label: 'Petrol Two-Wheeler (0.045 kg CO₂/km)' },
                    { value: 'petrol_car', label: 'Petrol Car - Solo (0.165 kg CO₂/km)' },
                    { value: 'diesel_car', label: 'Diesel Car (0.182 kg CO₂/km)' },
                    { value: 'cycling', label: 'Bicycle (0.000 kg CO₂/km)' },
                    { value: 'walking', label: 'Walking (0.000 kg CO₂/km)' },
                  ]}
                />

                <Input
                  label="Distance Travelled"
                  type="number"
                  step="0.5"
                  unit="km"
                  {...registerTransport('distanceKm', { valueAsNumber: true })}
                  error={transportErrors.distanceKm?.message}
                  required
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="w-full justify-center"
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  Add Commute Record
                </Button>
              </form>
            </Card>
          </div>

          {/* Activity Table */}
          <div className="lg:col-span-7">
            <Card className="overflow-hidden">
              <CardHeader
                title="Recent Travel Log"
                subtitle="Editable history of recorded transit trips"
                icon={<Calendar className="w-5 h-5 text-emerald-600" />}
              />
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Mode</th>
                      <th className="py-3 px-4 text-right">Distance</th>
                      <th className="py-3 px-4 text-right">CO₂e Impact</th>
                      <th className="py-3 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {transportRecords.map((rec) => (
                      <tr key={rec.id} className="hover:bg-slate-50/60">
                        <td className="py-3 px-4 font-medium text-slate-800">{rec.date}</td>
                        <td className="py-3 px-4 capitalize text-slate-600">
                          {rec.mode.replace(/_/g, ' ')}
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-slate-800">
                          {rec.distanceKm} km
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-emerald-700">
                          {rec.estimatedEmissionsKg} kg
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => onDeleteTransport(rec.id)}
                            className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                            title="Delete entry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 3: ELECTRICITY LOG */}
      {activeTab === 'electricity-log' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5">
            <Card className="p-6">
              <h3 className="font-bold text-base text-slate-900 mb-1 flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                Log Monthly Power Bill
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Update your monthly DISCOM bill to reflect ongoing household energy conservation.
              </p>

              <form onSubmit={handleElectricitySubmit(onAddElectricity)} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Select
                    label="Billing Month"
                    {...registerElectricity('month')}
                    options={[
                      { value: 'Jan', label: 'January' },
                      { value: 'Feb', label: 'February' },
                      { value: 'Mar', label: 'March' },
                      { value: 'Apr', label: 'April' },
                      { value: 'May', label: 'May' },
                      { value: 'Jun', label: 'June' },
                      { value: 'Jul', label: 'July' },
                      { value: 'Aug', label: 'August' },
                      { value: 'Sep', label: 'September' },
                      { value: 'Oct', label: 'October' },
                      { value: 'Nov', label: 'November' },
                      { value: 'Dec', label: 'December' },
                    ]}
                  />

                  <Input
                    label="Year"
                    type="number"
                    {...registerElectricity('year', { valueAsNumber: true })}
                    required
                  />
                </div>

                <Input
                  label="Units Consumed (kWh)"
                  type="number"
                  unit="kWh"
                  {...registerElectricity('consumptionKwh', { valueAsNumber: true })}
                  error={electricityErrors.consumptionKwh?.message}
                  required
                />

                <Input
                  label="Total Bill Amount"
                  type="number"
                  unit="₹"
                  {...registerElectricity('costInr', { valueAsNumber: true })}
                  error={electricityErrors.costInr?.message}
                  required
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="w-full justify-center"
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  Save Monthly Record
                </Button>
              </form>
            </Card>
          </div>

          <div className="lg:col-span-7">
            <Card className="overflow-hidden">
              <CardHeader
                title="Historical Billing Records"
                subtitle="Calculated at ~0.716 kg CO₂e / kWh"
                icon={<Zap className="w-5 h-5 text-amber-500" />}
              />
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Period</th>
                      <th className="py-3 px-4 text-right">Units (kWh)</th>
                      <th className="py-3 px-4 text-right">Bill (₹)</th>
                      <th className="py-3 px-4 text-right">CO₂e Emissions</th>
                      <th className="py-3 px-4 text-center">Baseline</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {electricityRecords.map((el) => (
                      <tr key={el.id} className="hover:bg-slate-50/60">
                        <td className="py-3 px-4 font-medium text-slate-800">
                          {el.month} {el.year}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-slate-900">
                          {el.consumptionKwh} kWh
                        </td>
                        <td className="py-3 px-4 text-right text-slate-600">₹{el.costInr}</td>
                        <td className="py-3 px-4 text-right font-bold text-emerald-700">
                          {el.estimatedEmissionsKg} kg
                        </td>
                        <td className="py-3 px-4 text-center">
                          {el.isBaseline ? (
                            <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">
                              Baseline
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 4: METHODOLOGY & EMISSION FACTORS */}
      {activeTab === 'methodology' && (
        <Card className="p-6 space-y-4">
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <Info className="w-5 h-5 text-emerald-600" />
            Centralized Emission Constants Reference Table
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            All footprint calculations in GreenPulse utilize isolated, transparent emission constants stored centrally in <code>src/utils/footprintCalculations.ts</code>. These are calibrated to standard published Indian baseline standards.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200">
              <span className="text-xs font-bold text-emerald-950 block">Indian Grid Electricity</span>
              <span className="text-xl font-black text-emerald-700 font-display mt-1 block">
                {EMISSION_FACTORS.ELECTRICITY_KG_PER_KWH} kg / kWh
              </span>
              <p className="text-[11px] text-slate-500 mt-1">
                Ref: Central Electricity Authority (CEA) Baseline Database Ver 19.
              </p>
            </div>

            <div className="p-4 bg-sky-50/60 rounded-xl border border-sky-200">
              <span className="text-xs font-bold text-sky-950 block">Petrol Personal Car</span>
              <span className="text-xl font-black text-sky-700 font-display mt-1 block">
                {EMISSION_FACTORS.PETROL_CAR_KG_PER_KM} kg / km
              </span>
              <p className="text-[11px] text-slate-500 mt-1">
                Ref: IPCC Transport Guidelines, standard passenger combustion sedan.
              </p>
            </div>

            <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200">
              <span className="text-xs font-bold text-amber-950 block">Piped Natural Gas (PNG)</span>
              <span className="text-xl font-black text-amber-700 font-display mt-1 block">
                {EMISSION_FACTORS.PIPED_GAS_KG_PER_SCM} kg / SCM
              </span>
              <p className="text-[11px] text-slate-500 mt-1">
                Standard Cubic Metre stoichiometric combustion emissions.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
