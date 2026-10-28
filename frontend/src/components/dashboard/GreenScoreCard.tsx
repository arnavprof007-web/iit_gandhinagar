import React from 'react';
import { Card } from '../common/Card';
import { ProgressBar } from '../common/ProgressBar';
import { Leaf, Award, Sparkles, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface GreenScoreCardProps {
  score: number; // 0 to 100
  level: number;
  streakDays: number;
}

export const GreenScoreCard: React.FC<GreenScoreCardProps> = ({ score, level, streakDays }) => {
  const getLevelTitle = (lvl: number) => {
    if (lvl >= 5) return 'Mission LiFE Champion';
    if (lvl === 4) return 'Sustainability Influencer';
    if (lvl === 3) return 'Green Advocate';
    if (lvl === 2) return 'Active Conservationist';
    return 'LiFE Starter';
  };

  const getScoreColor = (sc: number) => {
    if (sc >= 80) return 'text-emerald-600 stroke-emerald-600';
    if (sc >= 60) return 'text-teal-600 stroke-teal-600';
    if (sc >= 40) return 'text-amber-500 stroke-amber-500';
    return 'text-red-500 stroke-red-500';
  };

  const strokeDashoffset = 283 - (283 * score) / 100;

  return (
    <Card className="p-6 bg-gradient-to-br from-white via-emerald-50/40 to-teal-50/30 border-emerald-100 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Leaf className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Green Score</h3>
              <p className="text-[11px] text-slate-500">Mission LiFE Index</p>
            </div>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
            Level {level}
          </span>
        </div>

        {/* Circular Dial Representation */}
        <div className="flex items-center justify-center my-2">
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                className="stroke-slate-100"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                className={`transition-all duration-1000 ease-out ${getScoreColor(score)}`}
                strokeWidth="8"
                strokeDasharray="283"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold text-slate-900 font-display tracking-tight">
                {score}
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-400">out of 100</span>
            </div>
          </div>
        </div>

        <div className="text-center mt-2">
          <p className="text-sm font-bold text-emerald-950">{getLevelTitle(level)}</p>
          <p className="text-xs text-slate-500 mt-0.5">
            Top 15% among Gandhinagar citizen households
          </p>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-emerald-100/70">
        <div className="flex justify-between items-center text-xs text-slate-600 mb-1.5">
          <span>Next Milestone: Level {level + 1}</span>
          <span className="font-bold text-emerald-700">82%</span>
        </div>
        <ProgressBar value={82} size="sm" color="emerald" />
        <Link
          to="/challenges"
          className="mt-3 flex items-center justify-between text-xs font-semibold text-emerald-700 hover:text-emerald-900 transition-colors"
        >
          <span>Complete 1 challenge to level up</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </Card>
  );
};
