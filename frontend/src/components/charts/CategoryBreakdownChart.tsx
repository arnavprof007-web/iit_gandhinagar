import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';

interface CategoryBreakdownChartProps {
  electricityKg: number;
  transportKg: number;
  cookingKg: number;
}

export const CategoryBreakdownChart: React.FC<CategoryBreakdownChartProps> = ({
  electricityKg,
  transportKg,
  cookingKg,
}) => {
  const data = [
    { name: 'Grid Electricity', value: Number(electricityKg.toFixed(1)), color: '#10b981' },
    { name: 'Road Transport', value: Number(transportKg.toFixed(1)), color: '#0284c7' },
    { name: 'Cooking Fuel', value: Number(cookingKg.toFixed(1)), color: '#f59e0b' },
  ];

  const total = Number((electricityKg + transportKg + cookingKg).toFixed(1));

  return (
    <div className="w-full h-64 flex flex-col items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={4}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={2} stroke="#fff" />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload;
                const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0';
                return (
                  <div className="bg-white p-2.5 rounded-xl shadow-lg border border-slate-100 text-xs">
                    <p className="font-semibold text-slate-800">{item.name}</p>
                    <p className="font-bold text-emerald-600 mt-0.5">
                      {item.value} kg CO₂e ({pct}%)
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            formatter={(value) => <span className="text-xs text-slate-600">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
