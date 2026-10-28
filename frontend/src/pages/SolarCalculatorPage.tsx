import React, { useState } from 'react';
import { solarService } from '../services/solarService';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { SolarAssessmentInput, SolarAssessmentResult } from '../types';
import { SolarForm } from '../components/solar/SolarForm';
import { SolarResultCards } from '../components/solar/SolarResultCards';
import { SolarGenerationChart } from '../components/charts/SolarGenerationChart';
import { Card, CardHeader, CardContent } from '../components/common/Card';
import { Alert } from '../components/common/Alert';
import { Button } from '../components/common/Button';
import { Link } from 'react-router-dom';
import {
  Sun,
  ShieldAlert,
  ArrowRight,
  TrendingDown,
  BookOpen,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { formatInr } from '../utils/formatters';

export const SolarCalculatorPage: React.FC = () => {
  const { user } = useApp();
  const { showToast } = useToast();

  const [input, setInput] = useState<SolarAssessmentInput>(() =>
    solarService.getDefaultInput(user)
  );

  const [result, setResult] = useState<SolarAssessmentResult>(() =>
    solarService.assess(input)
  );

  const handleFormSubmit = (newInput: SolarAssessmentInput) => {
    setInput(newInput);
    const newResult = solarService.assess(newInput);
    setResult(newResult);
    showToast({
      title: 'Solar Feasibility Recalculated',
      message: `Recommended ${newResult.recommendedCapacityKw} kWp system with estimated ${newResult.estimatedPaybackYears} yrs payback.`,
      type: 'success',
    });
  };

  const handleReset = () => {
    const defaultIn = solarService.getDefaultInput(user);
    setInput(defaultIn);
    const res = solarService.assess(defaultIn);
    setResult(res);
  };

  // Scenario Comparison Data: Current Grid Only vs Grid + Rooftop Solar
  const currentAnnualGridBill = (input.monthlyBillInr || 1980) * 12;
  const solarAnnualGridBill = Math.max(0, currentAnnualGridBill - result.annualSavingsInr);

  return (
    <div className="space-y-6">
      {/* Transparency Disclaimer Notice */}
      <Alert type="warning" title="Indicative Solar Estimation Notice">
        All solar figures, capacities, generation numbers, and subsidy estimates are educational calculations modeled on benchmark Indian insolation standards and PM Surya Ghar Muft Bijli Yojana illustrative guidelines. They do not constitute a formal commercial quotation, EPC contract, or binding DISCOM approval.
      </Alert>

      {/* Top Section: Form + Results Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form */}
        <div className="lg:col-span-5">
          <Card className="p-6">
            <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
                <Sun className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Rooftop Parameters</h3>
                <p className="text-xs text-slate-500">Customize to your terrace & electricity bills</p>
              </div>
            </div>

            <SolarForm
              initialValues={input}
              onSubmit={handleFormSubmit}
              onReset={handleReset}
            />
          </Card>
        </div>

        {/* Right Column: Result Cards */}
        <div className="lg:col-span-7">
          <SolarResultCards result={result} input={input} />
        </div>
      </div>

      {/* Seasonal Generation Chart */}
      <Card>
        <CardHeader
          title="Seasonal Generation vs Consumption Baseline"
          subtitle="Monthly solar generation variation across the year in Western India"
          icon={<Sun className="w-5 h-5 text-amber-500" />}
        />
        <CardContent>
          <SolarGenerationChart
            data={result.monthlyProfile}
            averageMonthlyConsumptionKwh={input.monthlyKwh}
          />
        </CardContent>
      </Card>

      {/* Scenario Comparison: Baseline Grid vs Rooftop Solar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 space-y-4">
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-emerald-600" />
            Annual Financial Comparison
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            See how installing a {result.recommendedCapacityKw} kWp rooftop solar array reshapes your annual energy outlay.
          </p>

          <div className="space-y-3 pt-2">
            {/* Scenario 1: Current Grid Only */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-slate-900 block">Scenario A: 100% Grid Reliance</span>
                <span className="text-slate-500">Current annual power utility bills</span>
              </div>
              <span className="text-base font-extrabold text-slate-900">
                {formatInr(currentAnnualGridBill)} / yr
              </span>
            </div>

            {/* Scenario 2: With Rooftop Solar */}
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-300 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-emerald-950 block">Scenario B: With Rooftop Solar</span>
                <span className="text-emerald-700">Remaining grid bill after solar generation</span>
              </div>
              <div className="text-right">
                <span className="text-base font-extrabold text-emerald-800">
                  {formatInr(solarAnnualGridBill)} / yr
                </span>
                <span className="text-[10px] text-emerald-600 block font-semibold">
                  Saves {formatInr(result.annualSavingsInr)} / yr
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Educational Resources Link */}
        <Card className="p-6 bg-gradient-to-br from-emerald-50/80 to-teal-50/50 border-emerald-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                Next Steps & Subsidies
              </span>
            </div>
            <h4 className="text-base font-bold text-slate-900 mb-1">
              Applying for National PM Surya Ghar Subsidies
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Under national rooftop solar rules, residential consumers receive direct bank transfer subsidies (DBT) of up to ₹78,000 for verified 3 kW installations through the national portal.
            </p>
            <ul className="space-y-1.5 text-xs text-slate-700">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verify shadow-free terrace rights with society / landlord</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Request quotes from empaneled DISCOM vendors</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Apply for bi-directional net meter installation</span>
              </li>
            </ul>
          </div>

          <div className="mt-5 pt-4 border-t border-emerald-100">
            <Link to="/resources">
              <Button variant="primary" size="sm" className="w-full justify-center" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Read Step-by-Step Solar Guide
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
