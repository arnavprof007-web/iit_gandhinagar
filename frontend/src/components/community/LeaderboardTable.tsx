import React from 'react';
import { CommunityLeaderboardItem } from '../../types';
import { Trophy, Medal, Award, Sparkles } from 'lucide-react';
import { formatNumber } from '../../utils/formatters';

interface LeaderboardTableProps {
  items: CommunityLeaderboardItem[];
}

export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({ items }) => {
  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <span className="w-7 h-7 rounded-xl bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-xs border border-amber-300">
          🥇
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="w-7 h-7 rounded-xl bg-slate-200 text-slate-800 font-bold flex items-center justify-center text-xs border border-slate-300">
          🥈
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="w-7 h-7 rounded-xl bg-amber-50 text-amber-900 font-bold flex items-center justify-center text-xs border border-amber-200">
          🥉
        </span>
      );
    }
    return (
      <span className="w-7 h-7 rounded-xl bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-xs">
        #{rank}
      </span>
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
          <tr>
            <th className="py-3 px-4">Rank</th>
            <th className="py-3 px-4">Citizen</th>
            <th className="py-3 px-4">Location</th>
            <th className="py-3 px-4">Badge Title</th>
            <th className="py-3 px-4 text-right">Green Points</th>
            <th className="py-3 px-4 text-right">CO₂ Avoided</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((item) => (
            <tr
              key={item.id}
              className={`transition-colors ${
                item.isCurrentUser
                  ? 'bg-emerald-50/80 font-semibold text-emerald-950'
                  : 'hover:bg-slate-50 text-slate-700'
              }`}
            >
              <td className="py-3 px-4 flex items-center">{getRankBadge(item.rank)}</td>
              <td className="py-3 px-4 font-bold text-slate-900">
                <div className="flex items-center gap-2">
                  <span>{item.name}</span>
                  {item.isCurrentUser && (
                    <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold">
                      You
                    </span>
                  )}
                </div>
              </td>
              <td className="py-3 px-4 text-slate-500">{item.location}</td>
              <td className="py-3 px-4">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-100/60 px-2 py-0.5 rounded-full">
                  <Award className="w-3 h-3 text-emerald-600" />
                  {item.badge}
                </span>
              </td>
              <td className="py-3 px-4 text-right font-bold text-emerald-700">
                {formatNumber(item.points)} pts
              </td>
              <td className="py-3 px-4 text-right font-medium text-slate-600">
                ~{formatNumber(item.co2AvoidedKg)} kg
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
