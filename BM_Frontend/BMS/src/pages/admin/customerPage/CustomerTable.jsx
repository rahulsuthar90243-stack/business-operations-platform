import { ChevronLeft, ChevronRight, Eye, Pencil } from "lucide-react";

const STATUS_STYLES = {
  active: "border-emerald-200 bg-emerald-50 text-emerald-700",
  inactive: "border-slate-200 bg-slate-100 text-slate-600",
  new: "border-sky-200 bg-sky-50 text-sky-700",
  rejected: "border-rose-200 bg-rose-50 text-rose-700",
};

function getInitials(name) {
  return (
    String(name ?? "")
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "C"
  );
}

function formatLastActivity(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  const daysAgo = Math.floor((Date.now() - date.getTime()) / 86_400_000);
  if (daysAgo <= 0) return "Today";
  if (daysAgo === 1) return "1d ago";
  if (daysAgo < 7) return `${daysAgo}d ago`;

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() === new Date().getFullYear() ? undefined : "numeric",
  }).format(date);
}

export default function CustomerTable({
  customers,
  loading,
  error,
  page,
  pageSize = 7,
  onPageChange,
  onViewCustomer,
  onEditCustomer,
}) {
  const pageCount = Math.max(1, Math.ceil(customers.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visibleCustomers = customers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  const firstResult = customers.length ? (currentPage - 1) * pageSize + 1 : 0;
  const lastResult = Math.min(currentPage * pageSize, customers.length);

  return (
    <section
      aria-label="Customers"
      className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
    >
      {error && (
        <p role="alert" className="border-b border-red-100 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </p>
      )}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th scope="col" className="px-4 py-3 font-medium">Customer</th>
              <th scope="col" className="px-4 py-3 font-medium">Active Projects</th>
              <th scope="col" className="px-4 py-3 font-medium">Open Tickets</th>
              <th scope="col" className="px-4 py-3 font-medium">Status</th>
              <th scope="col" className="px-4 py-3 font-medium">Last Activity</th>
              <th scope="col" className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                  Loading customers…
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                  Customer data could not be displayed.
                </td>
              </tr>
            ) : visibleCustomers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                  No customers match these filters.
                </td>
              </tr>
            ) : (
              visibleCustomers.map((customer) => {
                const status = customer.customerStatus;
                const statusStyle =
                  STATUS_STYLES[status] ?? STATUS_STYLES.inactive;

                return (
                  <tr key={customer.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-medium text-violet-700">
                          {getInitials(customer.username)}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-slate-800">
                            {customer.username || "Unnamed customer"}
                          </p>
                          {customer.companyName && (
                            <p className="truncate text-xs text-slate-500">
                              {customer.companyName}
                            </p>
                          )}
                          <p className="truncate text-xs text-slate-500">
                            {customer.email || "No email address"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-slate-600">
                      <span className="mr-2 inline-block size-2 rounded-full bg-violet-500" />
                      {customer.activeProjects}
                      <span className="ml-1 text-xs text-slate-500">projects</span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-slate-600">
                      {customer.openTickets > 0 ? (
                        <>
                          <span className="mr-2 inline-block size-2 rounded-full bg-amber-500" />
                          {customer.openTickets}
                          <span className="ml-1 text-xs text-slate-500">tickets</span>
                        </>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${statusStyle}`}
                      >
                        <span className="size-1.5 rounded-full bg-current" />
                        {status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-slate-500">
                      {formatLastActivity(customer.lastSeen)}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onViewCustomer(customer)}
                          aria-label={`View ${customer.username || "customer"}`}
                          className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium text-violet-700 hover:bg-violet-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600"
                        >
                          <Eye aria-hidden="true" className="size-3.5" />
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => onEditCustomer(customer)}
                          aria-label={`Edit ${customer.username || "customer"}`}
                          className="cursor-pointer inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600"
                        >
                          <Pencil aria-hidden="true" className="size-3.5" />
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {!loading && !error && (
        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 text-xs text-slate-600">
          <p>
            Showing {firstResult}–{lastResult} of {customers.length} results
          </p>
          <nav aria-label="Customer table pages" className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              aria-label="Previous page"
              className="rounded-md p-2 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft aria-hidden="true" className="size-4" />
            </button>
            {Array.from({ length: pageCount }, (_, index) => index + 1).map(
              (pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() => onPageChange(pageNumber)}
                  aria-current={pageNumber === currentPage ? "page" : undefined}
                  className={`size-8 rounded-lg font-medium ${
                    pageNumber === currentPage
                      ? "bg-violet-600 text-white"
                      : "hover:bg-slate-100"
                  }`}
                >
                  {pageNumber}
                </button>
              ),
            )}
            <button
              type="button"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === pageCount}
              aria-label="Next page"
              className="rounded-md p-2 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight aria-hidden="true" className="size-4" />
            </button>
          </nav>
        </footer>
      )}
    </section>
  );
}
