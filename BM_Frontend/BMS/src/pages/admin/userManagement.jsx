import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Users,
  ShieldCheck,
  BriefcaseBusiness,
  UserRound,
  Building2,
  Pencil,
  CircleCheck,
  CircleX,
  X,
} from "lucide-react";
import PageWrapper from "../../components/PageWrapper.jsx";
import {
  approveUser,
  getAllUser,
  rejectUser,
  updateUser,
} from "../../services/adminService.js";

const ROLE_LABELS = {
  admin: "Admin",
  manager: "Manager",
  employee: "Employee",
  customer: "Customer",
};

function getAccessApprovalStatus(user) {
  const status = String(user.accessStatus ?? user.approvalStatus ?? "").toLowerCase();
  return ["pending", "approved", "rejected"].includes(status) ? status : "unknown";
}

function getUserStatus(user) {
  const approvalStatus = String(
    user.accessStatus ?? user.approvalStatus ?? user.status ?? "",
  ).toLowerCase();
  if (approvalStatus === "pending" || approvalStatus === "rejected")
    return approvalStatus;
  if (approvalStatus === "approved") {
    if (typeof user.isOnline === "boolean")
      return user.isOnline ? "active" : "inactive";
    return user.isActive === true ? "active" : "inactive";
  }
  if (approvalStatus === "active" || approvalStatus === "inactive")
    return approvalStatus;
  if (user.isOnline === true || user.isActive === true) return "active";
  if (user.isOnline === false || user.isActive === false) return "inactive";
  return "unknown";
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : new Intl.DateTimeFormat("en", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(date);
}

function initials(name) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "U"
  );
}

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savingUserId, setSavingUserId] = useState("");

  useEffect(() => {
    let isCurrent = true;
    getAllUser()
      .then((result) => {
        const list = Array.isArray(result) ? result : result?.users;
        if (isCurrent) setUsers(Array.isArray(list) ? list : []);
      })
      .catch((requestError) => {
        if (isCurrent)
          setError(requestError.message || "Could not load users.");
      })
      .finally(() => {
        if (isCurrent) setLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  const counts = useMemo(() => {
    const byRole = (role) =>
      users.filter(
        (user) =>
          String(user.role ?? user.userRole ?? "").toLowerCase() === role,
      ).length;
    return {
      total: users.length,
      admins: byRole("admin"),
      managers: byRole("manager"),
      employees: byRole("employee"),
      customers: byRole("customer"),
    };
  }, [users]);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return users.filter((user) => {
      const role = String(user.role ?? user.userRole ?? "").toLowerCase();
      const status = getUserStatus(user);
      const name = user.username ?? user.name ?? "";
      const matchesSearch =
        !query || `${name} ${user.email ?? ""}`.toLowerCase().includes(query);
      return (
        matchesSearch &&
        (roleFilter === "all" || role === roleFilter) &&
        (statusFilter === "all" || status === statusFilter)
      );
    });
  }, [users, search, roleFilter, statusFilter]);

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

  async function handleApprovalAction(user, action) {
    const userId = user._id ?? user.id;
    if (!userId) return;
    setActionError("");
    setSavingUserId(userId);
    try {
      if (action === "approve") await approveUser(userId);
      else await rejectUser(userId);
      setUsers((current) =>
        current.map((item) =>
          (item._id ?? item.id) === userId
            ? {
                ...item,
                accessStatus: action === "approve" ? "approved" : "rejected",
              }
            : item,
        ),
      );
    } catch (requestError) {
      setActionError(requestError.message || `Could not ${action} this user.`);
    } finally {
      setSavingUserId("");
    }
  }

  async function handleEditSubmit(event) {
    event.preventDefault();
    if (!editingUser) return;
    setSaving(true);
    setActionError("");
    try {
      const userId = editingUser._id ?? editingUser.id;
      const updated = await updateUser(userId, {
        username: editingUser.username,
        email: editingUser.email,
        role: editingUser.role,
        accessStatus: editingUser.accessStatus,
      });
      setUsers((current) =>
        current.map((item) =>
          (item._id ?? item.id) === userId
            ? { ...item, ...(updated?.user ?? updated) }
            : item,
        ),
      );
      setEditingUser(null);
    } catch (requestError) {
      setActionError(requestError.message || "Could not update this user.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <PageWrapper>
      <section aria-labelledby="user-management-title">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1
              id="user-management-title"
              className="text-xl font-semibold text-slate-900"
            >
              User Management
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage employees, managers and customer accounts.
            </p>
          </div>
          <button
            type="button"
            disabled
            title="Connect a create-user API to enable this action"
            className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium text-white opacity-70 shadow-sm"
          >
            <Plus aria-hidden="true" className="size-4" /> Add User
          </button>
        </div>

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

        <section
          className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
          aria-label="Users"
        >
          <div className="flex flex-wrap gap-2 border-b border-slate-100 p-4">
            <label className="relative min-w-[220px] flex-1 sm:max-w-sm">
              <Search
                aria-hidden="true"
                className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
              />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name or email..."
                className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
              />
            </label>
            <select
              aria-label="Filter by role"
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 outline-none focus:border-violet-400"
            >
              <option value="all">All Roles</option>
              {Object.entries(ROLE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <select
              aria-label="Filter by status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 outline-none focus:border-violet-400"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {error && (
            <p role="alert" className="p-4 text-sm text-red-600">
              {error}
            </p>
          )}
          {actionError && (
            <p role="alert" className="px-4 pt-3 text-sm text-red-600">
              {actionError}
            </p>
          )}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Department</th>
                  <th className="px-4 py-3 font-medium">Access Approval</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Joined</th>
                  <th className="px-4 py-3 font-medium">Last Active</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan="8"
                      className="px-4 py-10 text-center text-slate-500"
                    >
                      Loading users…
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan="8"
                      className="px-4 py-10 text-center text-slate-500"
                    >
                      {error ? "Users could not be loaded." : "No users found."}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user, index) => {
                    const name = user.username ?? user.name ?? "Unnamed user";
                    const role = String(
                      user.role ?? user.userRole ?? "",
                    ).toLowerCase();
                    const approvalStatus = getAccessApprovalStatus(user);
                    const status = getUserStatus(user);
                    return (
                      <tr
                        key={user._id ?? user.id ?? user.email ?? index}
                        className="hover:bg-slate-50/70"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-medium text-violet-700">
                              {initials(name)}
                            </span>
                            <span className="min-w-0">
                              <span className="block truncate font-medium text-slate-800">
                                {name}
                              </span>
                              <span className="block truncate text-xs text-slate-500">
                                {user.email ?? "—"}
                              </span>
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-xs text-violet-700">
                            {ROLE_LABELS[role] ?? (role || "Unknown")}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {user.department ?? "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs ${approvalStatus === "approved" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : approvalStatus === "pending" ? "border-amber-200 bg-amber-50 text-amber-700" : approvalStatus === "rejected" ? "border-red-200 bg-red-50 text-red-700" : "border-slate-200 bg-white text-slate-500"}`}>
                            <span className="size-1.5 rounded-full bg-current" />
                            {approvalStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs ${status === "active" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : status === "pending" ? "border-amber-200 bg-amber-50 text-amber-700" : status === "rejected" ? "border-red-200 bg-red-50 text-red-700" : status === "inactive" ? "border-slate-200 bg-slate-100 text-slate-600" : "border-slate-200 bg-white text-slate-500"}`}
                          >
                            <span className="size-1.5 rounded-full bg-current" />
                            {status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500">
                          {formatDate(user.createdAt ?? user.joinedAt)}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500">
                          {user.lastActive ?? "—"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setActionError("");
                                setEditingUser({
                                  ...user,
                                  username: user.username ?? user.name ?? "",
                                  role,
                                });
                              }}
                              aria-label={`Edit ${name}`}
                              title="Edit user"
                              className="rounded-md p-2 text-slate-500 hover:bg-violet-50 hover:text-violet-700 focus-visible:outline-2 focus-visible:outline-violet-500"
                            >
                              <Pencil aria-hidden="true" className="size-4" />
                            </button>
                            {(status === "pending" ||
                              status === "rejected") && (
                              <>
                                <button
                                  type="button"
                                  disabled={
                                    savingUserId === (user._id ?? user.id)
                                  }
                                  onClick={() =>
                                    handleApprovalAction(user, "approve")
                                  }
                                  aria-label={`${status === "rejected" ? "Reapprove" : "Approve"} ${name}`}
                                  title={
                                    status === "rejected"
                                      ? "Approve user again"
                                      : "Approve user"
                                  }
                                  className="rounded-md p-2 text-emerald-600 hover:bg-emerald-50 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-emerald-500"
                                >
                                  <CircleCheck
                                    aria-hidden="true"
                                    className="size-4"
                                  />
                                </button>
                                {status === "pending" && (
                                  <button
                                    type="button"
                                    disabled={
                                      savingUserId === (user._id ?? user.id)
                                    }
                                    onClick={() =>
                                      handleApprovalAction(user, "reject")
                                    }
                                    aria-label={`Reject ${name}`}
                                    title="Reject user"
                                    className="rounded-md p-2 text-red-600 hover:bg-red-50 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-red-500"
                                  >
                                    <CircleX
                                      aria-hidden="true"
                                      className="size-4"
                                    />
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <div className="border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
            Showing {filteredUsers.length} of {users.length} users
          </div>
        </section>
      </section>
      {editingUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving)
              setEditingUser(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-user-title"
            className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2
                id="edit-user-title"
                className="text-lg font-semibold text-slate-900"
              >
                Edit user
              </h2>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                disabled={saving}
                aria-label="Close edit form"
                className="rounded-md p-1 text-slate-500 hover:bg-slate-100"
              >
                <X className="size-5" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <label className="block text-sm font-medium text-slate-700">
                Name
                <input
                  required
                  value={editingUser.username ?? ""}
                  onChange={(event) =>
                    setEditingUser((current) => ({
                      ...current,
                      username: event.target.value,
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 font-normal outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Email
                <input
                  required
                  type="email"
                  value={editingUser.email ?? ""}
                  onChange={(event) =>
                    setEditingUser((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 font-normal outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Role
                <select
                  value={editingUser.role ?? "customer"}
                  onChange={(event) =>
                    setEditingUser((current) => ({
                      ...current,
                      role: event.target.value,
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-normal outline-none focus:border-violet-400"
                >
                  {Object.entries(ROLE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm font-medium text-slate-700">
                Access Approval
                <select
                  value={editingUser.accessStatus ?? "pending"}
                  onChange={(event) =>
                    setEditingUser((current) => ({
                      ...current,
                      accessStatus: event.target.value,
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-normal outline-none focus:border-violet-400"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </label>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setEditingUser(null)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-60"
                >
                  {saving ? "Saving…" : "Save changes"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </PageWrapper>
  );
}
