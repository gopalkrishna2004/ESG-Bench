import { useEffect, useState } from 'react';
import { getCompanyBenchmark, getMetricRanking } from '../api';
import MetricCard from '../components/MetricCard';
import PercentileBarChart from '../components/charts/PercentileBarChart';
import DistributionBoxPlot from '../components/charts/DistributionBoxPlot';

const ENV_METRICS = [
  { key: 'scope_1', label: 'Scope 1 Emissions', unit: 'tCO₂e', lowerIsBetter: true },
  { key: 'scope_2', label: 'Scope 2 Emissions', unit: 'tCO₂e', lowerIsBetter: true },
  { key: 'emissions_intensity', label: 'Emissions Intensity', unit: 'tCO₂e/unit', lowerIsBetter: true },
  { key: 'renewable_energy_pct', label: 'Renewable Energy %', unit: '%', lowerIsBetter: false },
  { key: 'water_consumption', label: 'Water Consumption', unit: 'KL', lowerIsBetter: true },
  { key: 'total_waste', label: 'Total Waste', unit: 'MT', lowerIsBetter: true },
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

export default function EnvironmentalBenchmark({ selectedCompany }) {
  const [benchmark, setBenchmark] = useState(null);
  const [rankings, setRankings] = useState({});
  const [activeMetric, setActiveMetric] = useState('emissions_intensity');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setBenchmark(null);
    setError(null);
    if (!selectedCompany) return;
    setLoading(true);
    getCompanyBenchmark(selectedCompany._id)
      .then((res) => setBenchmark(res.data))
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
        Select a company from the header to view environmental benchmarks
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
    if (Math.abs(v) >= 1e6) return `${(v / 1e6).toFixed(2)}M`;
    if (Math.abs(v) >= 1e3) return `${(v / 1e3).toFixed(1)}K`;
    return Number(v).toFixed(2);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 animate-fade-in-up">
        <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-bold text-sm">E</div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Environmental Benchmark</h2>
          <p className="text-sm text-slate-500">Scope emissions, energy, water &amp; waste performance</p>
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        {ENV_METRICS.map((m) => {
          const ms = sectorStats[m.key] ?? {};
          return (
            <div
              key={m.key}
              onClick={() => setActiveMetric(m.key)}
              className={`cursor-pointer transition-all ${activeMetric === m.key ? 'ring-2 ring-blue-500 rounded-xl' : ''}`}
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
          {ENV_METRICS.map((m) => {
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

      {/* Sector ranking chart */}
      <div className="card animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
        <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
          <p className="card-title mb-0">
            Sector Ranking — {ENV_METRICS.find((m) => m.key === activeMetric)?.label}
          </p>
          <div className="flex flex-wrap gap-2">
            {ENV_METRICS.map((m) => (
              <button
                key={m.key}
                onClick={() => setActiveMetric(m.key)}
                className={`text-xs px-2.5 py-1 rounded-lg transition-colors ${
                  activeMetric === m.key
                    ? 'bg-brand-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {m.label.split(' ').slice(0, 2).join(' ')}
              </button>
            ))}
          </div>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Click a card or button to switch metric · Gold bar = selected company
        </p>
        <PercentileBarChart
          ranked={rankings[activeMetric]?.ranked ?? []}
          selectedId={selectedCompany._id}
          label={ENV_METRICS.find((m) => m.key === activeMetric)?.label}
          unit={ENV_METRICS.find((m) => m.key === activeMetric)?.unit}
        />
      </div>

      {/* Gap analysis table */}
      <div className="card animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
        <p className="card-title">Gap to Sector Leader</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500">Metric</th>
                <th className="text-right py-2 px-3 text-xs font-semibold text-slate-500">Your Value</th>
                <th className="text-right py-2 px-3 text-xs font-semibold text-slate-500">Sector Avg</th>
                <th className="text-right py-2 px-3 text-xs font-semibold text-slate-500">Sector Best</th>
                <th className="text-right py-2 px-3 text-xs font-semibold text-slate-500">Gap to Best</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500">Leader</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {ENV_METRICS.map((m) => {
                const gap = gapAnalysis[m.key];
                if (!gap) return null;
                const isGood = gap.gapToLeader != null && gap.gapToLeader <= 0;
                return (
                  <tr key={m.key} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-medium text-slate-700">{m.label}</td>
                    <td className="py-2 px-3 text-right text-slate-600">{fmt(gap.companyValue, m.unit)}</td>
                    <td className="py-2 px-3 text-right text-slate-500">{fmt(gap.avgValue, m.unit)}</td>
                    <td className="py-2 px-3 text-right text-emerald-600 font-semibold">{fmt(gap.leaderValue, m.unit)}</td>
                    <td className="py-2 px-3 text-right">
                      <span className={`font-semibold ${isGood ? 'text-emerald-600' : 'text-red-600'}`}>
                        {isGood ? '✓ Leader' : fmt(gap.gapToLeader, m.unit)}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-slate-500 text-xs truncate max-w-[150px]">
                      {gap.leaderName ?? '—'}
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
