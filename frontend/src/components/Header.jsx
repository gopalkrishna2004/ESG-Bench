import { useEffect, useState } from 'react';
import { getCompanies } from '../api';

export default function Header({ selectedCompany, setSelectedCompany }) {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getCompanies()
      .then((res) => setCompanies(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = companies.filter((c) =>
    c.company_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between gap-4 flex-shrink-0">
      <div>
        <h1 className="text-base font-semibold text-slate-800">
          {selectedCompany ? selectedCompany.company_name : 'Select a company to benchmark'}
        </h1>
        {selectedCompany && (
          <p className="text-xs text-slate-500 mt-0.5">
            {selectedCompany.sector} · BSE: {selectedCompany.bse_code}
          </p>
        )}
      </div>

      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-900 text-white text-sm rounded-lg hover:bg-brand-800 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
          </svg>
          {selectedCompany ? 'Change Company' : 'Select Company'}
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 z-50">
            <div className="p-3 border-b border-slate-100">
              <input
                autoFocus
                type="text"
                placeholder="Search companies..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full text-sm px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <ul className="max-h-64 overflow-y-auto divide-y divide-slate-50">
              {loading && (
                <li className="px-4 py-3 text-sm text-slate-400">Loading...</li>
              )}
              {!loading && filtered.length === 0 && (
                <li className="px-4 py-3 text-sm text-slate-400">No results</li>
              )}
              {filtered.map((c) => (
                <li key={c._id}>
                  <button
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors ${
                      selectedCompany?._id === c._id ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-700'
                    }`}
                    onClick={() => {
                      setSelectedCompany(c);
                      setOpen(false);
                      setSearch('');
                    }}
                  >
                    <span className="block font-medium">{c.company_name}</span>
                    <span className="block text-xs text-slate-400 mt-0.5">BSE: {c.bse_code}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </header>
  );
}
