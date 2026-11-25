import { ArrowDownRight, ArrowUpRight } from "lucide-react";

export default function FinanceStatusCard({
  label,
  value,
  change,
  favorable,
  icon: Icon,
  footer,
}) {
  const numericChange = Number(change);
  const hasChange =
    change !== undefined &&
    change !== null &&
    change !== "" &&
    Number.isFinite(numericChange);
  const TrendIcon = numericChange < 0 ? ArrowDownRight : ArrowUpRight;

  return (
    <article className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="truncate text-sm text-slate-500">{label}</p>
        <Icon aria-hidden="true" className="size-4 shrink-0 text-violet-600" />
      </div>
      <p className="mt-2 truncate text-2xl font-semibold tracking-tight text-slate-900">
        {value}
      </p>
      <div className="mt-2 flex min-h-6 items-center gap-2 text-xs">
        {footer ?? (
          <>
            {hasChange ? (
              <span
                clcChaassName={`inline-flex items-center gap-0.5 rounded-full px-2 py-1 font-medium ${
                  favorable ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                }`}
              >
                <TrendIcon aria-hidden="true" className="size-3" />
                {numericChange > 0 ? "+" : ""}
                {numeringe.toFixed(1)}%
              </span>
            ) : (
              <span className="text-slate-400">—</span>
            )}
            <span className="text-slate-400">vs last month</span>
          </>
        )}
      </div>
    </article>
  );
}
