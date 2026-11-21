import { useEffect, useMemo, useState } from "react";
import PageWrapper from "../../../components/PageWrapper.jsx";
import {
  createUser,
  getAllUser,
  getProjects,
  getTickets,
  updateUser,
} from "../../../services/adminService.js";
import CustomerFilters from "./CustomerFilters.jsx";
import CustomerPageHeader from "./CustomerPageHeader.jsx";
import CustomerStats from "./CustomerStats.jsx";
import CustomerTable from "./CustomerTable.jsx";
import EditCustomer from "./editCustomer.jsx";

const INITIAL_CUSTOMER_FORM = {
  username: "",
  email: "",
  password: "",
};

function getReferenceId(value) {
  if (value && typeof value === "object") {
    return value._id ?? value.id ?? "";
  }
  return value ?? "";
}

function getCustomerStatus(customer) {
  const accessStatus = String(
    customer.accessStatus ?? customer.approvalStatus ?? customer.status ?? "",
  ).toLowerCase();

  if (accessStatus === "pending") return "new";
  if (accessStatus === "rejected") return "rejected";
  if (accessStatus === "active" || accessStatus === "inactive")
    return accessStatus;
  return customer.isOnline === true || customer.isActive === true
    ? "active"
    : "inactive";
}

function isCreatedThisMonth(value) {
  if (!value) return false;
  const createdAt = new Date(value);
  const now = new Date();
  return (
    !Number.isNaN(createdAt.getTime()) &&
    createdAt.getFullYear() === now.getFullYear() &&
    createdAt.getMonth() === now.getMonth()
  );
}

function getCompanyName(customer) {
  const company = customer.company ?? customer.organization;
  if (typeof company === "string") return company;
  return (
    customer.companyName ??
    customer.organizationName ??
    company?.companyName ??
    company?.name ??
    customer.companyId?.companyName ??
    ""
  );
}

