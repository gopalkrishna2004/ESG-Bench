import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-xs">
      <p className="font-semibold text-slate-700 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: <span className="font-semibold">{p.value}</span>
          <span className="text-slate-400">/100</span>
        </p>
      ))}
    </div>
  );
};

export default function ESGRadarChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center text-slate-400 text-sm">
        No radar data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={360}>
      <RadarChart data={data} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
        <PolarGrid stroke="#e2e8f0" />
        <PolarAngleAxis
          dataKey="metric"
          tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }}
          tickLine={false}
        />
        <PolarRadiusAxis
          angle={30}
          domain={[0, 100]}
          tick={{ fontSize: 9, fill: '#94a3b8' }}
          tickCount={5}
          axisLine={false}
        />
        <Radar
          name="Sector Leader"
          dataKey="leader"
          stroke="#10b981"
          fill="#10b981"
          fillOpacity={0.06}
          strokeWidth={1.5}
          strokeDasharray="4 3"
        />
        <Radar
          name="Sector Average"
          dataKey="sectorAvg"
          stroke="#94a3b8"
          fill="#94a3b8"
          fillOpacity={0.08}
          strokeWidth={1.5}
          strokeDasharray="3 2"
        />
        <Radar
          name="Selected Company"
          dataKey="company"
          stroke="#3b82f6"
          fill="#3b82f6"
          fillOpacity={0.25}
          strokeWidth={2}
        />
        <Legend
          wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
          formatter={(value) => <span className="text-slate-600">{value}</span>}
        />
        <Tooltip content={<CustomTooltip />} />
      </RadarChart>
    </ResponsiveContainer>
  );
}
