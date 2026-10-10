import { useId, useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const REVENUE_COLOR = "#7c3aed"; // violet-600
const EXPENSES_COLOR = "#c4b5fd"; // violet-300

// Mock data for initial UI development only — pass your own via the `data` prop.
const MOCK_DATA = [
  { month: "Jan", revenue: 140000, expenses: 90000 },
  { month: "Feb", revenue: 158000, expenses: 92000 },
  { month: "Mar", revenue: 148000, expenses: 88000 },
  { month: "Apr", revenue: 188000, expenses: 100000 },
  { month: "May", revenue: 200000, expenses: 107000 },
  { month: "Jun", revenue: 228000, expenses: 115000 },
  { month: "Jul", revenue: 222000, expenses: 112000 },
  { month: "Aug", revenue: 252000, expenses: 120000 },
  { month: "Sep", revenue: 265000, expenses: 127000 },
];

// 70000 -> "$70k", 0 -> "$0"
const formatDollars = (value) =>
  value >= 1000 ? `$${Math.round(value / 1000)}k` : `$${value}`;

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs shadow-md">
      <p className="mb-1 font-medium text-gray-900">{label}</p>
      {payload.map((item) => (
        <p key={item.dataKey} className="flex items-center gap-1.5 text-gray-500">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: item.stroke }}
          />
          {item.name}:{" "}
          <span className="font-mono text-gray-900">
            {formatDollars(item.value)}
          </span>
        </p>
      ))}
    </div>
  );
}

function LegendItem({ color, label }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
      <span
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  );
}

/**
 * RevenueExpenseChart
 *
 * Props:
 *  - data:      [{ month, revenue, expenses }, ...]  (defaults to mock data)
 *  - title:     card title
 *  - subtitle:  small text under the title
 *  - className: extra classes for the outer card
 *
 * Usage:
 *   <RevenueExpenseChart />
 *   <RevenueExpenseChart data={myData} subtitle="January - September 2026" />
 */
export default function RevenueExpenseChart({
  data = MOCK_DATA,
  title = "Revenue vs Expenses",
  subtitle = "January - September 2026",
  className = "",
}) {
  const uid = useId().replace(/:/g, "");
  const revenueFill = `revenueFill-${uid}`;
  const expensesFill = `expensesFill-${uid}`;

  // Round the top of the Y-axis up and split it into 4 even steps (0, 25%, ... 100%)
  const { top, ticks } = useMemo(() => {
    const max = Math.max(0, ...data.flatMap((d) => [d.revenue, d.expenses]));
    const roundedTop = Math.max(40000, Math.ceil(max / 40000) * 40000);
    return {
      top: roundedTop,
      ticks: [0, 0.25, 0.5, 0.75, 1].map((p) => p * roundedTop),
    };
  }, [data]);

  return (
    <section
      className={`min-w-0 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5 lg:p-6 ${className}`}
    >
      <header className="mb-4 flex flex-wrap items-start justify-between gap-x-4 gap-y-2 sm:mb-5">
        <div>
          <h2 className="text-sm font-semibold text-gray-900 sm:text-base">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-0.5 text-xs text-slate-400 sm:text-sm">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-4">
          <LegendItem color={REVENUE_COLOR} label="Revenue" />
          <LegendItem color={EXPENSES_COLOR} label="Expenses" />
        </div>
      </header>

      <div className="h-64 w-full sm:h-72 lg:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id={revenueFill} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={REVENUE_COLOR} stopOpacity={0.12} />
                <stop offset="100%" stopColor={REVENUE_COLOR} stopOpacity={0} />
              </linearGradient>
              <linearGradient id={expensesFill} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={EXPENSES_COLOR} stopOpacity={0.12} />
                <stop offset="100%" stopColor={EXPENSES_COLOR} stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#eef0f6" />

            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#94a3b8", fontSize: 11 }}
              tickMargin={8}
            />
            <YAxis
              domain={[0, top]}
              ticks={ticks}
              tickFormatter={formatDollars}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#94a3b8", fontSize: 11 }}
              width={44}
            />

            <Tooltip
              content={<ChartTooltip />}
              cursor={{ stroke: "#d1d5db", strokeWidth: 1 }}
            />

            <Area
              type="monotone"
              dataKey="expenses"
              name="Expenses"
              stroke={EXPENSES_COLOR}
              strokeWidth={2}
              fill={`url(#${expensesFill})`}
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              name="Revenue"
              stroke={REVENUE_COLOR}
              strokeWidth={2}
              fill={`url(#${revenueFill})`}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}