import { X } from "lucide-react";

export default function EditUserModal({
  user,
  roles,
  onUserChange,
  onClose,
  onSubmit,
  saving,
}) {
  function updateField(event) {
    const { name, value } = event.target;
    onUserChange((current) => ({ ...current, [name]: value }));
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) onClose();
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
            onClick={onClose}
            disabled={saving}
            aria-label="Close edit form"
            className="rounded-md p-1 text-slate-500 hover:bg-slate-100"
          >
            <X className="size-5" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block text-sm font-medium text-slate-700">
            Name
            <input
              name="username"
              required
              value={user.username ?? ""}
              onChange={updateField}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 font-normal outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Email
            <input
              name="email"
              required
              type="email"
              value={user.email ?? ""}
              onChange={updateField}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 font-normal outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Role
            <select
              name="role"
              value={user.role ?? "customer"}
              onChange={updateField}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-normal outline-none focus:border-violet-400"
            >
              {Object.entries(roles).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Access Approval
            <select
              name="accessStatus"
              value={user.accessStatus ?? "pending"}
              onChange={updateField}
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
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="cursor-pointer rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}


