function percentileBadge(pct) {
  if (pct == null) return { text: 'N/A', cls: 'badge-blue' };
  if (pct >= 75) return { text: `Top ${100 - pct}%`, cls: 'badge-green' };
  if (pct >= 50) return { text: `${pct}th %ile`, cls: 'badge-blue' };
  if (pct >= 25) return { text: `${pct}th %ile`, cls: 'badge-amber' };
  return { text: `Bottom ${pct}%`, cls: 'badge-red' };
}

function formatValue(value, unit) {
  if (value == null) return '—';
  if (unit === '%') return `${value.toFixed(1)}%`;
  if (unit === 'ratio') return value.toFixed(2);
  if (unit === 'year') return Math.round(value).toString();
  if (unit === 'rate') return value.toFixed(3);
  if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (Math.abs(value) >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toFixed(2);
}

export default function MetricCard({ label, value, unit, percentile, avgValue, leaderValue, lowerIsBetter }) {
  const badge = percentileBadge(percentile);

  const pctBar = percentile != null ? Math.max(2, percentile) : 0;
  const barColor =
    percentile >= 75 ? 'bg-emerald-500' : percentile >= 50 ? 'bg-blue-500' : percentile >= 25 ? 'bg-amber-500' : 'bg-red-500';

  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide leading-tight">{label}</p>
        <span className={badge.cls}>{badge.text}</span>
      </div>

      <p className="text-2xl font-bold text-slate-800 mt-1">
        {formatValue(value, unit)}
        {value != null && <span className="text-sm font-normal text-slate-400 ml-1">{unit}</span>}
      </p>

      {/* Percentile bar */}
      <div className="mt-3 mb-2">
        <div className="flex justify-between text-xs text-slate-400 mb-1">
          <span>Sector rank</span>
          <span>{percentile != null ? `${percentile}th percentile` : 'N/A'}</span>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${pctBar}%` }} />
        </div>
      </div>

      {/* Comparison row */}
      <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100">
        <div>
          <p className="text-xs text-slate-400">Sector Avg</p>
          <p className="text-sm font-medium text-slate-600">{formatValue(avgValue, unit)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">{lowerIsBetter ? 'Best (lowest)' : 'Best (highest)'}</p>
          <p className="text-sm font-medium text-emerald-600">{formatValue(leaderValue, unit)}</p>
        </div>
      </div>
    </div>
  );
}
