import { Download, Plus } from "lucide-react";

export default function CustomerPageHeader({
  onExport,
  onAddCustomer,
  exportDisabled = false,
}) {
  return (
    <section
      aria-labelledby="customer-page-title"
      className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="min-w-0">
        <h1
          id="customer-page-title"
          className="text-xl font-semibold text-slate-900"
        >
          Customers
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage customer accounts and business relationships.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
        <button
          type="button"
          onClick={onExport}
          disabled={exportDisabled}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Download aria-hidden="true" className="size-4" />
          Export CSV
        </button>
        <button
          type="button"
          onClick={onAddCustomer}
          className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-lg bg-violet-600 px-3.5 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-violet-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600"
        >
          <Plus aria-hidden="true" className="size-4" />
          Add Customer
        </button>
      </div>
    </section>
  );
}
