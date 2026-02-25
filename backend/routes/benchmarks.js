const router = require('express').Router();
const {
  getCompanyBenchmark,
  getSectorStats,
  getHeatmapData,
  getMetricRanking,
} = require('../controllers/benchmarksController');

router.get('/company/:id', getCompanyBenchmark);
router.get('/sector-stats', getSectorStats);
router.get('/heatmap', getHeatmapData);
router.get('/ranking/:metric', getMetricRanking);

module.exports = router;
