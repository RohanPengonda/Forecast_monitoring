import { addMinutes, isBefore, isSameMinute } from 'date-fns';

export function processChartData(actuals, forecasts, start, end, horizonHours) {
  const actualsMap = new Map();
  actuals.forEach(a => {
    actualsMap.set(new Date(a.startTime).getTime(), a.generation);
  });

  const forecastsMap = new Map();
  forecasts.forEach(f => {
    const time = new Date(f.startTime).getTime();
    if (!forecastsMap.has(time)) forecastsMap.set(time, []);
    forecastsMap.get(time).push(f);
  });

  const data = [];
  let current = start;

  while (isBefore(current, end) || isSameMinute(current, end)) {
    const timeMs = current.getTime();
    const actual = actualsMap.get(timeMs) ?? null;
    let forecast = null;

    const targetForecasts = forecastsMap.get(timeMs);
    if (targetForecasts) {
      const valid = targetForecasts.filter(f => {
        const diff = (new Date(f.startTime) - new Date(f.publishTime)) / (1000 * 60 * 60);
        return diff >= horizonHours && diff <= 48;
      });

      if (valid.length > 0) {
        valid.sort((a, b) => new Date(b.publishTime) - new Date(a.publishTime));
        forecast = valid[0].generation;
      }
    }

    data.push({ time: current.toISOString(), actual, forecast });
    current = addMinutes(current, 30);
  }

  return data;
}
