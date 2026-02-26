import { useEffect, useState } from 'react';
import { getPeerComparison } from '../api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ScatterChart, Scatter, ZAxis, LabelList,
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

function avg(arr) {
  const valid = arr.filter((v) => v != null);
  if (!valid.length) return null;
  return valid.reduce((s, v) => s + v, 0) / valid.length;
}

const COLS = [
  { key: 'esg_score',         label: 'ESG Score',    short: 'ESG' },
  { key: 'environment_score', label: 'Environmental', short: 'Env' },
  { key: 'social_score',      label: 'Social',        short: 'Social' },
  { key: 'governance_score',  label: 'Governance',    short: 'Gov' },
];

// ─── Score Card ───────────────────────────────────────────────────────────────

function ScoreCard({ label, score, rank, total, icon }) {
  const { bg, fg, label: tier } = scoreColor(score);
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</span>
        <span className="text-lg">{icon}</span>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-3xl font-bold" style={{ color: bg }}>
          {score != null ? score.toFixed(1) : '—'}
        </span>
        <span className="text-sm text-slate-400 mb-1">/100</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs px-2 py-0.5 rounded font-semibold" style={{ backgroundColor: bg, color: fg }}>
          {tier}
        </span>
        {rank && <span className="text-xs text-slate-400">Rank: #{rank}</span>}
      </div>
    </div>
  );
}

// ─── 1. Peer Bar Chart (existing) ─────────────────────────────────────────────

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
        <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} angle={-40} textAnchor="end" interval={0} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
        <Tooltip formatter={(v) => [`${v}/100`, label]} contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e2e8f0' }} />
        <ReferenceLine y={50} stroke="#cbd5e1" strokeDasharray="4 3" />
        <Bar dataKey="score" radius={[3, 3, 0, 0]} maxBarSize={28}>
          {data.map((entry, idx) => (
            <Cell key={idx} fill={entry.isSelected ? '#3b82f6' : '#94a3b8'} opacity={entry.isSelected ? 1 : 0.5} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── 2. Radar Chart — Company vs Sector Avg vs Best ──────────────────────────

function ESGRadarChart({ companies, selected }) {
  const radarData = COLS.map(({ key, short }) => {
    const sectorAvg = avg(companies.map((c) => c[key]));
    const best = Math.max(...companies.map((c) => c[key] ?? 0));
    return {
      pillar: short,
      Company: selected[key] ?? 0,
      'Sector Avg': sectorAvg != null ? parseFloat(sectorAvg.toFixed(1)) : 0,
      'Sector Best': best,
    };
  });

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-xs">
        <p className="font-semibold text-slate-700 mb-1">{label}</p>
        {payload.map((p) => (
          <p key={p.name} style={{ color: p.color }}>
            {p.name}: <span className="font-semibold">{p.value}</span>/100
          </p>
        ))}
      </div>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={320}>
      <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
        <PolarGrid stroke="#e2e8f0" />
        <PolarAngleAxis dataKey="pillar" tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }} />
        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9, fill: '#94a3b8' }} tickCount={5} axisLine={false} />
        <Radar name="Sector Best" dataKey="Sector Best" stroke="#10b981" fill="#10b981" fillOpacity={0.08} strokeWidth={1.5} strokeDasharray="4 3" />
        <Radar name="Sector Avg"  dataKey="Sector Avg"  stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.12} strokeWidth={1.5} strokeDasharray="4 3" />
        <Radar name="Company"     dataKey="Company"     stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.25} strokeWidth={2.5} />
        <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
        <Tooltip content={<CustomTooltip />} />
      </RadarChart>
    </ResponsiveContainer>
  );
}

// ─── 3. Gap to Sector Leader — Horizontal Bars ───────────────────────────────

