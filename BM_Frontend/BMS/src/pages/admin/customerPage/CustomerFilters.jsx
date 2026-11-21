import { Search } from "lucide-react";

export default function CustomerFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
}) {
  return (
    <section
      aria-label="Filter customers"
      className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <label className="relative min-w-[220px] flex-1 sm:max-w-sm">
        <Search
          aria-hidden="true"
          className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
        />
        <input
          type="search"
          aria-label="Search customers"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search by name, company or email..."
          className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
        />
      </label>

      <label className="sr-only" htmlFor="customer-status-filter">
        Filter by status
      </label>
      <select
        id="customer-status-filter"
        value={status}
        onChange={(event) => onStatusChange(event.target.value)}
        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 outline-none focus:border-violet-400"
      >
        <option value="all">All Statuses</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
        <option value="new">New</option>
        <option value="rejected">Rejected</option>
      </select>
    </section>
  );
}
