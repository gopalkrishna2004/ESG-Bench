import { Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ErrorBoundary from './components/ErrorBoundary';
import Dashboard from './pages/Dashboard';
import EnvironmentalBenchmark from './pages/EnvironmentalBenchmark';
import SocialBenchmark from './pages/SocialBenchmark';
import GovernanceBenchmark from './pages/GovernanceBenchmark';

export default function App() {
  const [selectedCompany, setSelectedCompany] = useState(null);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header selectedCompany={selectedCompany} setSelectedCompany={setSelectedCompany} />
        <main className="flex-1 overflow-y-auto p-6">
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard selectedCompany={selectedCompany} />} />
              <Route path="/environmental" element={<EnvironmentalBenchmark selectedCompany={selectedCompany} />} />
              <Route path="/social" element={<SocialBenchmark selectedCompany={selectedCompany} />} />
              <Route path="/governance" element={<GovernanceBenchmark selectedCompany={selectedCompany} />} />
            </Routes>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
