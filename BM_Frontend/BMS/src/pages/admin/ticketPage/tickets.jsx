import { useCallback, useEffect, useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  AlertCircle,
  CalendarDays,
  Check,
  ChevronDown,
  Filter,
  GripVertical,
  LayoutGrid,
  LoaderCircle,
  Plus,
  Search,
  Ticket as TicketIcon,
  Trash2,
  X,
} from "lucide-react";
import TicketFormModal from "./TicketFormModal.jsx";
import TicketSummary from "./TicketSummary.jsx";
import PriorityDistribution from "./PriorityDistribution.jsx";
import TicketAssignee from "./ticketAssignee.jsx";
import { useAuth } from "../../../context/AuthContext.jsx";
import {
  getCompanyEmployees,
  getProjects,
} from "../../../services/adminService.js";
import {
  createTicket,
  deleteTicket,
  getTickets,
  updateTicket,
} from "../../../services/ticketService.js";

const STATUS_COLUMNS = [
  { id: "open", label: "To Do", color: "bg-slate-400" },
  { id: "in_progress", label: "In Progress", color: "bg-blue-500" },
  { id: "in_review", label: "In Review", color: "bg-amber-500" },
  { id: "resolved", label: "Done", color: "bg-emerald-500" },
];

const PRIORITY_COLUMNS = [
  { id: "urgent", label: "Urgent", color: "bg-red-500" },
  { id: "high", label: "High", color: "bg-orange-500" },
  { id: "medium", label: "Medium", color: "bg-blue-500" },
  { id: "low", label: "Low", color: "bg-slate-400" },
];

const PRIORITIES = ["urgent", "high", "medium", "low"];
const STATUS_OPTIONS = [
  { value: "open", label: "To Do" },
  { value: "in_progress", label: "In Progress" },
  { value: "in_review", label: "In Review" },
  { value: "resolved", label: "Done" },
  { value: "closed", label: "Closed" },
  { value: "escalated", label: "Escalated" },
];

// Utility functions for handling ticket data and formatting
function getId(value) {
  if (!value) return "";
  return typeof value === "string" ? value : value._id || value.id || "";
}

//Utility to get the name of a person
function getName(value) {
  if (!value) return "Unassigned";
  if (typeof value === "string") return value;
  return value.username || value.name || value.email || "Unassigned";
}

// Utility to get the priority of a ticket
function getPriority(ticket) {
  return ticket.priority === "critical"
    ? "urgent"
    : ticket.priority || "medium";
}

// Utility to get the status group of a ticket
function getStatusGroup(status) {
  if (status === "in_progress" || status === "in_review") return status;
  if (status === "resolved" || status === "closed") return "resolved";
  return "open";
}

//get the group of a ticket based on the groupBy parameter
function getTicketGroup(ticket, groupBy) {
  return groupBy === "priority"
    ? getPriority(ticket)
    : getStatusGroup(ticket.status);
}

//The ticket number is generated using the last 6 characters of the MongoDB ID.
function getDisplayId(ticket) {
  return `TKT-${String(ticket._id || "")
    .slice(-6)
    .toUpperCase()}`;
}

