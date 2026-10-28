import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { ElectricityRecord } from '../../types';

interface ElectricityChartProps {
  data: ElectricityRecord[];
  baselineKwh?: number;
}

export const ElectricityChart: React.FC<ElectricityChartProps> = ({
  data,
  baselineKwh = 300,
}) => {
  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
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
            unit=" kWh"
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload as ElectricityRecord;
                return (
                  <div className="bg-white p-3 rounded-xl shadow-lg border border-slate-100 text-xs">
                    <p className="font-bold text-slate-800">
                      {item.month} {item.year}
                    </p>
                    <p className="text-emerald-600 font-semibold mt-1">
                      Consumption: {item.consumptionKwh} kWh
                    </p>
                    <p className="text-slate-500">Bill Cost: ₹{item.costInr}</p>
                    <p className="text-slate-500">
                      Estimated CO₂e: {item.estimatedEmissionsKg} kg
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          {baselineKwh && (
            <ReferenceLine
              y={baselineKwh}
              stroke="#f59e0b"
              strokeDasharray="4 4"
              label={{
                value: `Baseline (${baselineKwh} kWh)`,
                position: 'top',
                fill: '#b45309',
                fontSize: 11,
                fontWeight: 600,
              }}
            />
          )}
          <Bar
            dataKey="consumptionKwh"
            fill="#10b981"
            radius={[6, 6, 0, 0]}
            name="Electricity (kWh)"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
