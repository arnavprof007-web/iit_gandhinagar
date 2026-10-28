import React from 'react';
import { Challenge } from '../../types';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { CheckCircle2, Flame, Award, Lightbulb, ListChecks } from 'lucide-react';

interface ChallengeModalProps {
  challenge: Challenge | null;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (id: string) => void;
}

export const ChallengeModal: React.FC<ChallengeModalProps> = ({
  challenge,
  isOpen,
  onClose,
  onComplete,
}) => {
  if (!challenge) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={challenge.title} maxWidth="lg">
      <div className="space-y-5">
        {/* Badges & Meta */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="emerald" className="capitalize">
            {challenge.category}
          </Badge>
          <Badge variant="blue" className="capitalize">
            {challenge.cadence}
          </Badge>
          <Badge
            variant={
              challenge.difficulty === 'easy'
                ? 'mint'
                : challenge.difficulty === 'medium'
                ? 'solar'
                : 'red'
            }
            className="capitalize"
          >
            {challenge.difficulty} Difficulty
          </Badge>
        </div>

        <p className="text-sm text-slate-700 leading-relaxed">{challenge.description}</p>

        {/* Reward Pill */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 via-teal-50 to-green-50 border border-emerald-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Challenge Reward</p>
              <p className="text-sm font-bold text-emerald-950">+{challenge.points} Green Points</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500 font-medium">Environmental Impact</p>
            <p className="text-sm font-bold text-emerald-700">~{challenge.co2AvoidedKg} kg CO₂e saved</p>
          </div>
        </div>

        {/* Step-by-Step Instructions */}
        {challenge.instructions && challenge.instructions.length > 0 && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 mb-2.5">
              <ListChecks className="w-4 h-4 text-emerald-600" />
              How to complete:
            </h4>
            <ul className="space-y-2">
              {challenge.instructions.map((step, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-600">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center flex-shrink-0 text-[10px]">
                    {idx + 1}
                  </span>
                  <span className="mt-0.5">{step}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Practical Tips */}
        {challenge.tips && challenge.tips.length > 0 && (
          <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200">
            <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5 mb-1.5">
              <Lightbulb className="w-4 h-4 text-amber-600" />
              Mission LiFE Efficiency Tip:
            </h4>
            <ul className="space-y-1">
              {challenge.tips.map((tip, idx) => (
                <li key={idx} className="text-xs text-amber-800 leading-relaxed">
                  • {tip}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            {challenge.completed ? 'Self-reported & reward claimed' : 'Self-reported action'}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
            {!challenge.completed && (
              <Button
                variant="primary"
                size="sm"
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
                onClick={() => {
                  onComplete(challenge.id);
                  onClose();
                }}
              >
                Mark Complete (+{challenge.points} pts)
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