//format date value 
function formatDate(value) {
  if (!value) return "No due date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No due date";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function initials(name) {
  return String(name || "U")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

// Get a list of unique people from the projects and tickets
function personOptions(projects, tickets) {
  const people = new Map();
  for (const project of projects) {
    for (const member of project.members || []) {
      if (member && typeof member === "object" && member.role === "employee") {
        people.set(getId(member), member);
      }
    }
  }

  // Add ticket assignees to the people map
  for (const ticket of tickets) {
    const assignee = ticket.assignedTo;
    if (assignee && typeof assignee === "object") {
      people.set(getId(assignee), assignee);
    }
  }
  return [...people.entries()]
    .filter(([id]) => id)
    .map(([id, person]) => ({ id, name: getName(person) }))
    .sort((a, b) => a.name.localeCompare(b.name));
}


function PriorityBadge({ priority }) {
  const styles = {
    urgent: "bg-red-50 text-red-700 ring-red-200",
    high: "bg-orange-50 text-orange-700 ring-orange-200",
    medium: "bg-blue-50 text-blue-700 ring-blue-200",
    low: "bg-slate-100 text-slate-600 ring-slate-200",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ring-1 ring-inset ${styles[priority] || styles.medium}`}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {priority}
    </span>
  );
}

function TicketCard({
  ticket,
  groupId,
  canMove,
  canAssign,
  employees,
  employeesError,
  onAssign,
  onOpen,
}) {
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id: ticket._id,
    data: { groupId },
    disabled: !canMove,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      onClick={() => onOpen(ticket)}
      className="cursor-pointer rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm transition hover:border-violet-200 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] font-medium tracking-wide text-slate-400">
            {getDisplayId(ticket)}
          </p>
          <h3 className="mt-1 line-clamp-2 text-sm font-semibold leading-5 text-slate-800">
            {ticket.title}
          </h3>
        </div>
        {canMove && (
          <button
            type="button"
            {...attributes}
            {...listeners}
            aria-label={`Drag ${ticket.title}`}
            onClick={(event) => event.stopPropagation()}
            className="shrink-0 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-violet-500"
          >
            <GripVertical className="size-4" aria-hidden="true" />
          </button>
        )}
      </div>

      <p className="mt-2 line-clamp-2 min-h-9 text-xs leading-[18px] text-slate-500">
        {ticket.description || "No description provided."}
      </p>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <PriorityBadge priority={getPriority(ticket)} />
        {ticket.status === "escalated" && (
          <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-medium text-rose-700">
            Escalated
          </span>
        )}
      </div>

      <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
        <TicketAssignee
          ticket={ticket}
          canAssign={canAssign}
          employees={employees}
          employeesError={employeesError}
          onAssign={onAssign}
          getId={getId}
          getName={getName}
          initials={initials}
        />
        <div className="flex min-w-0 items-center justify-between gap-2 text-[11px] text-slate-500">
          <span className="truncate">
            {getName(ticket.project) || "No project"}
          </span>
          <span className="flex shrink-0 items-center gap-1">
            <CalendarDays className="size-3" aria-hidden="true" />
            {ticket.dueDate ? formatDate(ticket.dueDate) : "No due date"}
          </span>
        </div>
      </div>
    </article>
  );
}

// Component to display a column of tickets in the board view, with drag-and-drop support
function BoardColumn({
  column,
  tickets,
  groupBy,
  canMove,
  canAssign,
  employees,
  employeesError,
  onAssign,
  onOpen,
  onAdd,
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: `lane:${column.id}`,
    data: { groupId: column.id },
    disabled: !canMove,
  });
  const count = tickets.length;

  return (
    <section
      ref={setNodeRef}
      className={`flex w-[286px] shrink-0 flex-col self-start rounded-xl border p-3 transition-colors sm:w-[310px] ${
        isOver
          ? "border-violet-300 bg-violet-50/70"
          : "border-slate-200 bg-slate-50/80"
      }`}
      aria-label={`${column.label}, ${count} tickets`}
    >
      <div className="mb-3 flex items-center justify-between gap-2 px-0.5">
        <div className="flex min-w-0 items-center gap-2">
          <span className={`size-2 rounded-full ${column.color}`} />
          <h2 className="truncate text-sm font-semibold text-slate-700">
            {column.label}
          </h2>
          <span className="rounded-md bg-white px-1.5 py-0.5 text-[11px] font-medium text-slate-500 ring-1 ring-slate-200">
            {count}
          </span>
        </div>
        <button
          type="button"
          onClick={() => onAdd(column.id, groupBy)}
          aria-label={`Create ticket in ${column.label}`}
          className="rounded-md p-1 text-slate-400 transition hover:bg-white hover:text-violet-700"
        >
          <Plus className="size-4" aria-hidden="true" />
        </button>
      </div>

      <SortableContext
        items={tickets.map((ticket) => ticket._id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex min-h-24 flex-col gap-2.5">
          {tickets.map((ticket) => (
            <TicketCard
              key={ticket._id}
              ticket={ticket}
              groupId={column.id}
              canMove={canMove}
              canAssign={canAssign}
              employees={employees}
              employeesError={employeesError}
              onAssign={onAssign}
              onOpen={onOpen}
            />
          ))}
          {!count && (
            <div className="flex min-h-20 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-white/70 text-xs text-slate-400">
              Drop a ticket here
            </div>
          )}
        </div>
      </SortableContext>
    </section>
  );
}

function TicketDrawer({
  ticket,
  projects,
  employees,
  canEditFields,
  canChangeStatus,
  canDelete,
  onClose,
  onDelete,
  onSave,
  saving,
  deleting,
}) {
  const [form, setForm] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setForm({
      title: ticket.title || "",
      description: ticket.description || "",
      priority: ticket.priority || "medium",
      status: ticket.status || "open",
      assignedTo: getId(ticket.assignedTo),
      dueDate: ticket.dueDate
        ? new Date(ticket.dueDate).toISOString().slice(0, 10)
        : "",
    });
    setError("");
  }, [ticket]);

  if (!form) return null;
  const project = projects.find((item) => item._id === getId(ticket.project));
  const isDirty =
    form.title !== (ticket.title || "") ||
    form.description !== (ticket.description || "") ||
    form.priority !== (ticket.priority || "medium") ||
    form.status !== (ticket.status || "open") ||
    form.assignedTo !== getId(ticket.assignedTo) ||
    form.dueDate !==
      (ticket.dueDate
        ? new Date(ticket.dueDate).toISOString().slice(0, 10)
        : "");

  async function submit(event) {
    event.preventDefault();
    setError("");
    try {
      await onSave({
        title: form.title.trim(),
        description: form.description.trim(),
        priority: form.priority,
        status: form.status,
        assignedTo: form.assignedTo || null,
        dueDate: form.dueDate || null,
      });
    } catch (saveError) {
      setError(saveError.message || "Unable to update this ticket.");
    }
  }

  async function remove() {
    if (
      !window.confirm(
        `Delete "${ticket.title}"? This action cannot be undone.`,
      )
    ) {
      return;
    }

    setError("");
    try {
      await onDelete();
    } catch (deleteError) {
      setError(deleteError.message || "Unable to delete this ticket.");
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-slate-950/35">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
        aria-label="Close ticket details"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="ticket-detail-title"
        className="relative z-10 flex h-full w-full max-w-2xl flex-col bg-white shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-7">
          <div className="flex min-w-0 items-center gap-2 text-xs text-slate-500">
            <TicketIcon className="size-4 text-violet-600" aria-hidden="true" />
            <span>{getDisplayId(ticket)}</span>
            <span className="text-slate-300">/</span>
            <span className="truncate">{getName(ticket.project)}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close details"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </header>

        <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-7">
            {canEditFields ? (
              <label className="block">
                <span className="sr-only">Ticket title</span>
                <input
                  id="ticket-detail-title"
                  value={form.title}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                  required
                  maxLength={200}
                  className="w-full border-0 p-0 text-xl font-semibold text-slate-900 outline-none placeholder:text-slate-300 focus:ring-0 sm:text-2xl"
                />
              </label>
            ) : (
              <h2
                id="ticket-detail-title"
                className="text-xl font-semibold text-slate-900 sm:text-2xl"
              >
                {ticket.title}
              </h2>
            )}

            <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_230px]">
              <div>
                <h3 className="text-sm font-semibold text-slate-800">
                  Description
                </h3>
                {canEditFields ? (
                  <textarea
                    value={form.description}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        description: event.target.value,
                      }))
                    }
                    rows={8}
                    className="mt-2 w-full resize-y rounded-lg border border-slate-200 px-3 py-2.5 text-sm leading-6 text-slate-700 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15"
                    placeholder="Add a description..."
                  />
                ) : (
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                    {ticket.description || "No description provided."}
                  </p>
                )}
                <section className="mt-8 rounded-xl border border-dashed border-slate-200 bg-slate-50/70 p-4">
                  <h3 className="text-sm font-semibold text-slate-700">
                    Activity
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Ticket comments and per-ticket activity history are not
                    available in the current API.
                  </p>
                </section>
              </div>

              <dl className="space-y-4 rounded-xl border border-slate-200 p-4">
                <div>
                  <dt className="text-xs font-medium text-slate-500">Status</dt>
                  {canChangeStatus ? (
                    <select
                      value={form.status}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          status: event.target.value,
                        }))
                      }
                      className="mt-1.5 h-9 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-sm text-slate-700"
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <dd className="mt-1 text-sm font-medium text-slate-800">
                      {STATUS_OPTIONS.find(
                        (item) => item.value === ticket.status,
                      )?.label || ticket.status}
                    </dd>
                  )}
                </div>
                <div>
                  <dt className="text-xs font-medium text-slate-500">
                    Priority
                  </dt>
                  {canEditFields ? (
                    <select
                      value={
                        getPriority(ticket) === "urgent" &&
                        form.priority === "critical"
                          ? "critical"
                          : form.priority
                      }
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          priority: event.target.value,
                        }))
                      }
                      className="mt-1.5 h-9 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-sm capitalize text-slate-700"
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
                  ) : (
                    <dd className="mt-1">
                      <PriorityBadge priority={getPriority(ticket)} />
                    </dd>
                  )}
                </div>
                <div>
                  <dt className="text-xs font-medium text-slate-500">
                    Assignee
                  </dt>
                  {canEditFields ? (
                    <select
                      value={form.assignedTo}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          assignedTo: event.target.value,
                        }))
                      }
                      className="mt-1.5 h-9 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-sm text-slate-700"
                    >
                      <option value="">Unassigned</option>
                      {employees.map((employee) => (
                        <option key={getId(employee)} value={getId(employee)}>
                          {getName(employee)}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <dd className="mt-1 text-sm font-medium text-slate-800">
                      {getName(ticket.assignedTo)}
                    </dd>
                  )}
                </div>
                <div>
                  <dt className="text-xs font-medium text-slate-500">
                    Project
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-slate-800">
                    {getName(ticket.project)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-slate-500">
                    Due date
                  </dt>
                  {canEditFields ? (
                    <input
                      type="date"
                      value={form.dueDate}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          dueDate: event.target.value,
                        }))
                      }
                      className="mt-1.5 h-9 w-full rounded-lg border border-slate-200 px-2.5 text-sm text-slate-700"
                    />
                  ) : (
                    <dd className="mt-1 text-sm font-medium text-slate-800">
                      {formatDate(ticket.dueDate)}
                    </dd>
                  )}
                </div>
                <div>
                  <dt className="text-xs font-medium text-slate-500">
                    Created
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-slate-800">
                    {formatDate(ticket.createdAt)}
                  </dd>
                </div>
              </dl>
            </div>
            {error && (
              <p
                role="alert"
                className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
              >
                {error}
              </p>
            )}
          </div>

          {(canEditFields || canChangeStatus) && (
            <footer className="flex items-center justify-between gap-2 border-t border-slate-200 px-5 py-4 sm:px-7">
              {canDelete && (
                <button
                  type="button"
                  onClick={remove}
                  disabled={saving || deleting}
                  className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {deleting ? (
                    <LoaderCircle className="size-4 animate-spin" />
                  ) : (
                    <Trash2 className="size-4" aria-hidden="true" />
                  )}
                  {deleting ? "Deleting..." : "Delete ticket"}
                </button>
              )}
              <div className="ml-auto flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={saving || deleting}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={saving || deleting || !isDirty}
                  className="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving && <LoaderCircle className="size-4 animate-spin" />}
                  {saving ? "Saving..." : "Save changes"}
                </button>
              </div>
            </footer>
          )}
        </form>
      </aside>
    </div>
  );
}

export default function TicketManagementPage() {
  const { user } = useAuth();
  const role = user?.role;
  const canCreate = ["admin", "manager", "employee"].includes(role);
  const canEditFields = ["admin", "manager"].includes(role);
  const canChangeStatus = ["admin", "manager", "employee"].includes(role);
  const canAssignTickets = ["admin", "manager"].includes(role);
  const canDelete = ["admin", "manager", "employee"].includes(role);

  const [tickets, setTickets] = useState([]);
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [projectError, setProjectError] = useState("");
  const [employeesError, setEmployeesError] = useState("");
  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [groupBy, setGroupBy] = useState("status");
  const [assigneeFilter, setAssigneeFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [projectFilter, setProjectFilter] = useState("");
  const [dueFilter, setDueFilter] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [createStatus, setCreateStatus] = useState("open");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [savingTicket, setSavingTicket] = useState(false);
  const [deletingTicket, setDeletingTicket] = useState(false);
  const [pendingIds, setPendingIds] = useState(() => new Set());
  const [activeTicket, setActiveTicket] = useState(null);
  const [notice, setNotice] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const refreshTickets = useCallback(async () => {
    const result = await getTickets();
    if (!Array.isArray(result)) {
      throw new Error("The tickets response was not a list.");
    }
    setTickets(result);
    setSelectedTicket((current) =>
      current
        ? result.find((ticket) => ticket._id === current._id) || current
        : null,
    );
  }, []);

  useEffect(() => {
    let active = true;

    async function loadPage() {
      setLoading(true);
      setError("");
      const results = await Promise.allSettled([
        getTickets(),
        role === "customer" ? Promise.resolve([]) : getProjects(),
        role === "customer" ? Promise.resolve([]) : getCompanyEmployees(),
      ]);
      if (!active) return;

      if (
        results[0].status === "fulfilled" &&
        Array.isArray(results[0].value)
      ) {
        setTickets(results[0].value);
      } else {
        setError(
          results[0].status === "rejected"
            ? results[0].reason?.message || "Unable to load tickets."
            : "The tickets response was not a list.",
        );
      }

      if (role !== "customer") {
        if (
          results[1].status === "fulfilled" &&
          Array.isArray(results[1].value)
        ) {
          setProjects(results[1].value);
        } else {
          setProjectError(
            results[1].status === "rejected"
              ? results[1].reason?.message || "Unable to load project options."
              : "The projects response was not a list.",
          );
        }

        if (
          results[2].status === "fulfilled" &&
          Array.isArray(results[2].value)
        ) {
          setEmployees(results[2].value);
        } else {
          setEmployeesError(
            results[2].status === "rejected"
              ? results[2].reason?.message ||
                  "Unable to load company employees."
              : "The company employees response was not a list.",
          );
        }
      }
      setLoading(false);
    }

    loadPage();
    return () => {
      active = false;
    };
  }, [role]);

  useEffect(() => {
    if (!notice) return undefined;
    const timeout = window.setTimeout(() => setNotice(null), 4200);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  const people = useMemo(
    () => personOptions(projects, tickets),
    [projects, tickets],
  );
  const projectChoices = useMemo(() => {
    const choices = new Map();
    for (const project of projects) {
      if (project?._id)
        choices.set(project._id, project.name || "Untitled project");
    }
    for (const ticket of tickets) {
      if (ticket.project?._id) {
        choices.set(
          ticket.project._id,
          ticket.project.name || "Untitled project",
        );
      }
    }
    return [...choices.entries()].map(([id, name]) => ({ id, name }));
  }, [projects, tickets]);

  const filteredTickets = useMemo(() => {
    const query = search.trim().toLowerCase();
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    return tickets.filter((ticket) => {
      const dueDate = ticket.dueDate ? new Date(ticket.dueDate) : null;
      const validDueDate = dueDate && !Number.isNaN(dueDate.getTime());
      const matchesSearch =
        !query ||
        String(ticket.title || "")
          .toLowerCase()
          .includes(query) ||
        getDisplayId(ticket).toLowerCase().includes(query) ||
        String(ticket._id || "")
          .toLowerCase()
          .includes(query);
      const matchesDue =
        !dueFilter ||
        (dueFilter === "overdue" && validDueDate && dueDate < today) ||
        (dueFilter === "next7" &&
          validDueDate &&
          dueDate >= today &&
          dueDate <= nextWeek) ||
        (dueFilter === "none" && !ticket.dueDate);
      const assigneeId = getId(ticket.assignedTo);
      const matchesAssignee =
        !assigneeFilter ||
        (assigneeFilter === "unassigned"
          ? !assigneeId
          : assigneeId === assigneeFilter);

      return (
        matchesSearch &&
        matchesAssignee &&
        (!priorityFilter || getPriority(ticket) === priorityFilter) &&
        (!projectFilter || getId(ticket.project) === projectFilter) &&
        matchesDue
      );
    });
  }, [
    tickets,
    search,
    assigneeFilter,
    priorityFilter,
    projectFilter,
    dueFilter,
  ]);

  const summary = useMemo(
    () => ({
      open: tickets.filter((ticket) => ticket.status === "open").length,
      inProgress: tickets.filter((ticket) => ticket.status === "in_progress")
        .length,
      resolved: tickets.filter(
        (ticket) => ticket.status === "resolved" || ticket.status === "closed",
      ).length,
      escalated: tickets.filter((ticket) => ticket.status === "escalated")
        .length,
    }),
    [tickets],
  );

  const priorityCounts = useMemo(() => {
    const counts = Object.fromEntries(
      PRIORITIES.map((priority) => [priority, 0]),
    );
    for (const ticket of tickets) counts[getPriority(ticket)] += 1;
    return counts;
  }, [tickets]);
  const totalPriorities = tickets.length || 1;

  const columns = groupBy === "status" ? STATUS_COLUMNS : PRIORITY_COLUMNS;
  const ticketsByColumn = useMemo(
    () =>
      Object.fromEntries(
        columns.map((column) => [
          column.id,
          filteredTickets.filter(
            (ticket) => getTicketGroup(ticket, groupBy) === column.id,
          ),
        ]),
      ),
    [columns, filteredTickets, groupBy],
  );

  function openCreate(status = "open", grouping = "status") {
    setCreateStatus(
      grouping === "status"
        ? status === "resolved"
          ? "resolved"
          : status
        : "open",
    );
    setCreateError("");
    setShowCreate(true);
  }

  async function submitCreate(form) {
    if (!form.projectId) {
      setCreateError("Select a project before creating the ticket.");
      return;
    }
    setCreating(true);
    setCreateError("");
    try {
      await createTicket(form.projectId, {
        title: form.title.trim(),
        description: form.description.trim(),
        assignedTo: form.assignedTo || null,
        status: form.status,
        priority: form.priority,
        dueDate: form.dueDate || null,
      });
      setShowCreate(false);
      setNotice({ type: "success", text: "Ticket created successfully." });
      await refreshTickets();
    } catch (requestError) {
      setCreateError(requestError.message || "Unable to create the ticket.");
    } finally {
      setCreating(false);
    }
  }

  async function saveTicket(updates) {
    if (!selectedTicket?._id) return;
    setSavingTicket(true);
    try {
      const updated = await updateTicket(selectedTicket._id, updates);
      setTickets((current) =>
        current.map((ticket) =>
          ticket._id === updated._id ? updated : ticket,
        ),
      );
      setSelectedTicket(updated);
      setNotice({ type: "success", text: "Ticket updated successfully." });
    } catch (requestError) {
      throw requestError;
    } finally {
      setSavingTicket(false);
    }
  }

  async function assignTicket(ticketId, employeeId) {
    const updated = await updateTicket(ticketId, {
      assignedTo: employeeId || null,
    });
    setTickets((current) =>
      current.map((ticket) =>
        ticket._id === ticketId ? { ...ticket, ...updated } : ticket,
      ),
    );
    setSelectedTicket((current) =>
      current?._id === ticketId ? { ...current, ...updated } : current,
    );
  }

  async function removeTicket() {
    const ticketId = selectedTicket?._id;
    if (!ticketId) throw new Error("Ticket ID is missing.");

    setDeletingTicket(true);
    try {
      await deleteTicket(ticketId);
      setTickets((current) =>
        current.filter((ticket) => ticket._id !== ticketId),
      );
      setSelectedTicket(null);
      setNotice({ type: "success", text: "Ticket deleted successfully." });
    } finally {
      setDeletingTicket(false);
    }
  }

  async function changeGroup(ticketId, destination) {
    const previousTickets = tickets;
    const ticket = tickets.find((item) => item._id === ticketId);
    if (!ticket || pendingIds.has(ticketId)) return;
    const source = getTicketGroup(ticket, groupBy);
    if (source === destination) return;
    const changes =
      groupBy === "status"
        ? { status: destination }
        : { priority: destination === "urgent" ? "critical" : destination };

    setPendingIds((current) => new Set(current).add(ticketId));
    setTickets((current) =>
      current.map((item) =>
        item._id === ticketId ? { ...item, ...changes } : item,
      ),
    );
    setSelectedTicket((current) =>
      current?._id === ticketId ? { ...current, ...changes } : current,
    );

    try {
      const updated = await updateTicket(ticketId, changes);
      setTickets((current) =>
        current.map((item) => (item._id === ticketId ? updated : item)),
      );
      setSelectedTicket((current) =>
        current?._id === ticketId ? updated : current,
      );
    } catch (requestError) {
      setTickets(previousTickets);
      setSelectedTicket((current) =>
        current?._id === ticketId
          ? previousTickets.find((item) => item._id === ticketId) || current
          : current,
      );
      setNotice({
        type: "error",
        text:
          requestError.message ||
          "Ticket status could not be saved. Changes were reverted.",
      });
    } finally {
      setPendingIds((current) => {
        const next = new Set(current);
        next.delete(ticketId);
        return next;
      });
    }
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    setActiveTicket(null);
    if (!over) return;
    const ticketId = String(active.id);
    const destination = over.data.current?.groupId;
    if (destination) changeGroup(ticketId, destination);
  }

  const clearFilters = () => {
    setAssigneeFilter("");
    setPriorityFilter("");
    setProjectFilter("");
    setDueFilter("");
  };

  return (
    <div className="space-y-5 pb-8">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-violet-600">
            Workspace
          </p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
            Ticket Management
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Track requests, manage priorities, and keep work moving.
          </p>
        </div>
        {canCreate && (
          <button
            type="button"
            onClick={() => openCreate()}
            disabled={!projects.length || Boolean(projectError)}
            className="cursor-pointer inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-violet-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="size-4" aria-hidden="true" />
            Create ticket
          </button>
        )}
      </div>

      {notice && (
        <div
          role={notice.type === "error" ? "alert" : "status"}
          className={`flex items-center justify-between gap-3 rounded-lg border px-3.5 py-2.5 text-sm ${
            notice.type === "error"
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
        >
          <span className="flex items-center gap-2">
            {notice.type === "error" ? (
              <AlertCircle className="size-4" aria-hidden="true" />
            ) : (
              <Check className="size-4" aria-hidden="true" />
            )}
            {notice.text}
          </span>
          <button
            type="button"
            onClick={() => setNotice(null)}
            aria-label="Dismiss notification"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          <p className="font-medium">Tickets could not be loaded</p>
          <p className="mt-1">{error}</p>
          <button
            type="button"
            onClick={async () => {
              setLoading(true);
              setError("");
              try {
                await refreshTickets();
              } catch (requestError) {
                setError(requestError.message || "Unable to load tickets.");
              } finally {
                setLoading(false);
              }
            }}
            className="mt-3 rounded-md bg-white px-3 py-1.5 font-medium text-red-700 ring-1 ring-red-200 hover:bg-red-100"
          >
            Try again
          </button>
        </div>
      ) : (
        <>
          <TicketSummary summary={summary} />

          <PriorityDistribution
            priorities={PRIORITIES}
            priorityCounts={priorityCounts}
            totalPriorities={totalPriorities}
          />

          {projectError && canCreate && (
            <p
              role="alert"
              className="rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-sm text-amber-800"
            >
              Project options could not be loaded, so ticket creation is
              unavailable. {projectError}
            </p>
          )}

          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-200 p-3.5 sm:flex-row sm:items-center sm:px-4">
              <label className="relative min-w-0 flex-1 sm:max-w-sm">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search tickets by title or ID"
                  aria-label="Search tickets by title or ID"
                  className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none transition focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-500/15"
                />
              </label>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFiltersOpen((open) => !open)}
                  aria-expanded={filtersOpen}
                  className={`inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition ${
                    filtersOpen
                      ? "border-violet-200 bg-violet-50 text-violet-700"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Filter className="size-4" aria-hidden="true" />
                  Filters
                  <ChevronDown
                    className={`size-3.5 transition-transform ${filtersOpen ? "rotate-180" : ""}`}
                  />
                </button>
                <label className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-2.5 text-xs font-medium text-slate-500">
                  <LayoutGrid className="size-3.5" aria-hidden="true" />
                  <span className="hidden sm:inline">Group by</span>
                  <select
                    value={groupBy}
                    onChange={(event) => setGroupBy(event.target.value)}
                    aria-label="Group tickets by"
                    className="max-w-24 bg-transparent text-sm text-slate-700 outline-none"
                  >
                    <option value="status">Status</option>
                    <option value="priority">Priority</option>
                  </select>
                </label>
                <span className="ml-auto text-xs text-slate-400 sm:ml-0">
                  {filteredTickets.length}{" "}
                  {filteredTickets.length === 1 ? "ticket" : "tickets"}
                </span>
              </div>
            </div>

            {filtersOpen && (
              <div className="grid gap-3 border-b border-slate-200 bg-slate-50/70 p-3.5 sm:grid-cols-2 lg:grid-cols-4 sm:px-4">
                <label className="text-xs font-medium text-slate-500">
                  Assignee
                  <select
                    value={assigneeFilter}
                    onChange={(event) => setAssigneeFilter(event.target.value)}
                    className="mt-1.5 h-9 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-sm font-normal text-slate-700"
                  >
                    <option value="">Everyone</option>
                    <option value="unassigned">Unassigned</option>
                    {people.map((person) => (
                      <option key={person.id} value={person.id}>
                        {person.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-xs font-medium text-slate-500">
                  Priority
                  <select
                    value={priorityFilter}
                    onChange={(event) => setPriorityFilter(event.target.value)}
                    className="mt-1.5 h-9 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-sm font-normal text-slate-700"
                  >
                    <option value="">All priorities</option>
                    {PRIORITIES.map((priority) => (
                      <option key={priority} value={priority}>
                        {priority}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-xs font-medium text-slate-500">
                  Project
                  <select
                    value={projectFilter}
                    onChange={(event) => setProjectFilter(event.target.value)}
                    className="mt-1.5 h-9 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-sm font-normal text-slate-700"
                  >
                    <option value="">All projects</option>
                    {projectChoices.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-xs font-medium text-slate-500">
                  Due date
                  <select
                    value={dueFilter}
                    onChange={(event) => setDueFilter(event.target.value)}
                    className="mt-1.5 h-9 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-sm font-normal text-slate-700"
                  >
                    <option value="">Any due date</option>
                    <option value="overdue">Overdue</option>
                    <option value="next7">Due in the next 7 days</option>
                    <option value="none">No due date</option>
                  </select>
                </label>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-left text-xs font-medium text-violet-700 hover:text-violet-800 sm:col-span-2 lg:col-span-4"
                >
                  Clear filters
                </button>
              </div>
            )}

            {loading ? (
              <div
                className="flex gap-3 overflow-hidden p-4"
                aria-label="Loading tickets"
              >
                {Array.from({ length: 4 }, (_, index) => (
                  <div
                    key={index}
                    className="h-64 w-[286px] shrink-0 animate-pulse rounded-xl bg-slate-100"
                  />
                ))}
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={({ active }) => {
                  setActiveTicket(
                    tickets.find((ticket) => ticket._id === active.id) || null,
                  );
                }}
                onDragCancel={() => setActiveTicket(null)}
                onDragEnd={handleDragEnd}
              >
                <div className="flex min-h-[360px] gap-3 overflow-x-auto p-3.5 sm:p-4">
                  {columns.map((column) => (
                    <BoardColumn
                      key={column.id}
                      column={column}
                      tickets={ticketsByColumn[column.id] || []}
                      groupBy={groupBy}
                      canMove={canChangeStatus && pendingIds.size === 0}
                      canAssign={canAssignTickets}
                      employees={employees}
                      employeesError={employeesError}
                      onAssign={assignTicket}
                      onOpen={setSelectedTicket}
                      onAdd={openCreate}
                    />
                  ))}
                  {!filteredTickets.length && (
                    <div className="pointer-events-none absolute inset-x-0 mt-32 text-center text-sm text-slate-400">
                      {tickets.length
                        ? "No tickets match these filters."
                        : "No tickets yet. Create one to get started."}
                    </div>
                  )}
                </div>
                <DragOverlay>
                  {activeTicket ? (
                    <div className="w-[286px] rotate-[1deg] rounded-xl border border-violet-200 bg-white p-3.5 shadow-xl sm:w-[310px]">
                      <p className="text-[11px] font-medium text-slate-400">
                        {getDisplayId(activeTicket)}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        {activeTicket.title}
                      </p>
                    </div>
                  ) : null}
                </DragOverlay>
              </DndContext>
            )}
          </section>
        </>
      )}

      {showCreate && (
        <TicketFormModal
          projects={projects}
          employees={employees}
          employeesError={employeesError}
          initialStatus={createStatus}
          getId={getId}
          getName={getName}
          saving={creating}
          error={createError}
          onClose={() => {
            if (!creating) setShowCreate(false);
          }}
          onSubmit={submitCreate}
        />
      )}

      {selectedTicket && (
        <TicketDrawer
          ticket={selectedTicket}
          projects={projects}
          employees={employees}
          canEditFields={canEditFields}
          canChangeStatus={canChangeStatus}
          canDelete={canDelete}
          saving={savingTicket}
          deleting={deletingTicket}
          onDelete={removeTicket}
          onClose={() => setSelectedTicket(null)}
          onSave={saveTicket}
        />
      )}
    </div>
  );
}

