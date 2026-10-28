import React, { useState } from 'react';
import { recommendationService } from '../services/recommendationService';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { Recommendation } from '../types';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Tabs } from '../components/common/Tabs';
import { Alert } from '../components/common/Alert';
import {
  Lightbulb,
  CheckCircle2,
  Bookmark,
  BookmarkCheck,
  Zap,
  Bike,
  Flame,
  Sun,
  ShoppingBag,
  Clock,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { formatInr } from '../utils/formatters';

export const RecommendationsPage: React.FC = () => {
  const { user } = useApp();
  const { showToast } = useToast();

  const [recommendations, setRecommendations] = useState(() =>
    recommendationService.getDynamicRecommendationsForUser(user)
  );
  const [activeTab, setActiveTab] = useState('all');
  const [selectedRec, setSelectedRec] = useState<Recommendation | null>(null);

  const handleStatusChange = (id: string, newStatus: 'pending' | 'completed' | 'saved') => {
    recommendationService.updateStatus(id, newStatus);
    setRecommendations(recommendationService.getDynamicRecommendationsForUser(user));
    showToast({
      title: 'Action Updated',
      message: `Recommendation marked as ${newStatus}.`,
      type: 'success',
    });
  };

  const filteredRecs = recommendations.filter((r) => {
    if (activeTab === 'pending') return r.status === 'pending';
    if (activeTab === 'completed') return r.status === 'completed';
    if (activeTab === 'saved') return r.status === 'saved';
    return true;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'electricity':
        return <Zap className="w-4 h-4 text-amber-500" />;
      case 'solar':
        return <Sun className="w-4 h-4 text-amber-600" />;
      case 'transport':
        return <Bike className="w-4 h-4 text-sky-600" />;
      case 'cooking':
        return <Flame className="w-4 h-4 text-orange-600" />;
      default:
        return <ShoppingBag className="w-4 h-4 text-emerald-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <Alert type="info">
        <strong>Personalized Rule Engine:</strong> Recommendations are dynamically tailored to your {user.electricityKwh} kWh monthly consumption, {user.city} location, and commute habits. Financial savings and emission reductions are indicative estimates.
      </Alert>

      {/* Tabs */}
      <Tabs
        tabs={[
          { id: 'all', label: 'All Recommendations', badge: recommendations.length },
          { id: 'pending', label: 'Actionable', badge: recommendations.filter((r) => r.status === 'pending').length },
          { id: 'saved', label: 'Saved for Later', badge: recommendations.filter((r) => r.status === 'saved').length },
          { id: 'completed', label: 'Completed', badge: recommendations.filter((r) => r.status === 'completed').length },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* Grid of Recommendation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRecs.map((rec) => (
          <Card
            key={rec.id}
            hoverEffect
            className={`p-5 flex flex-col justify-between ${
              rec.status === 'completed' ? 'bg-emerald-50/30 border-emerald-200' : ''
            }`}
          >
            <div>
              {/* Category & Status */}
              <div className="flex items-center justify-between mb-3">
                <Badge variant="emerald" icon={getCategoryIcon(rec.category)} className="capitalize text-[11px]">
                  {rec.category}
                </Badge>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-500 flex items-center gap-1 font-medium">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {rec.timeToImplement}
                  </span>
                </div>
              </div>

              {/* Title & Description */}
              <h4 className="font-bold text-slate-900 text-sm mb-1.5 line-clamp-1">{rec.title}</h4>
              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                {rec.description}
              </p>

              {/* Estimated Benefit Highlight */}
              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50/80 rounded-xl border border-slate-100 text-xs mb-4">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Est. Bill Savings</span>
                  <span className="font-bold text-emerald-700">{formatInr(rec.estimatedSavingsInrPerMonth)}/mo</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">CO₂e Avoided</span>
                  <span className="font-bold text-teal-700">~{rec.impactKgPerMonth} kg/mo</span>
                </div>
              </div>

              {/* Mission LiFE Pillar */}
              <p className="text-[11px] text-slate-400 italic mb-3">
                🎯 {rec.missionLifeAction}
              </p>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedRec(rec)}
                className="text-xs py-1 px-2 text-slate-500"
              >
                Details
              </Button>

              <div className="flex items-center gap-1.5">
                {rec.status !== 'saved' ? (
                  <button
                    onClick={() => handleStatusChange(rec.id, 'saved')}
                    className="p-1.5 text-slate-400 hover:text-emerald-700 transition-colors"
                    title="Save for later"
                  >
                    <Bookmark className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => handleStatusChange(rec.id, 'pending')}
                    className="p-1.5 text-emerald-700 transition-colors"
                    title="Remove from saved"
                  >
                    <BookmarkCheck className="w-4 h-4" />
                  </button>
                )}

                {rec.status === 'completed' ? (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-xl flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Done
                  </span>
                ) : (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => handleStatusChange(rec.id, 'completed')}
                    className="text-xs py-1 px-3"
                  >
                    Mark Done
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Details Modal */}
      {selectedRec && (
        <Modal
          isOpen={!!selectedRec}
          onClose={() => setSelectedRec(null)}
          title={selectedRec.title}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-2">
              <Badge variant="emerald" className="capitalize">
                {selectedRec.category}
              </Badge>
              <Badge variant="solar" className="capitalize">
                {selectedRec.difficulty} Difficulty
              </Badge>
              <span className="text-slate-500">Takes: {selectedRec.timeToImplement}</span>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed">{selectedRec.description}</p>

            <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200">
              <span className="font-bold text-emerald-950 block mb-1">
                Why this was recommended for your home:
              </span>
              <p className="text-emerald-800 leading-relaxed">{selectedRec.reason}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <span className="text-slate-400 block font-medium">Estimated Financial Savings</span>
                <span className="text-base font-extrabold text-emerald-700">
                  {formatInr(selectedRec.estimatedSavingsInrPerMonth)} per month
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Estimated Carbon Abatement</span>
                <span className="text-base font-extrabold text-teal-700">
                  ~{selectedRec.impactKgPerMonth} kg CO₂e / month
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedRec(null)}>
                Close
              </Button>
              {selectedRec.status !== 'completed' && (
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<CheckCircle2 className="w-4 h-4" />}
                  onClick={() => {
                    handleStatusChange(selectedRec.id, 'completed');
                    setSelectedRec(null);
                  }}
                >
                  Mark as Completed
                </Button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
