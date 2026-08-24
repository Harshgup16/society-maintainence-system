'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = [
  '#4a7bbd', '#d4a574', '#6b8f71', '#c75c5c', 
  '#8a8a8a', '#9b59b6', '#34495e', '#e67e22', '#16a085'
];

export default function CategoryChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-text-muted text-sm">
        No complaint category data available
      </div>
    );
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={4}
            dataKey="value"
            nameKey="name"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              borderColor: '#d1cdc5',
              borderRadius: '8px',
              color: '#1a1a1a',
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => <span className="text-xs text-text-secondary">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
