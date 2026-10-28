import React from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Sun, ArrowRight, Zap, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

export const SolarInsightCard: React.FC = () => {
  return (
    <Card className="p-5 bg-gradient-to-br from-amber-50/70 via-solar-50/40 to-white border-amber-200/80 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
            <Sun className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold text-amber-900 bg-amber-100/70 px-2.5 py-0.5 rounded-full border border-amber-300">
            Solar Feasibility Preview
          </span>
        </div>

        <h4 className="font-bold text-slate-900 text-sm mb-1">
          Offset ~85% of your power bill with 2.5 kW Solar
        </h4>
        <p className="text-xs text-slate-600 leading-relaxed mb-4">
          Gandhinagar receives over 320 sunny days annually. Under current PM Surya Ghar guidelines, save up to ₹1,650/month with subsidy support.
        </p>

        <div className="grid grid-cols-2 gap-2 p-2.5 bg-white/80 rounded-xl border border-amber-200/60 text-xs mb-4">
          <div>
            <span className="text-[10px] text-slate-400 block font-medium">Est. Annual Savings</span>
            <span className="font-bold text-emerald-700 text-sm">₹19,800/yr</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-medium">Benchmark Payback</span>
            <span className="font-bold text-amber-700 text-sm">~3.4 Years</span>
          </div>
        </div>
      </div>

      <Link to="/solar">
        <Button variant="solar" size="sm" className="w-full justify-center" rightIcon={<ArrowRight className="w-4 h-4" />}>
          Run Full Solar Assessment
        </Button>
      </Link>
    </Card>
  );
};
