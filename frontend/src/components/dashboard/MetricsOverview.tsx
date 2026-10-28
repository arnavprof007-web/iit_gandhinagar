import React from 'react';
import { StatCard } from '../common/StatCard';
import { FootprintSummary, UserProfile } from '../../types';
import { Footprints, Zap, Trophy, Target } from 'lucide-react';
import { formatNumber, formatInr } from '../../utils/formatters';

interface MetricsOverviewProps {
  user: UserProfile;
  footprintSummary: FootprintSummary;
}

export const MetricsOverview: React.FC<MetricsOverviewProps> = ({ user, footprintSummary }) => {
  const goalTargetKg = user.personalGoalEmissionsKg || 190;
  const currentTotalKg = footprintSummary.totalKg;
  const goalProgressPct = Math.min(
    100,
    Math.max(0, Math.round(((365 - currentTotalKg) / (365 - goalTargetKg)) * 100))
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Footprint */}
      <StatCard
        title="Est. Monthly Footprint"
        value={`${currentTotalKg} kg`}
        icon={<Footprints className="w-5 h-5 text-emerald-600" />}
        change={{
          value: `${Math.abs(footprintSummary.deltaPercentage)}%`,
          label: 'baseline (365 kg)',
          type: 'decrease',
          isPositiveGreen: true,
        }}
      />

      {/* 2. Electricity */}
      <StatCard
        title="Electricity Draw"
        value={`${user.electricityKwh} kWh`}
        icon={<Zap className="w-5 h-5 text-amber-500" />}
        change={{
          value: formatInr(user.monthlyBillInr),
          label: 'last bill',
          type: 'neutral',
        }}
      />

      {/* 3. Green Points & Streak */}
      <StatCard
        title="Green Points"
        value={formatNumber(user.greenPoints)}
        icon={<Trophy className="w-5 h-5 text-amber-600" />}
        change={{
          value: `${user.streakDays}d streak 🔥`,
          label: 'active multiplier',
          type: 'increase',
          isPositiveGreen: true,
        }}
      />

      {/* 4. Personal Sustainability Goal */}
      <StatCard
        title="Personal Goal Progress"
        value={`${goalProgressPct}%`}
        subtitle={`Target: < ${goalTargetKg} kg CO₂e / mo`}
        icon={<Target className="w-5 h-5 text-teal-600" />}
      />
    </div>
  );
};
