import { useEffect, useMemo, useRef } from "react";
import { Bell, ChevronDown, HelpCircle, Search } from "lucide-react";

const formatDate = (date) =>
  new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);

const getInitials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

/**
 * Reusable dashboard header.
 *
 * Purely presentational: all data and behaviour come in through props,
 * so Admin, Manager, Employee and Customer dashboards can share it.
 *
 * @param {object}   props
 * @param {string}   props.title                  Page title, e.g. "Admin Dashboard"
 * @param {string}   [props.breadcrumb]           Current section, e.g. "Overview"
 * @param {Date|string} [props.date]              Defaults to today. Strings are shown as-is.
 * @param {string}   [props.searchPlaceholder]
 * @param {string}   [props.searchValue]          Pass with onSearchChange for a controlled input
 * @param {function} [props.onSearchChange]       (value: string) => void
 * @param {function} [props.onSearchSubmit]       (value: string) => void, fired on Enter
 * @param {boolean}  [props.showSearch=true]
 * @param {boolean}  [props.hasNotifications=false] Shows the red indicator on the bell
 * @param {function} [props.onNotificationsClick]
 * @param {boolean}  [props.showHelp=true]
 * @param {function} [props.onHelpClick]
 * @param {{name: string, role?: string, avatarUrl?: string}} [props.user]
 * @param {boolean}  [props.isProfileOpen=false]  Reflected in aria-expanded / arrow rotation
 * @param {function} [props.onProfileClick]
 * @param {string}   [props.className]
 */
export default function Header({
  title,
  breadcrumb,
  date,
  searchPlaceholder = "Search anything...",
  searchValue,
  onSearchChange,
  onSearchSubmit,
  showSearch = true,
  hasNotifications = false,
  onNotificationsClick,
  showHelp = true,
  onHelpClick,
  user,
  isProfileOpen = false,
  onProfileClick,
  className = "",
}) {
  const searchRef = useRef(null);

  const dateLabel = useMemo(() => {
    if (typeof date === "string") return date;
    return formatDate(date instanceof Date ? date : new Date());
  }, [date]);

  // Cmd/Ctrl + K focuses the search field
  useEffect(() => {
    if (!showSearch) return undefined;
    const handler = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [showSearch]);

  const iconButton =
    "relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500";

  return (
    <header
      className={`flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-white px-6 py-3 ${className}`}
    >
      {/* Title block */}
      <div className="min-w-0">
        <div className="flex items-baseline gap-2">
          <h1 className="truncate text-lg font-semibold text-slate-900">
            {title}
          </h1>
          {breadcrumb && (
            <>
              <span className="text-slate-300" aria-hidden="true">
                /
              </span>
              <span className="truncate text-sm text-slate-500">
                {breadcrumb}
              </span>
            </>
          )}
        </div>
        <p className="mt-0.5 text-xs text-slate-400">{dateLabel}</p>
      </div>

      {/* Actions */}
      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        {showSearch && (
          <form
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              onSearchSubmit?.(searchRef.current?.value ?? "");
            }}
            className="relative hidden w-64 md:block lg:w-72"
          >
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              ref={searchRef}
              type="search"
              aria-label="Search"
              placeholder={searchPlaceholder}
              {...(searchValue !== undefined ? { value: searchValue } : {})}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-14 text-sm text-slate-700 placeholder:text-slate-400 focus:border-violet-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 [&::-webkit-search-cancel-button]:appearance-none"
            />
            <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[11px] font-medium text-slate-400">
              ⌘K
            </kbd>
          </form>
        )}

        <button
          type="button"
          onClick={onNotificationsClick}
          className={iconButton}
          aria-label={
            hasNotifications ? "Notifications (unread)" : "Notifications"
          }
        >
          <Bell className="h-5 w-5" aria-hidden="true" />
          {hasNotifications && (
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
          )}
        </button>

        {showHelp && (
          <button
            type="button"
            onClick={onHelpClick}
            className={iconButton}
            aria-label="Help"
          >
            <HelpCircle className="h-5 w-5" aria-hidden="true" />
          </button>
        )}

        {user && (
          <>
            <span className="hidden h-6 w-px bg-slate-200 sm:block" />
            <button
              type="button"
              onClick={onProfileClick}
              aria-haspopup="menu"
              aria-expanded={isProfileOpen}
              className="flex items-center gap-3 rounded-lg px-1.5 py-1 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
            >
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt=""
                  className="h-9 w-9 rounded-full object-cover"
                />
              ) : (
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-100 text-xs font-semibold text-violet-600">
                  {getInitials(user.name)}
                </span>
              )}
              <span className="hidden text-left leading-tight sm:block">
                <span className="block text-sm font-medium text-slate-800">
                  {user.name}
                </span>
                {user.role && (
                  <span className="block text-xs text-slate-500">
                    {user.role}
                  </span>
                )}
              </span>
              <ChevronDown
                className={`hidden h-4 w-4 text-slate-400 transition-transform sm:block ${
                  isProfileOpen ? "rotate-180" : ""
                }`}
                aria-hidden="true"
              />
            </button>
          </>
        )}
      </div>
    </header>
  );
}

/* Example usage (Admin dashboard):
 *
 * <Header
 *   title="Admin Dashboard"
 *   breadcrumb="Overview"
 *   hasNotifications
 *   user={{ name: "Alex Rivera", role: "Administrator" }}
 *   onSearchSubmit={(q) => navigate(`/search?q=${q}`)}
 *   onProfileClick={() => setProfileOpen((o) => !o)}
 *   isProfileOpen={profileOpen}
 * />
 *
 * Other dashboards only change the props, e.g.
 * <Header title="Manager Dashboard" breadcrumb="Team" user={...} />
 */