# ESG Bench — Performance Benchmarking & Gap Analysis

**Task 4 · Feature 2** — Comprehensive Metric Comparison  
Part of the ESG Benchmarking & Competitive Intelligence Agent (Priyank's Team)

## Stack

| Layer    | Tech                          |
|----------|-------------------------------|
| Database | MongoDB (`esg_database`)      |
| Backend  | Node.js · Express · Mongoose  |
| Frontend | React 18 · Vite · Tailwind CSS |
| Charts   | Recharts v2                   |

## Prerequisites

1. MongoDB running locally on `localhost:27017`
2. The `esg_database.oil_gas_esg` collection populated (run `Data/Data_Scraping/esg_mongo_csv.py`)
3. Node.js ≥ 18

## Setup & Run

**Terminal 1 — Backend API**
```bash
cd "ESG Bench/backend"
npm run dev          # runs on http://localhost:5000
```

**Terminal 2 — Frontend Dev Server**
```bash
cd "ESG Bench/frontend"
npm run dev          # runs on http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000) and select a company from the header to begin benchmarking.

## Features

### Dashboard (Overview)
- ESG pillar score cards (Environmental / Social / Governance, 0–100)
- Multi-dimensional radar chart (company vs sector average vs leader)
- Gap vs sector average waterfall chart (percentile point delta per metric)
- Strengths · Opportunities · Weaknesses identification
- Peer comparison heatmap (all sector companies × all metrics)

### Environmental Benchmark
- Scope 1 & 2 emissions, emissions intensity, renewable energy %, water consumption, total waste
- Clickable metric cards → live sector ranking bar chart
- Gap-to-sector-leader table

### Social Benchmark
- Gender diversity %, board women %, LTIFR, employee turnover, pay equity ratio
- Pay equity grouped bar chart (female vs male median remuneration)
- Sector ranking chart per metric

### Governance Benchmark
- Board women %, independent directors %, data breaches, net zero target year
- Net zero commitment analysis panel
- Sector ranking & gap table

## API Endpoints

| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/companies` | List all companies |
| GET | `/api/companies/sectors` | Distinct sectors |
| GET | `/api/companies/:id` | Single company detail |
| GET | `/api/benchmarks/company/:id` | Full benchmark payload for a company |
| GET | `/api/benchmarks/sector-stats?sector=` | Sector-level statistics |
| GET | `/api/benchmarks/heatmap?sector=` | Normalised scores for heatmap |
| GET | `/api/benchmarks/ranking/:metric?sector=` | Ranked list for one metric |
