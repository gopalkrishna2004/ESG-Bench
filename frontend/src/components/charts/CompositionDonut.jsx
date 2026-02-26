import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const DEFAULT_COLORS = ['#8b5cf6', '#3b82f6'];

export default function CompositionDonut({ data, colors = DEFAULT_COLORS, centerLabel, centerSubLabel, height = 200 }) {
  if (!data || data.length === 0) return null;

  const total = data.reduce((sum, d) => sum + (d.value ?? 0), 0);
  if (total === 0) return null;

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius="60%"
            outerRadius="80%"
            paddingAngle={2}
            strokeWidth={0}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={colors[i % colors.length]} />
            ))}
          </Pie>
          <Tooltip
            content={({ payload }) => {
              if (!payload?.[0]) return null;
              const d = payload[0];
              const pct = total > 0 ? ((d.value / total) * 100).toFixed(1) : 0;
              return (
                <div className="bg-white shadow-lg rounded-lg px-3 py-2 border border-slate-100 text-xs">
                  <p className="font-semibold text-slate-700">{d.name}</p>
                  <p className="text-slate-500">{d.value?.toLocaleString()} ({pct}%)</p>
                </div>
              );
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Center labels */}
      {(centerLabel || centerSubLabel) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {centerLabel && <span className="text-xl font-bold text-slate-800">{centerLabel}</span>}
          {centerSubLabel && <span className="text-[10px] text-slate-400 uppercase tracking-wider">{centerSubLabel}</span>}
        </div>
      )}

      {/* Legend */}
      <div className="flex justify-center gap-4 -mt-2">
        {data.map((d, i) => (
          <div key={d.name} className="flex items-center gap-1.5 text-xs text-slate-600">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colors[i % colors.length] }} />
            <span>{d.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
