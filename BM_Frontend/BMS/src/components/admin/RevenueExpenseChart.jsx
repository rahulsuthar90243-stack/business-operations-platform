import { useEffect, useId, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getRevenueExpenseData } from "../../services/financeService.js";

const REVENUE_COLOR = "#7c3aed";
const EXPENSE_COLOR = "#c4b5fd";

const formatAxisCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    notation: "compact",
    maximumFractionDigits: 0,
  }).format(amount);

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

const getRecordDate = (record, field) => {
  const date = new Date(record[field] || record.createdAt || "");
  return Number.isNaN(date.getTime()) ? null : date;
};

const sumForMonth = (records, dateField, month) =>
  records.reduce((sum, record) => {
    const date = getRecordDate(record, dateField);
    const amount = Number(record.amount);
    return date &&
      date.getFullYear() === month.getFullYear() &&
      date.getMonth() === month.getMonth() &&
      Number.isFinite(amount)
      ? sum + amount
      : sum;
  }, 0);

function createMonthlyChartData({ revenues, expenses }) {
  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(new Date().getFullYear(), new Date().getMonth() - 5 + index, 1);
    return {
      date,
      month: date.toLocaleString("en-IN", { month: "short" }),
      revenue: sumForMonth(revenues, "revenueDate", date),
      expenses: sumForMonth(expenses, "expenseDate", date),
    };
  });
  const firstMonth = months[0].date;
  const lastMonth = months[months.length - 1].date;
  const firstMonthLabel = firstMonth.toLocaleString("en-IN", { month: "long" });
  const lastMonthLabel = lastMonth.toLocaleString("en-IN", { month: "long" });
  const subtitle =
    firstMonth.getFullYear() === lastMonth.getFullYear()
      ? `${firstMonthLabel} – ${lastMonthLabel} ${lastMonth.getFullYear()}`
      : `${firstMonthLabel} ${firstMonth.getFullYear()} – ${lastMonthLabel} ${lastMonth.getFullYear()}`;

  return {
    data: months.map(({ month, revenue, expenses: monthExpenses }) => ({
      month,
      revenue,
      expenses: monthExpenses,
    })),
    subtitle,
  };
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-md">
      <p className="mb-1 font-medium text-slate-900">{label}</p>
      {payload.map((item) => (
        <p key={item.dataKey} className="flex items-center gap-1.5 text-slate-500">
          <span
            aria-hidden="true"
            className="size-2 rounded-full"
            style={{ backgroundColor: item.stroke }}
          />
          {item.name}:{" "}
          <span className="font-medium text-slate-900">
            {formatCurrency(item.value)}
          </span>
        </p>
      ))}
    </div>
  );
}

function LegendItem({ color, label }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
      <span
        aria-hidden="true"
        className="size-2 rounded-full"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  );
}

export default function RevenueExpense({
  subtitle,
  className = "",
  compact = false,
}) {
  const [data, setData] = useState([]);
  const [chartSubtitle, setChartSubtitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState("");
  const chartId = useId().replace(/:/g, "");
  const revenueFill = `revenue-fill-${chartId}`;
  const expenseFill = `expense-fill-${chartId}`;

  useEffect(() => {
    let active = true;
    let isFetching = false;

    const loadChartData = async () => {
      if (isFetching) return;
      isFetching = true;
      setLoading(true);
      setError("");

      try {
        const financeData = await getRevenueExpenseData();
        const chartData = createMonthlyChartData(financeData);
        if (active) {
          setData(chartData.data);
          setChartSubtitle(chartData.subtitle);
          setHasLoaded(true);
        }
      } catch (requestError) {
        if (active) {
          setError(requestError.message || "Unable to load revenue and expense data.");
        }
      } finally {
        isFetching = false;
        if (active) setLoading(false);
      }
    };

    loadChartData();
    const intervalId = window.setInterval(loadChartData, 60_000);

    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, []);

  const activeSubtitle = subtitle || chartSubtitle;
  const hasData = data.some((item) => item.revenue > 0 || item.expenses > 0);

  const { top, ticks } = useMemo(() => {
    const maxValue = Math.max(
      0,
      ...data.flatMap((item) => [
        Number(item.revenue) || 0,
        Number(item.expenses) || 0,
      ]),
    );
    const step = Math.max(1, Math.ceil(maxValue / 3 / 1000) * 1000);
    const chartTop = step * 3;

    return {
      top: chartTop,
      ticks: [0, step, step * 2, chartTop],
    };
  }, [data]);

  return (
    <section
      className={`min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:p-6 ${className}`}
    >
      <header className="mb-4 flex flex-wrap items-start justify-between gap-x-4 gap-y-2 sm:mb-5">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 sm:text-base">
            Revenue vs Expenses
          </h2>
          {activeSubtitle && (
            <p className="mt-0.5 text-xs text-slate-400 sm:text-sm">{activeSubtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-4">
          <LegendItem color={REVENUE_COLOR} label="Revenue" />
          <LegendItem color={EXPENSE_COLOR} label="Expenses" />
        </div>
      </header>

      {error && (
        <p role="alert" className="mb-3 text-xs text-amber-700">
          {hasLoaded
            ? `Refresh failed: ${error}. Showing the latest loaded data.`
            : error}
        </p>
      )}

      {hasData ? (
        <div className={`w-full ${compact ? "h-32 sm:h-36" : "h-56 sm:h-64"}`}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id={revenueFill} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={REVENUE_COLOR} stopOpacity={0.1} />
                  <stop offset="100%" stopColor={REVENUE_COLOR} stopOpacity={0} />
                </linearGradient>
                <linearGradient id={expenseFill} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={EXPENSE_COLOR} stopOpacity={0.12} />
                  <stop offset="100%" stopColor={EXPENSE_COLOR} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#eef0f6" strokeDasharray="3 3" />
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
                tickFormatter={formatAxisCurrency}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                width={54}
              />
              <Tooltip
                content={<ChartTooltip />}
                cursor={{ stroke: "#d1d5db", strokeWidth: 1 }}
              />
              <Area
                type="monotone"
                dataKey="expenses"
                name="Expenses"
                stroke={EXPENSE_COLOR}
                strokeWidth={2}
                fill={`url(#${expenseFill})`}
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
      ) : (
        <div
          aria-live="polite"
          className="flex h-56 items-center justify-center text-sm text-slate-400"
        >
          {loading && !hasLoaded
            ? "Loading revenue and expense data…"
            : error && !hasLoaded
              ? "Revenue and expense data could not be loaded."
              : "No revenue or expense data available."}
        </div>
      )}
    </section>
  );
}