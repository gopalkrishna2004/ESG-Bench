const router = require('express').Router();
const { getAll, getById, getSectors } = require('../controllers/companiesController');

router.get('/', getAll);
router.get('/sectors', getSectors);
router.get('/:id', getById);

module.exports = router;
