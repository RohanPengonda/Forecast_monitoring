import { addDays, format, isBefore, min, subHours } from 'date-fns';

const API_BASE = 'https://data.elexon.co.uk/bmrs/api/v1/datasets';

export async function fetchActuals(start, end) {
  const minDate = new Date('2025-01-01T00:00:00Z');
  let current = start < minDate ? minDate : start;
  const results = [];

  while (isBefore(current, end) || current.getTime() === end.getTime()) {
    const chunkEnd = min([addDays(current, 6), end]);
    const fromStr = format(current, 'yyyy-MM-dd');
    const toStr = format(chunkEnd, 'yyyy-MM-dd');

    const url = `${API_BASE}/FUELHH?settlementDateFrom=${fromStr}&settlementDateTo=${toStr}`;
    const res = await fetch(url);
    const json = await res.json();

    if (json.data) {
      const windData = json.data
        .filter(d => d.fuelType === 'WIND')
        .map(d => ({ startTime: d.startTime, generation: d.generation }));
      results.push(...windData);
    }

    current = addDays(chunkEnd, 1);
  }

  return results;
}

export async function fetchForecasts(start, end) {
  const minDate = new Date('2025-01-01T00:00:00Z');
  const clampedStart = start < minDate ? minDate : start;
  let current = subHours(clampedStart, 48);
  const results = [];

  while (isBefore(current, end)) {
    const chunkEnd = min([addDays(current, 6), end]);
    const fromStr = current.toISOString();
    const toStr = chunkEnd.toISOString();

    const url = `${API_BASE}/WINDFOR?publishDateTimeFrom=${fromStr}&publishDateTimeTo=${toStr}`;
    const res = await fetch(url);
    const json = await res.json();

    if (json.data) {
      results.push(...json.data.map(d => ({
        startTime: d.startTime,
        publishTime: d.publishTime,
        generation: d.generation,
      })));
    }

    current = chunkEnd;
  }

  return results;
}
