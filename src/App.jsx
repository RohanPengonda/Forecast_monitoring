import { format, parseISO, subDays } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { fetchActuals, fetchForecasts } from "./api";
import { Chart } from "./components/Chart";
import { processChartData } from "./utils";

function formatNumber(value) {
  return Intl.NumberFormat("en-GB", { maximumFractionDigits: 2 }).format(value);
}

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

  const stats = useMemo(() => {
    const points = chartData.filter(
      (d) => d.actual != null && d.forecast != null,
    );
    const count = points.length;

    if (count === 0) return null;

    const errors = points.map((d) => d.forecast - d.actual);
    const mae = errors.reduce((sum, e) => sum + Math.abs(e), 0) / count;
    const bias = errors.reduce((sum, e) => sum + e, 0) / count;

    return {
      count,
      mae,
      bias,
      start: chartData[0]?.time,
      end: chartData[chartData.length - 1]?.time,
    };
  }, [chartData]);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <header className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
            Wind Power Forecast Monitor
          </h1>
          <p className="mt-2 text-sm md:text-base text-slate-600 max-w-2xl mx-auto">
            Compare forecasted vs actual UK wind generation, explore forecast
            error trends, and see how reliable wind capacity can be.
          </p>
        </header>

        <section className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-4 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-medium text-slate-900">Controls</h2>
            <p className="mt-1 text-sm text-slate-600">
              Select a time range and forecast horizon.
            </p>

            <div className="mt-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Start time
                </label>
                <input
                  type="datetime-local"
                  min="2025-01-01T00:00"
                  value={startStr}
                  onChange={(e) => setStartStr(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  End time
                </label>
                <input
                  type="datetime-local"
                  min="2025-01-01T00:00"
                  value={endStr}
                  onChange={(e) => setEndStr(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700">
                    Forecast horizon
                  </label>
                  <span className="text-xs text-slate-600">{horizon}h</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="48"
                  value={horizon}
                  onChange={(e) => setHorizon(parseInt(e.target.value))}
                  className="mt-2 w-full accent-indigo-400"
                />
                <div className="flex justify-between text-xs text-slate-600 mt-1">
                  <span>0h</span>
                  <span>24h</span>
                  <span>48h</span>
                </div>
              </div>
            </div>

            {stats && (
              <div className="mt-6 rounded-xl bg-gray-50 border border-gray-200 p-4">
                <h3 className="text-sm font-medium text-slate-900">Summary</h3>
                <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-slate-700">
                  <div>
                    <dt className="text-xs text-slate-500">Points</dt>
                    <dd className="font-semibold text-slate-900">
                      {stats.count}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500">MAE</dt>
                    <dd className="font-semibold text-slate-900">
                      {formatNumber(stats.mae)} MW
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500">Bias</dt>
                    <dd
                      className={`font-semibold ${Math.abs(stats.bias) < 1 ? "text-emerald-600" : "text-amber-600"}`}
                    >
                      {formatNumber(stats.bias)} MW
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500">Data span</dt>
                    <dd className="font-semibold text-slate-900">
                      {stats.start
                        ? format(parseISO(stats.start), "dd MMM HH:mm")
                        : "—"}{" "}
                      →{" "}
                      {stats.end
                        ? format(parseISO(stats.end), "dd MMM HH:mm")
                        : "—"}
                    </dd>
                  </div>
                </dl>
              </div>
            )}
          </div>

          <div className="lg:col-span-8">
            <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-lg font-medium text-slate-900">
                    Forecast vs Actual
                  </h2>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-400"></span>
                    Actual
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
                    Forecast
                  </div>
                </div>
              </div>

              {error && (
                <div className="mt-6 rounded-xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-700">
                  {error}
                </div>
              )}

              {loading ? (
                <div className="mt-8 flex h-[420px] items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400"></div>
                </div>
              ) : (
                <Chart data={chartData} />
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
