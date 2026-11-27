import { useMemo, useState, type ChangeEvent } from "react";
import { Download, Eye, Search } from "lucide-react";
import FinanceTable from "../FinanceTable.jsx";

interface PaymentParty {
  _id?: string;
  username?: string;
  name?: string;
  email?: string;
}

interface PaymentInvoiceRef {
  _id?: string;
  invoiceNumber?: string;
  status?: string;
}

export interface PaymentRecord {
  _id?: string;
  amount?: number | string;
  paymentMethod?: string;
  paymentDate?: string;
  status?: string;
  transactionId?: string;
  notes?: string;
  customerId?: string | PaymentParty;
  invoiceId?: string | PaymentInvoiceRef;
}

const PAGE_SIZE = 8;

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  month: "short",
  day: "2-digit",
  year: "numeric",
});

const STATUS_OPTIONS = [
  { value: "completed", label: "Completed" },
  { value: "pending", label: "Pending" },
  { value: "refunded", label: "Refunded" },
  { value: "failed", label: "Failed" },
];

const STATUS_STYLES: Record<string, string> = {
  completed: "bg-emerald-50 text-emerald-700",
  pending: "bg-amber-50 text-amber-700",
  refunded: "bg-slate-100 text-slate-600",
  failed: "bg-red-50 text-red-700",
};

const PAYMENT_METHODS = [
  { value: "bank_transfer", label: "Bank transfer" },
  { value: "credit_card", label: "Credit card" },
  { value: "debit_card", label: "Debit card" },
  { value: "cash", label: "Cash" },
  { value: "cheque", label: "Cheque" },
  { value: "other", label: "Other" },
];

const inputClassName =
  "h-10 min-w-0 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-600 outline-none focus:border-violet-400";

const getDate = (value?: string) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const getCustomerName = (customer?: string | PaymentParty) =>
  typeof customer === "string"
    ? "Customer"
    : customer?.username || customer?.name || customer?.email || "Customer";

const getInvoiceNumber = (invoice?: string | PaymentInvoiceRef) =>
  typeof invoice === "string" ? "—" : invoice?.invoiceNumber || "—";

const getInvoiceStatus = (invoice?: string | PaymentInvoiceRef) =>
  typeof invoice === "string" ? "" : invoice?.status || "";

const getPaymentId = (payment: PaymentRecord) =>
  payment.transactionId ||
  (payment._id ? payment._id.slice(-8).toUpperCase() : "—");

const getStatus = (payment: PaymentRecord) =>
  String(payment.status || "pending").toLowerCase();

const getMethodLabel = (method?: string) =>
  PAYMENT_METHODS.find((option) => option.value === method)?.label ||
  method ||
  "—";

const formatDate = (value?: string) => {
  const date = getDate(value);
  return date ? dateFormatter.format(date) : "—";
};

