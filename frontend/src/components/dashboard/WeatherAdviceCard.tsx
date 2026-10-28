import React from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { CloudSun, Sun, ArrowRight, Sparkles, Wind } from 'lucide-react';
import { Link } from 'react-router-dom';
import { weatherService } from '../../services/weatherService';

export const WeatherAdviceCard: React.FC = () => {
  const weather = weatherService.getWeatherInsight('Gandhinagar');

  return (
    <Card className="p-5 bg-gradient-to-br from-emerald-50/60 via-teal-50/40 to-white border-emerald-100 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
            <Sun className="w-5 h-5 text-amber-300" />
          </div>
          <span className="text-[11px] font-bold text-emerald-900 bg-emerald-100/70 px-2.5 py-0.5 rounded-full border border-emerald-200">
            {weather.solarSuitability} Solar Conditions
          </span>
        </div>

        <div className="flex items-baseline justify-between mb-2">
          <h4 className="font-bold text-slate-900 text-sm">{weather.location}</h4>
          <span className="text-sm font-extrabold text-emerald-900">{weather.temperatureC}°C • {weather.condition}</span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed mb-4">
          Peak generation window: <strong className="text-slate-800">{weather.peakSolarHours}</strong>. Solar insolation expected at 95% today.
        </p>

        <div className="p-3 bg-white/90 rounded-xl border border-emerald-100 text-xs text-slate-700 mb-4 flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
          <p className="leading-snug">
            <strong>Today's Tip:</strong> Run high-draw appliances (washing machine, water pumps) between 11 AM – 2 PM to self-consume peak solar power.
          </p>
        </div>
      </div>

      <Link to="/weather">
        <Button variant="secondary" size="sm" className="w-full justify-center" rightIcon={<ArrowRight className="w-4 h-4" />}>
          View Weather & Forecast
        </Button>
      </Link>
    </Card>
  );
};
