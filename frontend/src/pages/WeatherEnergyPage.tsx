import React, { useState } from 'react';
import { weatherService } from '../services/weatherService';
import { Card, CardHeader, CardContent } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { StatCard } from '../components/common/StatCard';
import { Alert } from '../components/common/Alert';
import {
  Sun,
  CloudSun,
  Wind,
  Droplets,
  Thermometer,
  Zap,
  MapPin,
  Clock,
  Sparkles,
  Info,
} from 'lucide-react';

export const WeatherEnergyPage: React.FC = () => {
  const [selectedCity, setSelectedCity] = useState('Gandhinagar');
  const availableLocations = weatherService.getAvailableLocations();
  const weather = weatherService.getWeatherInsight(selectedCity);

  return (
    <div className="space-y-6">
      {/* Top Location Selector & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-emerald-100">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-display">
            Weather & Energy Insights
          </h2>
          <p className="text-xs text-slate-500">
            Smart appliance scheduling based on local ambient temperature and solar insolation
          </p>
        </div>

        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-emerald-600" />
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="text-xs font-semibold rounded-xl border border-emerald-200 px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {availableLocations.map((loc) => (
              <option key={loc.key} value={loc.key}>
                {loc.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Alert type="info">
        <strong>Data Status:</strong> {weather.dataSource} • Last updated: {weather.lastUpdated}. Ready for backend proxy integration with OpenWeather or IMD APIs.
      </Alert>

      {/* Hero Current Conditions Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <Card className="p-6 bg-gradient-to-br from-emerald-600 via-teal-700 to-green-800 text-white shadow-xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">
                  Current Atmospheric Observation
                </span>
                <h3 className="text-3xl font-extrabold font-display tracking-tight mt-1 text-white">
                  {weather.location}
                </h3>
                <p className="text-emerald-100 text-sm mt-0.5">{weather.condition}</p>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black font-display text-white">
                  {weather.temperatureC}°
                </span>
                <span className="text-emerald-200 text-xl font-bold">C</span>
              </div>
            </div>

            {/* Weather Metrics Sub-grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-emerald-500/40 text-xs">
              <div className="flex items-center gap-2">
                <Wind className="w-4 h-4 text-emerald-300" />
                <span>Wind: {weather.windKmph} km/h</span>
              </div>
              <div className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-emerald-300" />
                <span>Humidity: {weather.humidityPct}%</span>
              </div>
              <div className="flex items-center gap-2">
                <CloudSun className="w-4 h-4 text-emerald-300" />
                <span>Cloud Cover: {weather.cloudCoverPct}%</span>
              </div>
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-300" />
                <span>UV Index: {weather.uvIndex}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Solar Generation Readiness Card */}
        <div className="lg:col-span-4">
          <Card className="p-6 h-full flex flex-col justify-between bg-gradient-to-br from-amber-500/10 via-solar-50/20 to-white border-amber-200">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                  Solar Readiness
                </span>
                <Badge variant="solar" className="font-bold">
                  {weather.solarSuitability}
                </Badge>
              </div>

              <div className="flex items-center gap-3 my-2">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold">
                  <Sun className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">Optimal Solar Hours</h4>
                  <p className="text-xs text-amber-800 font-semibold mt-0.5">
                    {weather.peakSolarHours}
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed mt-3">
                Solar irradiation levels are ideal today. Rooftop solar modules will operate at high efficiency with minimal thermal derating.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-amber-200/60 text-center">
              <span className="text-[11px] font-bold text-amber-900">
                Recommended: Schedule heavy washing & pumps between 11 AM – 2 PM
              </span>
            </div>
          </Card>
        </div>
      </div>

      {/* 7-Day Forecast & Solar Rating */}
      <Card>
        <CardHeader
          title="7-Day Solar & Temperature Outlook"
          subtitle="Estimated daily solar suitability index for household planning"
          icon={<CloudSun className="w-5 h-5 text-emerald-600" />}
        />
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
            {weather.dailyForecast.map((day, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-center space-y-2 hover:bg-emerald-50/50 transition-colors"
              >
                <p className="text-xs font-bold text-slate-700">{day.day}</p>
                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
                  <Sun className="w-4 h-4" />
                </div>
                <p className="text-base font-black text-slate-900">{day.temp}°C</p>
                <p className="text-[10px] text-slate-500 truncate">{day.condition}</p>
                <div className="pt-1 border-t border-slate-200">
                  <span className="text-[10px] font-bold text-emerald-700">
                    {day.solarRating}% Sun
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Contextual Weather Energy Tips */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          Today's Contextual Energy Conservation Recommendations
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {weather.tips.map((tip, idx) => (
            <Card key={idx} className="p-4 border-emerald-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {tip.priority} Priority
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 mb-1">{tip.title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{tip.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
