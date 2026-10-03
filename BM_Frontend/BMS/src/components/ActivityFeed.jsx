import { Inbox } from "lucide-react";

// Mock data for initial UI development only — pass your own via the `activities` prop.
const MOCK_ACTIVITIES = [
  { id: 1, user: "Sarah Chen", action: "completed task", target: "API Integration Review", time: "5 min ago" },
  { id: 2, user: "Marcus Webb", action: "commented on", target: "TKT-1021", time: "22 min ago" },
  { id: 3, user: "Priya Nair", action: "uploaded file to", target: "Q3 Report", time: "1h ago" },
  { id: 4, user: "Acme Corp", action: "created ticket", target: "TKT-1022", time: "2h ago" },
  { id: 5, user: "James Holloway", action: "updated status of", target: "Platform v3 Launch", time: "3h ago" },
  { id: 6, user: "Aisha Okonkwo", action: "assigned", target: "TKT-1018", time: "5h ago" },
];

const AVATAR_COLORS = [
  "bg-violet-100 text-violet-700",
  "bg-emerald-100 text-emerald-700",
  "bg-sky-100 text-sky-700",
  "bg-amber-100 text-amber-700",
];

const getInitials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

// Same name always gets the same avatar colour.
const getAvatarColor = (name = "") => {
  const hash = [...name].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
};

// Strings are shown as-is ("5 min ago"); Date objects become relative text.
const formatTime = (value) => {
  if (!(value instanceof Date)) return value;
  const minutes = Math.max(0, Math.round((Date.now() - value.getTime()) / 60000));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

/**
 * ActivityFeed
 *
 * Props:
 *  - activities:      [{ id?, user, action, target?, targetHref?, time }, ...]
 *                     `target` is the highlighted entity (ticket ID, task name…).
 *                     `time` is a string ("5 min ago") or a Date.
 *  - title:           card heading
 *  - live:            show the green "live" dot in the header (default true)
 *  - scrollClassName: classes for the scroll area (default "max-h-80").
 *                     Use e.g. "h-full" with a tall parent to fill the card.
 *  - className:       extra classes for the outer card
 *
 * Usage:
 *   <ActivityFeed />
 *   <ActivityFeed activities={items} scrollClassName="max-h-96" />
 */
export default function ActivityFeed({
  activities = MOCK_ACTIVITIES,
  title = "Activity Feed",
  live = true,
  scrollClassName = "max-h-80",
  className = "",
}) {
  return (
    <section
      className={`flex min-w-0 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm ${className}`}
    >
      <header className="flex items-center justify-between gap-3 px-4 py-3.5 sm:px-5">
        <h2 className="text-sm font-semibold text-gray-900 sm:text-base">{title}</h2>
        {live && (
          <span
            className="h-2 w-2 rounded-full bg-emerald-400"
            title="Live"
            role="img"
            aria-label="Live updates"
          />
        )}
      </header>

      <div
        tabIndex={0}
        className={`min-h-0 flex-1 overflow-y-auto border-t border-gray-100 px-4 py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-violet-300 sm:px-5 ${scrollClassName}`}
      >
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-sm text-gray-400">
            <Inbox className="h-6 w-6" aria-hidden="true" />
            No recent activity
          </div>
        ) : (
          <ul className="space-y-4">
            {activities.map((item) => (
              <li key={item.id ?? `${item.user}-${item.action}-${item.target}-${item.time}`} className="flex items-start gap-3">
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-medium ${getAvatarColor(item.user)}`}
                  aria-hidden="true"
                >
                  {getInitials(item.user)}
                </span>

                <div className="min-w-0">
                  <p className="text-sm leading-snug text-gray-600">
                    <span className="font-medium text-gray-900">{item.user}</span>{" "}
                    {item.action}
                    {item.target && (
                      <>
                        {" "}
                        {item.targetHref ? (
                          <a
                            href={item.targetHref}
                            className="font-medium text-violet-600 hover:text-violet-700"
                          >
                            {item.target}
                          </a>
                        ) : (
                          <span className="font-medium text-violet-600">{item.target}</span>
                        )}
                      </>
                    )}
                  </p>
                  <p className="mt-1 font-mono text-xs text-gray-400">{formatTime(item.time)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}