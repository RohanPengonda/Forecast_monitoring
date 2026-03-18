# Wind Power Generation Forecast Monitoring

A small dashboard for comparing **UK wind generation forecasts** against **actual generation** from the Elexon BMRS API, plus a companion analysis notebook for evaluating forecast error and “reliable capacity”.

---

## 🧠 What is this for?

This project helps analysts, developers, and energy planners answer questions like:

- How accurate are wind generation forecasts over different lookahead horizons (0–48h)?
- How does forecast error behave across time and seasons?
- How much wind capacity can be treated as “reliable” given forecast uncertainty?

It does this by plotting forecast vs actual generation in a visual dashboard and providing a Jupyter notebook that computes error statistics.

---

## 🧩 Project Structure

```
.
├── public/
│   └── index.html              # Static HTML template
├── src/
│   ├── api.js                  # Elexon BMRS API fetching helpers
│   ├── App.jsx                 # Main React app + UI state
│   ├── components/Chart.jsx    # Recharts chart component
│   ├── index.css               # Global styles (Tailwind base)
│   ├── main.jsx                # React + Vite entrypoint
│   └── utils.js                # Data processing / chart data generation
├── analysis.ipynb              # Notebook analysis of forecast error
├── package.json
├── vite.config.js
└── README.md
```

---

## 🚀 Features

- 📅 **Time-range selection:** Choose any start/end datetime (within API limits).
- ⏳ **Forecast horizon slider:** See how forecast vs actual changes for 0–48h forecast lead times.
- 📈 **Interactive chart:** Actual vs forecast generation plotted on the same timeline.
- ✅ **Error handling:** Shows user-friendly error messages when API calls fail.
- 📱 **Responsive layout:** Works on desktop and mobile screen sizes.

---

## 🛠️ Tech Stack

- **React** (Vite)
- **Tailwind CSS** for styling
- **Recharts** for charting
- **date-fns** for date parsing/formatting
- **Elexon BMRS API** (UK electricity generation data)

---

## 🧪 Data Source

This app uses the **Elexon Balancing Mechanism Reporting Service (BMRS)** APIs that provide:

- **Actual generation** (AGPT/B1620 dataset)
- **Forecast generation** (FGT/B1640 dataset)

The app fetches and aligns those time series to compute forecast vs actual comparisons.

---

## 🏁 Getting Started (Local)

1. Install dependencies:

```bash
npm install
```

2. Start dev server:

```bash
npm run dev
```

3. Open the URL shown (typically `http://localhost:5173`).

---

## 🧮 Analysis Notebook

`analysis.ipynb` contains a deeper analysis of forecast error, including:

- Error distribution over time
- Mean absolute error (MAE) / root mean squared error (RMSE)
- Reliable capacity estimates (how much wind can be trusted to be available under forecast uncertainty)

You can open it in Jupyter Lab / Notebook:

```bash
jupyter lab analysis.ipynb
```

---

## 📁 Useful Commands

- `npm run dev` — start the dev server
- `npm run build` — build production assets
- `npm run preview` — serve production build locally

---
