import { Plus } from "lucide-react";
import { Link } from "react-router-dom";

const actions = [
  { label: "Create Invoice", to: "/admin/finance/invoices" },
  { label: "Record Payment", to: "/admin/finance/payments" },
  { label: "Add Expense", to: "/admin/finance/expenses" },
  { label: "Add Revenue", to: "/admin/finance/revenue" },
];

export default function QuickActions() {
  return (
    <section
      aria-label="Finance quick actions"
      className="grid grid-cols-2 items-center gap-3 md:grid-cols-[auto_repeat(4,minmax(0,1fr))]"
    >
      <h2 className="col-span-2 text-xs font-semibold text-slate-900 md:col-span-1">
        Quick Actions
      </h2>
      {actions.map((action) => (
        <Link
          key={action.to}
          to={action.to}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-violet-200 bg-white px-3 text-xs font-medium text-violet-700 transition hover:bg-violet-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600"
        >
          <Plus aria-hidden="true" className="size-3.5" />
          {action.label}
        </Link>
      ))}
    </section>
  );
}
