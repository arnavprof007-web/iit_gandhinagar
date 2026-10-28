import React, { useState } from 'react';
import { challengeService } from '../services/challengeService';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { ChallengeCard } from '../components/challenges/ChallengeCard';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Tabs } from '../components/common/Tabs';
import { ProgressBar } from '../components/common/ProgressBar';
import {
  Trophy,
  Flame,
  Award,
  Search,
  Filter,
  Sparkles,
  Zap,
  Droplet,
  Trash2,
  Bike,
  CheckCircle2,
} from 'lucide-react';
import { formatNumber } from '../utils/formatters';

export const ChallengesPage: React.FC = () => {
  const { user, refreshUser } = useApp();
  const { showToast } = useToast();

  const [challenges, setChallenges] = useState(() => challengeService.getChallenges());
  const [cadenceTab, setCadenceTab] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'points' | 'difficulty' | 'default'>('default');

  React.useEffect(() => {
    challengeService.fetchChallenges(categoryFilter, searchQuery).then((data) => {
      setChallenges(data);
    });
  }, [categoryFilter, searchQuery]);

  const handleComplete = async (id: string) => {
    // If UUID format from PostgreSQL backend, call backend joinChallenge
    if (id.includes('-') && id.length > 20) {
      const res = await challengeService.joinChallenge(id);
      if (res.success) {
        const fresh = await challengeService.fetchChallenges(categoryFilter, searchQuery);
        setChallenges(fresh);
        refreshUser();
        showToast({
          title: 'Challenge Enrolled!',
          message: res.message,
          type: 'success',
        });
      } else {
        showToast({
          title: 'Notice',
          message: res.message,
          type: 'info',
        });
      }
      return;
    }

    const res = challengeService.completeChallenge(id);
    if (res.success) {
      setChallenges(challengeService.getChallenges());
      refreshUser();
      showToast({
        title: 'Challenge Action Logged!',
        message: res.message,
        type: 'success',
      });
    } else {
      showToast({
        title: 'Notice',
        message: res.message,
        type: 'info',
      });
    }
  };

  // Filter logic
  const filtered = challenges.filter((c) => {
    if (cadenceTab !== 'all' && c.cadence !== cadenceTab) return false;
    if (categoryFilter !== 'all' && c.category !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q);
    }
    return true;
  });

  // Sort logic
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'points') return b.points - a.points;
    if (sortBy === 'difficulty') {
      const order = { easy: 1, medium: 2, hard: 3 };
      return order[b.difficulty] - order[a.difficulty];
    }
    return 0;
  });

  const completedCount = challenges.filter((c) => c.completed).length;

  return (
    <div className="space-y-6">
      {/* Gamification Header Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Streak Highlight */}
        <Card className="p-5 bg-gradient-to-br from-amber-500 to-amber-600 text-white flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-100">
              Active Streak
            </span>
            <div className="text-3xl font-black font-display tracking-tight mt-0.5">
              {user.streakDays} Days 🔥
            </div>
            <p className="text-xs text-amber-100 mt-1">1.2x Point Multiplier Active</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
            <Flame className="w-7 h-7 text-white fill-amber-200" />
          </div>
        </Card>

        {/* Total Points */}
        <Card className="p-5 bg-gradient-to-br from-emerald-600 to-green-700 text-white flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-100">
              Green Points
            </span>
            <div className="text-3xl font-black font-display tracking-tight mt-0.5">
              {formatNumber(user.greenPoints)} pts
            </div>
            <p className="text-xs text-emerald-100 mt-1">Level {user.level} Citizen</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
            <Trophy className="w-7 h-7 text-white" />
          </div>
        </Card>

        {/* Challenges Completed */}
        <Card className="p-5 bg-gradient-to-br from-teal-600 to-cyan-700 text-white flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-100">
              Completed Actions
            </span>
            <div className="text-3xl font-black font-display tracking-tight mt-0.5">
              {completedCount} / {challenges.length}
            </div>
            <p className="text-xs text-teal-100 mt-1">Self-reported verification</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
            <CheckCircle2 className="w-7 h-7 text-white" />
          </div>
        </Card>
      </div>

      {/* Cadence Tabs */}
      <Tabs
        tabs={[
          { id: 'all', label: 'All Challenges', badge: challenges.length },
          { id: 'daily', label: 'Daily Habits', badge: challenges.filter((c) => c.cadence === 'daily').length },
          { id: 'weekly', label: 'Weekly Goals', badge: challenges.filter((c) => c.cadence === 'weekly').length },
          { id: 'monthly', label: 'Monthly Projects', badge: challenges.filter((c) => c.cadence === 'monthly').length },
        ]}
        activeTab={cadenceTab}
        onChange={setCadenceTab}
      />

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search challenges (e.g. AC 24°C, composting)..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Category Filter Pills & Sorter */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Categories</option>
            <option value="energy">⚡ Energy</option>
            <option value="water">💧 Water</option>
            <option value="waste">♻️ Waste</option>
            <option value="mobility">🚲 Mobility</option>
            <option value="lifestyle">🌱 Lifestyle</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="default">Default Order</option>
            <option value="points">Highest Points</option>
            <option value="difficulty">Difficulty</option>
          </select>
        </div>
      </div>

      {/* Challenge Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sorted.map((challenge) => (
          <ChallengeCard
            key={challenge.id}
            challenge={challenge}
            onComplete={handleComplete}
          />
        ))}
      </div>

      {/* Achievement Badges Gallery */}
      <div className="mt-12 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-emerald-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900 font-display">
              Mission LiFE Achievement Badges
            </h3>
            <p className="text-xs text-slate-500">
              Collect badges by maintaining habits and hitting milestone benchmarks
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            {user.badges.filter((b) => b.unlockedAt).length} / {user.badges.length} Unlocked
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {user.badges.map((badge) => {
            const isUnlocked = !!badge.unlockedAt;
            return (
              <Card
                key={badge.id}
                className={`p-4 text-center transition-all ${
                  isUnlocked
                    ? 'bg-white border-emerald-200 shadow-sm'
                    : 'bg-slate-50/70 border-slate-200 opacity-60'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-2xl mx-auto mb-2 flex items-center justify-center ${
                    isUnlocked
                      ? 'bg-gradient-to-tr from-emerald-500 to-green-600 text-white shadow-md'
                      : 'bg-slate-200 text-slate-400'
                  }`}
                >
                  <Award className="w-6 h-6" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 truncate">{badge.name}</h4>
                <p className="text-[10px] text-slate-500 mt-1 line-clamp-2 leading-tight">
                  {badge.description}
                </p>
                <div className="mt-3">
                  {isUnlocked ? (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      Unlocked
                    </span>
                  ) : (
                    <div className="space-y-1">
                      <ProgressBar value={badge.progressPct} size="sm" color="amber" />
                      <span className="text-[10px] text-slate-400">{badge.progressPct}%</span>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};
