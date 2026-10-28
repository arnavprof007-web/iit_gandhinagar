import React from 'react';
import { SolarAssessmentResult, SolarAssessmentInput } from '../../types';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Printer, Download, Sun, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { formatInr, formatNumber } from '../../utils/formatters';

interface SolarSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: SolarAssessmentResult;
  input: SolarAssessmentInput;
}

export const SolarSummaryModal: React.FC<SolarSummaryModalProps> = ({
  isOpen,
  onClose,
  result,
  input,
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Rooftop Solar Assessment Summary" maxWidth="2xl">
      <div className="space-y-6 printable-area">
        {/* Header Branding */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
              <Sun className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">GreenPulse Solar Feasibility Report</h3>
              <p className="text-xs text-slate-500">Location: {input.city} • Generated: {new Date().toLocaleDateString('en-IN')}</p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-amber-50 text-amber-800 rounded-full border border-amber-200">
            Indicative Estimate
          </span>
        </div>

        {/* Primary Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[11px] text-slate-500 block">Recommended Capacity</span>
            <span className="text-lg font-bold text-slate-900">{result.recommendedCapacityKw} kWp</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[11px] text-slate-500 block">Annual Clean Energy</span>
            <span className="text-lg font-bold text-amber-600">{formatNumber(result.annualGenerationKwh)} kWh</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[11px] text-slate-500 block">Annual Bill Savings</span>
            <span className="text-lg font-bold text-emerald-600">{formatInr(result.annualSavingsInr)}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[11px] text-slate-500 block">Est. Payback Period</span>
            <span className="text-lg font-bold text-slate-900">{result.estimatedPaybackYears} Years</span>
          </div>
        </div>

        {/* Financial Breakdown Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
          <div className="bg-slate-50 px-4 py-2.5 font-bold text-slate-700 border-b border-slate-200">
            Financial & Capital Cost Analysis
          </div>
          <div className="divide-y divide-slate-100">
            <div className="px-4 py-2 flex justify-between">
              <span className="text-slate-600">Estimated Benchmark System Capital Cost</span>
              <span className="font-semibold text-slate-900">{formatInr(result.estimatedSystemCostInr)}</span>
            </div>
            <div className="px-4 py-2 flex justify-between text-emerald-700 bg-emerald-50/40">
              <span className="font-medium">Indicative National Benchmark Subsidy</span>
              <span className="font-bold">-{formatInr(result.subsidyApplicableInr)}</span>
            </div>
            <div className="px-4 py-2 flex justify-between bg-slate-50/70 font-bold">
              <span className="text-slate-900">Net Estimated Consumer Outlay</span>
              <span className="text-emerald-800">{formatInr(result.netSystemCostInr)}</span>
            </div>
            <div className="px-4 py-2 flex justify-between">
              <span className="text-slate-600">25-Year Cumulative Lifetime Savings (after degradation)</span>
              <span className="font-bold text-emerald-600">{formatInr(result.lifetimeSavingsInr)}</span>
            </div>
            <div className="px-4 py-2 flex justify-between">
              <span className="text-slate-600">Shadow-Free Rooftop Area Required</span>
              <span className="font-semibold text-slate-900">{result.requiredRoofSqFt} sq. ft.</span>
            </div>
          </div>
        </div>

        {/* Environmental Impact */}
        <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-emerald-950 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Avoids ~{result.co2OffsetTonnesPerYear} tonnes of grid CO₂e annually</span>
          </div>
          <span className="text-emerald-800 font-bold">≈ {result.treesEquivalent} Mature Trees planted</span>
        </div>

        {/* Methodology & Assumptions List */}
        <div className="space-y-1.5">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Calculation Assumptions:</h4>
          <ul className="space-y-1 text-[11px] text-slate-500">
            {result.assumptions.map((item, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-emerald-600">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Disclaimer Alert */}
        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p>
            <strong>Transparency Notice:</strong> This summary is an educational simulation based on national benchmark formulas. It is not an engineering feasibility guarantee or official quotation. Final system generation depends on rooftop shading, panel orientation, and local DISCOM net metering approval.
          </p>
        </div>

        {/* Modal Actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between no-print">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Printer className="w-4 h-4" />}
              onClick={handlePrint}
            >
              Print / Save PDF
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
