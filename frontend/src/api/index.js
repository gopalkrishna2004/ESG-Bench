import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

export const getCompanies = () => api.get('/companies');
export const getCompany = (id) => api.get(`/companies/${id}`);
export const getSectors = () => api.get('/companies/sectors');
export const getCompanyBenchmark = (id) => api.get(`/benchmarks/company/${id}`);
export const getSectorStats = (sector) =>
  api.get(`/benchmarks/sector-stats${sector ? `?sector=${encodeURIComponent(sector)}` : ''}`);
export const getHeatmapData = (sector) =>
  api.get(`/benchmarks/heatmap${sector ? `?sector=${encodeURIComponent(sector)}` : ''}`);
export const getMetricRanking = (metric, sector) =>
  api.get(`/benchmarks/ranking/${metric}${sector ? `?sector=${encodeURIComponent(sector)}` : ''}`);
