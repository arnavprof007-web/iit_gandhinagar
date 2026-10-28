import React from 'react';
import { Card, CardHeader, CardContent } from '../common/Card';
import { Challenge } from '../../types';
import { Button } from '../common/Button';
import { Trophy, CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { triggerEcoConfetti } from '../../utils/confetti';

interface ActiveChallengesCardProps {
  challenges: Challenge[];
  onComplete: (id: string) => void;
}

export const ActiveChallengesCard: React.FC<ActiveChallengesCardProps> = ({
  challenges,
  onComplete,
}) => {
  const pending = challenges.filter((c) => !c.completed).slice(0, 3);

  const handleComplete = (id: string) => {
    triggerEcoConfetti();
    onComplete(id);
  };

  return (
    <Card className="h-full flex flex-col justify-between">
      <div>
        <CardHeader
          title="Active Green Challenges"
          subtitle="Micro-actions for today"
          icon={<Trophy className="w-5 h-5 text-amber-500" />}
          action={
            <Link to="/challenges" className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1">
              <span>All Challenges</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          }
        />
        <CardContent className="divide-y divide-slate-100 p-0">
          {pending.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">
              🎉 All active challenges completed for now! Visit the challenges tab to explore more.
            </div>
          ) : (
            pending.map((ch) => (
              <div key={ch.id} className="p-4 flex items-center justify-between hover:bg-slate-50/60 transition-colors gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded-full">
                      +{ch.points} pts
                    </span>
                    <span className="text-[10px] text-slate-400 capitalize">{ch.cadence}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 truncate">{ch.title}</h4>
                  <p className="text-[11px] text-slate-500 line-clamp-1">{ch.description}</p>
                </div>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => handleComplete(ch.id)}
                  className="text-xs py-1 px-3 flex-shrink-0"
                  leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                >
                  Done
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </div>
    </Card>
  );
};
