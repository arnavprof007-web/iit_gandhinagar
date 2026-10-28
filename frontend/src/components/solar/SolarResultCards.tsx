import React, { useState } from 'react';
import { SolarAssessmentResult, SolarAssessmentInput } from '../../types';
import { StatCard } from '../common/StatCard';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { SolarSummaryModal } from './SolarSummaryModal';
import { formatInr, formatNumber } from '../../utils/formatters';
import {
  Sun,
  Zap,
  TrendingUp,
  Coins,
  ShieldCheck,
  Trees,
  FileText,
  Clock,
} from 'lucide-react';

interface SolarResultCardsProps {
  result: SolarAssessmentResult;
  input: SolarAssessmentInput;
}

export const SolarResultCards: React.FC<SolarResultCardsProps> = ({ result, input }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="space-y-4">
        {/* Top Highlight Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500 via-solar-500 to-amber-600 text-white shadow-md shadow-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center flex-shrink-0">
              <Sun className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-amber-100">
                Recommended Solar Array
              </p>
              <h3 className="text-2xl font-black font-display tracking-tight">
                {result.recommendedCapacityKw} kWp System
              </h3>
              <p className="text-xs text-amber-100 mt-0.5">
                Fits comfortably within {result.requiredRoofSqFt} sq ft of your rooftop
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            leftIcon={<FileText className="w-4 h-4" />}
            className="bg-white/95 text-amber-900 border-none hover:bg-white text-xs font-bold"
          >
            View Full Report
          </Button>
        </div>

        {/* 6-Grid Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          <StatCard
            title="Annual Clean Generation"
            value={`${formatNumber(result.annualGenerationKwh)} kWh`}
            subtitle={`~${result.monthlyGenerationKwh} kWh / month`}
            icon={<Zap className="w-5 h-5 text-amber-500" />}
          />

          <StatCard
            title="Annual Bill Savings"
            value={formatInr(result.annualSavingsInr)}
            subtitle={`~${formatInr(result.monthlySavingsInr)} / month`}
            icon={<TrendingUp className="w-5 h-5 text-emerald-600" />}
          />

          <StatCard
            title="Estimated Capital Cost"
            value={formatInr(result.estimatedSystemCostInr)}
            subtitle="Benchmark standard hardware"
            icon={<Coins className="w-5 h-5 text-slate-600" />}
          />

          <StatCard
            title="Indicative Subsidy"
            value={formatInr(result.subsidyApplicableInr)}
            subtitle="PM Surya Ghar benchmark slab"
            icon={<ShieldCheck className="w-5 h-5 text-emerald-600" />}
          />

          <StatCard
            title="Estimated Payback"
            value={`${result.estimatedPaybackYears} Years`}
            subtitle={`Net investment: ${formatInr(result.netSystemCostInr)}`}
            icon={<Clock className="w-5 h-5 text-amber-600" />}
          />

          <StatCard
            title="CO₂ Offset"
            value={`${result.co2OffsetTonnesPerYear} Tons/Yr`}
            subtitle={`≈ ${result.treesEquivalent} mature trees`}
            icon={<Trees className="w-5 h-5 text-green-600" />}
          />
        </div>
      </div>

      <SolarSummaryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        result={result}
        input={input}
      />
    </>
  );
};
