import React from 'react';
import { CommunityTeam } from '../../types';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Users, Leaf, Check, Plus, Trophy } from 'lucide-react';
import { formatNumber } from '../../utils/formatters';

interface TeamCardProps {
  team: CommunityTeam;
  onToggleJoin: (teamId: string) => void;
}

export const TeamCard: React.FC<TeamCardProps> = ({ team, onToggleJoin }) => {
  return (
    <Card hoverEffect className="p-5 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${team.avatarColor} text-white font-bold text-sm flex items-center justify-center shadow-sm flex-shrink-0`}
            >
              #{team.rank}
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">{team.name}</h4>
              <p className="text-xs text-slate-400 capitalize">
                {team.type} • {team.city}
              </p>
            </div>
          </div>
          {team.isMember && (
            <Badge variant="emerald" icon={<Check className="w-3 h-3" />}>
              Joined
            </Badge>
          )}
        </div>

        {/* Description */}
        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
          {team.description}
        </p>

        {/* Stats Pill */}
        <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50/80 rounded-xl text-center border border-slate-100 mb-4">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Members</span>
            <span className="text-xs font-bold text-slate-800">{team.membersCount}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Points</span>
            <span className="text-xs font-bold text-emerald-700">{formatNumber(team.totalPoints)}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">CO₂ Saved</span>
            <span className="text-xs font-bold text-teal-700">{formatNumber(team.co2AvoidedKg)} kg</span>
          </div>
        </div>
      </div>

      {/* Action */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[11px] text-slate-400 flex items-center gap-1">
          <Trophy className="w-3.5 h-3.5 text-amber-500" /> Rank #{team.rank} in {team.city}
        </span>
        <Button
          size="sm"
          variant={team.isMember ? 'outline' : 'primary'}
          onClick={() => onToggleJoin(team.id)}
          className="text-xs py-1 px-3"
        >
          {team.isMember ? 'Leave Squad' : 'Join Squad'}
        </Button>
      </div>
    </Card>
  );
};
