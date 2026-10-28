import { footprintService } from './footprintService';
import { challengeService } from './challengeService';
import { authService } from './authService';

export interface ProgressSummaryData {
  period: 'weekly' | 'monthly' | 'yearly';
  electricityAvoidedKwh: number;
  emissionsAvoidedKg: number;
  challengesCompleted: number;
  greenPointsEarned: number;
  currentStreakDays: number;
  goalCompletionPct: number;
  categoryImprovements: {
    category: string;
    reductionPct: number;
    description: string;
  }[];
  activityTimeline: {
    id: string;
    date: string;
    title: string;
    category: string;
    points: number;
    type: 'challenge' | 'footprint' | 'solar' | 'badge';
  }[];
}

export const progressService = {
  getProgressSummary(period: 'weekly' | 'monthly' | 'yearly' = 'monthly'): ProgressSummaryData {
    const user = authService.getCurrentUser();
    const challenges = challengeService.getChallenges();
    const completedChallenges = challenges.filter((c) => c.completed);

    // Baseline 310 kWh vs current 248 kWh
    const electricityAvoidedKwh = 310 - user.electricityKwh;
    // Separate emission savings estimate: ~117 kg avoided compared to baseline 365 kg
    const emissionsAvoidedKg = Math.round(365 - 247.8);

    const goalCompletionPct = Math.min(
      100,
      Math.round(((365 - 247.8) / (365 - user.personalGoalEmissionsKg)) * 100)
    );

    const activityTimeline = [
      {
        id: 'act_1',
        date: '2026-10-26',
        title: 'Completed Vampire Power Exorcism Challenge',
        category: 'Energy Conservation',
        points: 20,
        type: 'challenge' as const,
      },
      {
        id: 'act_2',
        date: '2026-10-25',
        title: 'Logged 28 km Metro Commute to Work',
        category: 'Clean Mobility',
        points: 30,
        type: 'footprint' as const,
      },
      {
        id: 'act_3',
        date: '2026-10-20',
        title: 'Unlocked "Streak Champion" Achievement',
        category: 'Consistency Badge',
        points: 100,
        type: 'badge' as const,
      },
      {
        id: 'act_4',
        date: '2026-10-18',
        title: 'Simulated 2.5 kW Rooftop Solar Feasibility',
        category: 'Clean Energy',
        points: 50,
        type: 'solar' as const,
      },
      {
        id: 'act_5',
        date: '2026-10-15',
        title: 'Adopted AC 24°C Comfort Setting Protocol',
        category: 'Energy Conservation',
        points: 25,
        type: 'challenge' as const,
      },
    ];

    return {
      period,
      electricityAvoidedKwh,
      emissionsAvoidedKg,
      challengesCompleted: completedChallenges.length,
      greenPointsEarned: user.greenPoints,
      currentStreakDays: user.streakDays,
      goalCompletionPct,
      categoryImprovements: [
        {
          category: 'Electricity Efficiency',
          reductionPct: 20.0,
          description: 'Measured power draw reduced from 310 kWh to 248 kWh/month',
        },
        {
          category: 'Commute Emissions',
          reductionPct: 31.7,
          description: 'Replaced solo petrol driving with metro and cycling legs',
        },
        {
          category: 'Cooking Gas Optimization',
          reductionPct: 14.3,
          description: 'Adopted induction cooking for water boiling and morning tea',
        },
      ],
      activityTimeline,
    };
  },
};
