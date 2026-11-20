import {
  BriefcaseBusiness,
  Building2,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react";

export default function UserStats({ counts }) {
  const statCards = [
    {
      label: "Total Users",
      value: counts.total,
      icon: Users,
      color: "text-violet-600",
    },
    {
      label: "Admins",
      value: counts.admins,
      icon: ShieldCheck,
      color: "text-violet-600",
    },
    {
      label: "Managers",
      value: counts.managers,
      icon: BriefcaseBusiness,
      color: "text-blue-600",
    },
    {
      label: "Employees",
      value: counts.employees,
      icon: UserRound,
      color: "text-emerald-600",
    },
    {
      label: "Customers",
      value: counts.customers,
      icon: Building2,
      color: "text-amber-600",
    },
  ];

  return (
    <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
      {statCards.map(({ label, value, icon: Icon, color }) => (
        <article
          key={label}
          className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="flex items-center justify-between gap-2">
            <p className={`text-2xl font-semibold ${color}`}>{value}</p>
            <Icon aria-hidden="true" className={`size-5 ${color}`} />
          </div>
          <p className="mt-1 text-sm text-slate-600">{label}</p>
        </article>
      ))}
    </div>
  );
}

