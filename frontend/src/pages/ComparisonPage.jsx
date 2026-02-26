import { useEffect, useState } from 'react';
import { getPeerComparison } from '../api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine, Cell,
} from 'recharts';

// ─── Helpers ────────────────────────────────────────────────────────────────

function scoreColor(score) {
  if (score == null) return { bg: '#f1f5f9', fg: '#94a3b8', label: 'N/A' };
  if (score >= 70)   return { bg: '#059669', fg: '#ffffff', label: 'Strong' };
  if (score >= 50)   return { bg: '#f59e0b', fg: '#78350f', label: 'Average' };
  return               { bg: '#ef4444', fg: '#ffffff', label: 'Weak' };
}

function getRank(companies, selectedName, key) {
  const sorted = [...companies]
    .filter((c) => c[key] != null)
    .sort((a, b) => b[key] - a[key]);
  const idx = sorted.findIndex((c) => c.company_name === selectedName);
  return idx === -1 ? null : idx + 1;
}

// ─── Top Score Card ───────────────────────────────────────────────────────────

function ScoreCard({ label, score, rank, total, icon }) {
  const { bg, fg, label: tier } = scoreColor(score);
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</span>
        <span className="text-lg">{icon}</span>
      </div>
      <div className="flex items-end gap-2">
        <span
          className="text-3xl font-bold"
          style={{ color: bg }}
        >
          {score != null ? score.toFixed(1) : '—'}
        </span>
        <span className="text-sm text-slate-400 mb-1">/100</span>
      </div>
      <div className="flex items-center justify-between">
        <span
          className="text-xs px-2 py-0.5 rounded font-semibold"
          style={{ backgroundColor: bg, color: fg }}
        >
          {tier}
        </span>
        {rank && (
          <span className="text-xs text-slate-400">
            Rank: #{rank}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Peer Bar Chart ───────────────────────────────────────────────────────────

function PeerBarChart({ companies, selectedName, scoreKey, label }) {
  const sorted = [...companies]
    .filter((c) => c[scoreKey] != null)
    .sort((a, b) => b[scoreKey] - a[scoreKey]);

  const data = sorted.map((c) => ({
    name: c.company_name.split(' ').slice(0, 2).join(' '),
    score: c[scoreKey],
    isSelected: c.company_name === selectedName,
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 10, fill: '#94a3b8' }}
          tickLine={false}
          angle={-40}
          textAnchor="end"
          interval={0}
        />
        <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
        <Tooltip
          formatter={(v) => [`${v}/100`, label]}
          contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e2e8f0' }}
        />
        <ReferenceLine y={50} stroke="#cbd5e1" strokeDasharray="4 3" />
        <Bar dataKey="score" radius={[3, 3, 0, 0]} maxBarSize={28}>
          {data.map((entry, idx) => (
            <Cell
              key={idx}
              fill={entry.isSelected ? '#3b82f6' : '#94a3b8'}
              opacity={entry.isSelected ? 1 : 0.5}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── Peer Comparison Table ────────────────────────────────────────────────────

const COLS = [
  { key: 'esg_score',         label: 'ESG Score' },
  { key: 'environment_score', label: 'Environmental' },
  { key: 'social_score',      label: 'Social' },
  { key: 'governance_score',  label: 'Governance' },
];

function PeerTable({ companies, selectedName }) {
  const sorted = [...companies].sort((a, b) => (b.esg_score ?? 0) - (a.esg_score ?? 0));

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="text-left px-3 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide w-8">#</th>
            <th className="text-left px-3 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide min-w-[200px]">Company</th>
            {COLS.map((c) => (
              <th key={c.key} className="text-center px-3 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide min-w-[100px]">
                {c.label}
              </th>
            ))}
            <th className="text-left px-3 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Report Date
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((company, idx) => {
            const isSelected = company.company_name === selectedName;
            return (
              <tr
                key={company._id}
                className={`border-b border-slate-100 transition-colors ${
                  isSelected ? 'bg-blue-50 border-blue-200' : 'hover:bg-slate-50'
                }`}
              >
                <td className="px-3 py-3 text-xs text-slate-400 font-medium">{idx + 1}</td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2">
                    {isSelected && (
                      <span className="text-blue-500 text-sm">★</span>
                    )}
                    <div>
                      <p className={`text-sm font-semibold ${isSelected ? 'text-blue-700' : 'text-slate-700'}`}>
                        {company.company_name}
                      </p>
                    </div>
                  </div>
                </td>
                {COLS.map((col) => {
                  const val = company[col.key];
                  const { bg, fg } = scoreColor(val);
                  return (
                    <td key={col.key} className="px-3 py-3 text-center">
                      <span
                        className="inline-block px-2.5 py-1 rounded text-xs font-semibold min-w-[44px]"
                        style={{ backgroundColor: bg, color: fg }}
                      >
                        {val != null ? val.toFixed(1) : '—'}
                      </span>
                    </td>
                  );
                })}
                <td className="px-3 py-3 text-xs text-slate-400">
                  {company.latest_report_date || '—'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ComparisonPage({ selectedCompany }) {
  const [allCompanies, setAllCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    getPeerComparison()
      .then((res) => setAllCompanies(res.data.companies))
      .catch((e) => setError(e?.response?.data?.message || e.message || 'Failed to load data'))
      .finally(() => setLoading(false));
  }, []);

  // Find the selected company's data from esg_reports
  const selected = selectedCompany
    ? allCompanies.find((c) => c.company_name === selectedCompany.company_name)
    : null;

  const total = allCompanies.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 gap-3 text-slate-500">
        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
        Loading peer data...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-red-500 bg-red-50 rounded-lg px-4 py-3 text-sm">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Peer Comparison</h2>
            <p className="text-sm text-slate-500">
              {selected
                ? `${selected.company_name} vs ${total - 1} oil & gas peers`
                : `${total} oil & gas companies · Select a company to highlight`}
            </p>
          </div>
        </div>
        {!selectedCompany && (
          <div className="text-xs bg-amber-50 border border-amber-200 text-amber-700 px-3 py-2 rounded-lg">
            Select a company from the header to see your peer ranking
          </div>
        )}
      </div>

      {/* Score Summary Cards — only when a company is selected */}
      {selected && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <ScoreCard
            label="ESG Score"
            score={selected.esg_score}
            rank={getRank(allCompanies, selected.company_name, 'esg_score')}
            total={total}
            icon="🌱"
          />
          <ScoreCard
            label="Environmental"
            score={selected.environment_score}
            rank={getRank(allCompanies, selected.company_name, 'environment_score')}
            total={total}
            icon="🌍"
          />
          <ScoreCard
            label="Social"
            score={selected.social_score}
            rank={getRank(allCompanies, selected.company_name, 'social_score')}
            total={total}
            icon="👥"
          />
          <ScoreCard
            label="Governance"
            score={selected.governance_score}
            rank={getRank(allCompanies, selected.company_name, 'governance_score')}
            total={total}
            icon="🏛️"
          />
        </div>
      )}

      {/* Peer Bar Charts */}
      {selected && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700 mb-1">Peer Score Distribution</h3>
          <p className="text-xs text-slate-400 mb-5">
            <span className="inline-block w-3 h-3 rounded bg-blue-500 mr-1 align-middle" />
            {selected.company_name} highlighted in blue · sorted by score
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {COLS.map((col) => (
              <div key={col.key}>
                <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">{col.label}</p>
                <PeerBarChart
                  companies={allCompanies}
                  selectedName={selected.company_name}
                  scoreKey={col.key}
                  label={col.label}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Peer Comparison Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-700">
            Peer ESG Rating Comparison
            {selected && <span className="ml-2 text-blue-600">★ = {selected.company_name}</span>}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Sorted by Overall ESG Score · Source: sesesg.com · {total} companies
          </p>
        </div>
        <PeerTable
          companies={allCompanies}
          selectedName={selected?.company_name}
        />

        {/* Legend */}
        <div className="px-5 py-3 border-t border-slate-100 flex items-center gap-4 flex-wrap">
          <span className="text-xs text-slate-400">Score range:</span>
          {[
            { label: '≥70 Strong',     bg: '#059669', fg: '#fff' },
            { label: '50–69 Average',  bg: '#f59e0b', fg: '#78350f' },
            { label: '<50 Weak',       bg: '#ef4444', fg: '#fff' },
          ].map((l) => (
            <span key={l.label} className="text-xs px-2 py-0.5 rounded font-medium" style={{ backgroundColor: l.bg, color: l.fg }}>
              {l.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
