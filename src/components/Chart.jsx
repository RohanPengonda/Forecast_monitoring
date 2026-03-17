import { format, parseISO } from "date-fns";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function Chart({ data }) {
  return (
    <div className="h-[420px] w-full mt-8">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 18, right: 26, left: 16, bottom: 18 }}
        >
          <CartesianGrid
            stroke="rgba(148,163,184,0.25)"
            strokeDasharray="4 4"
          />
          <XAxis
            dataKey="time"
            tickFormatter={(t) => format(parseISO(t), "HH:mm\ndd/MM/yy")}
            minTickGap={40}
            label={{
              value: "Target Time End (UTC)",
              position: "insideBottom",
              dy: 18,
              fill: "#0f172a",
              fontSize: 12,
            }}
            tick={{ fontSize: 12, fill: "#0f172a" }}
            axisLine={{ stroke: "#e2e8f0" }}
            tickLine={{ stroke: "#e2e8f0" }}
          />
          <YAxis
            tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
            domain={["auto", "auto"]}
            label={{
              value: "Power (MW)",
              angle: -90,
              position: "insideLeft",
              offset: -10,
              fill: "#0f172a",
            }}
            tick={{ fontSize: 12, fill: "#0f172a" }}
            axisLine={{ stroke: "#e2e8f0" }}
            tickLine={{ stroke: "#e2e8f0" }}
          />
          <Tooltip
            wrapperStyle={{ borderRadius: 12, borderColor: "#334155" }}
            labelFormatter={(label) =>
              format(parseISO(label), "dd/MM/yyyy HH:mm")
            }
            formatter={(value, name) => [
              `${value} MW`,
              name === "actual" ? "Actual Generation" : "Forecasted Generation",
            ]}
          />
          {/* <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            wrapperStyle={{ color: "#0f172a", paddingBottom: 8 }}
          /> */}
          <Line
            type="monotone"
            dataKey="actual"
            stroke="#60a5fa"
            strokeWidth={2}
            dot={false}
            connectNulls
            name="Actual"
          />
          <Line
            type="monotone"
            dataKey="forecast"
            stroke="#4ade80"
            strokeWidth={2}
            dot={false}
            connectNulls
            name="Forecast"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
