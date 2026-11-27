import { ChevronLeft, ChevronRight } from "lucide-react";

export default function FinanceTable({
  toolbar,
  columns,
  children,
  emptyMessage,
  hasRows,
  firstRow,
  lastRow,
  totalRows,
  itemLabel,
  currentPage,
  totalPages,
  onPageChange,
  tableClassName = "w-full min-w-[780px] text-left text-xs",
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-3">{toolbar}</div>
      <div className="overflow-x-auto">
        <table className={tableClassName}>
          <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
            <tr>
              {columns.map(({ label, align = "left" }) => (
                <th
                  key={label}
                  scope="col"
                  className={`px-4 py-3 font-medium ${
                    align === "right" ? "text-right" : ""
                  }`}
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {hasRows ? (
              children
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-10 text-center text-sm text-slate-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <footer className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-xs text-slate-400">
        <span>
          Showing {firstRow}–{lastRow} of {totalRows} {itemLabel}
        </span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
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
            onClick={() => onPageChange(currentPage + 1)}
            aria-label="Next page"
            className="inline-flex size-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 enabled:hover:bg-slate-50 disabled:opacity-40"
          >
            <ChevronRight aria-hidden="true" className="size-4" />
          </button>
        </div>
      </footer>
    </section>
  );
}
