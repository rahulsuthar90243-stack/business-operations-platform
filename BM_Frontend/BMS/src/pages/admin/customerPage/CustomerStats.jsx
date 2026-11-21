export default function CustomerStats({ counts = {} }) {
  const statCards = [
    {
      label: "Total Customers",
      value: counts.total ?? 0,
      color: "text-violet-600",
    },
    {
      label: "Active",
      value: counts.active ?? 0,
      color: "text-emerald-600",
    },
    {
      label: "New This Month",
      value: counts.newThisMonth ?? 0,
      color: "text-blue-600",
    },
    {
      label: "With Open Tickets",
      value: counts.withOpenTickets ?? 0,
      color: "text-amber-600",
    },
  ];

  return (
    <section
      aria-label="Customer statistics"
      className="grid grid-cols-2 gap-3 lg:grid-cols-4"
    >
      {statCards.map(({ label, value, color }) => (
        <article
          key={label}
          className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <p className={`text-2xl font-semibold ${color}`}>{value}</p>
          <p className="mt-1 text-sm text-slate-700">{label}</p>
        </article>
      ))}
    </section>
  );
}