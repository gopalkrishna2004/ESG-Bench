import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine,
} from 'recharts';

function yearColor(year) {
  if (year <= 2035) return '#059669';
  if (year <= 2045) return '#d97706';
  return '#dc2626';
}

export default function NetZeroTimeline({ ranked, selectedId }) {
  if (!ranked || ranked.length === 0) return null;

  const data = ranked
    .filter((r) => r.value != null && r.value > 2020)
    .map((r) => ({
      name: (r.company_name || '').split(' ').slice(0, 3).join(' '),
      year: Math.round(r.value),
      isSelected: r._id?.toString() === selectedId?.toString(),
    }))
    .sort((a, b) => a.year - b.year);

  if (data.length === 0) return null;

  return (
    <ResponsiveContainer width="100%" height={Math.max(data.length * 28 + 40, 180)}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
      >
        <XAxis
          type="number"
          domain={[2025, (dataMax) => Math.max(dataMax + 2, 2055)]}
          tick={{ fontSize: 10, fill: '#94a3b8' }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          dataKey="name"
          type="category"
          width={100}
          tick={({ x, y, payload }) => {
            const item = data.find((d) => d.name === payload.value);
            return (
              <text
                x={x}
                y={y}
                dy={4}
                textAnchor="end"
                fontSize={10}
                fill={item?.isSelected ? '#1e3a5f' : '#64748b'}
                fontWeight={item?.isSelected ? 700 : 400}
              >
                {item?.isSelected ? `★ ${payload.value}` : payload.value}
              </text>
            );
          }}
          tickLine={false}
          axisLine={false}
        />
        <ReferenceLine x={2035} stroke="#059669" strokeDasharray="4 3" strokeWidth={1} label={{ value: '2035', position: 'top', fontSize: 9, fill: '#059669' }} />
        <ReferenceLine x={2045} stroke="#d97706" strokeDasharray="4 3" strokeWidth={1} label={{ value: '2045', position: 'top', fontSize: 9, fill: '#d97706' }} />
        <Tooltip
          content={({ payload }) => {
            if (!payload?.[0]) return null;
            const d = payload[0].payload;
            return (
              <div className="bg-white shadow-lg rounded-lg px-3 py-2 border border-slate-100 text-xs">
                <p className="font-semibold text-slate-700">{d.name}</p>
                <p className="text-slate-500">Target: <span className="font-bold">{d.year}</span></p>
              </div>
            );
          }}
        />
        <Bar dataKey="year" radius={[0, 3, 3, 0]} maxBarSize={16}>
          {data.map((d, i) => (
            <Cell
              key={i}
              fill={d.isSelected ? '#f59e0b' : yearColor(d.year)}
              stroke={d.isSelected ? '#d97706' : 'none'}
              strokeWidth={d.isSelected ? 2 : 0}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
