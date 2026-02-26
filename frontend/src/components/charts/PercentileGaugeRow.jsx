export default function PercentileGaugeRow({ percentile }) {
  if (percentile == null) {
    return (
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full bg-slate-200" style={{ width: '0%' }} />
      </div>
    );
  }

  const clampedPct = Math.max(0, Math.min(100, percentile));

  return (
    <div className="relative h-3">
      <svg width="100%" height="12" preserveAspectRatio="none" viewBox="0 0 100 12">
        {/* Zone segments */}
        <rect x="0" y="2" width="25" height="8" rx="1" fill="#fecaca" />
        <rect x="25" y="2" width="25" height="8" fill="#fef3c7" />
        <rect x="50" y="2" width="25" height="8" fill="#dbeafe" />
        <rect x="75" y="2" width="25" height="8" rx="1" fill="#d1fae5" />

        {/* Marker triangle */}
        <polygon
          points={`${clampedPct - 2.5},0 ${clampedPct + 2.5},0 ${clampedPct},4`}
          fill="#1e293b"
        />
        {/* Marker line */}
        <line
          x1={clampedPct}
          y1="4"
          x2={clampedPct}
          y2="12"
          stroke="#1e293b"
          strokeWidth="1.5"
        />
      </svg>
    </div>
  );
}
