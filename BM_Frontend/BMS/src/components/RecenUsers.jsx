import { ArrowRight } from "lucide-react";

// Mock data for initial UI development only — pass your own via the `users` prop.
const MOCK_USERS = [
  { id: 1, name: "Sarah Chen", email: "sarah.chen@acme.com", role: "Manager", status: "active", joined: "Sep 22, 2026" },
  { id: 2, name: "Marcus Webb", email: "m.webb@acme.com", role: "Employee", status: "active", joined: "Sep 20, 2026" },
  { id: 3, name: "Priya Nair", email: "p.nair@acme.com", role: "Employee", status: "pending", joined: "Sep 19, 2026" },
  { id: 4, name: "James Holloway", email: "j.holloway@acme.com", role: "Manager", status: "active", joined: "Sep 17, 2026" },
  { id: 5, name: "Aisha Okonkwo", email: "a.okonkwo@acme.com", role: "Employee", status: "inactive", joined: "Sep 15, 2026" },
];

const STATUS_STYLES = {
  active: {
    badge: "border-emerald-200 bg-emerald-50 text-emerald-600",
    dot: "bg-emerald-500",
  },
  pending: {
    badge: "border-gray-200 bg-gray-100 text-gray-600",
    dot: "bg-gray-400",
  },
  inactive: {
    badge: "border-gray-200 bg-gray-100 text-gray-500",
    dot: "bg-gray-300",
  },
};

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

const formatDate = (value) =>
  value instanceof Date
    ? value.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : value;

function StatusBadge({ status }) {
  const key = String(status ?? "").toLowerCase();
  const style = STATUS_STYLES[key] ?? STATUS_STYLES.inactive;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${style.badge}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {status}
    </span>
  );
}

/**
 * RecentUsers
 *
 * Props:
 *  - users:        [{ id?, name, email, role, status, joined }, ...]
 *                  status: "active" | "pending" | "inactive"
 *                  joined: string (shown as-is) or Date
 *  - title:        card heading
 *  - viewAllHref:  link for "View all" (pass null to hide it)
 *  - className:    extra classes for the outer card
 *
 * Usage:
 *   <RecentUsers />
 *   <RecentUsers users={users} viewAllHref="/users" />
 */
export default function RecentUsers({
  users = MOCK_USERS,
  title = "Recent Users",
  viewAllHref = "#",
  className = "",
}) {
  const th =
    "px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-400 sm:px-5";
  const td = "px-4 py-3.5 text-sm sm:px-5";

  return (
    <section
      className={`min-w-0 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm ${className}`}
    >
      <header className="flex items-center justify-between gap-3 px-4 py-3.5 sm:px-5">
        <h2 className="text-sm font-semibold text-gray-900 sm:text-base">{title}</h2>
        {viewAllHref !== null && (
          <a
            href={viewAllHref}
            className="inline-flex items-center gap-1 text-sm font-medium text-violet-600 hover:text-violet-700"
          >
            View all
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        )}
      </header>

      <div className="overflow-x-auto border-t border-gray-100">
        <table className="w-full min-w-[560px] border-collapse">
          <thead>
            <tr>
              <th scope="col" className={th}>User</th>
              <th scope="col" className={th}>Role</th>
              <th scope="col" className={th}>Status</th>
              <th scope="col" className={th}>Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-sm text-gray-400">
                  No users to show
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id ?? user.email}>
                  <td className={td}>
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-medium ${getAvatarColor(user.name)}`}
                        aria-hidden="true"
                      >
                        {getInitials(user.name)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-gray-900">{user.name}</p>
                        <p className="truncate text-xs text-gray-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className={`${td} text-gray-700`}>{user.role}</td>
                  <td className={td}>
                    <StatusBadge status={user.status} />
                  </td>
                  <td className={`${td} whitespace-nowrap font-mono text-xs text-gray-500`}>
                    {formatDate(user.joined)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}