import { format, parseISO, subDays } from "date-fns";
import { useEffect, useState } from "react";
import { fetchActuals, fetchForecasts } from "./api";
import { Chart } from "./components/Chart";
import { processChartData } from "./utils";

export default function App() {
  const [startStr, setStartStr] = useState(
    format(subDays(new Date(), 2), "yyyy-MM-dd'T'00:00"),
  );
  const [endStr, setEndStr] = useState(
    format(new Date(), "yyyy-MM-dd'T'00:00"),
  );
  const [horizon, setHorizon] = useState(4);

  const [actuals, setActuals] = useState([]);
  const [forecasts, setForecasts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      const start = parseISO(startStr);
      const end = parseISO(endStr);

      if (start >= end) {
        setError("Start time must be before end time");
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const [a, f] = await Promise.all([
          fetchActuals(start, end),
          fetchForecasts(start, end),
        ]);
        setActuals(a);
        setForecasts(f);
      } catch (err) {
        setError("Failed to fetch data from Elexon API");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [startStr, endStr]);

  const chartData =
    actuals.length > 0 || forecasts.length > 0
      ? processChartData(
          actuals,
          forecasts,
          parseISO(startStr),
          parseISO(endStr),
          horizon,
        )
      : [];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">
          Wind Power Generation Forecast Monitoring
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Time
            </label>
            <input
              type="datetime-local"
              min="2025-01-01T00:00"
              value={startStr}
              onChange={(e) => setStartStr(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Time
            </label>
            <input
              type="datetime-local"
              min="2025-01-01T00:00"
              value={endStr}
              onChange={(e) => setEndStr(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Forecast Horizon: {horizon}h
            </label>
            <input
              type="range"
              min="0"
              max="48"
              value={horizon}
              onChange={(e) => setHorizon(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-3"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0h</span>
              <span>24h</span>
              <span>48h</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="h-[400px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <Chart data={chartData} />
        )}

        <div className="mt-6 flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-blue-500 rounded"></div>
            <span className="text-gray-600">Actual Generation</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-green-500 rounded"></div>
            <span className="text-gray-600">Forecasted Generation</span>
          </div>
        </div>
      </div>
    </div>
  );
}
