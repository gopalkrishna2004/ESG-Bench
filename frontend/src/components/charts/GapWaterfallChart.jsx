import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Cell,
  ResponsiveContainer,
  LabelList,
} from 'recharts';

/**
 * Waterfall-style gap chart.
 * Each bar represents the gap between the company's percentile and the sector average (50).
 * Positive = above average (good), Negative = below average (needs improvement).
 */
const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-xs">
      <p className="font-semibold text-slate-700 mb-1">{d.label}</p>
      <p className="text-slate-600">
        Company: <span className="font-semibold">{d.pct}th %ile</span>
      </p>
      <p className={d.gap >= 0 ? 'text-emerald-600' : 'text-red-600'}>
        vs Avg: <span className="font-semibold">{d.gap >= 0 ? '+' : ''}{d.gap} pts</span>
      </p>
    </div>
  );
};

export default function GapWaterfallChart({ percentiles = {}, metricsConfig = {} }) {
  const data = Object.entries(percentiles)
    .filter(([, pct]) => pct != null)
    .map(([metric, pct]) => ({
      label: metricsConfig[metric]?.label || metric,
      shortLabel: (metricsConfig[metric]?.label || metric).split(' ').slice(0, 2).join(' '),
      pct,
      gap: pct - 50,
    }))
    .sort((a, b) => a.gap - b.gap);

  if (!data.length) {
    return <div className="h-72 flex items-center justify-center text-slate-400 text-sm">No data available</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis
          dataKey="shortLabel"
          angle={-40}
          textAnchor="end"
          tick={{ fontSize: 10, fill: '#64748b' }}
          interval={0}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 10, fill: '#94a3b8' }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `${v > 0 ? '+' : ''}${v}`}
          domain={[-60, 60]}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
        <ReferenceLine y={0} stroke="#64748b" strokeWidth={1.5} label={{ value: 'Sector Average', fontSize: 9, fill: '#64748b' }} />
        <Bar dataKey="gap" radius={[3, 3, 0, 0]} maxBarSize={36}>
          <LabelList
            dataKey="gap"
            position="top"
            style={{ fontSize: 9, fill: '#64748b' }}
            formatter={(v) => `${v > 0 ? '+' : ''}${v}`}
          />
          {data.map((entry, idx) => (
            <Cell key={idx} fill={entry.gap >= 0 ? '#10b981' : '#ef4444'} opacity={0.85} />
          ))}
        </Bar>
      </ComposedChart>
    </ResponsiveContainer>
  );
}