function csvCell(value) {
  let text = String(value ?? "");
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

function formatCustomerDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default function CustomerPage() {
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [customerForm, setCustomerForm] = useState(INITIAL_CUSTOMER_FORM);
  const [savingCustomer, setSavingCustomer] = useState(false);
  const [createError, setCreateError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [viewingCustomer, setViewingCustomer] = useState(null);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [savingCustomerChanges, setSavingCustomerChanges] = useState(false);
  const [editError, setEditError] = useState("");

  useEffect(() => {
    let isCurrent = true;

    Promise.all([getAllUser(), getProjects(), getTickets()])
      .then(([userResult, projectResult, ticketResult]) => {
        if (!isCurrent) return;

        const userList = Array.isArray(userResult)
          ? userResult
          : userResult?.users;
        const projectList = Array.isArray(projectResult)
          ? projectResult
          : projectResult?.projects;
        const ticketList = Array.isArray(ticketResult)
          ? ticketResult
          : ticketResult?.tickets;

        if (
          !Array.isArray(userList) ||
          !Array.isArray(projectList) ||
          !Array.isArray(ticketList)
        ) {
          throw new Error("The server returned incomplete customer data.");
        }

        setUsers(userList);
        setProjects(projectList);
        setTickets(ticketList);
      })
      .catch((requestError) => {
        if (isCurrent) {
          setError(requestError.message || "Could not load customer data.");
        }
      })
      .finally(() => {
        if (isCurrent) setLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  const customers = useMemo(() => {
    const customerUsers = users.filter(
      (user) =>
        String(user.role ?? user.userRole ?? "").toLowerCase() === "customer",
    );
    const activeProjectCounts = new Map();
    const openTicketCounts = new Map();

    projects.forEach((project) => {
      if (project.status !== "active") return;
      (project.members ?? []).forEach((member) => {
        const memberId = String(getReferenceId(member));
        if (memberId) {
          activeProjectCounts.set(
            memberId,
            (activeProjectCounts.get(memberId) ?? 0) + 1,
          );
        }
      });
    });

    tickets.forEach((ticket) => {
      if (ticket.status !== "open") return;
      const customerId = String(getReferenceId(ticket.createdBy));
      if (customerId) {
        openTicketCounts.set(
          customerId,
          (openTicketCounts.get(customerId) ?? 0) + 1,
        );
      }
    });

    return customerUsers.map((customer) => {
      const customerId = String(getReferenceId(customer._id ?? customer.id));

      return {
        ...customer,
        id: customerId,
        companyName: getCompanyName(customer),
        customerStatus: getCustomerStatus(customer),
        activeProjects: activeProjectCounts.get(customerId) ?? 0,
        openTickets: openTicketCounts.get(customerId) ?? 0,
        lastSeen: customer.lastSeen ?? customer.updatedAt ?? customer.createdAt,
      };
    });
  }, [users, projects, tickets]);

  const counts = useMemo(
    () => ({
      total: customers.length,
      active: customers.filter(
        (customer) => customer.customerStatus === "active",
      ).length,
      newThisMonth: customers.filter((customer) =>
        isCreatedThisMonth(customer.createdAt),
      ).length,
      withOpenTickets: customers.filter(
        (customer) => customer.openTickets > 0,
      ).length,
    }),
    [customers],
  );

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return customers.filter((customer) => {
      const searchableText = [
        customer.username,
        customer.name,
        customer.email,
        customer.companyName,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return (
        (!query || searchableText.includes(query)) &&
        (statusFilter === "all" ||
          customer.customerStatus === statusFilter)
      );
    });
  }, [customers, search, statusFilter]);

  function updateSearch(value) {
    setSearch(value);
    setPage(1);
  }

  function updateStatusFilter(value) {
    setStatusFilter(value);
    setPage(1);
  }

  function handleExport() {
    const headers = [
      "Name",
      "Email",
      "Status",
      "Active Projects",
      "Open Tickets",
      "Last Activity",
    ];
    const rows = filteredCustomers.map((customer) => [
      customer.username ?? customer.name,
      customer.email,
      customer.customerStatus,
      customer.activeProjects,
      customer.openTickets,
      customer.lastSeen,
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map(csvCell).join(","))
      .join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "customers.csv";
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  function openCreateCustomer() {
    setCustomerForm(INITIAL_CUSTOMER_FORM);
    setCreateError("");
    setSuccessMessage("");
    setShowAddCustomer(true);
  }

  async function handleCreateCustomer(event) {
    event.preventDefault();
    setSavingCustomer(true);
    setCreateError("");

    try {
      const createdCustomer = await createUser({
        ...customerForm,
        username: customerForm.username.trim(),
        email: customerForm.email.trim().toLowerCase(),
        role: "customer",
      });
      if (!createdCustomer || !(createdCustomer._id || createdCustomer.id)) {
        throw new Error("The server did not return the created customer.");
      }

      setUsers((current) => [createdCustomer, ...current]);
      setShowAddCustomer(false);
      setSuccessMessage("Customer created successfully.");
    } catch (requestError) {
      setCreateError(requestError.message || "Could not create this customer.");
    } finally {
      setSavingCustomer(false);
    }
  }

  function openEditCustomer(customer) {
    setEditError("");
    setEditingCustomer(customer);
  }

  async function handleUpdateCustomer(updates) {
    if (!editingCustomer) return;

    setSavingCustomerChanges(true);
    setEditError("");
    try {
      const updatedCustomer = await updateUser(editingCustomer.id, {
        ...updates,
        role: "customer",
      });
      if (!updatedCustomer || !(updatedCustomer._id || updatedCustomer.id)) {
        throw new Error("The server did not return the updated customer.");
      }

      setUsers((current) =>
        current.map((user) =>
          String(getReferenceId(user._id ?? user.id)) === editingCustomer.id
            ? updatedCustomer
            : user,
        ),
      );
      setEditingCustomer(null);
      setSuccessMessage("Customer updated successfully.");
    } catch (requestError) {
      setEditError(requestError.message || "Could not update this customer.");
    } finally {
      setSavingCustomerChanges(false);
    }
  }

  return (
    <PageWrapper>
      <CustomerPageHeader
        onExport={handleExport}
        onAddCustomer={openCreateCustomer}
        exportDisabled={loading || filteredCustomers.length === 0}
      />

      {successMessage && (
        <p
          role="status"
          className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700"
        >
          {successMessage}
        </p>
      )}

      <CustomerStats counts={counts} />
      <CustomerFilters
        search={search}
        onSearchChange={updateSearch}
        status={statusFilter}
        onStatusChange={updateStatusFilter}
      />
      <CustomerTable
        customers={filteredCustomers}
        loading={loading}
        error={error}
        page={page}
        onPageChange={setPage}
        onViewCustomer={setViewingCustomer}
        onEditCustomer={openEditCustomer}
      />

      {viewingCustomer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setViewingCustomer(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="view-customer-title"
            className="w-full max-w-lg rounded-xl bg-white p-5 shadow-xl"
          >
            <h2
              id="view-customer-title"
              className="text-lg font-semibold text-slate-900"
            >
              Customer details
            </h2>
            <dl className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-medium uppercase text-slate-500">Name</dt>
                <dd className="mt-1 text-sm text-slate-900">
                  {viewingCustomer.username || viewingCustomer.name || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase text-slate-500">Email</dt>
                <dd className="mt-1 break-all text-sm text-slate-900">
                  {viewingCustomer.email || "—"}
                </dd>
              </div>
              {viewingCustomer.companyName && (
                <div>
                  <dt className="text-xs font-medium uppercase text-slate-500">Company</dt>
                  <dd className="mt-1 text-sm text-slate-900">
                    {viewingCustomer.companyName}
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-xs font-medium uppercase text-slate-500">Status</dt>
                <dd className="mt-1 text-sm capitalize text-slate-900">
                  {viewingCustomer.customerStatus}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase text-slate-500">Active Projects</dt>
                <dd className="mt-1 text-sm text-slate-900">
                  {viewingCustomer.activeProjects}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase text-slate-500">Open Tickets</dt>
                <dd className="mt-1 text-sm text-slate-900">
                  {viewingCustomer.openTickets}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase text-slate-500">Joined</dt>
                <dd className="mt-1 text-sm text-slate-900">
                  {formatCustomerDate(viewingCustomer.createdAt)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase text-slate-500">Last Activity</dt>
                <dd className="mt-1 text-sm text-slate-900">
                  {formatCustomerDate(viewingCustomer.lastSeen)}
                </dd>
              </div>
            </dl>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setViewingCustomer(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </section>
        </div>
      )}

      {editingCustomer && (
        <EditCustomer
          customer={editingCustomer}
          onClose={() => setEditingCustomer(null)}
          onSave={handleUpdateCustomer}
          saving={savingCustomerChanges}
          error={editError}
        />
      )}

      {showAddCustomer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !savingCustomer) {
              setShowAddCustomer(false);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-customer-title"
            className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl"
          >
            <h2
              id="add-customer-title"
              className="text-lg font-semibold text-slate-900"
            >
              Add customer
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Create a customer account for your organization.
            </p>

            <form onSubmit={handleCreateCustomer} className="mt-5 space-y-4">
              <label className="block text-sm font-medium text-slate-700">
                Name
                <input
                  name="username"
                  value={customerForm.username}
                  onChange={(event) =>
                    setCustomerForm((current) => ({
                      ...current,
                      username: event.target.value,
                    }))
                  }
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
                  value={customerForm.email}
                  onChange={(event) =>
                    setCustomerForm((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
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
                  value={customerForm.password}
                  onChange={(event) =>
                    setCustomerForm((current) => ({
                      ...current,
                      password: event.target.value,
                    }))
                  }
                  required
                  minLength={8}
                  maxLength={72}
                  autoComplete="new-password"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 font-normal outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                />
                <span className="mt-1 block text-xs font-normal text-slate-500">
                  Use 8–72 characters.
                </span>
              </label>

              {createError && (
                <p role="alert" className="text-sm text-red-600">
                  {createError}
                </p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  disabled={savingCustomer}
                  onClick={() => setShowAddCustomer(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingCustomer}
                  className="cursor-pointer rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savingCustomer ? "Creating…" : "Create customer"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </PageWrapper>
  );
}