import { NavLink } from "react-router-dom";
import { LogOut } from "lucide-react";
import { getNavigationByRole } from "../config/navigationConfig";
import { useAuth } from "../context/AuthContext";

function Sidebar({ ticketsCount = 0, className = "" }) {
  // NOTE: if your AuthContext exposes a logout function under a different
  // name (e.g. signOut), change it here.
  const { user, logout } = useAuth();

  const role = user?.role?.toLowerCase();
  const navigationItems = getNavigationByRole(role);

  const displayName = user?.username ?? user?.name ?? "User";
  const displayRole = user?.role ?? "";
  const avatarInitials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <aside
      className={`flex h-dvh w-[68px] shrink-0 flex-col border-r border-white/10 bg-[#0d1117] text-slate-300 sm:w-[232px] ${className}`}
      aria-label="Main sidebar"
    >
      {/* Brand */}
      <div className="flex h-[68px] items-center gap-3 border-b border-white/[0.06] px-4 sm:px-5">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-[9px] bg-[#7c3aed] text-sm font-semibold text-white">
          W
        </div>
        <div className="hidden min-w-0 sm:block">
          <p className="truncate text-[13px] font-semibold leading-5 text-white">WorkOS</p>
          <p className="truncate text-[11px] leading-4 text-slate-500">WorkOS Platform</p>
        </div>
        <span className="sr-only sm:hidden">WorkOS Platform</span>
      </div>

      {/* Role-based navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 sm:px-3" aria-label="Navigation">
        <p className="mb-2 hidden px-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 sm:block">
          Navigation
        </p>
        <ul className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const showBadge = item.path?.includes("tickets") && ticketsCount > 0;

            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  title={item.label}
                  className={({ isActive }) =>
                    `group relative flex h-9 w-full items-center gap-3 rounded-[8px] px-3 text-left text-[13px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400 ${
                      isActive
                        ? "bg-[#1c2231] font-medium text-white before:absolute before:inset-y-1 before:left-0 before:w-[3px] before:rounded-full before:bg-[#8b3dff]"
                        : "text-slate-400 hover:bg-white/[0.05] hover:text-slate-100"
                    }`
                  }
                >
                  {Icon && (
                    <Icon className="size-4 shrink-0" strokeWidth={1.7} aria-hidden="true" />
                  )}
                  <span className="hidden flex-1 truncate sm:block">{item.label}</span>
                  {showBadge && (
                    <>
                      <span className="hidden min-w-5 rounded-full bg-[#321b65] px-1.5 py-0.5 text-center text-[10px] leading-4 text-[#b78aff] sm:block">
                        {ticketsCount}
                      </span>
                      <span className="sr-only">, {ticketsCount} notifications</span>
                    </>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User footer */}
      <div className="border-t border-white/[0.06] p-3 sm:p-3.5">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full border border-violet-500/30 bg-violet-500/10 text-[11px] font-medium text-violet-300">
            {avatarInitials}
          </div>
          <div className="hidden min-w-0 flex-1 sm:block">
            <p className="truncate text-[12px] font-medium leading-4 text-white">{displayName}</p>
            <p className="truncate text-[10px] leading-4 text-violet-400">{displayRole}</p>
          </div>
          <button
            type="button"
            aria-label={`Log out ${displayName}`}
            title="Log out"
            onClick={logout}
            className="ml-auto flex size-7 shrink-0 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-white/[0.06] hover:text-slate-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400 sm:ml-0"
          >
            <LogOut className="size-3.5" strokeWidth={1.7} aria-hidden="true" />
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;