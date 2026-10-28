import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Alert } from '../components/common/Alert';
import { Modal } from '../components/common/Modal';
import {
  User,
  Settings,
  Bell,
  Shield,
  Download,
  RotateCcw,
  LogOut,
  Save,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

const settingsSchema = z.object({
  name: z.string().min(2, 'Name must have at least 2 characters'),
  email: z.string().email(),
  city: z.string().min(2),
  householdSize: z.number().min(1).max(20),
  electricityKwh: z.number().min(20).max(5000),
  monthlyBillInr: z.number().min(100),
  tariffInrPerKwh: z.number().min(3).max(20),
  personalGoalEmissionsKg: z.number().min(50).max(500),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

export const SettingsPage: React.FC = () => {
  const { user, updateUser, resetAllDemo } = useApp();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [notificationDigest, setNotificationDigest] = useState(true);
  const [solarAlerts, setSolarAlerts] = useState(true);
  const [leaderboardPublic, setLeaderboardPublic] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      city: user.city,
      householdSize: user.householdSize,
      electricityKwh: user.electricityKwh,
      monthlyBillInr: user.monthlyBillInr,
      tariffInrPerKwh: user.tariffInrPerKwh,
      personalGoalEmissionsKg: user.personalGoalEmissionsKg || 190,
    },
  });

  const onSubmit = (data: SettingsFormData) => {
    updateUser(data);
    showToast({
      title: 'Profile Updated',
      message: 'Demo preferences and household parameters saved successfully.',
      type: 'success',
    });
  };

  const handleExportData = () => {
    const exportPayload = {
      userProfile: user,
      exportTimestamp: new Date().toISOString(),
      platform: 'GreenPulse Mission LiFE Platform (Frontend Prototype)',
      disclaimer: 'Illustrative mock data for hackathon review',
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `greenpulse_data_${user.name.toLowerCase().replace(/\s+/g, '_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    showToast({
      title: 'Export Generated',
      message: 'Household sustainability dataset downloaded as JSON.',
      type: 'success',
    });
  };

  const confirmReset = () => {
    resetAllDemo();
    setIsResetModalOpen(false);
    showToast({
      title: 'Demo State Cleared',
      message: 'All local demo points, activities, and challenges have been reset to pristine default.',
      type: 'info',
    });
  };

  const handleSignOut = () => {
    showToast({
      title: 'Session Ended',
      message: 'Signed out of simulated account.',
      type: 'info',
    });
    navigate('/');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Alert type="info">
        <strong>Demo Profile Environment:</strong> Changes are persisted in your browser's local sandbox and will not affect any remote server or production database.
      </Alert>

      {/* Main Settings Form */}
      <Card className="p-6 sm:p-8">
        <div className="flex items-center gap-3 pb-4 mb-6 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Household Profile & Parameters</h3>
            <p className="text-xs text-slate-500">Configure baseline inputs for solar & footprint calculations</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Citizen Full Name"
              {...register('name')}
              error={errors.name?.message}
              required
            />

            <Input
              label="Email Address"
              type="email"
              {...register('email')}
              error={errors.email?.message}
              required
            />

            <Input
              label="City"
              {...register('city')}
              error={errors.city?.message}
              required
            />

            <Input
              label="Household Size"
              type="number"
              unit="persons"
              {...register('householdSize', { valueAsNumber: true })}
              error={errors.householdSize?.message}
              required
            />

            <Input
              label="Monthly Electricity (Baseline)"
              type="number"
              unit="kWh"
              {...register('electricityKwh', { valueAsNumber: true })}
              error={errors.electricityKwh?.message}
              required
            />

            <Input
              label="Monthly Power Bill"
              type="number"
              unit="₹"
              {...register('monthlyBillInr', { valueAsNumber: true })}
              error={errors.monthlyBillInr?.message}
              required
            />

            <Input
              label="Effective Grid Tariff Rate"
              type="number"
              step="0.1"
              unit="₹/kWh"
              {...register('tariffInrPerKwh', { valueAsNumber: true })}
              error={errors.tariffInrPerKwh?.message}
              required
            />

            <Input
              label="Personal Emissions Target"
              type="number"
              unit="kg CO₂e/mo"
              {...register('personalGoalEmissionsKg', { valueAsNumber: true })}
              error={errors.personalGoalEmissionsKg?.message}
              helperText="Goal for 2026 Mission LiFE commitment"
              required
            />
          </div>

          <div className="pt-4 flex justify-end">
            <Button type="submit" variant="primary" size="sm" leftIcon={<Save className="w-4 h-4" />}>
              Save Profile Changes
            </Button>
          </div>
        </form>
      </Card>

      {/* Preferences & Privacy Toggles */}
      <Card className="p-6 space-y-4">
        <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <Bell className="w-4 h-4 text-emerald-600" />
          Notification & Privacy Preferences
        </h4>

        <div className="divide-y divide-slate-100 text-xs">
          <div className="py-3 flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-800">Weekly Mission LiFE Digest</p>
              <p className="text-slate-500">Summary of challenges and avoided carbon emissions</p>
            </div>
            <input
              type="checkbox"
              checked={notificationDigest}
              onChange={(e) => setNotificationDigest(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
            />
          </div>

          <div className="py-3 flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-800">Optimal Solar Generation Advisories</p>
              <p className="text-slate-500">Notifies when Gandhinagar forecasts peak 95%+ solar hours</p>
            </div>
            <input
              type="checkbox"
              checked={solarAlerts}
              onChange={(e) => setSolarAlerts(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
            />
          </div>

          <div className="py-3 flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-800">Public Community Squad Ranking</p>
              <p className="text-slate-500">Display your citizen alias on city & neighbourhood leaderboards</p>
            </div>
            <input
              type="checkbox"
              checked={leaderboardPublic}
              onChange={(e) => setLeaderboardPublic(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
            />
          </div>
        </div>
      </Card>

      {/* Demo Actions & Data Controls */}
      <Card className="p-6 border-red-100 bg-gradient-to-br from-white to-red-50/20 space-y-4">
        <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <Shield className="w-4 h-4 text-slate-600" />
          Platform Demo Controls & Data Management
        </h4>
        <p className="text-xs text-slate-500 leading-relaxed">
          Manage your simulation sandbox. You can export your session dataset as JSON, reset sample values to pristine defaults, or terminate your session.
        </p>

        <div className="pt-2 flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportData}
            leftIcon={<Download className="w-4 h-4" />}
          >
            Export My Data (JSON)
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsResetModalOpen(true)}
            leftIcon={<RotateCcw className="w-4 h-4 text-amber-600" />}
            className="text-amber-800 hover:bg-amber-50"
          >
            Reset Demo State
          </Button>

          <Button
            variant="danger"
            size="sm"
            onClick={handleSignOut}
            leftIcon={<LogOut className="w-4 h-4" />}
          >
            Sign Out (Demo)
          </Button>
        </div>
      </Card>

      {/* Confirmation Modal for Reset */}
      <Modal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        title="Reset Demo State to Defaults?"
      >
        <div className="space-y-4 text-xs text-slate-600">
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p>
              This will restore Aarav Sharma's initial benchmark data (1,240 pts, 12-day streak, original 7 challenges, and sample electricity records). All custom logs will be reset.
            </p>
          </div>
          <div className="pt-2 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsResetModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={confirmReset}>
              Confirm Reset
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
