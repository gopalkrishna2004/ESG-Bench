import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';

function scoreToColor(score) {
  if (score >= 80) return '#059669';
  if (score >= 60) return '#34d399';
  if (score >= 40) return '#fbbf24';
  if (score >= 20) return '#f97316';
  return '#ef4444';
}

function CustomContent({ x, y, width, height, name, score }) {
  if (width < 30 || height < 25) return null;
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={scoreToColor(score)} rx={4} stroke="white" strokeWidth={2} />
      {width > 50 && height > 35 && (
        <>
          <text x={x + width / 2} y={y + height / 2 - 6} textAnchor="middle" fill="white" fontSize={10} fontWeight="600">
            {name?.length > 12 ? name.slice(0, 12) + '…' : name}
          </text>
          <text x={x + width / 2} y={y + height / 2 + 10} textAnchor="middle" fill="rgba(255,255,255,0.85)" fontSize={12} fontWeight="700">
            {Math.round(score)}
          </text>
        </>
      )}
      {width > 30 && width <= 50 && height > 25 && (
        <text x={x + width / 2} y={y + height / 2 + 4} textAnchor="middle" fill="white" fontSize={11} fontWeight="700">
          {Math.round(score)}
        </text>
      )}
    </g>
  );
}

export default function MetricTreemap({ normalizedScores, metricsConfig }) {
  if (!normalizedScores || !metricsConfig) return null;

  const data = Object.entries(normalizedScores)
    .filter(([, v]) => v != null)
    .map(([key, score]) => ({
      name: metricsConfig[key]?.label || key,
      size: Math.max(score, 3), // avoid zero-area
      score: Math.round(score),
    }));

  if (data.length === 0) return null;

  return (
    <ResponsiveContainer width="100%" height={220}>
      <Treemap
        data={data}
        dataKey="size"
        stroke="none"
        content={<CustomContent />}
      >
        <Tooltip
          content={({ payload }) => {
            if (!payload?.[0]) return null;
            const d = payload[0].payload;
            return (
              <div className="bg-white shadow-lg rounded-lg px-3 py-2 border border-slate-100 text-xs">
                <p className="font-semibold text-slate-700">{d.name}</p>
                <p className="text-slate-500">Score: <span className="font-bold">{d.score}/100</span></p>
              </div>
            );
          }}
        />
      </Treemap>
    </ResponsiveContainer>
  );
}
