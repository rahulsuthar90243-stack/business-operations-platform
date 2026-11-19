export default function PriorityDistribution({
  priorities,
  priorityCounts,
  totalPriorities,
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-5">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
        <div className="flex shrink-0 items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <span className="size-2 rounded-full bg-violet-500" />
          Priority distribution
        </div>
        <div className="flex h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
          {[
            ["urgent", "bg-red-500"],
            ["high", "bg-orange-400"],
            ["medium", "bg-blue-500"],
            ["low", "bg-slate-300"],
          ].map(([priority, color]) => (
            <span
              key={priority}
              style={{
                width: `${(priorityCounts[priority] / totalPriorities) * 100}%`,
              }}
              className={`${color} transition-all`}
              title={`${priority}: ${priorityCounts[priority]}`}
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-500">
          {priorities.map((priority) => (
            <span
              key={priority}
              className="inline-flex items-center gap-1.5 capitalize"
            >
              <span
                className={`size-1.5 rounded-full ${
                  priority === "urgent"
                    ? "bg-red-500"
                    : priority === "high"
                      ? "bg-orange-400"
                      : priority === "medium"
                        ? "bg-blue-500"
                        : "bg-slate-300"
                }`}
              />
              {priority}{" "}
              <strong className="font-medium text-slate-700">
                {priorityCounts[priority]}
              </strong>
              <span className="text-slate-400">
                (
                {Math.round(
                  (priorityCounts[priority] / totalPriorities) * 100,
                )}
                %)
              </span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