function GapToLeaderChart({ companies, selected }) {
  const data = COLS.map(({ key, label }) => {
    const best = Math.max(...companies.map((c) => c[key] ?? 0));
    const leaderCompany = companies.find((c) => c[key] === best);
    const gap = parseFloat((best - (selected[key] ?? 0)).toFixed(1));
    return { metric: label, gap, leader: leaderCompany?.company_name.split(' ').slice(0, 2).join(' ') || '' };
  });

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-xs">
        <p className="font-semibold text-slate-700">{d.metric}</p>
        <p className="text-slate-500">Gap to leader: <span className="font-semibold text-red-500">−{d.gap} pts</span></p>
        <p className="text-slate-400">Leader: {d.leader}</p>
      </div>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 50, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
        <XAxis type="number" domain={[0, 50]} tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} tickFormatter={(v) => `-${v}`} />
        <YAxis type="category" dataKey="metric" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} width={90} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="gap" radius={[0, 4, 4, 0]} maxBarSize={22}>
          {data.map((entry, idx) => (
            <Cell key={idx} fill={entry.gap === 0 ? '#059669' : entry.gap < 10 ? '#f59e0b' : '#ef4444'} />
          ))}
          <LabelList dataKey="gap" position="right" formatter={(v) => (v === 0 ? '✓ Leader' : `-${v}`)} style={{ fontSize: 10, fill: '#64748b' }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── 4. Scatter Plot — Environmental vs Social ───────────────────────────────

function EnvSocialScatter({ companies, selectedName }) {
  const peers = companies
    .filter((c) => c.company_name !== selectedName && c.environment_score != null && c.social_score != null)
    .map((c) => ({ x: c.environment_score, y: c.social_score, name: c.company_name }));

  const sel = companies.find((c) => c.company_name === selectedName);
  const selData = sel && sel.environment_score != null && sel.social_score != null
    ? [{ x: sel.environment_score, y: sel.social_score, name: sel.company_name }]
    : [];

  const CustomDot = (props) => {
    const { cx, cy, payload } = props;
    const isSelected = payload.name === selectedName;
    return (
      <g>
        <circle cx={cx} cy={cy} r={isSelected ? 10 : 6} fill={isSelected ? '#3b82f6' : '#94a3b8'} opacity={isSelected ? 1 : 0.6} />
        {isSelected && <circle cx={cx} cy={cy} r={14} fill="none" stroke="#3b82f6" strokeWidth={1.5} opacity={0.4} />}
      </g>
    );
  };

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-xs">
        <p className="font-semibold text-slate-700 mb-1">{d.name}</p>
        <p className="text-emerald-600">Environmental: <span className="font-semibold">{d.x}</span>/100</p>
        <p className="text-blue-600">Social: <span className="font-semibold">{d.y}</span>/100</p>
      </div>
    );
  };

  const allData = [...peers, ...selData];

  return (
    <ResponsiveContainer width="100%" height={320}>
      <ScatterChart margin={{ top: 10, right: 20, bottom: 30, left: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis
          type="number" dataKey="x" name="Environmental" domain={[30, 100]}
          tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false}
          label={{ value: 'Environmental Score', position: 'insideBottom', offset: -15, fontSize: 11, fill: '#94a3b8' }}
        />
        <YAxis
          type="number" dataKey="y" name="Social" domain={[30, 100]}
          tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false}
          label={{ value: 'Social Score', angle: -90, position: 'insideLeft', offset: 10, fontSize: 11, fill: '#94a3b8' }}
        />
        <ZAxis range={[60, 60]} />
        <ReferenceLine x={avg(companies.map((c) => c.environment_score))} stroke="#cbd5e1" strokeDasharray="4 3" label={{ value: 'E avg', fontSize: 9, fill: '#94a3b8' }} />
        <ReferenceLine y={avg(companies.map((c) => c.social_score))} stroke="#cbd5e1" strokeDasharray="4 3" label={{ value: 'S avg', fontSize: 9, fill: '#94a3b8' }} />
        <Tooltip content={<CustomTooltip />} />
        <Scatter data={allData} shape={<CustomDot selectedName={selectedName} />} />
      </ScatterChart>
    </ResponsiveContainer>
  );
}

// ─── 5. Pillar Breakdown Stacked Comparison ──────────────────────────────────

