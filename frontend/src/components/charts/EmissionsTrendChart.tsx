import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ReferenceLine,
} from 'recharts';
import { FootprintSummary } from '../../types';

interface EmissionsTrendChartProps {
  data: FootprintSummary[];
  baselineTotalKg?: number;
}

export const EmissionsTrendChart: React.FC<EmissionsTrendChartProps> = ({
  data,
  baselineTotalKg = 365,
}) => {
  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="colorElec" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="colorTrans" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0284c7" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#0284c7" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="colorCook" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis
            dataKey="month"
            stroke="#64748b"
            fontSize={12}
            tickLine={false}
            axisLine={{ stroke: '#cbd5e1' }}
          />
          <YAxis
            stroke="#64748b"
            fontSize={12}
            tickLine={false}
            axisLine={{ stroke: '#cbd5e1' }}
            unit=" kg"
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload as FootprintSummary;
                return (
                  <div className="bg-white p-3 rounded-xl shadow-lg border border-slate-100 text-xs">
                    <p className="font-bold text-slate-900 mb-1.5">{item.period}</p>
                    <div className="space-y-1">
                      <p className="text-emerald-700 font-medium">
                        Electricity: {item.electricityKg} kg CO₂e
                      </p>
                      <p className="text-sky-700 font-medium">
                        Transport: {item.transportKg} kg CO₂e
                      </p>
                      <p className="text-amber-700 font-medium">
                        Cooking Fuel: {item.cookingKg} kg CO₂e
                      </p>
                      <div className="pt-1.5 mt-1 border-t border-slate-100 font-bold text-slate-800 flex justify-between gap-4">
                        <span>Total:</span>
                        <span>{item.totalKg} kg CO₂e ({item.deltaPercentage}%)</span>
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend
            verticalAlign="top"
            height={36}
            iconType="circle"
            formatter={(value) => <span className="text-xs text-slate-600 font-medium">{value}</span>}
          />
          {baselineTotalKg && (
            <ReferenceLine
              y={baselineTotalKg}
              stroke="#ef4444"
              strokeDasharray="4 4"
              label={{
                value: `Baseline (${baselineTotalKg} kg)`,
                position: 'top',
                fill: '#dc2626',
                fontSize: 11,
                fontWeight: 600,
              }}
            />
          )}
          <Area
            type="monotone"
            dataKey="electricityKg"
            name="Electricity"
            stackId="1"
            stroke="#059669"
            fill="url(#colorElec)"
          />
          <Area
            type="monotone"
            dataKey="transportKg"
            name="Transport"
            stackId="1"
            stroke="#0284c7"
            fill="url(#colorTrans)"
          />
          <Area
            type="monotone"
            dataKey="cookingKg"
            name="Cooking Fuel"
            stackId="1"
            stroke="#d97706"
            fill="url(#colorCook)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
