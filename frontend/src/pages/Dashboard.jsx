import { useEffect, useState } from 'react';
import { getCompanyBenchmark, getHeatmapData } from '../api';
import ESGRadarChart from '../components/charts/ESGRadarChart';
import GapWaterfallChart from '../components/charts/GapWaterfallChart';
import PeerHeatmap from '../components/charts/PeerHeatmap';
import PillarDonutChart from '../components/charts/PillarDonutChart';
import MetricTreemap from '../components/charts/MetricTreemap';
import InsightCard from '../components/InsightCard';
import {
  BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

const METRICS_CONFIG = {
  scope_1: { label: 'Scope 1 Emissions' },
  scope_2: { label: 'Scope 2 Emissions' },
  emissions_intensity: { label: 'Emissions Intensity' },
  renewable_energy_pct: { label: 'Renewable Energy %' },
  water_consumption: { label: 'Water Consumption' },
  total_waste: { label: 'Total Waste' },
  gender_diversity_pct: { label: 'Gender Diversity' },
  board_women_percent: { label: 'Board Women %' },
  ltifr: { label: 'LTIFR' },
  employee_turnover_rate: { label: 'Employee Turnover' },
  pay_equity_ratio: { label: 'Pay Equity Ratio' },
  independent_directors_percent: { label: 'Independent Directors' },
  data_breaches: { label: 'Data Breaches' },
  net_zero_target_year: { label: 'Net Zero Target Year' },
};

const PILLAR_COLORS = { Environmental: '#059669', Social: '#3b82f6', Governance: '#8b5cf6' };

export default function Dashboard({ selectedCompany }) {
  const [benchmark, setBenchmark] = useState(null);
  const [heatmap, setHeatmap] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setBenchmark(null);
    setHeatmap(null);
    setError(null);
    if (!selectedCompany) return;
    setLoading(true);
    Promise.all([
      getCompanyBenchmark(selectedCompany._id),
      getHeatmapData(selectedCompany.sector),
    ])
      .then(([bRes, hRes]) => {
        setBenchmark(bRes.data);
        setHeatmap(hRes.data);
      })
      .catch((e) => setError(e?.response?.data?.message || e.message || 'Failed to load data'))
      .finally(() => setLoading(false));
  }, [selectedCompany]);

  if (!selectedCompany) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-700">Select a company to begin</h2>
          <p className="text-sm text-slate-400 mt-1">Use the button in the top-right to choose a company for benchmarking</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex items-center gap-3 text-slate-500">
          <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          Loading benchmark data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-500 bg-red-50 rounded-lg px-4 py-3 text-sm">Error: {error}</div>
      </div>
    );
  }

  if (!benchmark) return null;

  const { pillarScores, radarData, percentiles, normalizedScores, strengths, weaknesses, opportunities, peerCount } = benchmark;

  // Pillar breakdown bar data
  const pillarBarData = [
    { name: 'E', value: pillarScores.environmental ?? 0 },
    { name: 'S', value: pillarScores.social ?? 0 },
    { name: 'G', value: pillarScores.governance ?? 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="animate-fade-in-up bg-gradient-to-r from-blue-50 to-slate-50 -mx-6 -mt-6 px-6 pt-6 pb-5 rounded-b-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800">{selectedCompany.company_name}</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Benchmarked against {peerCount} peers in {selectedCompany.sector}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Compact pillar breakdown */}
            <div className="hidden md:block w-36">
              <ResponsiveContainer width="100%" height={28}>
                <BarChart data={pillarBarData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <XAxis type="number" domain={[0, 100]} hide />
                  <Bar dataKey="value" radius={[3, 3, 3, 3]} maxBarSize={8}>
                    {pillarBarData.map((d) => (
                      <Cell key={d.name} fill={PILLAR_COLORS[d.name === 'E' ? 'Environmental' : d.name === 'S' ? 'Social' : 'Governance']} />
                    ))}
                  </Bar>
                  <Tooltip
                    content={({ payload }) => {
                      if (!payload?.[0]) return null;
                      const d = payload[0].payload;
                      const labels = { E: 'Environmental', S: 'Social', G: 'Governance' };
                      return (
                        <div className="bg-white shadow-lg rounded px-2 py-1 border border-slate-100 text-xs">
                          {labels[d.name]}: <strong>{d.value}/100</strong>
                        </div>
                      );
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-4 py-2">
              <span className="text-xs text-slate-500">Overall ESG Score</span>
              <span className={`text-2xl font-bold ${pillarScores.overall >= 60 ? 'text-emerald-600' : pillarScores.overall >= 40 ? 'text-amber-600' : 'text-red-600'}`}>
                {pillarScores.overall ?? '—'}
              </span>
              <span className="text-xs text-slate-400">/100</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pillar scores — ring gauges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        {[
          { label: 'Environmental', score: pillarScores.environmental, color: 'bg-emerald-500', icon: 'E' },
          { label: 'Social', score: pillarScores.social, color: 'bg-blue-500', icon: 'S' },
          { label: 'Governance', score: pillarScores.governance, color: 'bg-purple-500', icon: 'G' },
        ].map((p) => (
          <div key={p.label} className="card flex flex-col items-center py-6">
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-6 h-6 rounded-md ${p.color} flex items-center justify-center text-white text-xs font-bold`}>
                {p.icon}
              </div>
              <p className="text-sm font-semibold text-slate-700">{p.label}</p>
            </div>
            <div className="relative">
              <PillarDonutChart score={p.score} label="/ 100" size={130} strokeWidth={10} />
            </div>
          </div>
        ))}
      </div>

      {/* Performance Overview Treemap */}
      <div className="card animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
        <p className="card-title">Performance Overview</p>
        <p className="text-xs text-slate-400 -mt-2 mb-3">
          Rectangle size reflects normalized score (0–100). Larger green blocks = stronger performance.
        </p>
        <MetricTreemap normalizedScores={normalizedScores} metricsConfig={METRICS_CONFIG} />
      </div>

      {/* Radar + Gap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <div className="card">
          <p className="card-title">ESG Multi-Dimensional Radar</p>
          <p className="text-xs text-slate-400 -mt-2 mb-3">Normalized 0–100 scores across 8 key dimensions</p>
          <ESGRadarChart data={radarData} />
        </div>

        <div className="card">
          <p className="card-title">Gap vs Sector Average</p>
          <p className="text-xs text-slate-400 -mt-2 mb-3">
            Positive = above average · Negative = below average (percentile points)
          </p>
          <GapWaterfallChart percentiles={percentiles} metricsConfig={METRICS_CONFIG} />
        </div>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
        <InsightCard strengths={strengths} weaknesses={weaknesses} opportunities={opportunities} />
      </div>

      {/* Peer Heatmap */}
      <div className="card animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
        <p className="card-title">Peer Comparison Heatmap</p>
        <p className="text-xs text-slate-400 -mt-2 mb-4">
          All companies in sector · Cells show normalized score (0–100) · ★ = selected company
        </p>
        <PeerHeatmap data={heatmap?.data ?? []} selectedId={selectedCompany._id} />
      </div>
    </div>
  );
}
