import { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Grid2x2,
  List,
  Pencil,
  Plus,
  Search,
  X,
} from "lucide-react";
import ProjectGridView from "./projectGridView.jsx";
import ProjectTableView from "./projectTableView.jsx";
import {
  createProject,
  getAllUser,
  getProjects,
  updateProject,
} from "../../../services/adminService.js";

const PAGE_SIZE = 6;

const statusOptions = [
  { value: "on-track", label: "On Track" },
  { value: "at-risk", label: "At Risk" },
  { value: "delayed", label: "Delayed" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const summaryItems = [
  { label: "Total Projects", status: "", tone: "text-violet-600" },
  { label: "On Track", status: "on-track", tone: "text-emerald-600" },
  { label: "At Risk", status: "at-risk", tone: "text-amber-600" },
  { label: "Delayed", status: "delayed", tone: "text-red-500" },
  { label: "Completed", status: "completed", tone: "text-slate-600" },
];

const projectStatuses = ["planned", "active", "on-hold", "completed", "cancelled"];

const statusStyles = {
  "on-track": "border-emerald-200 bg-emerald-50 text-emerald-700",
  "at-risk": "border-amber-200 bg-amber-50 text-amber-700",
  delayed: "border-red-200 bg-red-50 text-red-700",
  completed: "border-slate-200 bg-slate-100 text-slate-700",
  cancelled: "border-slate-200 bg-slate-50 text-slate-500",
};

const initialForm = {
  name: "",
  description: "",
  manager: "",
  members: [],
  status: "planned",
  startDate: "",
  dueDate: "",
};

function getPersonName(person) {
  if (!person) return "Unassigned";
  if (typeof person === "string") return person;
  return person.username || person.name || person.email || "Unknown user";
}

function getPersonId(person) {
  if (!person) return "";
  return typeof person === "string" ? person : person._id || person.id || "";
}

function getDisplayStatus(project) {
  const status = String(project.status || "").toLowerCase();
  if (status === "completed") return "completed";
  if (status === "cancelled") return "cancelled";
  if (status === "on-hold") return "at-risk";

  if (project.dueDate) {
    const dueDate = new Date(project.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (!Number.isNaN(dueDate.getTime()) && dueDate < today) return "delayed";
  }

  return "on-track";
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(date);
}

// date formatting for yyyy-mm-dd input fields
function toDateInputValue(value) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

function ProjectFormModal({
  managers,
  employees,
  project,
  onClose,
  onSubmit,
  saving,
  error,
}) {
  const [form, setForm] = useState(() =>
    project
      ? {
          name: project.name || "",
          description: project.description || "",
          manager: getPersonId(project.manager),
          members: (project.members || []).map(getPersonId).filter(Boolean),
          status: project.status || "planned",
          startDate: toDateInputValue(project.startDate),
          dueDate: toDateInputValue(project.dueDate),
        }
      : initialForm,
  );
  const editing = Boolean(project);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function toggleMember(memberId) {
    setForm((current) => ({
      ...current,
      members: current.members.includes(memberId)
        ? current.members.filter((id) => id !== memberId)
        : [...current.members, memberId],
    }));
  }

  function submitForm(event) {
    event.preventDefault();
    onSubmit(form);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-form-title"
        className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 id="project-form-title" className="text-xl font-semibold text-slate-800">
            {editing ? "Update Project" : "Create Project"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={submitForm} className="space-y-4">
          <label className="block text-sm font-medium text-slate-700">
            Project name
            <input
              name="name"
              value={form.name}
              onChange={updateField}
              required
              minLength={3}
              maxLength={100}
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal"
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Description
            <textarea
              name="description"
              value={form.description}
              onChange={updateField}
              maxLength={1000}
              rows={3}
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700">
              Manager
              <select
                name="manager"
                value={form.manager}
                onChange={updateField}
                required
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal"
              >
                <option value="">Select a manager</option>
                {managers.map((manager) => (
                  <option key={getPersonId(manager)} value={getPersonId(manager)}>
                    {getPersonName(manager)}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Project status
              <select
                name="status"
                value={form.status}
                onChange={updateField}
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal"
              >
                {projectStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status.replace("-", " ")}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Start date
              <input
                name="startDate"
                type="date"
                value={form.startDate}
                onChange={updateField}
                required
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal"
              />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Deadline
              <input
                name="dueDate"
                type="date"
                value={form.dueDate}
                onChange={updateField}
                required
                min={form.startDate || undefined}
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal"
              />
            </label>
          </div>

          <fieldset className="rounded-xl border border-slate-200 p-3">
            <legend className="px-1 text-sm font-medium text-slate-700">
              Project members
            </legend>
            <p className="mb-2 text-xs text-slate-500">
              Select employees from your company to assign to this project.
            </p>
            {employees.length ? (
              <div className="max-h-40 space-y-1 overflow-y-auto">
                {employees.map((employee) => {
                  const employeeId = getPersonId(employee);
                  return (
                    <label
                      key={employeeId}
                      className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <input
                        type="checkbox"
                        checked={form.members.includes(employeeId)}
                        onChange={() => toggleMember(employeeId)}
                        className="rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                      />
                      <span>{getPersonName(employee)}</span>
                      {employee.email && (
                        <span className="ml-auto truncate text-xs text-slate-400">
                          {employee.email}
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            ) : (
              <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-500">
                No employees are available in this company.
              </p>
            )}
            <p className="mt-2 text-xs text-slate-500">
              {form.members.length} employee{form.members.length === 1 ? "" : "s"} selected
            </p>
          </fieldset>

          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="cursor-pointer rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? editing
                  ? "Saving..."
                  : "Creating..."
                : editing
                  ? "Save Changes"
                  : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ProjectPage() {
  const [projects, setProjects] = useState([]);
  const [managers, setManagers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [managerFilter, setManagerFilter] = useState("");
  const [view, setView] = useState("table");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [managerError, setManagerError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [createError, setCreateError] = useState("");
  const [saving, setSaving] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  async function loadProjects() {
    setLoading(true);
    setError("");
    try {
      const result = await getProjects();
      if (!Array.isArray(result)) {
        throw new Error("The projects response was not a list.");
      }
      setProjects(result);
    } catch (loadError) {
      setError(loadError.message || "Unable to load projects.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;

    async function loadPageData() {
      const [projectsResult, usersResult] = await Promise.allSettled([
        getProjects(),
        getAllUser(),
      ]);

      if (!active) return;

      if (projectsResult.status === "fulfilled" && Array.isArray(projectsResult.value)) {
        setProjects(projectsResult.value);
      } else {
        setError(
          projectsResult.status === "rejected"
            ? projectsResult.reason?.message || "Unable to load projects."
            : "The projects response was not a list.",
        );
      }
      setLoading(false);

      if (usersResult.status === "fulfilled") {
        const users = Array.isArray(usersResult.value)
          ? usersResult.value
          : usersResult.value?.users;
        if (Array.isArray(users)) {
          setEmployees(
            users.filter(
              (user) =>
                String(user.role || user.userRole || "").toLowerCase() ===
                "employee",
            ),
          );
          setManagers(
            users.filter(
              (user) =>
                String(user.role || user.userRole || "").toLowerCase() ===
                "manager",
            ),
          );
        } else {
          setManagerError("The managers response was not a list.");
        }
      } else {
        setManagerError(
          usersResult.reason?.message || "Unable to load managers.",
        );
      }
    }

    loadPageData();
    return () => {
      active = false;
    };
  }, []);

  const filteredProjects = useMemo(() => {
    const query = search.trim().toLowerCase();
    return projects.filter((project) => {
      const managerId = getPersonId(project.manager);
      const searchableValues = [
        project.name,
        project.description,
        project.companyId?.companyName,
        getPersonName(project.manager),
        getPersonName(project.createdBy),
        ...(project.members || []).map(getPersonName),
      ];
      const matchesSearch =
        !query ||
        searchableValues.some((value) =>
          String(value || "").toLowerCase().includes(query),
        );
      return (
        matchesSearch &&
        (!statusFilter || getDisplayStatus(project) === statusFilter) &&
        (!managerFilter || managerId === managerFilter)
      );
    });
  }, [projects, search, statusFilter, managerFilter]);

  const summaryCounts = useMemo(
    () =>
      summaryItems.map((item) => ({
        ...item,
        value: item.status
          ? projects.filter((project) => getDisplayStatus(project) === item.status)
              .length
          : projects.length,
      })),
    [projects],
  );

  //Pagination Logic
  const pageCount = Math.max(1, Math.ceil(filteredProjects.length / PAGE_SIZE));
  const pagedProjects = filteredProjects.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, managerFilter]);


  //Create projest API function
  async function handleCreateProject(form) {
    setSaving(true);
    setCreateError("");
    try {
      await createProject(form);
      setShowCreateForm(false);
      await loadProjects();
    } catch (requestError) {
      setCreateError(requestError.message || "Unable to create project.");
    } finally {
      setSaving(false);
    }
  }

  //Update Project API Function
  async function handleUpdateProject(form) {
    if (!editingProject?._id) {
      setCreateError("Project ID is missing.");
      return;
    }

    setSaving(true);
    setCreateError("");
    try {
      await updateProject(editingProject._id, form);
      setEditingProject(null);
      setSelectedProject(null);
      await loadProjects();
    } catch (requestError) {
      setCreateError(requestError.message || "Unable to update project.");
    } finally {
      setSaving(false);
    }
  }

  // renderStatus()-Status Badge
  function renderStatus(project) {
    const status = getDisplayStatus(project);
    const label =
      statusOptions.find((option) => option.value === status)?.label ||
      status.replace("-", " ");
    return (
      <span
        className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${statusStyles[status]}`}
      >
        {label}
      </span>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-800">
            Projects
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage company projects and track progress across all clients.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start xl:self-auto">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm">
            <button
              type="button"
              onClick={() => setView("table")}
              className={`flex h-9 w-9 items-center justify-center rounded-lg transition ${
                view === "table"
                  ? "bg-slate-100 text-slate-700"
                  : "text-slate-500 hover:bg-slate-100"
              }`}
              aria-label="Table view"
              aria-pressed={view === "table"}
            >
              <Grid2x2 className="h-4 w-4" strokeWidth={1.8} />
            </button>
            <button
              type="button"
              onClick={() => setView("grid")}
              className={`flex h-9 w-9 items-center justify-center rounded-lg transition ${
                view === "grid"
                  ? "bg-slate-100 text-slate-700"
                  : "text-slate-500 hover:bg-slate-100"
              }`}
              aria-label="Grid view"
              aria-pressed={view === "grid"}
            >
              <List className="h-4 w-4" strokeWidth={1.8} />
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              setCreateError("");
              setShowCreateForm(true);
            }}
            className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:brightness-105"
          >
            <Plus className="h-4 w-4" strokeWidth={2} />
            Create Project
          </button>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        {summaryCounts.map(({ label, value, tone }) => (
          <div
            key={label}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-5 shadow-sm"
          >
            <div className={`text-4xl font-semibold tracking-tight ${tone}`}>
              {loading ? "—" : value}
            </div>
            <div className="mt-2 text-base text-slate-600">{label}</div>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50/70 px-4 py-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              strokeWidth={2}
              aria-hidden="true"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search projects, customers, or users..."
              aria-label="Search projects"
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter by status"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600 shadow-sm"
            >
              <option value="">All Statuses</option>
              {statusOptions.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>

            <select
              value={managerFilter}
              onChange={(event) => setManagerFilter(event.target.value)}
              aria-label="Filter by manager"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600 shadow-sm"
            >
              <option value="">All Managers</option>
              {managers.map((manager) => (
                <option key={getPersonId(manager)} value={getPersonId(manager)}>
                  {getPersonName(manager)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {(error || managerError) && (
          <div
            className="border-b border-red-100 bg-red-50 px-5 py-3 text-sm text-red-700"
            role="alert"
          >
            {error || managerError}
          </div>
        )}

        {loading ? (
          <div className="px-5 py-12 text-center text-sm text-slate-500">
            Loading projects...
          </div>
        ) : pagedProjects.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-slate-500">
            {error ? "Projects could not be loaded." : "No projects found."}
          </div>
        ) : view === "grid" ? (
          <ProjectGridView
            projects={pagedProjects}
            getPersonName={getPersonName}
            renderStatus={renderStatus}
            formatDate={formatDate}
            onSelectProject={setSelectedProject}
          />
        ) : (
          <ProjectTableView
            projects={pagedProjects}
            getPersonName={getPersonName}
            renderStatus={renderStatus}
            formatDate={formatDate}
            onSelectProject={setSelectedProject}
          />
        )}

        <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50/50 px-5 py-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>
            Showing{" "}
            {filteredProjects.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}-
            {Math.min(page * PAGE_SIZE, filteredProjects.length)} of{" "}
            {filteredProjects.length} projects
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page <= 1}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-2 text-slate-600">
              Page {page} of {pageCount}
            </span>
            <button
              type="button"
              onClick={() =>
                setPage((current) => Math.min(pageCount, current + 1))
              }
              disabled={page >= pageCount}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {showCreateForm && (
        <ProjectFormModal
          managers={managers}
          employees={employees}
          project={null}
          onClose={() => setShowCreateForm(false)}
          onSubmit={handleCreateProject}
          saving={saving}
          error={createError || managerError}
        />
      )}

      {editingProject && (
        <ProjectFormModal
          key={editingProject._id}
          managers={managers}
          employees={employees}
          project={editingProject}
          onClose={() => {
            setEditingProject(null);
            setCreateError("");
          }}
          onSubmit={handleUpdateProject}
          saving={saving}
          error={createError || managerError}
        />
      )}

      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-details-title"
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 id="project-details-title" className="text-xl font-semibold text-slate-800">
                {selectedProject.name}
              </h2>
              <button
                type="button"
                onClick={() => setSelectedProject(null)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                aria-label="Close project details"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-4 text-sm">
              <div>
                <dt className="text-slate-500">Status</dt>
                <dd className="mt-1">{renderStatus(selectedProject)}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Company</dt>
                <dd className="mt-1 text-slate-800">
                  {selectedProject.companyId?.companyName || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Manager</dt>
                <dd className="mt-1 text-slate-800">
                  {getPersonName(selectedProject.manager)}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Created By</dt>
                <dd className="mt-1 text-slate-800">
                  {getPersonName(selectedProject.createdBy)}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Start Date</dt>
                <dd className="mt-1 text-slate-800">
                  {formatDate(selectedProject.startDate)}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Deadline</dt>
                <dd className="mt-1 text-slate-800">
                  {formatDate(selectedProject.dueDate)}
                </dd>
              </div>
              <div className="col-span-2">
                <dt className="text-slate-500">Description</dt>
                <dd className="mt-1 whitespace-pre-wrap text-slate-800">
                  {selectedProject.description || "No description"}
                </dd>
              </div>
            </dl>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setCreateError("");
                  setEditingProject(selectedProject);
                  setSelectedProject(null);
                }}
                className="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-700"
              >
                <Pencil className="h-4 w-4" />
                Update Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
