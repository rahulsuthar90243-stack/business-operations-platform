import { useState } from "react";
import { Check, Search, UserRound } from "lucide-react";

const avatarColors = [
  "bg-violet-100 text-violet-700",
  "bg-blue-100 text-blue-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-cyan-100 text-cyan-700",
  "bg-fuchsia-100 text-fuchsia-700",
  "bg-orange-100 text-orange-700",
];

function getAvatarColor(name) {
  let hash = 0;
  for (const character of String(name || "").toLowerCase()) {
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  }
  return avatarColors[hash % avatarColors.length];
}

function AssigneeAvatar({ person, getId, getName, initials, sizeClass }) {
  const assigned = Boolean(getId(person));
  const name = getName(person);

  return (
    <span
      className={`flex ${sizeClass} shrink-0 items-center justify-center rounded-full font-semibold ${
        assigned ? getAvatarColor(name) : "bg-slate-100 text-slate-500"
      }`}
    >
      {assigned ? (
        initials(name)
      ) : (
        <UserRound className="size-4" aria-hidden="true" />
      )}
    </span>
  );
}

export default function TicketAssignee({
  ticket,
  canAssign,
  employees,
  employeesError,
  onAssign,
  getId,
  getName,
  initials,
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [assigning, setAssigning] = useState(false);

  const searchTerm = search.trim().toLowerCase();
  const matchingEmployees = employees.filter((employee) =>
    `${getName(employee)} ${employee.email || ""}`
      .toLowerCase()
      .includes(searchTerm),
  );

  async function assignEmployee(employeeId) {
    if (employeeId === getId(ticket.assignedTo)) {
      setPickerOpen(false);
      return;
    }

    setError("");
    setAssigning(true);
    try {
      await onAssign(ticket._id, employeeId);
      setPickerOpen(false);
      setSearch("");
    } catch (assignError) {
      setError(assignError.message || "Unable to update the assignee.");
    } finally {
      setAssigning(false);
    }
  }

  if (!canAssign) {
    return (
      <div className="flex min-w-0 items-center gap-2 text-xs text-slate-600">
        <AssigneeAvatar
          person={ticket.assignedTo}
          getId={getId}
          getName={getName}
          initials={initials}
          sizeClass="size-6 text-[9px]"
        />
        <span className="truncate">{getName(ticket.assignedTo)}</span>
      </div>
    );
  }

  return (
    <div
      className="relative min-w-0"
      onClick={(event) => event.stopPropagation()}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setPickerOpen(false);
        }
      }}
    >
      <button
        type="button"
        onClick={() => {
          setError("");
          setPickerOpen((open) => !open);
        }}
        aria-haspopup="listbox"
        aria-expanded={pickerOpen}
        aria-label={`Change assignee for ${ticket.title}`}
        className="flex w-full min-w-0 items-center gap-2 rounded-md text-left text-xs text-slate-600 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-violet-500"
      >
        <AssigneeAvatar
          person={ticket.assignedTo}
          getId={getId}
          getName={getName}
          initials={initials}
          sizeClass="size-6 text-[9px]"
        />
        <span className="truncate">{getName(ticket.assignedTo)}</span>
      </button>
      {pickerOpen && (
        <div className="absolute bottom-full left-0 z-30 mb-2 w-72 max-w-[calc(100vw-2rem)] rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
          <label className="relative block">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search for people"
              aria-label="Search employees"
              className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15"
            />
          </label>

          <div className="mt-2 max-h-56 overflow-y-auto" role="listbox">
            <button
              type="button"
              role="option"
              aria-selected={!getId(ticket.assignedTo)}
              disabled={assigning}
              onClick={() => assignEmployee("")}
              className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                <UserRound className="size-4" aria-hidden="true" />
              </span>
              <span>Unassigned</span>
              {!getId(ticket.assignedTo) && (
                <Check
                  className="ml-auto size-4 text-violet-600"
                  aria-hidden="true"
                />
              )}
            </button>

            {employeesError ? (
              <p className="px-2.5 py-3 text-xs text-red-600" role="alert">
                {employeesError}
              </p>
            ) : matchingEmployees.length ? (
              matchingEmployees.map((employee) => {
                const employeeId = getId(employee);
                const selected = employeeId === getId(ticket.assignedTo);
                return (
                  <button
                    key={employeeId}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    disabled={assigning || !employeeId}
                    onClick={() => assignEmployee(employeeId)}
                    className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  >
                    <AssigneeAvatar
                      person={employee}
                      getId={getId}
                      getName={getName}
                      initials={initials}
                      sizeClass="size-8 text-[10px]"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate">{getName(employee)}</span>
                      {employee.email && (
                        <span className="block truncate text-xs text-slate-400">
                          {employee.email}
                        </span>
                      )}
                    </span>
                    {selected && (
                      <Check
                        className="size-4 text-violet-600"
                        aria-hidden="true"
                      />
                    )}
                  </button>
                );
              })
            ) : (
              <p className="px-2.5 py-3 text-xs text-slate-500">
                No employees found.
              </p>
            )}
          </div>
          {assigning && (
            <p className="px-2.5 py-2 text-xs text-slate-500">
              Updating assignee...
            </p>
          )}
          {error && (
            <p className="px-2.5 py-2 text-xs text-red-600" role="alert">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
