'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const STATUS_COLOR_MAP = {
  Open: '#4a7bbd',
  'In Progress': '#d4a574',
  Resolved: '#6b8f71',
};

export default function StatusChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-text-muted text-sm">
        No complaint status data available
      </div>
    );
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
          <XAxis dataKey="name" stroke="#8a8a8a" fontSize={12} tickLine={false} />
          <YAxis stroke="#8a8a8a" fontSize={12} tickLine={false} allowDecimals={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              borderColor: '#d1cdc5',
              borderRadius: '8px',
              color: '#1a1a1a',
            }}
          />
          <Bar dataKey="count" radius={[6, 6, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={STATUS_COLOR_MAP[entry.name] || '#1a1a1a'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
