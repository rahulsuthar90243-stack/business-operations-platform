import { useEffect, useState } from "react";
import { Inbox } from "lucide-react";
import { getActivityLogs } from "../../services/adminService.js";
import getActiveUsers from "../../services/activeFild.js";

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

const formatTime = (value) => {
  const timestamp = value instanceof Date ? value.getTime() : Date.parse(value);
  if (!Number.isFinite(timestamp)) return "Unknown time";

  const minutes = Math.max(0, Math.round((Date.now() - timestamp) / 60000));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

export default function ActivityFeed({
  title = "Activity Feed",
  live = true,
  scrollClassName = "max-h-80",
  className = "",
}) {
  const [fetchedActivities, setFetchedActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchActivities = async () => {
      try {
        const activityData = await getActivityLogs();
        const formattedActivities = getActiveUsers(activityData);

        if (isMounted) {
          setFetchedActivities(
            Array.isArray(formattedActivities) ? formattedActivities : [],
          );
        }
      } catch (error) {
        console.error("Error fetching activity logs:", error);
        if (isMounted) {
          setFetchedActivities([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchActivities();

    return () => {
      isMounted = false;
    };
  }, []);

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
        {loading ? (
          <p className="py-8 text-center text-sm text-gray-400" role="status">
            Loading activity...
          </p>
        ) : fetchedActivities.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-sm text-gray-400">
            <Inbox className="h-6 w-6" aria-hidden="true" />
            No recent activity
          </div>
        ) : (
          <ul className="space-y-4">
            {fetchedActivities.map((item, index) => {
              const user =
                typeof item.user === "string" && item.user.trim()
                  ? item.user
                  : "User";
              const activityText =
                item.description ||
                `${item.action || "updated"} ${item.entityType || "record"}`;

              return (
                <li
                  key={
                    item.id ??
                    `${user}-${item.action}-${item.createdAt}-${index}`
                  }
                  className="flex items-start gap-3"
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-medium ${getAvatarColor(user)}`}
                    aria-hidden="true"
                  >
                    {getInitials(user)}
                  </span>

                  <div className="min-w-0">
                    <p className="text-sm leading-snug text-gray-600">
                      <span className="font-medium text-gray-900">{user}</span>{" "}
                      {activityText}
                    </p>
                    <p className="mt-1 font-mono text-xs text-gray-400">
                      {formatTime(item.createdAt)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}