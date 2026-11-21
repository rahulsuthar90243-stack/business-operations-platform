import { useState } from "react";

const ACCESS_STATUSES = ["pending", "approved", "rejected"];

export default function EditCustomer({
  customer,
  onClose,
  onSave,
  saving,
  error,
}) {
  const [form, setForm] = useState(() => {
    const accessStatus =
      customer.accessStatus ?? customer.approvalStatus ?? "approved";

    return {
      username: customer.username ?? customer.name ?? "",
      email: customer.email ?? "",
      accessStatus: ACCESS_STATUSES.includes(accessStatus)
        ? accessStatus
        : "approved",
    };
  });

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function submitForm(event) {
    event.preventDefault();
    onSave({
      username: form.username.trim(),
      email: form.email.trim().toLowerCase(),
      accessStatus: form.accessStatus,
    });
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
        aria-labelledby="edit-customer-title"
        className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl"
      >
        <h2
          id="edit-customer-title"
          className="text-lg font-semibold text-slate-900"
        >
          Edit customer
        </h2>
        <form onSubmit={submitForm} className="mt-5 space-y-4">
          <label className="block text-sm font-medium text-slate-700">
            Name
            <input
              name="username"
              value={form.username}
              onChange={updateField}
              required
              maxLength={100}
              autoFocus
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 font-normal outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Email
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={updateField}
              required
              maxLength={254}
              autoComplete="email"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 font-normal outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Account approval
            <select
              name="accessStatus"
              value={form.accessStatus}
              onChange={updateField}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-normal outline-none focus:border-violet-400"
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </label>
          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              disabled={saving}
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="cursor-pointer rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}