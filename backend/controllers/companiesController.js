const EsgCompany = require('../models/EsgCompany');

const getAll = async (_req, res) => {
  try {
    const companies = await EsgCompany.find({}, {
      company_name: 1, bse_code: 1, sector: 1, serial_number: 1,
    }).sort({ company_name: 1 });
    res.json(companies);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getById = async (req, res) => {
  try {
    const company = await EsgCompany.findById(req.params.id);
    if (!company) return res.status(404).json({ message: 'Company not found' });
    res.json(company);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getSectors = async (_req, res) => {
  try {
    const sectors = await EsgCompany.distinct('sector');
    res.json(sectors.filter(Boolean).sort());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAll, getById, getSectors };
