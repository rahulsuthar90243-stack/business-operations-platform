import { useState } from "react";
import { X } from "lucide-react";

const initialForm = {
  username: "",
  email: "",
  password: "",
  role: "employee",
};

const roleOptions = [
  { value: "admin", label: "Admin" },
  { value: "manager", label: "Manager" },
  { value: "employee", label: "Employee" },
  { value: "customer", label: "Customer" },
];

export default function AddUser({
  onClose,
  onSubmit,
  saving,
  error,
}) {
  const [form, setForm] = useState(initialForm);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function submitForm(event) {
    event.preventDefault();
    onSubmit({
      ...form,
      username: form.username.trim(),
      email: form.email.trim().toLowerCase(),
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
        aria-labelledby="add-user-title"
        className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2
              id="add-user-title"
              className="text-lg font-semibold text-slate-900"
            >
              Add user
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              New accounts are approved and can sign in immediately.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Close add user form"
            className="rounded-md p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={submitForm} className="space-y-4">
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
            Initial password
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={updateField}
              required
              minLength={8}
              maxLength={72}
              autoComplete="new-password"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 font-normal outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            />
            <span className="mt-1 block text-xs font-normal text-slate-500">
              Use 8–72 characters. Share this password securely with the user.
            </span>
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Role
            <select
              name="role"
              value={form.role}
              onChange={updateField}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-normal outline-none focus:border-violet-400"
            >
              {roleOptions.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
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
              {saving ? "Creating…" : "Create user"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

