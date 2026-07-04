'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  ReferenceLine,
  Tooltip,
} from 'recharts';

interface EvalChartProps {
  evalHistory: number[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const val = payload[0].value as number;
  return (
    <div
      className="card-elevated px-2.5 py-1.5 text-xs font-mono-nums"
      style={{ border: '1px solid var(--border)' }}
    >
      <div style={{ color: 'var(--muted-foreground)' }}>Move {label}</div>
      <div style={{ color: val >= 0 ? '#f0d9b5' : '#b58863', fontWeight: 600 }}>
        {val >= 0 ? `+${val.toFixed(1)} White` : `${val.toFixed(1)} Black`}
      </div>
    </div>
  );
};

export function EvalChart({ evalHistory }: EvalChartProps) {
  const data = evalHistory.map((val, i) => ({ move: i, eval: val }));

  return (
    <ResponsiveContainer width="100%" height={80}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
        <defs>
          <linearGradient id="evalGradientPos" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--board-light)" stopOpacity={0.4} />
            <stop offset="95%" stopColor="var(--board-light)" stopOpacity={0.05} />
          </linearGradient>
          <linearGradient id="evalGradientNeg" x1="0" y1="1" x2="0" y2="0">
            <stop offset="5%" stopColor="var(--board-dark)" stopOpacity={0.4} />
            <stop offset="95%" stopColor="var(--board-dark)" stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <XAxis dataKey="move" hide />
        <YAxis domain={[-10, 10]} hide />
        <ReferenceLine y={0} stroke="var(--border)" strokeDasharray="3 3" />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="eval"
          stroke="var(--primary)"
          strokeWidth={1.5}
          fill="url(#evalGradientPos)"
          dot={false}
          activeDot={{ r: 3, fill: 'var(--primary)', stroke: 'var(--background)', strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}