function PillarStackedChart({ companies, selectedName }) {
  const top8 = [...companies]
    .filter((c) => c.esg_score != null)
    .sort((a, b) => b.esg_score - a.esg_score)
    .slice(0, 8);

  const data = top8.map((c) => ({
    name: c.company_name.split(' ').slice(0, 2).join(' '),
    Environmental: c.environment_score ?? 0,
    Social: c.social_score ?? 0,
    Governance: c.governance_score ?? 0,
    isSelected: c.company_name === selectedName,
  }));

  const renderCustomTick = (props) => {
    const { x, y, payload } = props;
    const item = data.find((d) => d.name === payload.value);
    return (
      <text x={x} y={y} dy={4} textAnchor="end" fontSize={10}
        fill={item?.isSelected ? '#3b82f6' : '#94a3b8'}
        fontWeight={item?.isSelected ? 700 : 400}>
        {item?.isSelected ? `★ ${payload.value}` : payload.value}
      </text>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 80, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
        <XAxis type="number" domain={[0, 240]} tick={{ fontSize: 9, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
        <YAxis type="category" dataKey="name" tick={renderCustomTick} tickLine={false} axisLine={false} />
        <Tooltip
          formatter={(v, name) => [`${v}/100`, name]}
          contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e2e8f0' }}
        />
        <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
        <Bar dataKey="Environmental" stackId="a" fill="#10b981" maxBarSize={18} />
        <Bar dataKey="Social"        stackId="a" fill="#3b82f6" maxBarSize={18} />
        <Bar dataKey="Governance"    stackId="a" fill="#8b5cf6" maxBarSize={18} radius={[0, 3, 3, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── Peer Comparison Table ────────────────────────────────────────────────────

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
            <th className="text-left px-3 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Report Date</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((company, idx) => {
            const isSelected = company.company_name === selectedName;
            return (
              <tr key={company._id} className={`border-b border-slate-100 transition-colors ${isSelected ? 'bg-blue-50 border-blue-200' : 'hover:bg-slate-50'}`}>
                <td className="px-3 py-3 text-xs text-slate-400 font-medium">{idx + 1}</td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2">
                    {isSelected && <span className="text-blue-500 text-sm">★</span>}
                    <p className={`text-sm font-semibold ${isSelected ? 'text-blue-700' : 'text-slate-700'}`}>
                      {company.company_name}
                    </p>
                  </div>
                </td>
                {COLS.map((col) => {
                  const val = company[col.key];
                  const { bg, fg } = scoreColor(val);
                  return (
                    <td key={col.key} className="px-3 py-3 text-center">
                      <span className="inline-block px-2.5 py-1 rounded text-xs font-semibold min-w-[44px]" style={{ backgroundColor: bg, color: fg }}>
                        {val != null ? val.toFixed(1) : '—'}
                      </span>
                    </td>
                  );
                })}
                <td className="px-3 py-3 text-xs text-slate-400">{company.latest_report_date || '—'}</td>
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

      {/* ── Score Summary Cards ── */}
      {selected && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <ScoreCard label="ESG Score"    score={selected.esg_score}         rank={getRank(allCompanies, selected.company_name, 'esg_score')}         total={total} icon="🌱" />
          <ScoreCard label="Environmental" score={selected.environment_score} rank={getRank(allCompanies, selected.company_name, 'environment_score')} total={total} icon="🌍" />
          <ScoreCard label="Social"        score={selected.social_score}       rank={getRank(allCompanies, selected.company_name, 'social_score')}       total={total} icon="👥" />
          <ScoreCard label="Governance"    score={selected.governance_score}   rank={getRank(allCompanies, selected.company_name, 'governance_score')}   total={total} icon="🏛️" />
        </div>
      )}

      {/* ── Row 1: Radar + Gap to Leader ── */}
      {selected && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Radar */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-700 mb-1">ESG Profile Radar</h3>
            <p className="text-xs text-slate-400 mb-3">
              Company vs sector average vs sector best across all four pillars
            </p>
            <ESGRadarChart companies={allCompanies} selected={selected} />
          </div>

          {/* Gap to leader */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-700 mb-1">Gap to Sector Leader</h3>
            <p className="text-xs text-slate-400 mb-3">
              Points behind the top scorer in each pillar · green = leading
            </p>
            <GapToLeaderChart companies={allCompanies} selected={selected} />
          </div>
        </div>
      )}

      {/* ── Row 2: Peer Bar Charts (2×2 grid) ── */}
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
                <PeerBarChart companies={allCompanies} selectedName={selected.company_name} scoreKey={col.key} label={col.label} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Row 3: Scatter + Stacked Bar ── */}
      {allCompanies.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Scatter Plot */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-700 mb-1">Environmental vs Social</h3>
            <p className="text-xs text-slate-400 mb-3">
              Each dot = one company · dashed lines = sector averages
              {selected && <> · <span className="text-blue-500 font-medium">● = {selected.company_name}</span></>}
            </p>
            <EnvSocialScatter companies={allCompanies} selectedName={selected?.company_name} />
          </div>

          {/* Stacked Pillar Breakdown */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-700 mb-1">Pillar Breakdown — Top 8</h3>
            <p className="text-xs text-slate-400 mb-3">
              Stacked E + S + G scores for top-8 companies by ESG score
              {selected && <> · <span className="text-blue-500 font-medium">★ = {selected.company_name}</span></>}
            </p>
            <PillarStackedChart companies={allCompanies} selectedName={selected?.company_name} />
          </div>
        </div>
      )}

      {/* ── Peer Comparison Table ── */}
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
        <PeerTable companies={allCompanies} selectedName={selected?.company_name} />
        <div className="px-5 py-3 border-t border-slate-100 flex items-center gap-4 flex-wrap">
          <span className="text-xs text-slate-400">Score range:</span>
          {[
            { label: '≥70 Strong',    bg: '#059669', fg: '#fff' },
            { label: '50–69 Average', bg: '#f59e0b', fg: '#78350f' },
            { label: '<50 Weak',      bg: '#ef4444', fg: '#fff' },
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
