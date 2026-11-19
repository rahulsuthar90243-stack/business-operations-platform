import { AlertCircle, Check, Circle, Clock3 } from "lucide-react";

function SummaryCard({ label, value, tone, icon: Icon }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className={`mt-2 text-2xl font-semibold tracking-tight ${tone}`}>
            {value}
          </p>
        </div>
        <span className="rounded-lg bg-slate-50 p-2 text-slate-500">
          <Icon className="size-4" aria-hidden="true" />
        </span>
      </div>
    </article>
  );
}

export default function TicketSummary({ summary }) {
  return (
    <section
      aria-label="Ticket summary"
      className="grid grid-cols-2 gap-3 lg:grid-cols-4"
    >
      <SummaryCard
        label="Open Tickets"
        value={summary.open}
        tone="text-blue-600"
        icon={Circle}
      />
      <SummaryCard
        label="In Progress"
        value={summary.inProgress}
        tone="text-amber-600"
        icon={Clock3}
      />
      <SummaryCard
        label="Resolved"
        value={summary.resolved}
        tone="text-emerald-600"
        icon={Check}
      />
      <SummaryCard
        label="Escalated"
        value={summary.escalated}
        tone="text-rose-600"
        icon={AlertCircle}
      />
    </section>
  );
}


