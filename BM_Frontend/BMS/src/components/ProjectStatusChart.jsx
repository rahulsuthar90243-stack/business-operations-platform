import { useMemo } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

// Mock data for initial UI development only — pass your own via the `data` prop.
const MOCK_DATA = [
  { name: "On Track", value: 18, color: "#059669" },
  { name: "At Risk", value: 9, color: "#d97706" },
  { name: "Delayed", value: 6, color: "#dc2626" },
  { name: "Completed", value: 5, color: "#4f46e5" },
];

const FALLBACK_COLORS = ["#059669", "#d97706", "#dc2626", "#4f46e5", "#0ea5e9", "#9ca3af"];

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { name, value, payload: row } = payload[0];

  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs shadow-md">
      <p className="flex items-center gap-1.5 text-gray-500">
        <span
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: row.fill }}
        />
        {name}: <span className="font-mono text-gray-900">{value}</span>
      </p>
    </div>
  );
}

/**
 * ProjectStatusChart
 *
 * Props:
 *  - data:      [{ name, value, color? }, ...]  (defaults to mock data)
 *  - title:     card title
 *  - subtitle:  text under the title (defaults to "<total> total projects")
 *  - className: extra classes for the outer card
 *
 * Usage:
 *   <ProjectStatusChart />
 *   <ProjectStatusChart data={statusData} className="h-full" />
 */
export default function ProjectStatusChart({
  data = MOCK_DATA,
  title = "Project Status",
  subtitle,
  className = "",
}) {
  const total = useMemo(
    () => data.reduce((sum, item) => sum + item.value, 0),
    [data]
  );

  const items = data.map((item, i) => ({
    ...item,
    color: item.color ?? FALLBACK_COLORS[i % FALLBACK_COLORS.length],
  }));

  return (
    <section
      className={`min-w-0 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5 lg:p-6 ${className}`}
    >
      <header className="mb-4 sm:mb-5">
        <h2 className="text-sm font-semibold text-gray-900 sm:text-base">{title}</h2>
        <p className="mt-0.5 text-xs text-slate-400 sm:text-sm">
          {subtitle ?? `${total} total projects`}
        </p>
      </header>

      <div
        className="h-44 w-full sm:h-48"
        role="img"
        aria-label={`${title}: ${items.map((d) => `${d.name} ${d.value}`).join(", ")}`}
      >
        {total > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={items}
                dataKey="value"
                nameKey="name"
                innerRadius="70%"
                outerRadius="95%"
                startAngle={90}
                endAngle={-270}
                paddingAngle={3}
                cornerRadius={3}
                stroke="none"
              >
                {items.map((item) => (
                  <Cell key={item.name} fill={item.color} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">
            No projects yet
          </div>
        )}
      </div>

      <ul className="mt-4 space-y-2.5 sm:mt-5">
        {items.map((item) => (
          <li key={item.name} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex min-w-0 items-center gap-2 text-gray-600">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="truncate">{item.name}</span>
            </span>
            <span className="font-mono text-gray-900">{item.value}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}