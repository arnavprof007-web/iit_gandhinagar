import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

interface SolarGenerationChartProps {
  data: { month: string; generationKwh: number; savingsInr: number }[];
  averageMonthlyConsumptionKwh?: number;
}

export const SolarGenerationChart: React.FC<SolarGenerationChartProps> = ({
  data,
  averageMonthlyConsumptionKwh = 260,
}) => {
  const chartData = data.map((item) => ({
    ...item,
    consumptionBaselineKwh: averageMonthlyConsumptionKwh,
  }));

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
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
                const item = payload[0].payload;
                return (
                  <div className="bg-white p-3 rounded-xl shadow-lg border border-slate-100 text-xs">
                    <p className="font-bold text-slate-900 mb-1">Month: {item.month}</p>
                    <p className="text-amber-600 font-semibold">
                      Solar Output: {item.generationKwh} kWh
                    </p>
                    <p className="text-emerald-600 font-semibold">
                      Est. Bill Savings: ₹{item.savingsInr.toLocaleString('en-IN')}
                    </p>
                    <p className="text-slate-500 mt-0.5">
                      Grid Baseline: {item.consumptionBaselineKwh} kWh
                    </p>
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
          <Bar
            dataKey="generationKwh"
            name="Solar Generation (kWh)"
            fill="#f59e0b"
            radius={[6, 6, 0, 0]}
          />
          <Line
            type="monotone"
            dataKey="consumptionBaselineKwh"
            name="Avg Consumption Baseline (kWh)"
            stroke="#64748b"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
