import React, { useState } from 'react';
import { Challenge } from '../../types';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { ProgressBar } from '../common/ProgressBar';
import { ChallengeModal } from './ChallengeModal';
import { triggerEcoConfetti } from '../../utils/confetti';
import {
  CheckCircle2,
  Trophy,
  Leaf,
  Info,
  Calendar,
  Zap,
  Droplet,
  Trash2,
  Bike,
  Sparkles,
} from 'lucide-react';

interface ChallengeCardProps {
  challenge: Challenge;
  onComplete: (id: string) => void;
}

export const ChallengeCard: React.FC<ChallengeCardProps> = ({ challenge, onComplete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'energy':
        return <Zap className="w-3.5 h-3.5 text-amber-600" />;
      case 'water':
        return <Droplet className="w-3.5 h-3.5 text-blue-600" />;
      case 'waste':
        return <Trash2 className="w-3.5 h-3.5 text-emerald-600" />;
      case 'mobility':
        return <Bike className="w-3.5 h-3.5 text-teal-600" />;
      default:
        return <Leaf className="w-3.5 h-3.5 text-green-600" />;
    }
  };

  const handleComplete = (id: string) => {
    if (challenge.completed) return;
    triggerEcoConfetti();
    onComplete(id);
  };

  const progressPct = Math.min(100, Math.round((challenge.progress / challenge.target) * 100));

  return (
    <>
      <Card
        hoverEffect
        className={`p-5 flex flex-col justify-between transition-all duration-200 ${
          challenge.completed ? 'bg-emerald-50/30 border-emerald-200' : ''
        }`}
      >
        <div>
          {/* Header Badges */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Badge variant="emerald" icon={getCategoryIcon(challenge.category)} className="capitalize text-[11px]">
                {challenge.category}
              </Badge>
              <Badge variant="slate" icon={<Calendar className="w-3 h-3 text-slate-400" />} className="capitalize text-[11px]">
                {challenge.cadence}
              </Badge>
            </div>
            <div className="flex items-center gap-1 font-bold text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              <Trophy className="w-3.5 h-3.5 text-amber-600" />
              <span>+{challenge.points} pts</span>
            </div>
          </div>

          {/* Title & Description */}
          <h4 className="font-semibold text-slate-900 text-sm mb-1 line-clamp-1">
            {challenge.title}
          </h4>
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
            {challenge.description}
          </p>

          {/* Target / Progress */}
          <div className="mb-4 space-y-1.5">
            <div className="flex justify-between items-center text-[11px] text-slate-600">
              <span className="font-medium">
                Goal: {challenge.progress}/{challenge.target} {challenge.unit}
              </span>
              <span className="font-bold text-emerald-700">{progressPct}%</span>
            </div>
            <ProgressBar value={progressPct} size="sm" color="emerald" />
          </div>
        </div>

        {/* Footer Meta & Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div className="text-[11px] font-medium text-emerald-800 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            <span>~{challenge.co2AvoidedKg} kg CO₂e</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsModalOpen(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              title="View Instructions"
              aria-label="View instructions"
            >
              <Info className="w-4 h-4" />
            </button>

            {challenge.completed ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-100/70 px-2.5 py-1 rounded-xl">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Done
              </span>
            ) : (
              <Button
                size="sm"
                variant="primary"
                onClick={() => handleComplete(challenge.id)}
                className="text-xs py-1 px-3"
              >
                Complete
              </Button>
            )}
          </div>
        </div>
      </Card>

      <ChallengeModal
        challenge={challenge}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onComplete={handleComplete}
      />
    </>
  );
};