const escapeCsvCell = (value: unknown) => {
  const text = String(value ?? "");
  const safeText = /^[\s]*[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${safeText.replace(/"/g, '""')}"`;
};

export default function PaymentsTable({
  payments,
}: {
  payments: PaymentRecord[];
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [methodFilter, setMethodFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(
    null,
  );

  const filteredPayments = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase();
    const from = dateFrom ? getDate(dateFrom) : null;
    const to = dateTo ? getDate(dateTo) : null;
    if (to) to.setHours(23, 59, 59, 999);

    return payments.filter((payment) => {
      const customer = getCustomerName(payment.customerId);
      const invoice = getInvoiceNumber(payment.invoiceId);
      const matchesSearch =
        !normalizedSearch ||
        [getPaymentId(payment), customer, invoice]
          .some((value) => value.toLocaleLowerCase().includes(normalizedSearch));
      const matchesStatus =
        !statusFilter || getStatus(payment) === statusFilter;
      const matchesMethod =
        !methodFilter || payment.paymentMethod === methodFilter;
      const paymentDate = getDate(payment.paymentDate);

      return (
        matchesSearch &&
        matchesStatus &&
        matchesMethod &&
        (!from || (paymentDate !== null && paymentDate >= from)) &&
        (!to || (paymentDate !== null && paymentDate <= to))
      );
    });
  }, [dateFrom, dateTo, methodFilter, payments, search, statusFilter]);

  const totalPages = Math.max(Math.ceil(filteredPayments.length / PAGE_SIZE), 1);
  const currentPage = Math.min(page, totalPages);
  const pagePayments = filteredPayments.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );
  const firstRow = filteredPayments.length ? (currentPage - 1) * PAGE_SIZE + 1 : 0;
  const lastRow = Math.min(currentPage * PAGE_SIZE, filteredPayments.length);

  const updateFilter =
    (setter: (value: string) => void) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setter(event.target.value);
      setPage(1);
    };

  const handleExport = () => {
    const headers = [
      "Payment ID",
      "Customer",
      "Invoice",
      "Amount",
      "Method",
      "Date",
      "Status",
    ];
    const rows = filteredPayments.map((payment) => [
      getPaymentId(payment),
      getCustomerName(payment.customerId),
      getInvoiceNumber(payment.invoiceId),
      Number(payment.amount) || 0,
      getMethodLabel(payment.paymentMethod),
      formatDate(payment.paymentDate),
      getStatus(payment),
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCsvCell).join(","))
      .join("\r\n");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "payments.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <FinanceTable
        toolbar={
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-[minmax(180px,1fr)_auto_auto_auto_auto_auto]">
            <label className="relative min-w-0">
              <Search
                aria-hidden="true"
                className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
              />
              <span className="sr-only">Search payments or customers</span>
              <input
                type="search"
                value={search}
                onChange={updateFilter(setSearch)}
                placeholder="Search payment or customer..."
                className={`${inputClassName} w-full pl-9`}
              />
            </label>

            <label>
              <span className="sr-only">Filter by payment status</span>
              <select
                value={statusFilter}
                onChange={updateFilter(setStatusFilter)}
                className={inputClassName}
              >
                <option value="">All Statuses</option>
                {STATUS_OPTIONS.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className="sr-only">Filter by payment method</span>
              <select
                value={methodFilter}
                onChange={updateFilter(setMethodFilter)}
                className={inputClassName}
              >
                <option value="">All Methods</option>
                {PAYMENT_METHODS.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className="sr-only">Payment date from</span>
              <input
                type="date"
                aria-label="Payment date from"
                value={dateFrom}
                max={dateTo || undefined}
                onChange={updateFilter(setDateFrom)}
                className={inputClassName}
              />
            </label>

            <label>
              <span className="sr-only">Payment date to</span>
              <input
                type="date"
                aria-label="Payment date to"
                value={dateTo}
                min={dateFrom || undefined}
                onChange={updateFilter(setDateTo)}
                className={inputClassName}
              />
            </label>

            <button
              type="button"
              onClick={handleExport}
              className={`${inputClassName} cursor-pointer inline-flex items-center justify-center gap-2 hover:bg-slate-50`}
            >
              Export
              <Download aria-hidden="true" className="size-4" />
            </button>
          </div>
        }
        columns={[
          { label: "Payment ID" },
          { label: "Customer / Invoice" },
          { label: "Amount" },
          { label: "Method" },
          { label: "Date" },
          { label: "Transaction status" },
          { label: "Action", align: "right" },
        ]}
        hasRows={pagePayments.length > 0}
        emptyMessage="No payments match your filters."
        firstRow={firstRow}
        lastRow={lastRow}
        totalRows={filteredPayments.length}
        itemLabel="payments"
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setPage}
      >
        {pagePayments.map((payment) => {
          const status = getStatus(payment);
          const customer = payment.customerId;
          const email = typeof customer === "string" ? "" : customer?.email;

          return (
            <tr key={payment._id || payment.transactionId}>
              <td className="whitespace-nowrap px-4 py-4 font-medium text-slate-900">
                {getPaymentId(payment)}
              </td>
              <td className="px-4 py-4">
                <p className="font-medium text-slate-700">
                  {getCustomerName(customer)}
                </p>
                {email && (
                  <p className="mt-1 text-[10px] text-slate-400">{email}</p>
                )}
                <p className="mt-1 text-[10px] text-slate-400">
                  {getInvoiceNumber(payment.invoiceId)}
                </p>
                {getInvoiceStatus(payment.invoiceId) && (
                  <p className="mt-1 text-[10px] text-slate-500">
                    Invoice:{" "}
                    {getInvoiceStatus(payment.invoiceId)
                      .toLowerCase()
                      .replaceAll("_", " ")}
                  </p>
                )}
              </td>
              <td className="whitespace-nowrap px-4 py-4 text-slate-700">
                {currencyFormatter.format(Number(payment.amount) || 0)}
              </td>
              <td className="whitespace-nowrap px-4 py-4 text-slate-600">
                {getMethodLabel(payment.paymentMethod)}
              </td>
              <td className="whitespace-nowrap px-4 py-4 text-slate-600">
                {formatDate(payment.paymentDate)}
              </td>
              <td className="px-4 py-4">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-1 font-medium ${
                    STATUS_STYLES[status] || STATUS_STYLES.pending
                  }`}
                >
                  <span aria-hidden="true">•</span>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
              </td>
              <td className="px-4 py-4 text-right">
                <button
                  type="button"
                  aria-label={`View payment ${getPaymentId(payment)}`}
                  onClick={() => setSelectedPayment(payment)}
                  className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-violet-700 cursor-pointer"
                >
                  <Eye aria-hidden="true" className="size-4" />
                </button>
              </td>
            </tr>
          );
        })}
      </FinanceTable>

      {selectedPayment && (
        <div
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedPayment(null);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="payment-details-title"
            className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id="payment-details-title"
                  className="text-lg font-semibold text-slate-900"
                >
                  Payment {getPaymentId(selectedPayment)}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {getCustomerName(selectedPayment.customerId)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPayment(null)}
                className="cursor-pointer rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
            <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-slate-500">Invoice</dt>
                <dd className="mt-1 font-medium text-slate-900">
                  {getInvoiceNumber(selectedPayment.invoiceId)}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Amount</dt>
                <dd className="mt-1 font-medium text-slate-900">
                  {currencyFormatter.format(Number(selectedPayment.amount) || 0)}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Method</dt>
                <dd className="mt-1 font-medium text-slate-900">
                  {getMethodLabel(selectedPayment.paymentMethod)}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Date</dt>
                <dd className="mt-1 font-medium text-slate-900">
                  {formatDate(selectedPayment.paymentDate)}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Status</dt>
                <dd className="mt-1 font-medium text-slate-900">
                  {getStatus(selectedPayment)}
                </dd>
              </div>
              {selectedPayment.notes && (
                <div className="col-span-2">
                  <dt className="text-slate-500">Notes</dt>
                  <dd className="mt-1 font-medium text-slate-900">
                    {selectedPayment.notes}
                  </dd>
                </div>
              )}
            </dl>
          </section>
        </div>
      )}
    </>
  );
}