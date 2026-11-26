import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Download, Eye, Pencil, Search, Trash2 } from "lucide-react";
import DeleteInvoice from "./deleteInvoice.jsx";

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

const getDate = (value) => {
  if (typeof value === "string") {
    const [year, month, day] = value.slice(0, 10).split("-").map(Number);
    if (year && month && day) return new Date(year, month - 1, day);
  }
  const date = new Date(value || "");
  return Number.isNaN(date.getTime()) ? null : date;
};

const getCustomerName = (customer) =>
  typeof customer === "string"
    ? "Customer"
    : customer?.username || customer?.name || customer?.email || "Customer";

const getCustomerId = (customer) =>
  typeof customer === "string" ? customer : customer?._id || customer?.id || "";

const getInvoiceStatus = (invoice) => {
  const status = String(invoice.status || "").toUpperCase();
  if (status === "DRAFT" || status === "CANCELLED") return status;

  const total = Number(invoice.totalAmount) || 0;
  const paid = Number(invoice.paidAmount) || 0;
  const balance = Math.max(total - paid, 0);

  if (status === "PAID" || (total > 0 && balance === 0)) return "PAID";

  const dueDate = getDate(invoice.dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (
    balance > 0 &&
    (status === "OVERDUE" || (dueDate !== null && dueDate < today))
  ) {
    return "OVERDUE";
  }

  return paid > 0 ? "PARTIALLY_PAID" : "UNPAID";
};

const STATUS_OPTIONS = [
  { value: "PAID", label: "Paid" },
  { value: "UNPAID", label: "Pending" },
  { value: "PARTIALLY_PAID", label: "Partially paid" },
  { value: "OVERDUE", label: "Overdue" },
  { value: "DRAFT", label: "Draft" },
  { value: "CANCELLED", label: "Cancelled" },
];

const STATUS_STYLES = {
  PAID: "bg-emerald-50 text-emerald-700",
  UNPAID: "bg-amber-50 text-amber-700",
  PARTIALLY_PAID: "bg-amber-50 text-amber-700",
  OVERDUE: "bg-red-50 text-red-700",
  DRAFT: "bg-slate-100 text-slate-600",
  CANCELLED: "bg-slate-100 text-slate-600",
};

const STATUS_LABELS = Object.fromEntries(
  STATUS_OPTIONS.map(({ value, label }) => [value, label]),
);

const formatDate = (value) => {
  const date = getDate(value);
  return date ? dateFormatter.format(date) : "—";
};

const escapeCsvCell = (value) => {
  const text = String(value ?? "");
  const safeText = /^[\s]*[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${safeText.replace(/"/g, '""')}"`;
};

const inputClassName =
  "h-10 min-w-0 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-600 outline-none focus:border-violet-400";

export default function InvoiceTable({ invoices, onEditInvoice, onDeletedInvoice }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [customerFilter, setCustomerFilter] = useState("");
  const [issuedFrom, setIssuedFrom] = useState("");
  const [issuedTo, setIssuedTo] = useState("");
  const [page, setPage] = useState(1);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [invoiceToDelete, setInvoiceToDelete] = useState(null);

  const customers = useMemo(() => {
    const uniqueCustomers = new Map();
    invoices.forEach((invoice) => {
      const customer = invoice.customerId;
      const id = getCustomerId(customer);
      if (id && !uniqueCustomers.has(id)) {
        uniqueCustomers.set(id, getCustomerName(customer));
      }
    });
    return [...uniqueCustomers.entries()].map(([id, name]) => ({ id, name }));
  }, [invoices]);

  const filteredInvoices = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase();
    const from = issuedFrom ? getDate(issuedFrom) : null;
    const to = issuedTo ? getDate(issuedTo) : null;
    if (to) to.setHours(23, 59, 59, 999);

    return invoices.filter((invoice) => {
      const customer = getCustomerName(invoice.customerId);
      const matchesSearch =
        !normalizedSearch ||
        [invoice.invoiceNumber, customer, invoice.customerId?.email]
          .filter(Boolean)
          .some((value) =>
            String(value).toLocaleLowerCase().includes(normalizedSearch),
          );
      const matchesStatus =
        !statusFilter || getInvoiceStatus(invoice) === statusFilter;
      const matchesCustomer =
        !customerFilter || getCustomerId(invoice.customerId) === customerFilter;
      const issuedDate = getDate(invoice.invoiceDate || invoice.createdAt);
      const matchesFrom = !from || (issuedDate && issuedDate >= from);
      const matchesTo = !to || (issuedDate && issuedDate <= to);

      return (
        matchesSearch &&
        matchesStatus &&
        matchesCustomer &&
        matchesFrom &&
        matchesTo
      );
    });
  }, [customerFilter, invoices, issuedFrom, issuedTo, search, statusFilter]);

  const totalPages = Math.max(
    Math.ceil(filteredInvoices.length / PAGE_SIZE),
    1,
  );
  const currentPage = Math.min(page, Math.max(totalPages, 1));
  const pageInvoices = filteredInvoices.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );
  const firstRow = filteredInvoices.length
    ? (currentPage - 1) * PAGE_SIZE + 1
    : 0;
  const lastRow = Math.min(currentPage * PAGE_SIZE, filteredInvoices.length);

  const updateFilter = (setter) => (event) => {
    setter(event.target.value);
    setPage(1);
  };

  const handleExport = () => {
    const headers = [
      "Invoice",
      "Customer",
      "Amount",
      "Issued",
      "Due date",
      "Status",
    ];
    const rows = filteredInvoices.map((invoice) => [
      invoice.invoiceNumber || "",
      getCustomerName(invoice.customerId),
      Number(invoice.totalAmount) || 0,
      formatDate(invoice.invoiceDate || invoice.createdAt),
      formatDate(invoice.dueDate),
      STATUS_LABELS[getInvoiceStatus(invoice)] || getInvoiceStatus(invoice),
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCsvCell).join(","))
      .join("\r\n");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "invoices.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="grid grid-cols-1 gap-2 border-b border-slate-100 p-3 sm:grid-cols-2 lg:grid-cols-[minmax(180px,1fr)_auto_auto_auto_auto_auto]">
          <label className="relative min-w-0">
            <Search
              aria-hidden="true"
              className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
            />
            <span className="sr-only">Search invoices or customers</span>
            <input
              type="search"
              value={search}
              onChange={updateFilter(setSearch)}
              placeholder="Search invoice or customer..."
              className={`${inputClassName} w-full pl-9`}
            />
          </label>

          <label>
            <span className="sr-only">Filter by invoice status</span>
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
            <span className="sr-only">Filter by customer</span>
            <select
              value={customerFilter}
              onChange={updateFilter(setCustomerFilter)}
              className={inputClassName}
            >
              <option value="">All Customers</option>
              {customers.map(({ id, name }) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-2">
            <span className="sr-only">Issued from date</span>
            <input
              type="date"
              aria-label="Issued from date"
              value={issuedFrom}
              max={issuedTo || undefined}
              onChange={updateFilter(setIssuedFrom)}
              className={inputClassName}
            />
          </label>

          <label className="flex items-center gap-2">
            <span className="sr-only">Issued to date</span>
            <input
              type="date"
              aria-label="Issued to date"
              value={issuedTo}
              min={issuedFrom || undefined}
              onChange={updateFilter(setIssuedTo)}
              className={inputClassName}
            />
          </label>

          <button
            type="button"
            onClick={handleExport}
            className={`${inputClassName} inline-flex items-center justify-center gap-2 hover:bg-slate-50 cursor-pointer`}
          >
            Export
            <Download aria-hidden="true" className="size-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] text-left text-xs">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">
                  Invoice
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Customer
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Amount
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Issued
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Due date
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Status
                </th>
                <th scope="col" className="px-4 py-3 text-right font-medium">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pageInvoices.map((invoice) => {
                const status = getInvoiceStatus(invoice);
                return (
                  <tr key={invoice._id || invoice.invoiceNumber}>
                    <td className="whitespace-nowrap px-4 py-4 font-medium text-slate-900">
                      {invoice.invoiceNumber || "—"}
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-medium text-slate-700">
                        {getCustomerName(invoice.customerId)}
                      </p>
                      {invoice.customerId?.email && (
                        <p className="mt-1 text-[10px] text-slate-400">
                          {invoice.customerId.email}
                        </p>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-slate-700">
                      {currencyFormatter.format(Number(invoice.totalAmount) || 0)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-slate-600">
                      {formatDate(invoice.invoiceDate || invoice.createdAt)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-slate-600">
                      {formatDate(invoice.dueDate)}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-1 font-medium ${
                          STATUS_STYLES[status] || STATUS_STYLES.DRAFT
                        }`}
                      >
                        <span aria-hidden="true">•</span>
                        {STATUS_LABELS[status] || status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          aria-label={`View ${invoice.invoiceNumber || "invoice"}`}
                          onClick={() => setSelectedInvoice(invoice)}
                          className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-violet-700"
                        >
                          <Eye aria-hidden="true" className="size-4" />
                        </button>
                        {!["PAID", "CANCELLED"].includes(
                          getInvoiceStatus(invoice),
                        ) && (
                          <button
                            type="button"
                            aria-label={`Edit ${invoice.invoiceNumber || "invoice"}`}
                            onClick={() => onEditInvoice?.(invoice)}
                            className="rounded p-1 text-slate-500 hover:bg-violet-50 hover:text-violet-700"
                          >
                            <Pencil aria-hidden="true" className="size-4 cursor-pointer" />
                          </button>
                        )}
                        {!["PAID", "PARTIALLY_PAID", "CANCELLED"].includes(
                          getInvoiceStatus(invoice),
                        ) && (
                          <button
                            type="button"
                            aria-label={`Delete ${invoice.invoiceNumber || "invoice"}`}
                            onClick={() => setInvoiceToDelete(invoice)}
                            className="cursor-pointer rounded p-1 text-slate-500 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 aria-hidden="true" className="size-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {pageInvoices.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-sm text-slate-500"
                  >
                    No invoices match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <footer className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-xs text-slate-400">
          <span>
            Showing {firstRow}–{lastRow} of {filteredInvoices.length} invoices
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setPage(currentPage - 1)}
              aria-label="Previous page"
              className="inline-flex size-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 enabled:hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronLeft aria-hidden="true" className="size-4" />
            </button>
            <span className="whitespace-nowrap text-slate-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setPage(currentPage + 1)}
              aria-label="Next page"
              className="inline-flex size-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 enabled:hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronRight aria-hidden="true" className="size-4" />
            </button>
          </div>
        </footer>
      </section>

      {selectedInvoice && (
        <div
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedInvoice(null);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="invoice-details-title"
            className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id="invoice-details-title"
                  className="text-lg font-semibold text-slate-900"
                >
                  {selectedInvoice.invoiceNumber || "Invoice details"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {getCustomerName(selectedInvoice.customerId)}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                {!["PAID", "CANCELLED"].includes(
                  getInvoiceStatus(selectedInvoice),
                ) && (
                  <button
                    type="button"
                    onClick={() => {
                      onEditInvoice?.(selectedInvoice);
                      setSelectedInvoice(null);
                    }}
                    className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-violet-200 px-3 py-1.5 text-sm font-medium text-violet-700 hover:bg-violet-50"
                  >
                    <Pencil aria-hidden="true" className="size-4 " />
                    Edit
                  </button>
                )}
                {!["PAID", "PARTIALLY_PAID", "CANCELLED"].includes(
                  getInvoiceStatus(selectedInvoice),
                ) && (
                  <button
                    type="button"
                    onClick={() => {
                      setInvoiceToDelete(selectedInvoice);
                      setSelectedInvoice(null);
                    }}
                    className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    <Trash2 aria-hidden="true" className="size-4" />
                    Delete
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedInvoice(null)}
                  className="cursor-pointer rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
                >
                  Close
                </button>
              </div>
            </div>
            <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-slate-500">Amount</dt>
                <dd className="mt-1 font-medium text-slate-900">
                  {currencyFormatter.format(
                    Number(selectedInvoice.totalAmount) || 0,
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Paid</dt>
                <dd className="mt-1 font-medium text-slate-900">
                  {currencyFormatter.format(
                    Number(selectedInvoice.paidAmount) || 0,
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Issued</dt>
                <dd className="mt-1 font-medium text-slate-900">
                  {formatDate(
                    selectedInvoice.invoiceDate || selectedInvoice.createdAt,
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Due date</dt>
                <dd className="mt-1 font-medium text-slate-900">
                  {formatDate(selectedInvoice.dueDate)}
                </dd>
              </div>
              <div className="col-span-2">
                <dt className="text-slate-500">Status</dt>
                <dd className="mt-1 font-medium text-slate-900">
                  {STATUS_LABELS[getInvoiceStatus(selectedInvoice)] ||
                    getInvoiceStatus(selectedInvoice)}
                </dd>
              </div>
            </dl>
          </section>
        </div>
      )}
      {invoiceToDelete && (
        <DeleteInvoice
          invoice={invoiceToDelete}
          onClose={() => setInvoiceToDelete(null)}
          onDeleted={(deletedInvoice) => {
            onDeletedInvoice?.(deletedInvoice);
          }}
        />
      )}
    </>
  );
}
