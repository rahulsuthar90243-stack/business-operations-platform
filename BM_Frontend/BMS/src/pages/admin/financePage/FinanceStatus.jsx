import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CreditCard,
  DollarSign,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import FinanceStatusCard from "./FinanceStatusCard.jsx";
import { getFinanceDashboardData } from "../../../services/financeService.js";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });

const formatCurrency = (amount) => {
  const numericAmount = Number(amount);
  return Number.isFinite(numericAmount)
    ? currencyFormatter.format(numericAmount)
    : "—";
};

//This function returns the current month.
const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

// The function's purpose is to extract the date from a financial record.
const getRecordDate = (record, field) => {
  const date = new Date(record[field] || record.createdAt || "");
  return Number.isNaN(date.getTime()) ? null : date;
};

//Calculating the total amount for the records of the selected month.
const sumByMonth = (records, dateField, amountField, monthDate) =>
  records.reduce((sum, record) => {
    const date = getRecordDate(record, dateField);
    const amount = Number(record[amountField]);

    return date &&
      date.getFullYear() === monthDate.getFullYear() &&
      date.getMonth() === monthDate.getMonth() &&
      Number.isFinite(amount)
      ? sum + amount
      : sum;
  }, 0);

  //This function calculates the percentage difference between the current month and the previous month.
const getMonthChange = (current, previous) => {
  if (previous === 0) return current === 0 ? 0 : null;
  return ((current - previous) / Math.abs(previous)) * 100;
};

const statusCards = [
  { id: "revenue", label: "Total Revenue", icon: TrendingUp },
  { id: "expenses", label: "Total Expenses", icon: TrendingDown },
  { id: "payments", label: "Total Payments", icon: CreditCard },
  { id: "netProfit", label: "Net Profit", icon: DollarSign },
];

export default function FinanceStatus({ selectedMonth, onMonthChange }) {
  const [internalMonth, setInternalMonth] = useState(getCurrentMonth);
  const [data, setData] = useState({ revenues: [], expenses: [], invoices: [] });
  const [hasLoaded, setHasLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const month = selectedMonth ?? internalMonth;
  const monthDate = useMemo(() => {
    const [year, monthNumber] = month.split("-").map(Number);
    return new Date(year, monthNumber - 1, 1);
  }, [month]);
  const previousMonth = useMemo(
    () => new Date(monthDate.getFullYear(), monthDate.getMonth() - 1, 1),
    [monthDate],
  );

  useEffect(() => {
    let active = true;
    let isFetching = false;

    const refreshData = async () => {
      if (isFetching) return;
      isFetching = true;
      setLoading(true);
      setError("");

      try {
        const financeData = await getFinanceDashboardData();
        if (active) {
          setData(financeData);
          setHasLoaded(true);
        }
      } catch (requestError) {
        if (active) {
          setError(requestError.message || "Unable to load finance data.");
        }
      } finally {
        isFetching = false;
        if (active) setLoading(false);
      }
    };

    refreshData();
    const intervalId = window.setInterval(refreshData, 60_000);

    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [refreshKey]);

  const currentMetrics = useMemo(() => {
    const revenue = sumByMonth(data.revenues, "revenueDate", "amount", monthDate);
    const expenses = sumByMonth(data.expenses, "expenseDate", "amount", monthDate);

    return {
      revenue,
      expenses,
      payments: sumByMonth(data.invoices, "invoiceDate", "paidAmount", monthDate),
      netProfit: revenue - expenses,
    };
  }, [data, monthDate]);

  const previousMetrics = useMemo(() => {
    const revenue = sumByMonth(data.revenues, "revenueDate", "amount", previousMonth);
    const expenses = sumByMonth(data.expenses, "expenseDate", "amount", previousMonth);

    return {
      revenue,
      expenses,
      payments: sumByMonth(
        data.invoices,
        "invoiceDate",
        "paidAmount",
        previousMonth,
      ),
      netProfit: revenue - expenses,
    };
  }, [data, previousMonth]);

  const handleMonthChange = (event) => {
    const nextMonth = event.target.value;
    setInternalMonth(nextMonth);
    onMonthChange?.(nextMonth);
  };

  if (loading && !hasLoaded) {
    return (
      <section
        aria-live="polite"
        className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500"
      >
        Loading finance data…
      </section>
    );
  }

  if (error && !hasLoaded) {
    return (
      <section
        role="alert"
        className="rounded-xl border border-red-200 bg-white p-5 text-sm text-red-700"
      >
        <p className="font-semibold">Finance data could not be loaded.</p>
        <p className="mt-1">{error}</p>
        <button
          type="button"
          onClick={() => setRefreshKey((key) => key + 1)}
          className="mt-3 rounded-lg bg-violet-600 px-4 py-2 font-medium text-white hover:bg-violet-700"
        >
          Try again
        </button>
      </section>
    );
  }

  return (
    <section aria-labelledby="finance-dashboard-title" className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1
            id="finance-dashboard-title"
            className="text-xl font-semibold tracking-tight text-slate-900"
          >
            Finance Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Track revenue, expenses, and the financial health of your business.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-600 shadow-sm">
            <CalendarDays aria-hidden="true" className="size-4 text-slate-500" />
            <span className="sr-only">Select dashboard month</span>
            <input
              type="month"
              value={month}
              onChange={handleMonthChange}
              className="min-w-0 bg-transparent outline-none"
            />
          </label>
        </div>
      </header>

      {error && (
        <p role="alert" className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Refresh failed: {error}. Showing the last loaded data.
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statusCards.map(({ id, label, icon }) => {
          const change = getMonthChange(currentMetrics[id], previousMetrics[id]);
          const isFavorable =
            id === "expenses" ? (change ?? 0) <= 0 : (change ?? 0) >= 0;

          return (
            <FinanceStatusCard
              key={id}
              label={label}
              icon={icon}
              value={formatCurrency(currentMetrics[id])}
              change={change}
              favorable={isFavorable}
            />
          );
        })}
      </div>
    </section>
  );
}