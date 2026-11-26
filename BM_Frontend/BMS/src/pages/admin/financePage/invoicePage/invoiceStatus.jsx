import { useMemo } from "react";
import { CreditCard, DollarSign, TrendingDown, TrendingUp } from "lucide-react";
import FinanceStatusCard from "../FinanceStatusCard.jsx";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const invoiceCards = [
  { id: "invoiced", label: "Total Invoiced", icon: TrendingUp, tone: "violet" },
  { id: "paid", label: "Paid Invoices", icon: TrendingDown, tone: "emerald" },
  { id: "outstanding", label: "Outstanding", icon: CreditCard, tone: "amber" },
  { id: "overdue", label: "Overdue", icon: DollarSign, tone: "red" },
];

const badgeClassNames = {
  violet: "bg-violet-50 text-violet-700",
  emerald: "bg-emerald-50 text-emerald-700",
  amber: "bg-amber-50 text-amber-700",
  red: "bg-red-50 text-red-700",
};

const getAmount = (value) => {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
};

const getCalendarDate = (value) => {
  if (typeof value === "string") {
    const [year, month, day] = value.slice(0, 10).split("-").map(Number);
    if (year && month && day) return new Date(year, month - 1, day);
  }

  const date = new Date(value || "");
  return Number.isNaN(date.getTime())
    ? null
    : new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

const getInvoiceMetrics = (invoices) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return invoices.reduce(
    (metrics, invoice) => {
      const status = String(invoice.status || "").toUpperCase();
      if (status === "DRAFT" || status === "CANCELLED") return metrics;

      const totalAmount = Math.max(getAmount(invoice.totalAmount), 0);
      const paidAmount = Math.min(
        Math.max(getAmount(invoice.paidAmount), 0),
        totalAmount,
      );
      const balance = Math.max(totalAmount - paidAmount, 0);
      const dueDate = getCalendarDate(invoice.dueDate);
      const isOverdue =
        balance > 0 &&
        (status === "OVERDUE" || (dueDate !== null && dueDate < today));
      const isPaid = status === "PAID" || (totalAmount > 0 && balance === 0);

      metrics.invoiced.amount += totalAmount;
      metrics.invoiced.count += 1;
      metrics.paid.amount += paidAmount;
      if (isPaid) metrics.paid.count += 1;

      if (balance > 0) {
        const bucket = isOverdue ? metrics.overdue : metrics.outstanding;
        bucket.amount += balance;
        bucket.count += 1;
      }

      return metrics;
    },
    {
      invoiced: { amount: 0, count: 0 },
      paid: { amount: 0, count: 0 },
      outstanding: { amount: 0, count: 0 },
      overdue: { amount: 0, count: 0 },
    },
  );
};

const formatInvoiceCount = (count) =>
  `${count.toLocaleString("en-IN")} ${count === 1 ? "invoice" : "invoices"}`;

export default function InvoiceStatus({ invoices }) {
  const metrics = useMemo(() => getInvoiceMetrics(invoices), [invoices]);

  return (
    <section aria-label="Invoice summary">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {invoiceCards.map(({ id, label, icon, tone }) => (
          <FinanceStatusCard
            key={id}
            label={label}
            icon={icon}
            value={currencyFormatter.format(metrics[id].amount)}
            footer={
              <span
                className={`inline-flex rounded-full px-2 py-1 font-medium ${badgeClassNames[tone]}`}
              >
                {formatInvoiceCount(metrics[id].count)}
              </span>
            }
          />
        ))}
      </div>
    </section>
  );
}