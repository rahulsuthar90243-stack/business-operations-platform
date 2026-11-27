import { useEffect, useMemo, useState } from "react";
import {
  BadgePercent,
  CreditCard,
  Plus,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import FinanceStatusCard from "../FinanceStatusCard.jsx";
import { getInvoices, getPayments } from "../../../../services/financeService.js";
import { getPaymentStatusMetrics } from "./paymentsStatus.ts";
import type { PaymentInvoice } from "./paymentsStatus";
import PaymentsTable, { type PaymentRecord } from "./paymentsTable";
import PaymentForm from "./patmentForm";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default function PaymentsPage() {
  const [invoices, setInvoices] = useState<PaymentInvoice[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [isPaymentFormOpen, setIsPaymentFormOpen] = useState(false);

  useEffect(() => {
    let active = true;

    const loadInvoices = async () => {
      setLoading(true);
      setError("");

      try {
        const [invoiceResult, paymentResult] = await Promise.all([
          getInvoices(),
          getPayments(),
        ]);
        if (!Array.isArray(invoiceResult) || !Array.isArray(paymentResult)) {
          throw new Error("Payment data was not returned in the expected format.");
        }
        if (active) {
          setInvoices(invoiceResult as PaymentInvoice[]);
          setPayments(paymentResult as PaymentRecord[]);
          setHasLoaded(true);
        }
      } catch (requestError) {
        if (active) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Unable to load payment data.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadInvoices();
    const intervalId = window.setInterval(loadInvoices, 60_000);

    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [refreshKey]);

  const metrics = useMemo(() => getPaymentStatusMetrics(invoices), [invoices]);

  return (
    <div className="mx-auto flex w-full min-w-0 flex-col gap-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">
            Payments
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Track incoming payments and keep your books up to date.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsPaymentFormOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-3.5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-violet-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600 cursor-pointer"
        >
          <Plus aria-hidden="true" className="size-4" />
          Record Payment
        </button>
      </header>

      {loading && !hasLoaded ? (
        <section
          aria-live="polite"
          className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500"
        >
          Loading payment data…
        </section>
      ) : error && !hasLoaded ? (
        <section
          role="alert"
          className="rounded-xl border border-red-200 bg-white p-5 text-sm text-red-700"
        >
          <p className="font-semibold">Payment data could not be loaded.</p>
          <p className="mt-1">{error}</p>
          <button
            type="button"
            onClick={() => setRefreshKey((key) => key + 1)}
            className="mt-3 rounded-lg bg-violet-600 px-4 py-2 font-medium text-white hover:bg-violet-700"
          >
            Try again
          </button>
        </section>
      ) : (
        <>
          {error && (
            <p
              role="alert"
              className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
            >
              Refresh failed: {error}. Showing the last loaded data.
            </p>
          )}
          <section aria-label="Payment summary">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <FinanceStatusCard
                label="Total Collected"
                value={currencyFormatter.format(metrics.collected.amount)}
                icon={TrendingUp}
                footer={
                  <span className="inline-flex rounded-full bg-emerald-50 px-2 py-1 font-medium text-emerald-700">
                    {metrics.collected.count}{" "}
                    {metrics.collected.count === 1 ? "payment" : "payments"}
                  </span>
                }
              />
              <FinanceStatusCard
                label="Pending Payments"
                value={currencyFormatter.format(metrics.pending.amount)}
                icon={TrendingDown}
                footer={
                  <span className="inline-flex rounded-full bg-amber-50 px-2 py-1 font-medium text-amber-700">
                    {metrics.pending.count}{" "}
                    {metrics.pending.count === 1 ? "invoice" : "invoices"}
                  </span>
                }
              />
              <FinanceStatusCard
                label="Refunded"
                value="—"
                icon={CreditCard}
                footer={
                  <span className="inline-flex rounded-full bg-slate-100 px-2 py-1 font-medium text-slate-600">
                    Refund data unavailable
                  </span>
                }
              />
              <FinanceStatusCard
                label="Success Rate"
                value={`${metrics.successRate.rate.toFixed(1)}%`}
                icon={BadgePercent}
                footer={
                  <span className="inline-flex rounded-full bg-violet-50 px-2 py-1 font-medium text-violet-700">
                    {metrics.successRate.paidCount} of{" "}
                    {metrics.successRate.invoiceCount} invoices paid
                  </span>
                }
              />
            </div>
          </section>
          <PaymentsTable payments={payments} />
        </>
      )}

      {isPaymentFormOpen && (
        <PaymentForm
          onClose={() => setIsPaymentFormOpen(false)}
          onSaved={() => {
            setIsPaymentFormOpen(false);
            setRefreshKey((key) => key + 1);
          }}
        />
      )}

    </div>
  );
}
