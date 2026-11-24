import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { getFinanceDashboardData } from "../../../services/financeService.js";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatDate = (value) => {
  const date = new Date(value || "");
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("en-IN", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      });
};

const getRecordDate = (record, dateField) =>
  new Date(record[dateField] || record.createdAt || "");

const formatStatus = (status, fallback) => {
  if (!status) return fallback;
  return status
    .toLowerCase()
    .split(/[_\s]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const statusClassName = (status) => {
  const normalized = status.toLowerCase();
  if (["completed", "paid", "approved", "recorded"].includes(normalized)) {
    return "bg-emerald-50 text-emerald-700";
  }
  if (["pending", "partially paid", "unpaid", "overdue"].includes(normalized)) {
    return "bg-amber-50 text-amber-700";
  }
  if (["rejected", "failed", "cancelled"].includes(normalized)) {
    return "bg-red-50 text-red-700";
  }
  return "bg-slate-100 text-slate-600";
};

const getCustomerName = (customer) =>
  typeof customer === "string"
    ? "Customer"
    : customer?.username || customer?.name || "Customer";

function createTransactions({ revenues, expenses, invoices }) {
  const revenueRows = revenues.map((revenue) => ({
    id: `revenue-${revenue._id}`,
    type: "Revenue",
    title: [revenue.category, revenue.title].filter(Boolean).join(" · "),
    amount: Number(revenue.amount),
    date: getRecordDate(revenue, "revenueDate"),
    status: "Recorded",
    to: "/admin/finance/revenue",
  }));

  const expenseRows = expenses.map((expense) => ({
    id: `expense-${expense._id}`,
    type: "Expense",
    title: [expense.category, expense.title].filter(Boolean).join(" · "),
    amount: -Math.abs(Number(expense.amount)),
    date: getRecordDate(expense, "expenseDate"),
    status: formatStatus(expense.status, "Recorded"),
    to: "/admin/finance/expenses",
  }));

  const paymentRows = invoices
    .filter((invoice) => Number(invoice.paidAmount) > 0)
    .map((invoice) => ({
      id: `payment-${invoice._id}`,
      type: "Payment",
      title: `${getCustomerName(invoice.customerId)} · ${invoice.invoiceNumber || "Invoice"}`,
      amount: Number(invoice.paidAmount),
      date: getRecordDate(invoice, "invoiceDate"),
      status: "Completed",
      to: "/admin/finance/payments",
    }));

  return [...revenueRows, ...expenseRows, ...paymentRows]
    .filter(
      (transaction) =>
        Number.isFinite(transaction.amount) &&
        !Number.isNaN(transaction.date.getTime()),
    )
    .sort((first, second) => second.date.getTime() - first.date.getTime())
    .slice(0, 5);
}

export default function RecentTransaction() {
  const [data, setData] = useState({
    revenues: [],
    expenses: [],
    invoices: [],
  });
  const [hasLoaded, setHasLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    let isFetching = false;

    const loadTransactions = async () => {
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
          setError(requestError.message || "Unable to load recent transactions.");
        }
      } finally {
        isFetching = false;
        if (active) setLoading(false);
      }
    };

    loadTransactions();
    const intervalId = window.setInterval(loadTransactions, 60_000);

    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, []);

  const transactions = useMemo(() => createTransactions(data), [data]);

  return (
    <section className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-4 sm:px-5">
        <h2 className="text-sm font-semibold text-slate-900">
          Recent Transactions
        </h2>
        <p className="text-[11px] text-slate-400">
          Latest activity across your accounts
        </p>
      </header>

      {error && (
        <p
          role={hasLoaded ? "status" : "alert"}
          className="px-4 pt-3 text-xs text-amber-700 sm:px-5"
        >
          {hasLoaded
            ? `Refresh failed: ${error}. Showing the latest loaded data.`
            : error}
        </p>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] table-fixed text-left text-xs">
          <thead className="bg-slate-50 text-[10px] font-medium uppercase tracking-wide text-slate-500">
            <tr>
              <th className="w-[14%] px-3 py-3 sm:px-4">Transaction type</th>
              <th className="w-[30%] px-3 py-3 sm:px-4">Title</th>
              <th className="w-[14%] px-3 py-3 text-right sm:px-4">Amount</th>
              <th className="w-[14%] px-3 py-3 sm:px-4">Date</th>
              <th className="w-[14%] px-3 py-3 sm:px-4">Status</th>
              <th className="w-[14%] px-3 py-3 sm:px-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-600">
            {loading && !hasLoaded ? (
              <tr>
                <td colSpan="6" className="px-4 py-8 text-center text-slate-400">
                  Loading recent transactions…
                </td>
              </tr>
            ) : transactions.length > 0 ? (
              transactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-slate-50/70">
                  <td className="truncate px-3 py-3.5 sm:px-4">
                    {transaction.type}
                  </td>
                  <td
                    className="truncate px-3 py-3.5 sm:px-4"
                    title={transaction.title}
                  >
                    {transaction.title || "—"}
                  </td>
                  <td
                    className={`whitespace-nowrap px-3 py-3.5 text-right font-semibold sm:px-4 ${
                      transaction.amount > 0 ? "text-emerald-600" : "text-slate-800"
                    }`}
                  >
                    {transaction.amount > 0 ? "+" : "−"}
                    {currencyFormatter.format(Math.abs(transaction.amount))}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3.5 sm:px-4">
                    {formatDate(transaction.date)}
                  </td>
                  <td className="px-3 py-3.5 sm:px-4">
                    <span
                      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-1 text-[10px] font-medium ${statusClassName(
                        transaction.status,
                      )}`}
                    >
                      <span
                        aria-hidden="true"
                        className="size-1.5 rounded-full bg-current"
                      />
                      {transaction.status}
                    </span>
                  </td>
                  <td className="px-3 py-3.5 sm:px-4">
                    <Link
                      to={transaction.to}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-violet-600 hover:text-violet-800"
                    >
                      View
                      <ArrowUpRight aria-hidden="true" className="size-3" />
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-4 py-8 text-center text-slate-400">
                  {error ? "Transactions unavailable" : "No recent transactions"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <footer className="border-t border-slate-100 px-4 py-3 text-[10px] text-slate-400 sm:px-5">
        Showing the {transactions.length} most recent transaction
        {transactions.length === 1 ? "" : "s"}
      </footer>
    </section>
  );
}