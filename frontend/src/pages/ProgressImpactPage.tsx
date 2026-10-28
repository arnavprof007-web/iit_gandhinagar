import React, { useState } from 'react';
import { progressService, ProgressSummaryData } from '../services/progressService';
import { footprintService } from '../services/footprintService';
import { Card, CardHeader, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { StatCard } from '../components/common/StatCard';
import { Tabs } from '../components/common/Tabs';
import { ProgressBar } from '../components/common/ProgressBar';
import { Alert } from '../components/common/Alert';
import { EmissionsTrendChart } from '../components/charts/EmissionsTrendChart';
import { ElectricityChart } from '../components/charts/ElectricityChart';
import {
  LineChart,
  Printer,
  Calendar,
  Zap,
  Footprints,
  Trophy,
  Flame,
  CheckCircle2,
  TrendingDown,
  Award,
} from 'lucide-react';
import { formatNumber, formatDate } from '../utils/formatters';

export const ProgressImpactPage: React.FC = () => {
  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');

  const progress = progressService.getProgressSummary(period);
  const electricityRecords = footprintService.getElectricityRecords();
  const footprintSummaries = footprintService.getFootprintSummaries();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 printable-area">
      {/* Header & Print Report CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-emerald-100 no-print">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-display">
            My Environmental Progress & Impact
          </h2>
          <p className="text-xs text-slate-500">
            Long-term conservation trends, milestones achieved, and verification log
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Tabs
            tabs={[
              { id: 'weekly', label: 'Weekly' },
              { id: 'monthly', label: 'Monthly' },
              { id: 'yearly', label: 'Yearly' },
            ]}
            activeTab={period}
            onChange={(id) => setPeriod(id as any)}
          />

          <Button
            size="sm"
            variant="outline"
            onClick={handlePrint}
            leftIcon={<Printer className="w-4 h-4" />}
          >
            Print Summary
          </Button>
        </div>
      </div>

      <Alert type="info">
        <strong>Metric Boundary Note:</strong> Measured electricity reduction (kWh avoided at the meter) and estimated emissions avoided (kg CO₂e) represent different physical units. They are evaluated independently and not conflated.
      </Alert>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Electricity Saved"
          value={`${progress.electricityAvoidedKwh} kWh`}
          subtitle="Measured vs Nov 2025 baseline"
          icon={<Zap className="w-5 h-5 text-amber-500" />}
        />

        <StatCard
          title="Estimated CO₂e Abated"
          value={`~${progress.emissionsAvoidedKg} kg`}
          subtitle="Combined energy & commute"
          icon={<Footprints className="w-5 h-5 text-emerald-600" />}
        />

        <StatCard
          title="Completed Challenges"
          value={progress.challengesCompleted}
          subtitle="Self-reported green actions"
          icon={<CheckCircle2 className="w-5 h-5 text-teal-600" />}
        />

        <StatCard
          title="Green Points"
          value={formatNumber(progress.greenPointsEarned)}
          subtitle={`${progress.currentStreakDays} day active streak 🔥`}
          icon={<Trophy className="w-5 h-5 text-amber-600" />}
        />
      </div>

      {/* Goal Progress Banner */}
      <Card className="p-6 bg-gradient-to-r from-emerald-50 via-teal-50 to-green-50 border-emerald-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-900">
              Personal Sustainability Goal
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-0.5">
              Target: Reduce footprint to under 190 kg CO₂e / month
            </h3>
          </div>
          <span className="text-2xl font-black text-emerald-800 font-display">
            {progress.goalCompletionPct}% Achieved
          </span>
        </div>
        <ProgressBar value={progress.goalCompletionPct} size="md" color="emerald" />
      </Card>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader
            title="Electricity Reduction Trajectory"
            subtitle="Actual household meter readings (kWh)"
            icon={<Zap className="w-5 h-5 text-amber-500" />}
          />
          <CardContent>
            <ElectricityChart data={electricityRecords} baselineKwh={300} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader
            title="Category Emissions Breakdown"
            subtitle="Historical monthly stack (kg CO₂e)"
            icon={<Footprints className="w-5 h-5 text-emerald-600" />}
          />
          <CardContent>
            <EmissionsTrendChart data={footprintSummaries} baselineTotalKg={365} />
          </CardContent>
        </Card>
      </div>

      {/* Category Improvements Table */}
      <Card className="overflow-hidden">
        <CardHeader
          title="Category-Wise Improvements & Action Evidence"
          subtitle="Measured reductions against baseline performance"
          icon={<TrendingDown className="w-5 h-5 text-emerald-600" />}
        />
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Reduction %</th>
                <th className="py-3 px-4">Impact Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {progress.categoryImprovements.map((cat, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60">
                  <td className="py-3 px-4 font-bold text-slate-900">{cat.category}</td>
                  <td className="py-3 px-4 text-right font-extrabold text-emerald-700">
                    -{cat.reductionPct}%
                  </td>
                  <td className="py-3 px-4 text-slate-600">{cat.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Activity Timeline */}
      <Card className="p-6">
        <h3 className="font-bold text-base text-slate-900 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-emerald-600" />
          Verified Activity Timeline
        </h3>
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {progress.activityTimeline.map((item) => (
            <div key={item.id} className="relative flex items-start justify-between gap-4">
              <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-emerald-600 ring-4 ring-white" />
              <div>
                <p className="text-xs font-bold text-slate-900">{item.title}</p>
                <p className="text-[11px] text-slate-500">
                  {item.category} • {formatDate(item.date)}
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 flex-shrink-0">
                +{item.points} pts
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
