import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { footprintService } from '../services/footprintService';
import { challengeService } from '../services/challengeService';
import { MetricsOverview } from '../components/dashboard/MetricsOverview';
import { GreenScoreCard } from '../components/dashboard/GreenScoreCard';
import { ActiveChallengesCard } from '../components/dashboard/ActiveChallengesCard';
import { RecentActivityFeed } from '../components/dashboard/RecentActivityFeed';
import { SolarInsightCard } from '../components/dashboard/SolarInsightCard';
import { WeatherAdviceCard } from '../components/dashboard/WeatherAdviceCard';
import { ElectricityChart } from '../components/charts/ElectricityChart';
import { EmissionsTrendChart } from '../components/charts/EmissionsTrendChart';
import { CategoryBreakdownChart } from '../components/charts/CategoryBreakdownChart';
import { Card, CardHeader, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Zap, Footprints, PieChart, Sparkles, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const { user, refreshUser } = useApp();
  const { showToast } = useToast();

  const [electricityRecords, setElectricityRecords] = useState(() =>
    footprintService.getElectricityRecords()
  );
  const [footprintSummaries, setFootprintSummaries] = useState(() =>
    footprintService.getFootprintSummaries()
  );
  const [challenges, setChallenges] = useState(() => challengeService.getChallenges());

  const currentSummary = footprintSummaries[footprintSummaries.length - 1];

  const handleChallengeComplete = (id: string) => {
    const res = challengeService.completeChallenge(id);
    if (res.success) {
      setChallenges(challengeService.getChallenges());
      refreshUser();
      showToast({
        title: 'Challenge Completed!',
        message: res.message,
        type: 'success',
      });
    } else {
      showToast({
        title: 'Action Notice',
        message: res.message,
        type: 'info',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Greeting & Quick Pitch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-emerald-100/60">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 font-display tracking-tight">
            Welcome back, {user.name} 👋
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Living consciously in {user.city}, {user.state} • Household of {user.householdSize}
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link to="/footprint">
            <Button size="sm" variant="outline" leftIcon={<PlusCircle className="w-4 h-4" />}>
              Log Activity
            </Button>
          </Link>
          <Link to="/challenges">
            <Button size="sm" variant="primary" leftIcon={<Sparkles className="w-4 h-4" />}>
              Explore Challenges
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 KPI Metrics Cards */}
      <MetricsOverview user={user} footprintSummary={currentSummary} />

      {/* Primary 2-Column Grid: Score + Active Challenges + Electricity Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Green Score Radial Gauge */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <GreenScoreCard
            score={user.greenScore}
            level={user.level}
            streakDays={user.streakDays}
          />
          <WeatherAdviceCard />
        </div>

        {/* Right Column: Electricity Chart & Active Challenges */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* 12-Month Electricity Consumption Chart */}
          <Card>
            <CardHeader
              title="Household Electricity Consumption"
              subtitle="12-Month historical trend vs 300 kWh baseline"
              icon={<Zap className="w-5 h-5 text-amber-500" />}
              action={
                <Link to="/footprint" className="text-xs font-semibold text-emerald-700 hover:text-emerald-900">
                  Manage Records
                </Link>
              }
            />
            <CardContent>
              <ElectricityChart data={electricityRecords} baselineKwh={300} />
            </CardContent>
          </Card>

          {/* Quick Active Challenges Card */}
          <ActiveChallengesCard
            challenges={challenges}
            onComplete={handleChallengeComplete}
          />
        </div>
      </div>

      {/* Secondary 2-Column Grid: Emissions Trend & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Stacked Emissions Chart */}
        <div className="lg:col-span-8">
          <Card className="h-full">
            <CardHeader
              title="Estimated Carbon Emissions Trend"
              subtitle="Breakdown by Electricity, Transport, and Cooking Gas (kg CO₂e)"
              icon={<Footprints className="w-5 h-5 text-emerald-600" />}
              action={
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  {currentSummary.deltaPercentage}% vs Baseline
                </span>
              }
            />
            <CardContent>
              <EmissionsTrendChart data={footprintSummaries} baselineTotalKg={365} />
            </CardContent>
          </Card>
        </div>

        {/* Category Breakdown Donut */}
        <div className="lg:col-span-4">
          <Card className="h-full flex flex-col justify-between">
            <CardHeader
              title="Current Category Proportions"
              subtitle="October 2026 Emissions"
              icon={<PieChart className="w-5 h-5 text-teal-600" />}
            />
            <CardContent>
              <CategoryBreakdownChart
                electricityKg={currentSummary.electricityKg}
                transportKg={currentSummary.transportKg}
                cookingKg={currentSummary.cookingKg}
              />
              <div className="mt-4 pt-3 border-t border-slate-100 text-center">
                <p className="text-xs text-slate-500">
                  Total Month: <strong className="text-slate-800">{currentSummary.totalKg} kg CO₂e</strong>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tertiary Row: Solar Insight + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SolarInsightCard />
        <RecentActivityFeed />
      </div>
    </div>
  );
};
