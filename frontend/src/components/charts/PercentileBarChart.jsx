import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Cell,
  ResponsiveContainer,
} from 'recharts';

function getBarColor(value, isSelected) {
  if (isSelected) return '#f59e0b';
  if (value >= 75) return '#10b981';
  if (value >= 50) return '#3b82f6';
  if (value >= 25) return '#f97316';
  return '#ef4444';
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-xs max-w-[200px]">
      <p className="font-semibold text-slate-700 mb-1 truncate">{d.fullName}</p>
      <p className="text-slate-600">
        Value: <span className="font-semibold">{d.displayValue}</span>
      </p>
      <p className="text-slate-600">
        Rank: <span className="font-semibold">{d.value}th percentile</span>
      </p>
    </div>
  );
};

export default function PercentileBarChart({ ranked = [], selectedId, label, unit }) {
  if (!ranked.length) {
    return <div className="h-64 flex items-center justify-center text-slate-400 text-sm">No data</div>;
  }

  function fmt(v) {
    if (v == null) return '—';
    if (unit === '%') return `${v.toFixed(1)}%`;
    if (unit === 'ratio') return v.toFixed(2);
    if (unit === 'year') return String(Math.round(v));
    if (Math.abs(v) >= 1e6) return `${(v / 1e6).toFixed(2)}M`;
    if (Math.abs(v) >= 1e3) return `${(v / 1e3).toFixed(1)}K`;
    return v.toFixed(2);
  }

  const data = ranked.map((r) => ({
    name: (r.company_name || 'Unknown').split(' ').slice(0, 2).join(' '),
    fullName: r.company_name || 'Unknown',
    value: r.percentile ?? 0,
    displayValue: fmt(r.value),
    isSelected: r._id?.toString() === selectedId?.toString(),
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 55 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis
          dataKey="name"
          angle={-40}
          textAnchor="end"
          tick={{ fontSize: 10, fill: '#64748b' }}
          interval={0}
          tickLine={false}
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fontSize: 10, fill: '#94a3b8' }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `${v}%`}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
        <ReferenceLine y={50} stroke="#94a3b8" strokeDasharray="4 3" label={{ value: 'Avg', fontSize: 9, fill: '#94a3b8' }} />
        <Bar dataKey="value" radius={[3, 3, 0, 0]} maxBarSize={40}>
          {data.map((entry, idx) => (
            <Cell key={idx} fill={getBarColor(entry.value, entry.isSelected)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
