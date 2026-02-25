const mongoose = require('mongoose');

const esgCompanySchema = new mongoose.Schema(
  {
    serial_number: Number,
    company_name: String,
    bse_code: String,
    sector: String,
    // Environmental
    scope_1: Number,
    scope_2: Number,
    emissions_intensity: Number,
    net_zero_target_year: Number,
    energy_consumption: Number,
    renewable_energy: Number,
    water_consumption: Number,
    total_waste: Number,
    // Social
    female_employees: Number,
    employees: Number,
    board_women_percent: Number,
    median_remuneration_female: Number,
    median_remuneration_male: Number,
    ltifr: Number,
    employee_turnover_rate: Number,
    // Governance
    independent_directors_percent: Number,
    data_breaches: Number,
  },
  { collection: 'oil_gas_esg', strict: false }
);

module.exports = mongoose.model('EsgCompany', esgCompanySchema);
