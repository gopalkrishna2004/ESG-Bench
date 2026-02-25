import { useEffect, useState } from 'react';
import { getCompanyBenchmark, getMetricRanking } from '../api';
import MetricCard from '../components/MetricCard';
import PercentileBarChart from '../components/charts/PercentileBarChart';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

const SOCIAL_METRICS = [
  { key: 'gender_diversity_pct', label: 'Gender Diversity', unit: '%', lowerIsBetter: false },
  { key: 'board_women_percent', label: 'Board Women %', unit: '%', lowerIsBetter: false },
  { key: 'ltifr', label: 'LTIFR', unit: 'rate', lowerIsBetter: true },
  { key: 'employee_turnover_rate', label: 'Employee Turnover', unit: '%', lowerIsBetter: true },
  { key: 'pay_equity_ratio', label: 'Pay Equity Ratio', unit: 'ratio', lowerIsBetter: false },
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

export default function SocialBenchmark({ selectedCompany }) {
  const [benchmark, setBenchmark] = useState(null);
  const [rankings, setRankings] = useState({});
  const [activeMetric, setActiveMetric] = useState('gender_diversity_pct');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setBenchmark(null);
    setError(null);
    if (!selectedCompany) return;
    setLoading(true);
    getCompanyBenchmark(selectedCompany._id)
      .then((res) => setBenchmark(res.data))
      .catch((e) => setError(e?.response?.data?.message || e.message || 'Failed to load benchmark data'))
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
        Select a company from the header to view social benchmarks
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
    if (unit === 'ratio') return Number(v).toFixed(2);
    if (unit === 'rate') return Number(v).toFixed(3);
    if (Math.abs(v) >= 1e6) return `${(v / 1e6).toFixed(2)}M`;
    if (Math.abs(v) >= 1e3) return `${(v / 1e3).toFixed(1)}K`;
    return Number(v).toFixed(2);
  };

  // Build pay equity bar chart data — only include rows with at least one valid value
  const payEquityData = [];
  if (company.median_remuneration_female != null || company.median_remuneration_male != null) {
    payEquityData.push({
      name: (selectedCompany.company_name || '').split(' ').slice(0, 2).join(' '),
      Female: company.median_remuneration_female ?? 0,
      Male: company.median_remuneration_male ?? 0,
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white font-bold text-sm">S</div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Social Benchmark</h2>
          <p className="text-sm text-slate-500">Diversity, safety, turnover &amp; pay equity</p>
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {SOCIAL_METRICS.map((m) => {
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

      {/* Sector ranking chart */}
      <div className="card">
        <div className="flex items-center justify-between mb-1">
          <p className="card-title mb-0">
            Sector Ranking — {SOCIAL_METRICS.find((m) => m.key === activeMetric)?.label}
          </p>
          <div className="flex flex-wrap gap-2">
            {SOCIAL_METRICS.map((m) => (
              <button
                key={m.key}
                onClick={() => setActiveMetric(m.key)}
                className={`text-xs px-2.5 py-1 rounded-lg transition-colors ${
                  activeMetric === m.key ? 'bg-brand-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {m.label.split(' ').slice(0, 2).join(' ')}
              </button>
            ))}
          </div>
        </div>
        <p className="text-xs text-slate-400 mb-4">Gold bar = selected company</p>
        <PercentileBarChart
          ranked={rankings[activeMetric]?.ranked ?? []}
          selectedId={selectedCompany._id}
          label={SOCIAL_METRICS.find((m) => m.key === activeMetric)?.label}
          unit={SOCIAL_METRICS.find((m) => m.key === activeMetric)?.unit}
        />
      </div>

      {/* Pay Equity Grouped Bar */}
      {payEquityData.length > 0 && (
        <div className="card">
          <p className="card-title">Pay Equity: Female vs Male Median Remuneration</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={payEquityData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} />
              <YAxis
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => {
                  if (v == null || isNaN(v)) return '0';
                  if (Math.abs(v) >= 1e6) return `₹${(v / 1e6).toFixed(1)}M`;
                  if (Math.abs(v) >= 1e3) return `₹${(v / 1e3).toFixed(0)}K`;
                  return `₹${v}`;
                }}
              />
              <Tooltip
                formatter={(v) => {
                  if (v == null || isNaN(v)) return '—';
                  if (Math.abs(v) >= 1e6) return `₹${(v / 1e6).toFixed(2)}M`;
                  if (Math.abs(v) >= 1e3) return `₹${(v / 1e3).toFixed(1)}K`;
                  return `₹${v}`;
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="Female" fill="#8b5cf6" radius={[3, 3, 0, 0]} maxBarSize={50} />
              <Bar dataKey="Male" fill="#3b82f6" radius={[3, 3, 0, 0]} maxBarSize={50} />
            </BarChart>
          </ResponsiveContainer>
          {company.pay_equity_ratio != null && (
            <div
              className={`mt-3 flex items-center gap-2 text-sm p-3 rounded-lg ${
                company.pay_equity_ratio >= 0.9 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
              }`}
            >
              <span className="font-semibold">Pay equity ratio: {Number(company.pay_equity_ratio).toFixed(2)}</span>
              <span className="text-xs">
                ({company.pay_equity_ratio >= 0.9
                  ? 'Good — within 10% of parity'
                  : 'Gap identified — female compensation lags'})
              </span>
            </div>
          )}
        </div>
      )}

      {/* Gap table */}
      <div className="card">
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
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {SOCIAL_METRICS.map((m) => {
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
