import { ArrowDown, ArrowUp } from "lucide-react";

export default function StatCard({
  icon: Icon,
  value,
  label,
  change,
  trend = "up",
  subtitle,
  className = "",
}) {
  const TrendIcon = trend === "down" ? ArrowDown : ArrowUp;

  return (
    <article
      className={`min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-violet-600 text-white">
          <Icon aria-hidden="true" className="size-4" />
        </div>
        {change != null && (
          <span
            aria-label={`${trend === "down" ? "Decreased" : "Increased"} ${change}`}
            className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium leading-none text-emerald-700"
          >
            <TrendIcon aria-hidden="true" className="size-3" />
            {change}
          </span>
        )}
      </div>

      <div className="mt-4 min-w-0">
        <p className="truncate text-2xl font-semibold leading-tight tracking-tight text-slate-950">
          {value}
        </p>
        <p className="mt-1 truncate text-sm text-slate-600">{label}</p>
        {subtitle && (
          <p className="mt-1 truncate text-xs text-slate-500">{subtitle}</p>
        )}
      </div>
    </article>
  );
}