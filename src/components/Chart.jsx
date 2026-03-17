import { format, parseISO } from 'date-fns';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export function Chart({ data }) {
  return (
    <div className="h-[400px] w-full mt-8">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <XAxis
            dataKey="time"
            tickFormatter={(t) => format(parseISO(t), 'HH:mm\ndd/MM/yy')}
            minTickGap={50}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
            domain={['auto', 'auto']}
            label={{ value: 'Power (MW)', angle: -90, position: 'insideLeft', offset: -10 }}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            labelFormatter={(label) => format(parseISO(label), 'dd/MM/yyyy HH:mm')}
            formatter={(value, name) => [
              `${value} MW`,
              name === 'actual' ? 'Actual Generation' : 'Forecasted Generation'
            ]}
          />
          <Line type="monotone" dataKey="actual" stroke="#3b82f6" strokeWidth={2} dot={false} connectNulls name="actual" />
          <Line type="monotone" dataKey="forecast" stroke="#22c55e" strokeWidth={2} dot={false} connectNulls name="forecast" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
