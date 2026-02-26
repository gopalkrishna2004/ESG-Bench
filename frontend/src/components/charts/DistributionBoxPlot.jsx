export default function DistributionBoxPlot({ label, min, max, p25, p50, p75, companyValue, lowerIsBetter, unit }) {
  if (min == null || max == null || min === max) return null;

  const range = max - min;
  const toPercent = (v) => `${Math.min(Math.max(((v - min) / range) * 100, 0), 100)}%`;
  const toPercentNum = (v) => Math.min(Math.max(((v - min) / range) * 100, 0), 100);

  const boxLeft = toPercentNum(p25 ?? min);
  const boxRight = toPercentNum(p75 ?? max);
  const boxWidth = Math.max(boxRight - boxLeft, 0.5);
  const medianPos = toPercentNum(p50 ?? (min + max) / 2);
  const companyPos = companyValue != null ? toPercentNum(companyValue) : null;

  // Determine company marker color based on performance tier
  let markerColor = '#64748b';
  if (companyValue != null && p25 != null && p75 != null) {
    const isTop = lowerIsBetter ? companyValue <= p25 : companyValue >= p75;
    const isBot = lowerIsBetter ? companyValue >= p75 : companyValue <= p25;
    if (isTop) markerColor = '#059669';
    else if (isBot) markerColor = '#dc2626';
    else markerColor = '#d97706';
  }

  const formatVal = (v) => {
    if (v == null) return '';
    if (unit === '%') return `${Number(v).toFixed(1)}%`;
    if (unit === 'ratio') return Number(v).toFixed(2);
    if (unit === 'year') return String(Math.round(v));
    if (unit === 'rate') return Number(v).toFixed(3);
    if (Math.abs(v) >= 1e6) return `${(v / 1e6).toFixed(1)}M`;
    if (Math.abs(v) >= 1e3) return `${(v / 1e3).toFixed(0)}K`;
    return Number(v).toFixed(1);
  };

  return (
    <div className="flex items-center gap-3">
      {/* Label */}
      <div className="w-32 shrink-0 text-right">
        <p className="text-xs font-medium text-slate-600 leading-tight">{label}</p>
        {companyValue != null && (
          <p className="text-[10px] text-slate-400">{formatVal(companyValue)} {unit}</p>
        )}
      </div>

      {/* Chart area */}
      <div className="flex-1 relative" style={{ height: 24 }}>
        {/* Center line (whisker) */}
        <div className="absolute top-1/2 left-0 right-0 h-px bg-slate-200" style={{ transform: 'translateY(-50%)' }} />

        {/* IQR Box */}
        <div
          className="absolute top-1/2 bg-slate-200 rounded-sm"
          style={{
            left: `${boxLeft}%`,
            width: `${boxWidth}%`,
            height: 14,
            transform: 'translateY(-50%)',
          }}
        />

        {/* Median line */}
        <div
          className="absolute top-1/2 w-0.5 bg-slate-500 rounded"
          style={{
            left: `${medianPos}%`,
            height: 18,
            transform: 'translate(-50%, -50%)',
          }}
        />

        {/* Company marker — a proper circle using a div */}
        {companyPos != null && (
          <div
            className="absolute top-1/2 rounded-full border-2 border-white"
            style={{
              left: `${companyPos}%`,
              width: 12,
              height: 12,
              backgroundColor: markerColor,
              transform: 'translate(-50%, -50%)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              zIndex: 10,
            }}
            title={`${label}: ${formatVal(companyValue)} ${unit}`}
          />
        )}
      </div>

      {/* P25/P75 labels */}
      <div className="w-16 shrink-0 text-[10px] text-slate-400 leading-tight text-right">
        <div>P25: {formatVal(p25)}</div>
        <div>P75: {formatVal(p75)}</div>
      </div>
    </div>
  );
}
