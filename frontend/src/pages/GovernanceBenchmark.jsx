import { useEffect, useState } from 'react';
import { getCompanyBenchmark, getMetricRanking } from '../api';
import MetricCard from '../components/MetricCard';
import PercentileBarChart from '../components/charts/PercentileBarChart';
import DistributionBoxPlot from '../components/charts/DistributionBoxPlot';
import CompositionDonut from '../components/charts/CompositionDonut';
import NetZeroTimeline from '../components/charts/NetZeroTimeline';

const GOV_METRICS = [
  { key: 'board_women_percent', label: 'Board Women %', unit: '%', lowerIsBetter: false },
  { key: 'independent_directors_percent', label: 'Independent Directors', unit: '%', lowerIsBetter: false },
  { key: 'data_breaches', label: 'Data Breaches', unit: 'count', lowerIsBetter: true },
  { key: 'net_zero_target_year', label: 'Net Zero Target Year', unit: 'year', lowerIsBetter: true },
];

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-64">
      <svg className="animate-spin w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
      </svg>
    </div>
  );
}

export default function GovernanceBenchmark({ selectedCompany }) {
  const [benchmark, setBenchmark] = useState(null);
  const [rankings, setRankings] = useState({});
  const [activeMetric, setActiveMetric] = useState('independent_directors_percent');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setBenchmark(null);
    setError(null);
    if (!selectedCompany) return;
    setLoading(true);
    getCompanyBenchmark(selectedCompany._id)
      .then((bRes) => {
        setBenchmark(bRes.data);
      })
      .catch((e) => setError(e?.response?.data?.message || e.message || 'Failed to load data'))
      .finally(() => setLoading(false));
  }, [selectedCompany]);

  useEffect(() => {
    if (!selectedCompany || !activeMetric) return;
    getMetricRanking(activeMetric, selectedCompany.sector)
      .then((res) => setRankings((prev) => ({ ...prev, [activeMetric]: res.data })))
      .catch(console.error);
  }, [activeMetric, selectedCompany]);

  if (!selectedCompany) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
        Select a company from the header to view governance benchmarks
      </div>
    );
  }

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500 bg-red-50 rounded-lg px-4 py-3 text-sm">Error: {error}</div>
      </div>
    );
  }

  if (!benchmark) return <LoadingSpinner />;

  const { company = {}, percentiles = {}, sectorStats = {}, gapAnalysis = {} } = benchmark;

  const fmt = (v, unit) => {
    if (v == null) return '—';
    if (unit === '%') return `${Number(v).toFixed(1)}%`;
    if (unit === 'year') return String(Math.round(Number(v)));
    if (unit === 'count') return String(Math.round(Number(v)));
    if (Math.abs(v) >= 1e6) return `${(v / 1e6).toFixed(2)}M`;
    return Number(v).toFixed(2);
  };

  const nzStats = sectorStats.net_zero_target_year ?? {};
  const nzYear = company.net_zero_target_year;

  // Board independence donut
  const indPct = company.independent_directors_percent;
  const boardDonutData = (indPct != null)
    ? [
        { name: 'Independent', value: indPct },
        { name: 'Non-Independent', value: Math.max(100 - indPct, 0) },
      ]
    : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 animate-fade-in-up">
        <div className="w-8 h-8 rounded-lg bg-purple-500 flex items-center justify-center text-white font-bold text-sm">G</div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Governance Benchmark</h2>
          <p className="text-sm text-slate-500">Board diversity, independence, transparency &amp; targets</p>
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        {GOV_METRICS.map((m) => {
          const ms = sectorStats[m.key] ?? {};
          return (
            <div
              key={m.key}
              onClick={() => setActiveMetric(m.key)}
              className={`cursor-pointer transition-all ${activeMetric === m.key ? 'ring-2 ring-purple-500 rounded-xl' : ''}`}
            >
              <MetricCard
                label={m.label}
                value={company[m.key] ?? null}
                unit={m.unit}
                percentile={percentiles[m.key] ?? null}
                avgValue={ms.avg ?? null}
                leaderValue={ms.best ?? null}
                lowerIsBetter={m.lowerIsBetter}
              />
            </div>
          );
        })}
      </div>

      {/* Sector Distribution Box Plots */}
      <div className="card animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
        <p className="card-title">Sector Distribution</p>
        <p className="text-xs text-slate-400 -mt-2 mb-4">
          Box = interquartile range (P25–P75) · Line = median · Dot = company position
        </p>
        <div className="space-y-3">
          {GOV_METRICS.map((m) => {
            const ss = sectorStats[m.key];
            if (!ss) return null;
            return (
              <DistributionBoxPlot
                key={m.key}
                label={m.label}
                min={ss.min}
                max={ss.max}
                p25={ss.p25}
                p50={ss.p50}
                p75={ss.p75}
                companyValue={company[m.key]}
                lowerIsBetter={m.lowerIsBetter}
                unit={m.unit}
              />
            );
          })}
        </div>
      </div>

      {/* Ranking + Board Composition */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <div className="card h-full">
          <div className="flex flex-wrap gap-2 mb-4">
            {GOV_METRICS.map((m) => (
              <button
                key={m.key}
                onClick={() => setActiveMetric(m.key)}
                className={`text-xs px-2.5 py-1 rounded-lg transition-colors ${
                  activeMetric === m.key ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {m.label.split(' ').slice(0, 2).join(' ')}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-400 mb-3">
            {activeMetric === 'net_zero_target_year'
              ? 'Net zero target year by company · Green ≤2035 · Amber ≤2045 · Red >2045'
              : `Sector ranking — ${GOV_METRICS.find((m) => m.key === activeMetric)?.label} · Gold = selected company`}
          </p>
          {activeMetric === 'net_zero_target_year' ? (
            <NetZeroTimeline
              ranked={rankings[activeMetric]?.ranked ?? []}
              selectedId={selectedCompany._id}
            />
          ) : (
            <PercentileBarChart
              ranked={rankings[activeMetric]?.ranked ?? []}
              selectedId={selectedCompany._id}
              label={GOV_METRICS.find((m) => m.key === activeMetric)?.label}
              unit={GOV_METRICS.find((m) => m.key === activeMetric)?.unit}
            />
          )}
        </div>

        {/* Right column: Board Independence Donut + Net Zero */}
        <div className="flex flex-col gap-6 h-full">
          {boardDonutData && (
            <div className="card">
              <p className="card-title">Board Independence</p>
              <p className="text-xs text-slate-400 -mt-2 mb-3">
                Proportion of independent vs non-independent directors
              </p>
              <CompositionDonut
                data={boardDonutData}
                colors={['#8b5cf6', '#cbd5e1']}
                centerLabel={`${indPct.toFixed(1)}%`}
                centerSubLabel="Independent"
                height={220}
              />
            </div>
          )}

          {/* Net Zero Commitment Analysis */}
          <div className="card flex-1">
            <p className="card-title">Net Zero Commitment Analysis</p>
            {nzYear != null ? (
              <div className="space-y-3">
                <div
                  className={`flex items-center gap-3 p-4 rounded-xl ${
                    nzYear <= 2035 ? 'bg-emerald-50' : nzYear <= 2045 ? 'bg-amber-50' : 'bg-red-50'
                  }`}
                >
                  <div
                    className={`text-3xl font-bold ${
                      nzYear <= 2035 ? 'text-emerald-700' : nzYear <= 2045 ? 'text-amber-700' : 'text-red-700'
                    }`}
                  >
                    {Math.round(nzYear)}
                  </div>
                  <div>
                    <p
                      className={`text-sm font-semibold ${
                        nzYear <= 2035 ? 'text-emerald-800' : nzYear <= 2045 ? 'text-amber-800' : 'text-red-800'
                      }`}
                    >
                      {nzYear <= 2035
                        ? 'Ambitious — Early commitment'
                        : nzYear <= 2045
                        ? 'Moderate — Aligned with Paris'
                        : 'Late — Below sector ambition'}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {nzStats.best != null
                        ? `Sector leader targets ${Math.round(nzStats.best)}`
                        : 'Net zero target set'}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  {[
                    { label: 'Sector Earliest', value: nzStats.best, color: 'text-emerald-600' },
                    { label: 'Sector Average', value: nzStats.avg, color: 'text-slate-600' },
                    { label: 'Your Target', value: nzYear, color: 'text-blue-600' },
                  ].map((s) => (
                    <div key={s.label} className="bg-slate-50 rounded-lg p-2">
                      <p className="text-xs text-slate-400">{s.label}</p>
                      <p className={`text-lg font-bold ${s.color}`}>
                        {s.value != null ? Math.round(s.value) : '—'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-32 gap-2">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-sm text-slate-500 font-medium">No net zero target set</p>
                <p className="text-xs text-slate-400 text-center max-w-[200px]">
                  {nzStats.count ?? 0} of {benchmark.peerCount ?? 0} sector peers have committed to a target year
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Gap table */}
      <div className="card animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
        <p className="card-title">Governance Gap to Sector Leader</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500">Metric</th>
                <th className="text-right py-2 px-3 text-xs font-semibold text-slate-500">Your Value</th>
                <th className="text-right py-2 px-3 text-xs font-semibold text-slate-500">Sector Avg</th>
                <th className="text-right py-2 px-3 text-xs font-semibold text-slate-500">Sector Best</th>
                <th className="text-right py-2 px-3 text-xs font-semibold text-slate-500">Percentile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {GOV_METRICS.map((m) => {
                const gap = gapAnalysis[m.key];
                const pct = percentiles[m.key];
                if (!gap) return null;
                return (
                  <tr key={m.key} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-medium text-slate-700">{m.label}</td>
                    <td className="py-2 px-3 text-right text-slate-600">{fmt(gap.companyValue, m.unit)}</td>
                    <td className="py-2 px-3 text-right text-slate-500">{fmt(gap.avgValue, m.unit)}</td>
                    <td className="py-2 px-3 text-right text-emerald-600 font-semibold">{fmt(gap.leaderValue, m.unit)}</td>
                    <td className="py-2 px-3 text-right">
                      <span
                        className={`font-semibold ${
                          pct >= 75
                            ? 'text-emerald-600'
                            : pct >= 50
                            ? 'text-blue-600'
                            : pct >= 25
                            ? 'text-amber-600'
                            : 'text-red-600'
                        }`}
                      >
                        {pct != null ? `${pct}th` : '—'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
