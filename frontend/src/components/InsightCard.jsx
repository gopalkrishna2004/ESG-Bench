export default function InsightCard({ strengths = [], weaknesses = [], opportunities = [] }) {
  return (
    <div className="card">
      <p className="card-title">Strengths & Weaknesses</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Strengths */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">Strengths</p>
          </div>
          {strengths.length === 0 ? (
            <p className="text-xs text-slate-400">None identified</p>
          ) : (
            <ul className="space-y-1.5">
              {strengths.map((s) => (
                <li key={s.metric} className="flex items-center justify-between bg-emerald-50 rounded-lg px-3 py-1.5">
                  <span className="text-xs font-medium text-emerald-800">{s.label}</span>
                  <span className="text-xs text-emerald-600 font-semibold">{s.percentile}th %ile</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Opportunities */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Opportunities</p>
          </div>
          {opportunities.length === 0 ? (
            <p className="text-xs text-slate-400">None identified</p>
          ) : (
            <ul className="space-y-1.5">
              {opportunities.map((o) => (
                <li key={o.metric} className="flex items-center justify-between bg-amber-50 rounded-lg px-3 py-1.5">
                  <span className="text-xs font-medium text-amber-800">{o.label}</span>
                  <span className="text-xs text-amber-600 font-semibold">{o.percentile}th %ile</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Weaknesses */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <p className="text-xs font-semibold text-red-700 uppercase tracking-wide">Weaknesses</p>
          </div>
          {weaknesses.length === 0 ? (
            <p className="text-xs text-slate-400">None identified</p>
          ) : (
            <ul className="space-y-1.5">
              {weaknesses.map((w) => (
                <li key={w.metric} className="flex items-center justify-between bg-red-50 rounded-lg px-3 py-1.5">
                  <span className="text-xs font-medium text-red-800">{w.label}</span>
                  <span className="text-xs text-red-600 font-semibold">{w.percentile}th %ile</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
