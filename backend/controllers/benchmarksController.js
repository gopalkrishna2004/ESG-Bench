const EsgCompany = require('../models/EsgCompany');
const EsgReport = require('../models/EsgReport');
const {
  METRICS_CONFIG,
  computeDerivedMetrics,
  computeSectorStats,
  computePercentileRank,
  computeNormalizedScore,
  computePillarScores,
  computeGapAnalysis,
  computeRadarData,
  computeStrengthsWeaknesses,
} = require('../utils/benchmarkCalculations');

/** Full benchmarking payload for a single company */
const getCompanyBenchmark = async (req, res) => {
  try {
    const company = await EsgCompany.findById(req.params.id);
    if (!company) return res.status(404).json({ message: 'Company not found' });

    const peers = await EsgCompany.find({ sector: company.sector });
    const { enriched, stats } = computeSectorStats(peers);
    const companyEnriched = computeDerivedMetrics(company.toObject());

    const percentiles = {};
    const normalizedScores = {};

    Object.entries(METRICS_CONFIG).forEach(([metric, config]) => {
      const allVals = enriched.map((c) => c[metric]);
      percentiles[metric] = computePercentileRank(companyEnriched[metric], allVals, config.lowerIsBetter);
      const ms = stats[metric];
      normalizedScores[metric] = ms
        ? computeNormalizedScore(companyEnriched[metric], ms.min, ms.max, config.lowerIsBetter)
        : null;
    });

    const pillarScores = computePillarScores(companyEnriched, stats);
    const overallScore = [pillarScores.environmental, pillarScores.social, pillarScores.governance]
      .filter((s) => s != null)
      .reduce((sum, s, _i, arr) => sum + s / arr.length, 0);

    const gapAnalysis = computeGapAnalysis(companyEnriched, enriched, stats);
    const radarData = computeRadarData(companyEnriched, enriched, stats);
    const { strengths, weaknesses, opportunities } = computeStrengthsWeaknesses(percentiles);

    res.json({
      company: companyEnriched,
      pillarScores: { ...pillarScores, overall: Math.round(overallScore) },
      percentiles,
      normalizedScores,
      gapAnalysis,
      radarData,
      sectorStats: stats,
      strengths,
      weaknesses,
      opportunities,
      peerCount: peers.length,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getSectorStats = async (req, res) => {
  try {
    const sector = req.query.sector;
    const filter = sector ? { sector } : {};
    const companies = await EsgCompany.find(filter);
    if (!companies.length) return res.status(404).json({ message: 'No companies found' });

    const { stats } = computeSectorStats(companies);
    res.json({ sector: sector || 'All', stats, count: companies.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getHeatmapData = async (req, res) => {
  try {
    const sector = req.query.sector;
    const filter = sector ? { sector } : {};
    const companies = await EsgCompany.find(filter);
    if (!companies.length) return res.status(404).json({ message: 'No companies found' });

    const { enriched, stats } = computeSectorStats(companies);
    const metrics = Object.keys(METRICS_CONFIG);
    const data = enriched.map((c) => {
      const row = { _id: c._id, company_name: c.company_name, bse_code: c.bse_code };
      metrics.forEach((metric) => {
        const ms = stats[metric];
        row[metric] = ms
          ? computeNormalizedScore(c[metric], ms.min, ms.max, METRICS_CONFIG[metric].lowerIsBetter)
          : null;
        row[`${metric}_raw`] = c[metric] != null ? c[metric] : null;
      });
      return row;
    });
    res.json({ metrics, data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getMetricRanking = async (req, res) => {
  try {
    const { metric } = req.params;
    const sector = req.query.sector;
    const filter = sector ? { sector } : {};
    const companies = await EsgCompany.find(filter);

    const { enriched } = computeSectorStats(companies);
    const config = METRICS_CONFIG[metric];
    if (!config) return res.status(400).json({ message: 'Unknown metric' });

    const allVals = enriched.map((c) => c[metric]);
    const ranked = enriched
      .map((c) => ({
        _id: c._id,
        company_name: c.company_name,
        value: c[metric] != null ? c[metric] : null,
        percentile: computePercentileRank(c[metric], allVals, config.lowerIsBetter),
      }))
      .filter((r) => r.value != null)
      .sort((a, b) => (config.lowerIsBetter ? a.value - b.value : b.value - a.value));

    res.json({ metric, label: config.label, unit: config.unit, lowerIsBetter: config.lowerIsBetter, ranked });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getPeerComparison = async (req, res) => {
  try {
    // 1. Get all companies from oil_gas_esg
    const oilGasCompanies = await EsgCompany.find({}, 'company_name bse_code _id');
    const nameList = oilGasCompanies.map((c) => c.company_name);

    // 2. Find matching entries in esg_reports by company name
    const reports = await EsgReport.find({ company_name: { $in: nameList } });

    // 3. Parse score strings to numbers
    const data = reports.map((r) => ({
      _id: r._id,
      company_name: r.company_name,
      sector: r.sector,
      esg_score:         parseFloat(r.esg_score)         || null,
      environment_score: parseFloat(r.environment_score) || null,
      social_score:      parseFloat(r.social_score)      || null,
      governance_score:  parseFloat(r.governance_score)  || null,
      latest_report_date: r.latest_report_date,
      coverage: r.coverage,
    }));

    // 4. Link back to oil_gas_esg _id for navigation to detailed benchmarks
    const oilGasMap = Object.fromEntries(
      oilGasCompanies.map((c) => [c.company_name, c._id])
    );
    data.forEach((d) => { d.oil_gas_id = oilGasMap[d.company_name] || null; });

    // 5. Sort alphabetically
    data.sort((a, b) => a.company_name.localeCompare(b.company_name));

    res.json({ companies: data, total: data.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getCompanyBenchmark, getSectorStats, getHeatmapData, getMetricRanking, getPeerComparison };
