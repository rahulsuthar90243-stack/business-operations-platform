import { useState } from "react";
import { LoaderCircle, X } from "lucide-react";

const EMPTY_FORM = {
  title: "",
  description: "",
  projectId: "",
  assignedTo: "",
  priority: "medium",
  status: "open",
  dueDate: "",
};

const PRIORITIES = ["urgent", "high", "medium", "low"];
const STATUS_OPTIONS = [
  { value: "open", label: "To Do" },
  { value: "in_progress", label: "In Progress" },
  { value: "in_review", label: "In Review" },
  { value: "resolved", label: "Done" },
  { value: "closed", label: "Closed" },
  { value: "escalated", label: "Escalated" },
];

export default function TicketFormModal({
  projects,
  employees,
  employeesError,
  initialStatus,
  getId,
  getName,
  onClose,
  onSubmit,
  saving,
  error,
}) {
  const [form, setForm] = useState({
    ...EMPTY_FORM,
    status: initialStatus || "open",
    projectId: projects[0]?._id || "",
  });
  const selectedProject = projects.find(
    (project) => project._id === form.projectId,
  );

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
      ...(name === "projectId" ? { assignedTo: "" } : {}),
    }));
  }

  function submitForm(event) {
    event.preventDefault();
    onSubmit(form);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-3 sm:p-6">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-ticket-title"
        className="max-h-[92dvh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-6"
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2
              id="create-ticket-title"
              className="text-lg font-semibold text-slate-900"
            >
              Create ticket
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Add a request to a project workspace.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Close create ticket dialog"
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={submitForm} className="space-y-4">
          <label className="block text-sm font-medium text-slate-700">
            Ticket title
            <input
              name="title"
              value={form.title}
              onChange={updateField}
              required
              minLength={1}
              maxLength={200}
              autoFocus
              className="mt-1.5 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm font-normal outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15"
              placeholder="What needs to be done?"
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Description
            <textarea
              name="description"
              value={form.description}
              onChange={updateField}
              required
              rows={4}
              className="mt-1.5 w-full resize-y rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-normal outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15"
              placeholder="Add context, requirements, or steps to reproduce."
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Project
            <select
              name="projectId"
              value={form.projectId}
              onChange={updateField}
              required
              className="mt-1.5 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-normal outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15"
            >
              <option value="">Select a project</option>
              {projects.map((project) => (
                <option key={project._id} value={project._id}>
                  {project.name}
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700">
              Assigned employee
              <select
                name="assignedTo"
                value={form.assignedTo}
                onChange={updateField}
                className="mt-1.5 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-normal outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15"
              >
                <option value="">Unassigned</option>
                {employees.map((employee) => (
                  <option key={getId(employee)} value={getId(employee)}>
                    {getName(employee)}
                  </option>
                ))}
              </select>
              {employeesError ? (
                <span
                  role="alert"
                  className="mt-1 block text-xs font-normal text-red-600"
                >
                  {employeesError}
                </span>
              ) : selectedProject && employees.length === 0 ? (
                <span className="mt-1 block text-xs font-normal text-slate-400">
                  No company employees are available.
                </span>
              ) : null}
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Priority
              <select
                name="priority"
                value={form.priority}
                onChange={updateField}
                className="mt-1.5 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-normal capitalize outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15"
              >
                {PRIORITIES.map((priority) => (
                  <option
                    key={priority}
                    value={priority === "urgent" ? "critical" : priority}
                  >
                    {priority}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Status
              <select
                name="status"
                value={form.status}
                onChange={updateField}
                className="mt-1.5 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-normal outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15"
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Due date
              <input
                type="date"
                name="dueDate"
                value={form.dueDate}
                onChange={updateField}
                className="mt-1.5 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm font-normal outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15"
              />
            </label>
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
            >
              {error}
            </p>
          )}
          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !projects.length}
              className="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving && <LoaderCircle className="size-4 animate-spin" />}
              {saving ? "Creating..." : "Create ticket"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
