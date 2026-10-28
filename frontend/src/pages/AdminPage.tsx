import React, { useState } from 'react';
import { adminService } from '../services/adminService';
import { challengeService } from '../services/challengeService';
import { useToast } from '../context/ToastContext';
import { Card, CardHeader, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { StatCard } from '../components/common/StatCard';
import { Alert } from '../components/common/Alert';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts';
import {
  ShieldCheck,
  Users,
  Trophy,
  Globe2,
  Sun,
  Plus,
  CheckCircle2,
  XCircle,
  Flag,
  FileText,
} from 'lucide-react';
import { formatNumber } from '../utils/formatters';

export const AdminPage: React.FC = () => {
  const { showToast } = useToast();
  const [analytics, setAnalytics] = useState(() => adminService.getAnalytics());
  const [isNewChallengeOpen, setIsNewChallengeOpen] = useState(false);

  // New Challenge Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'energy' | 'waste' | 'water' | 'mobility' | 'lifestyle'>('energy');
  const [newCadence, setNewCadence] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [newDifficulty, setNewDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [newPoints, setNewPoints] = useState(50);
  const [newCo2, setNewCo2] = useState(5.0);
  const [newDescription, setNewDescription] = useState('');

  const handleCreateChallenge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    adminService.createChallenge({
      title: newTitle,
      category: newCategory,
      cadence: newCadence,
      difficulty: newDifficulty,
      points: Number(newPoints),
      co2AvoidedKg: Number(newCo2),
      description: newDescription,
      target: 1,
      unit: 'action',
      instructions: ['Follow standard municipal environmental protocol.'],
      tips: ['Mission LiFE community guidelines.'],
    });

    setAnalytics(adminService.getAnalytics());
    setIsNewChallengeOpen(false);
    setNewTitle('');
    setNewDescription('');

    showToast({
      title: 'Challenge Published',
      message: `"${newTitle}" is now live for all platform citizens!`,
      type: 'success',
    });
  };

  const handleCampaignStatus = (id: string, status: 'active' | 'upcoming' | 'completed') => {
    adminService.updateCampaignStatus(id, status);
    setAnalytics({ ...adminService.getAnalytics() });
    showToast({
      title: 'Campaign Updated',
      message: `Status transitioned to ${status}.`,
      type: 'info',
    });
  };

  const handleModeration = (reportId: string, status: 'resolved' | 'dismissed') => {
    adminService.resolveModerationReport(reportId, status);
    setAnalytics({ ...adminService.getAnalytics() });
    showToast({
      title: 'Report Processed',
      message: `Flagged item marked as ${status}.`,
      type: 'info',
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-display flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            Citizen Engagement Administrator
          </h2>
          <p className="text-xs text-slate-500">
            Municipal Mission LiFE oversight, campaign telemetry, and moderation simulator
          </p>
        </div>

        <Button
          size="sm"
          variant="primary"
          onClick={() => setIsNewChallengeOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Publish New Challenge
        </Button>
      </div>

      <Alert type="warning">
        <strong>Demo Administrator Sandbox:</strong> All modifications here affect local browser state only. In the backend phase, this interface connects to authenticated role-based endpoints (`POST /api/v1/admin/challenges`, etc.).
      </Alert>

      {/* Aggregate City Telemetry KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Registered Citizens"
          value={formatNumber(analytics.totalCitizens)}
          subtitle="Gandhinagar Municipal Area"
          icon={<Users className="w-5 h-5 text-emerald-600" />}
        />

        <StatCard
          title="Active Challenges"
          value={analytics.activeChallenges}
          subtitle="Currently open for points"
          icon={<Trophy className="w-5 h-5 text-amber-500" />}
        />

        <StatCard
          title="Avoided CO₂ Equivalent"
          value={`${analytics.co2AvoidedTons} Tons`}
          subtitle="Aggregate citizen impact"
          icon={<Globe2 className="w-5 h-5 text-teal-600" />}
        />

        <StatCard
          title="Rooftop Solar Modeled"
          value={`${analytics.kwhSolarGeneratedMwh} MWh`}
          subtitle="Displaced grid generation"
          icon={<Sun className="w-5 h-5 text-amber-600" />}
        />
      </div>

      {/* Charts Row: Monthly Signups & Challenge Completions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader
            title="Monthly Citizen Adoption"
            subtitle="Households joined in 2026"
            icon={<Users className="w-5 h-5 text-emerald-600" />}
          />
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.monthlySignups}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-white p-2.5 rounded-xl shadow-lg border border-slate-100 text-xs">
                          <p className="font-bold">{d.month}: {d.users} new citizens</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="users" fill="#10b981" radius={[6, 6, 0, 0]} name="New Citizens" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader
            title="Challenge Completions by Mission LiFE Theme"
            subtitle="Aggregate verified micro-actions"
            icon={<Trophy className="w-5 h-5 text-amber-500" />}
          />
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={analytics.challengeCompletionByCategory}
                layout="vertical"
                margin={{ left: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="category"
                  stroke="#64748b"
                  fontSize={10}
                  tickLine={false}
                  width={110}
                />
                <Tooltip />
                <Bar dataKey="count" fill="#0284c7" radius={[0, 6, 6, 0]} name="Completions" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Management Table */}
      <Card className="overflow-hidden">
        <CardHeader
          title="City Environmental Campaigns"
          subtitle="Mission LiFE targets and citizen participation quotas"
          icon={<Flag className="w-5 h-5 text-emerald-600" />}
        />
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Campaign Title</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Citizens Enrolled</th>
                <th className="py-3 px-4 text-right">CO₂ Target</th>
                <th className="py-3 px-4 text-center">Manage Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {analytics.campaigns.map((camp) => (
                <tr key={camp.id} className="hover:bg-slate-50/60">
                  <td className="py-3 px-4 font-bold text-slate-900">{camp.title}</td>
                  <td className="py-3 px-4">
                    <Badge
                      variant={camp.status === 'active' ? 'emerald' : camp.status === 'upcoming' ? 'solar' : 'slate'}
                      className="capitalize text-[10px]"
                    >
                      {camp.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-slate-800">
                    {formatNumber(camp.enrolledCitizens)} / {formatNumber(camp.targetCitizens)}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-emerald-700">
                    {camp.co2TargetTons} Tons
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="inline-flex gap-1.5">
                      {camp.status !== 'active' && (
                        <button
                          onClick={() => handleCampaignStatus(camp.id, 'active')}
                          className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-semibold hover:bg-emerald-100"
                        >
                          Activate
                        </button>
                      )}
                      {camp.status !== 'completed' && (
                        <button
                          onClick={() => handleCampaignStatus(camp.id, 'completed')}
                          className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold hover:bg-slate-200"
                        >
                          Complete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Moderation Queue */}
      <Card className="overflow-hidden">
        <CardHeader
          title="Citizen Submission Moderation Queue"
          subtitle="Automated outlier flags and reported content"
          icon={<ShieldCheck className="w-5 h-5 text-amber-500" />}
        />
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Item Flagged</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Reporter</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Moderation Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {analytics.moderationReports.map((rep) => (
                <tr key={rep.id} className="hover:bg-slate-50/60">
                  <td className="py-3 px-4 font-bold text-slate-900">{rep.itemTitle}</td>
                  <td className="py-3 px-4 text-slate-500">{rep.type}</td>
                  <td className="py-3 px-4 text-slate-600">{rep.reportedBy}</td>
                  <td className="py-3 px-4 text-slate-500">{rep.date}</td>
                  <td className="py-3 px-4">
                    <Badge
                      variant={rep.status === 'pending' ? 'solar' : rep.status === 'resolved' ? 'emerald' : 'slate'}
                      className="capitalize text-[10px]"
                    >
                      {rep.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {rep.status === 'pending' ? (
                      <div className="inline-flex gap-2">
                        <button
                          onClick={() => handleModeration(rep.id, 'resolved')}
                          className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                          title="Approve / Resolve"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleModeration(rep.id, 'dismissed')}
                          className="p-1 text-red-500 hover:bg-red-50 rounded"
                          title="Dismiss"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-[11px]">Processed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create New Challenge Modal */}
      <Modal
        isOpen={isNewChallengeOpen}
        onClose={() => setIsNewChallengeOpen(false)}
        title="Publish a New Green Challenge"
      >
        <form onSubmit={handleCreateChallenge} className="space-y-4">
          <Input
            label="Challenge Title"
            placeholder="e.g. Drip Irrigation for Terrace Balcony"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Mission LiFE Pillar"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as any)}
              options={[
                { value: 'energy', label: '⚡ Energy' },
                { value: 'water', label: '💧 Water' },
                { value: 'waste', label: '♻️ Waste' },
                { value: 'mobility', label: '🚲 Mobility' },
                { value: 'lifestyle', label: '🌱 Lifestyle' },
              ]}
            />

            <Select
              label="Cadence"
              value={newCadence}
              onChange={(e) => setNewCadence(e.target.value as any)}
              options={[
                { value: 'daily', label: 'Daily' },
                { value: 'weekly', label: 'Weekly' },
                { value: 'monthly', label: 'Monthly' },
              ]}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Select
              label="Difficulty"
              value={newDifficulty}
              onChange={(e) => setNewDifficulty(e.target.value as any)}
              options={[
                { value: 'easy', label: 'Easy' },
                { value: 'medium', label: 'Medium' },
                { value: 'hard', label: 'Hard' },
              ]}
            />

            <Input
              label="Points"
              type="number"
              value={newPoints}
              onChange={(e) => setNewPoints(Number(e.target.value))}
              required
            />

            <Input
              label="CO₂ (kg)"
              type="number"
              step="0.1"
              value={newCo2}
              onChange={(e) => setNewCo2(Number(e.target.value))}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Description & Protocol <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Explain how citizens can complete this habit and why it matters..."
              className="w-full rounded-xl border border-slate-300 p-3 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsNewChallengeOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Publish Challenge
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
