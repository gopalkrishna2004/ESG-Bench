import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts';

export const COMPANY_COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];

export default function PillarGroupedBarChart({ comparisons = [] }) {
  if (!comparisons.length) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
        Select companies to compare
      </div>
    );
  }

  const pillars = [
    { key: 'esg_score',         label: 'Overall ESG' },
    { key: 'environment_score', label: 'Environmental' },
    { key: 'social_score',      label: 'Social' },
    { key: 'governance_score',  label: 'Governance' },
  ];

  const data = pillars.map(({ key, label }) => {
    const row = { pillar: label };
    comparisons.forEach((c) => {
      row[c.company_name] = c[key] ?? 0;
    });
    return row;
  });

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis dataKey="pillar" tick={{ fontSize: 12, fill: '#64748b' }} tickLine={false} />
        <YAxis
          domain={[0, 100]}
          tick={{ fontSize: 10, fill: '#94a3b8' }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          formatter={(value, name) => [`${value}/100`, name]}
          contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
        />
        <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
        <ReferenceLine y={50} stroke="#94a3b8" strokeDasharray="4 3" label={{ value: '50', position: 'insideRight', fontSize: 10, fill: '#94a3b8' }} />
        {comparisons.map((c, idx) => (
          <Bar
            key={c._id}
            dataKey={c.company_name}
            fill={COMPANY_COLORS[idx % COMPANY_COLORS.length]}
            radius={[3, 3, 0, 0]}
            maxBarSize={36}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
