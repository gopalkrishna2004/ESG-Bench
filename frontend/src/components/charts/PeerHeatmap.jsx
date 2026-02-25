/** Custom heatmap: companies (rows) × metrics (columns), color = normalized 0-100 score */

function scoreToColor(score) {
  if (score == null) return '#f1f5f9';
  if (score >= 80) return '#059669';
  if (score >= 60) return '#34d399';
  if (score >= 40) return '#fbbf24';
  if (score >= 20) return '#f97316';
  return '#ef4444';
}

function scoreToTextColor(score) {
  if (score == null) return '#94a3b8';
  if (score >= 60) return '#fff';
  if (score >= 40) return '#78350f';
  return '#fff';
}

const DISPLAY_METRICS = [
  { key: 'emissions_intensity', short: 'Emiss. Int.' },
  { key: 'renewable_energy_pct', short: 'Renew. E%' },
  { key: 'water_consumption', short: 'Water' },
  { key: 'gender_diversity_pct', short: 'Gender Div' },
  { key: 'board_women_percent', short: 'Board Women' },
  { key: 'ltifr', short: 'LTIFR' },
  { key: 'employee_turnover_rate', short: 'Turnover' },
  { key: 'independent_directors_percent', short: 'Ind. Dir.' },
  { key: 'pay_equity_ratio', short: 'Pay Equity' },
  { key: 'data_breaches', short: 'Data Breach' },
];

export default function PeerHeatmap({ data = [], selectedId }) {
  if (!data.length) {
    return <div className="h-64 flex items-center justify-center text-slate-400 text-sm">No heatmap data</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="text-xs w-full border-separate" style={{ borderSpacing: 2 }}>
        <thead>
          <tr>
            <th className="text-left px-2 py-1 text-slate-500 font-medium w-36 sticky left-0 bg-white z-10">
              Company
            </th>
            {DISPLAY_METRICS.map((m) => (
              <th key={m.key} className="px-1 py-1 text-slate-500 font-medium text-center min-w-[70px]">
                {m.short}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => {
            const isSelected = row._id?.toString() === selectedId?.toString();
            const shortName = (row.company_name || 'Unknown').split(' ').slice(0, 3).join(' ');
            return (
              <tr key={row._id} className={isSelected ? 'ring-2 ring-blue-500 ring-inset' : ''}>
                <td
                  className={`px-2 py-1.5 font-medium sticky left-0 z-10 rounded-l ${
                    isSelected ? 'bg-blue-50 text-blue-700' : 'bg-white text-slate-700'
                  }`}
                  title={row.company_name}
                >
                  <span className="truncate block max-w-[140px]">{shortName}</span>
                  {isSelected && <span className="text-blue-500 text-xs"> ★</span>}
                </td>
                {DISPLAY_METRICS.map((m) => {
                  const score = row[m.key];
                  const bg = scoreToColor(score);
                  const fg = scoreToTextColor(score);
                  return (
                    <td
                      key={m.key}
                      className="text-center px-1 py-1.5 rounded font-semibold"
                      style={{ backgroundColor: bg, color: fg }}
                      title={`${m.short}: ${score != null ? score : 'N/A'}/100`}
                    >
                      {score != null ? score : '—'}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Legend */}
      <div className="flex items-center gap-3 mt-3 pt-2 border-t border-slate-100">
        <span className="text-xs text-slate-400">Score:</span>
        {[
          { label: '80-100', bg: '#059669', fg: '#fff' },
          { label: '60-79', bg: '#34d399', fg: '#fff' },
          { label: '40-59', bg: '#fbbf24', fg: '#78350f' },
          { label: '20-39', bg: '#f97316', fg: '#fff' },
          { label: '0-19', bg: '#ef4444', fg: '#fff' },
          { label: 'N/A', bg: '#f1f5f9', fg: '#94a3b8' },
        ].map((l) => (
          <div
            key={l.label}
            className="flex items-center gap-1 text-xs px-2 py-0.5 rounded font-medium"
            style={{ backgroundColor: l.bg, color: l.fg }}
          >
            {l.label}
          </div>
        ))}
      </div>
    </div>
  );
}
