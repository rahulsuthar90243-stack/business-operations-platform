import { useEffect, useMemo, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { getRevenues } from "../../../services/financeService.js";

const CATEGORY_COLORS = [
  "#7c3aed",
  "#9b6bff",
  "#b99aff",
  "#d1bfff",
  "#e8ddff",
];

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

const getCurrentMonth = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
};

const getRevenueDate = (revenue) => {
  const date = new Date(revenue.revenueDate || revenue.createdAt || "");
  return Number.isNaN(date.getTime()) ? null : date;
};

function RevenueTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-md">
      <p className="font-medium text-slate-900">{payload[0].name}</p>
      <p className="mt-0.5 text-slate-500">{formatCurrency(payload[0].value)}</p>
    </div>
  );
}

export default function RevenueCategory({ selectedMonth }) {
  const [revenues, setRevenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    let isFetching = false;

    const loadRevenues = async () => {
      if (isFetching) return;
      isFetching = true;
      setLoading(true);
      setError("");

      try {
        const result = await getRevenues();
        if (active) {
          setRevenues(Array.isArray(result) ? result : []);
          setHasLoaded(true);
        }
      } catch (requestError) {
        if (active) {
          setError(requestError.message || "Unable to load revenue data.");
        }
      } finally {
        isFetching = false;
        if (active) setLoading(false);
      }
    };

    loadRevenues();
    const intervalId = window.setInterval(loadRevenues, 60_000);

    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, []);

  const monthDate = useMemo(() => {
    if (!selectedMonth) return getCurrentMonth();
    const [year, month] = selectedMonth.split("-").map(Number);
    return new Date(year, month - 1, 1);
  }, [selectedMonth]);

  const categoryData = useMemo(() => {
    const totals = new Map();
    revenues.forEach((revenue) => {
      const date = getRevenueDate(revenue);
      const amount = Number(revenue.amount);
      if (
        !date ||
        date.getFullYear() !== monthDate.getFullYear() ||
        date.getMonth() !== monthDate.getMonth() ||
        !Number.isFinite(amount) ||
        amount <= 0
      ) {
        return;
      }

      const name = revenue.category?.trim() || "Other";
      totals.set(name, (totals.get(name) ?? 0) + amount);
    });

    return Array.from(totals, ([name, value]) => ({ name, value })).sort(
      (first, second) => second.value - first.value,
    );
  }, [revenues, monthDate]);

  const total = categoryData.reduce((sum, category) => sum + category.value, 0);
  const isCurrentMonth =
    monthDate.getFullYear() === new Date().getFullYear() &&
    monthDate.getMonth() === new Date().getMonth();
  const monthLabel = isCurrentMonth
    ? "This month"
    : monthDate.toLocaleString("en-IN", { month: "short", year: "numeric" });

  if (loading && !hasLoaded) {
    return (
      <section
        aria-live="polite"
        className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
      >
        <h2 className="text-sm font-semibold text-slate-900">Revenue Sources</h2>
        <p className="mt-4 text-center text-xs text-slate-400">
          Loading revenue data…
        </p>
      </section>
    );
  }

  return (
    <section className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <h2 className="text-sm font-semibold text-slate-900">Revenue Sources</h2>

      {error && (
        <p role="alert" className="mt-2 text-xs text-amber-700">
          {hasLoaded
            ? `Refresh failed: ${error}. Showing the latest loaded data.`
            : error}
        </p>
      )}

      <div className="mt-2 grid grid-cols-1 items-center gap-2 sm:grid-cols-[minmax(120px,1fr)_minmax(90px,1fr)]">
        <div className="relative mx-auto h-36 w-full max-w-44">
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="66%"
                  outerRadius="92%"
                  paddingAngle={2}
                  stroke="none"
                >
                  {categoryData.map((category, index) => (
                    <Cell
                      key={category.name}
                      fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<RevenueTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="absolute inset-3 rounded-full border-[18px] border-slate-100" />
          )}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-sm font-semibold text-slate-900">
              {formatCurrency(total)}
            </span>
            <span className="mt-0.5 text-[10px] text-slate-400">{monthLabel}</span>
          </div>
        </div>

        <ul className="space-y-2">
          {categoryData.length > 0 ? (
            categoryData.slice(0, 5).map((category, index) => (
              <li
                key={category.name}
                className="flex items-center justify-between gap-2 text-xs"
              >
                <span className="flex min-w-0 items-center gap-1.5 text-slate-500">
                  <span
                    aria-hidden="true"
                    className="size-2 shrink-0 rounded-full"
                    style={{
                      backgroundColor:
                        CATEGORY_COLORS[index % CATEGORY_COLORS.length],
                    }}
                  />
                  <span className="truncate">{category.name}</span>
                </span>
                <span className="shrink-0 font-medium text-slate-700">
                  {Math.round((category.value / total) * 100)}%
                </span>
              </li>
            ))
          ) : (
            <li className="text-xs text-slate-400">
              {error
                ? "Revenue sources unavailable"
                : "No revenue sources this month"}
            </li>
          )}
        </ul>
      </div>
    </section>
  );
}