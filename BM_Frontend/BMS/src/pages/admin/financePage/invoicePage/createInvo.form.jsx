import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronDown,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { getAllUser } from "../../../../services/adminService.js";
import {
  createInvoice,
  updateInvoice,
} from "../../../../services/financeService.js";
import { createEditForm } from "./updateForm.jsx";

const DRAFT_STORAGE_KEY = "bms-invoice-draft";
const CURRENCY = "INR";
const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: CURRENCY,
  minimumFractionDigits: 2,
});

function getLocalDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDueDate(issueDate, days) {
  const dueDate = new Date(`${issueDate}T12:00:00`);
  dueDate.setDate(dueDate.getDate() + days);
  return getLocalDate(dueDate);
}

function createInitialForm() {
  const issueDate = getLocalDate(new Date());
  return {
    customerId: "",
    issueDate,
    dueDate: getDueDate(issueDate, 14),
    paymentTerm: "14",
    notes: "",
    taxPercent: "8",
    discountPercent: "0",
    items: [
      { description: "Website design & development", quantity: "1", unitPrice: "6500" },
      { description: "Monthly maintenance", quantity: "2", unitPrice: "500" },
    ],
  };
}


function getCustomerId(customer) {
  return String(customer?._id ?? customer?.id ?? "");
}

function getCustomerName(customer) {
  return customer?.username || customer?.name || customer?.email || "Customer";
}

const fieldClassName =
  "h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100";

function FormLabel({ children, required = false, htmlFor }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-[11px] font-semibold text-slate-700">
      {children}
      {required && <span className="ml-0.5 text-slate-500"> *</span>}
    </label>
  );
}

export default function CreateInvoiceForm({
  onClose,
  onCreated,
  onUpdated,
  invoiceToEdit,
}) {
  const [customers, setCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(true);
  const [customersError, setCustomersError] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerMenuOpen, setCustomerMenuOpen] = useState(false);
  const [form, setForm] = useState(() =>
    invoiceToEdit ? createEditForm(invoiceToEdit) : createInitialForm(),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [creationComplete, setCreationComplete] = useState(false);
  const [previewNumber] = useState(() => {
    if (invoiceToEdit?.invoiceNumber) return invoiceToEdit.invoiceNumber;
    const year = new Date().getFullYear();
    return `INV-${year}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
  });

  useEffect(() => {
    let active = true;

    getAllUser()
      .then((result) => {
        const users = Array.isArray(result) ? result : result?.users;
        if (!Array.isArray(users)) {
          throw new Error("The server returned customer data in an unexpected format.");
        }
        if (active) {
          setCustomers(
            users.filter(
              (user) =>
                String(user.role ?? user.userRole ?? "").toLowerCase() ===
                "customer",
            ),
          );
        }
      })
      .catch((requestError) => {
        if (active) {
          setCustomersError(
            requestError.message || "Unable to load customers.",
          );
        }
      })
      .finally(() => {
        if (active) setCustomersLoading(false);
      });

    if (!invoiceToEdit) {
      try {
        const savedDraft = window.localStorage.getItem(DRAFT_STORAGE_KEY);
        if (savedDraft) {
          const pDraarsedft = JSON.parse(savedDraft);
          if (
            parsedDraft &&
            typeof parsedDraft === "object" &&
            Array.isArray(parsedDraft.items)
          ) {
            setForm({ ...createInitialForm(), ...parsedDraft });
          }
        }
      } catch (storageError) {
        setError(
          storageError.message || "The saved invoice draft could not be loaded.",
        );
      }
    }

    return () => {
      active = false;
    };
  }, [invoiceToEdit]);

  const selectedCustomer = customers.find(
    (customer) => getCustomerId(customer) === form.customerId,
  );
  const filteredCustomers = useMemo(() => {
    const query = customerSearch.trim().toLocaleLowerCase();
    return customers.filter((customer) =>
      [getCustomerName(customer), customer.email, customer.companyName]
        .filter(Boolean)
        .some((value) => String(value).toLocaleLowerCase().includes(query)),
    );
  }, [customerSearch, customers]);

  const subtotal = useMemo(
    () =>
      form.items.reduce((sum, item) => {
        const quantity = Number(item.quantity) || 0;
        const unitPrice = Number(item.unitPrice) || 0;
        return sum + quantity * unitPrice;
      }, 0),
    [form.items],
  );
  const taxAmount = (subtotal * (Number(form.taxPercent) || 0)) / 100;
  const discountAmount =
    (subtotal * (Number(form.discountPercent) || 0)) / 100;
  const total = Math.max(subtotal + taxAmount - discountAmount, 0);
  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function chooseCustomer(customer) {
    updateForm("customerId", getCustomerId(customer));
    setCustomerSearch("");
    setCustomerMenuOpen(false);
  }

  function updateItem(index, field, value) {
    setForm((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    }));
  }

  function addItem() {
    setForm((current) => ({
      ...current,
      items: [...current.items, { description: "", quantity: "1", unitPrice: "" }],
    }));
  }

  function removeItem(index) {
    setForm((current) => ({
      ...current,
      items: current.items.filter((_, itemIndex) => itemIndex !== index),
    }));
  }

  function updatePaymentTerm(value) {
    setForm((current) => ({
      ...current,
      paymentTerm: value,
      dueDate:
        value === "custom"
          ? current.dueDate
          : getDueDate(current.issueDate, Number(value)),
    }));
  }

  function handleIssueDateChange(value) {
    setForm((current) => ({
      ...current,
      issueDate: value,
      dueDate:
        current.paymentTerm === "custom"
          ? current.dueDate
          : getDueDate(value, Number(current.paymentTerm)),
    }));
  }

  function handleDueDateChange(value) {
    setForm((current) => ({ ...current, dueDate: value, paymentTerm: "custom" }));
  }

  function getInvoicePayload() {
    const items = form.items.map((item) => ({
      description: item.description.trim(),
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
    }));

    if (!form.customerId) {
      throw new Error("Choose a customer before creating this invoice.");
    }
    if (
      items.length === 0 ||
      items.some(
        (item) =>
          !item.description ||
          !Number.isInteger(item.quantity) ||
          item.quantity < 1 ||
          !Number.isFinite(item.unitPrice) ||
          item.unitPrice < 0,
      )
    ) {
      throw new Error("Add a description, quantity, and valid rate for every line item.");
    }
    if (!form.dueDate || form.dueDate < form.issueDate) {
      throw new Error("The due date must be on or after the issue date.");
    }
    if (
      !Number.isFinite(Number(form.taxPercent)) ||
      Number(form.taxPercent) < 0 ||
      !Number.isFinite(Number(form.discountPercent)) ||
      Number(form.discountPercent) < 0
    ) {
      throw new Error("Tax and discount percentages must be zero or greater.");
    }
    if (discountAmount > subtotal + taxAmount) {
      throw new Error("The discount cannot be greater than the invoice amount.");
    }

    return {
      customerId: form.customerId,
      items,
      taxAmount: Number(taxAmount.toFixed(2)),
      discountAmount: Number(discountAmount.toFixed(2)),
      invoiceDate: form.issueDate,
      dueDate: form.dueDate,
      notes: form.notes.trim(),
    };
  }

  function handleSaveDraft() {
    setError("");
    setNotice("");
    try {
      window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(form));
      setNotice("Draft saved in this browser. Reopen this form to continue editing.");
    } catch (storageError) {
      setError(storageError.message || "Unable to save the invoice draft.");
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setNotice("");

    let payload;
    try {
      payload = getInvoicePayload();
    } catch (validationError) {
      setError(validationError.message);
      return;
    }

    setSaving(true);
    try {
      const savedInvoice = invoiceToEdit
        ? await updateInvoice(invoiceToEdit._id, payload)
        : await createInvoice(payload);
      if (!savedInvoice || !(savedInvoice._id || savedInvoice.invoiceNumber)) {
        throw new Error("The server did not return the saved invoice.");
      }
      if (invoiceToEdit) {
        onUpdated?.(savedInvoice);
      } else {
        onCreated?.(savedInvoice);
      }
      if (invoiceToEdit) {
        onClose?.();
        return;
      }
      try {
        window.localStorage.removeItem(DRAFT_STORAGE_KEY);
      } catch (storageError) {
        setCreationComplete(true);
        setNotice(
          `Invoice created, but the saved draft could not be cleared: ${storageError.message}`,
        );
        return;
      }
      onClose?.();
    } catch (requestError) {
      setError(
        requestError.message ||
          (invoiceToEdit
            ? "Unable to update the invoice."
            : "Unable to create the invoice."),
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) onClose?.();
      }}
      className="fixed inset-0 z-50 flex justify-end bg-slate-900/40"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-invoice-title"
        className="flex h-full max-h-screen w-full max-w-3xl flex-col overflow-hidden border-l border-slate-200 bg-white shadow-2xl"
      >
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-7">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">
                Invoice details
              </p>
              <h1 id="create-invoice-title" className="sr-only">
                {invoiceToEdit ? "Update invoice" : "Create invoice"}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[10px] font-medium text-violet-700">
                Draft
              </span>
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                aria-label="Close create invoice form"
                className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
              >
                <X aria-hidden="true" className="size-4" />
              </button>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
            <section aria-labelledby="customer-heading">
              <h2 id="customer-heading" className="text-sm font-semibold text-slate-900">
                Customer
              </h2>
              <p className="mt-1 text-[11px] text-slate-500">
                Choose who will receive this invoice.
              </p>

              <div className="mt-4">
                <FormLabel htmlFor="invoice-customer" required>
                  Bill to
                </FormLabel>
                <div className="relative">
                  <button
                    id="invoice-customer"
                    type="button"
                    role="combobox"
                    aria-haspopup="listbox"
                    aria-expanded={customerMenuOpen}
                    aria-controls="invoice-customer-options"
                    onClick={() => setCustomerMenuOpen((isOpen) => !isOpen)}
                    disabled={customersLoading || Boolean(customersError)}
                    className={`${fieldClassName} flex items-center justify-between pr-3 text-left disabled:bg-slate-50`}
                  >
                    <span className={selectedCustomer ? "truncate" : "text-slate-400"}>
                      {customersLoading
                        ? "Loading customers…"
                        : selectedCustomer
                          ? getCustomerName(selectedCustomer)
                          : "Select a customer"}
                    </span>
                    <ChevronDown aria-hidden="true" className="ml-2 size-4 shrink-0 text-slate-400" />
                  </button>
                  {customerMenuOpen && (
                    <div className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-md border border-slate-200 bg-white shadow-lg">
                      <label className="relative block border-b border-slate-100 p-2">
                        <Search
                          aria-hidden="true"
                          className="absolute left-4 top-1/2 size-3.5 -translate-y-1/2 text-slate-400"
                        />
                        <input
                          type="search"
                          autoFocus
                          role="searchbox"
                          aria-label="Search customers"
                          value={customerSearch}
                          onChange={(event) => setCustomerSearch(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === "Escape") {
                              setCustomerMenuOpen(false);
                              setCustomerSearch("");
                            } else if (event.key === "Enter" && filteredCustomers[0]) {
                              event.preventDefault();
                              chooseCustomer(filteredCustomers[0]);
                            }
                          }}
                          placeholder="Search customers…"
                          className="h-8 w-full rounded border border-slate-200 pl-8 pr-2 text-xs outline-none focus:border-violet-400"
                        />
                      </label>
                      <div
                        id="invoice-customer-options"
                        role="listbox"
                        aria-label="Customers"
                        className="max-h-48 overflow-y-auto py-1"
                      >
                        {filteredCustomers.map((customer) => (
                          <button
                            key={getCustomerId(customer)}
                            type="button"
                            role="option"
                            aria-selected={getCustomerId(customer) === form.customerId}
                            onClick={() => chooseCustomer(customer)}
                            className="block w-full px-3 py-2 text-left hover:bg-violet-50 aria-selected:bg-violet-50"
                          >
                            <span className="block truncate text-xs font-medium text-slate-700">
                              {getCustomerName(customer)}
                            </span>
                            {customer.email && (
                              <span className="mt-0.5 block truncate text-[10px] text-slate-500">
                                {customer.email}
                              </span>
                            )}
                          </button>
                        ))}
                        {filteredCustomers.length === 0 && (
                          <p className="px-3 py-3 text-xs text-slate-500">
                            No matching customers.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                {customersError && (
                  <p role="alert" className="mt-2 text-xs text-red-600">
                    {customersError}
                  </p>
                )}
                {selectedCustomer && (
                  <div className="mt-2 rounded-md bg-slate-50 px-3 py-2 text-[10px] leading-4 text-slate-500">
                    {selectedCustomer.email || "No email address on file"}
                    {(selectedCustomer.companyName || selectedCustomer.address) && (
                      <span className="block">
                        {selectedCustomer.companyName || selectedCustomer.address}
                      </span>
                    )}
                  </div>
                )}
                {!customersLoading && !customersError && customers.length === 0 && (
                  <p className="mt-2 text-xs text-amber-700">
                    No customers are available. Add a customer before creating an invoice.
                  </p>
                )}
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="min-w-0">
                  <FormLabel htmlFor="invoice-number" required>
                    Invoice number
                  </FormLabel>
                  <input
                    id="invoice-number"
                    value={previewNumber}
                    readOnly
                    className={`${fieldClassName} bg-slate-50`}
                  />
                  <p className="mt-1 text-[9px] text-slate-400">
                    Final number assigned when created
                  </p>
                </div>
                <div className="min-w-0">
                  <FormLabel htmlFor="invoice-issue-date" required>
                    Issue date
                  </FormLabel>
                  <div className="relative">
                    <input
                      id="invoice-issue-date"
                      type="date"
                      required
                      value={form.issueDate}
                      onChange={(event) => handleIssueDateChange(event.target.value)}
                      className={`${fieldClassName} pr-9`}
                    />
                    <CalendarDays
                      aria-hidden="true"
                      className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
                    />
                  </div>
                </div>
                <div className="min-w-0">
                  <FormLabel htmlFor="invoice-due-date" required>
                    Due date
                  </FormLabel>
                  <div className="relative">
                    <input
                      id="invoice-due-date"
                      type="date"
                      required
                      min={form.issueDate}
                      value={form.dueDate}
                      onChange={(event) => handleDueDateChange(event.target.value)}
                      className={`${fieldClassName} pr-9`}
                    />
                    <CalendarDays
                      aria-hidden="true"
                      className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
                    />
                  </div>
                </div>
              </div>
            </section>

            <section aria-labelledby="line-items-heading" className="mt-5 border-t border-slate-100 pt-5">
              <h2 id="line-items-heading" className="text-sm font-semibold text-slate-900">
                Line items
              </h2>
              <p className="mt-1 text-[11px] text-slate-500">
                Add the products or services you are billing for.
              </p>

              <div className="mt-3 overflow-hidden rounded-md border border-slate-200">
                <div className="hidden grid-cols-[minmax(0,1fr)_70px_110px_100px_32px] gap-3 bg-slate-50 px-3 py-2 text-[9px] font-medium uppercase text-slate-500 sm:grid">
                  <span>Description</span>
                  <span className="text-center">Qty</span>
                  <span className="text-right">Rate</span>
                  <span className="text-right">Amount</span>
                  <span />
                </div>
                <div className="divide-y divide-slate-100">
                  {form.items.map((item, index) => {
                    const lineTotal =
                      (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
                    return (
                      <div
                        key={`invoice-item-${index}`}
                        className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-[minmax(0,1fr)_70px_110px_100px_32px] sm:items-center"
                      >
                        <div className="col-span-2 sm:col-span-1">
                          <label className="sr-only" htmlFor={`item-description-${index}`}>
                            Item {index + 1} description
                          </label>
                          <input
                            id={`item-description-${index}`}
                            required
                            value={item.description}
                            onChange={(event) =>
                              updateItem(index, "description", event.target.value)
                            }
                            placeholder="Description"
                            className={`${fieldClassName} h-9`}
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-[9px] font-medium uppercase text-slate-500 sm:sr-only">
                            Quantity
                          </label>
                          <input
                            type="number"
                            required
                            min="1"
                            step="1"
                            aria-label={`Quantity for item ${index + 1}`}
                            value={item.quantity}
                            onChange={(event) =>
                              updateItem(index, "quantity", event.target.value)
                            }
                            className={`${fieldClassName} h-9 text-center`}
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-[9px] font-medium uppercase text-slate-500 sm:sr-only">
                            Rate
                          </label>
                          <input
                            type="number"
                            required
                            min="0"
                            step="0.01"
                            aria-label={`Rate for item ${index + 1}`}
                            value={item.unitPrice}
                            onChange={(event) =>
                              updateItem(index, "unitPrice", event.target.value)
                            }
                            className={`${fieldClassName} h-9 text-right`}
                          />
                        </div>
                        <div className="col-span-1 flex items-center justify-between sm:justify-end">
                          <span className="text-[10px] text-slate-400 sm:hidden">Line total</span>
                          <span className="whitespace-nowrap text-[10px] font-medium text-slate-700">
                            {currencyFormatter.format(lineTotal)}
                          </span>
                        </div>
                        <div className="flex items-center justify-end">
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            disabled={form.items.length === 1}
                            aria-label={`Remove item ${index + 1}`}
                            className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:invisible"
                          >
                            <Trash2 aria-hidden="true" className="size-3.5 cursor-pointer" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <button
                type="button"
                onClick={addItem}
                className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-violet-700 hover:text-violet-800"
              >
                <Plus aria-hidden="true" className="size-3.5" />
                Add line item
              </button>
            </section>

            <section className="mt-5 grid grid-cols-1 gap-5 border-t border-slate-100 pt-5 sm:grid-cols-2">
              <div>
                <FormLabel htmlFor="invoice-notes">Notes to customer</FormLabel>
                <textarea
                  id="invoice-notes"
                  rows={3}
                  value={form.notes}
                  onChange={(event) => updateForm("notes", event.target.value)}
                  placeholder="Add a note for your customer…"
                  className="w-full resize-y rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                />
              </div>

              <div className="space-y-2 text-[11px]">
                <div className="flex items-center justify-between gap-3 text-slate-500">
                  <span>Subtotal</span>
                  <span className="font-medium text-slate-700">
                    {currencyFormatter.format(subtotal)}
                  </span>
                </div>
                <div className="grid grid-cols-[1fr_70px_auto] items-center gap-2 text-slate-500">
                  <label htmlFor="invoice-discount">Discount</label>
                  <div className="relative">
                    <input
                      id="invoice-discount"
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={form.discountPercent}
                      onChange={(event) => updateForm("discountPercent", event.target.value)}
                      className="h-7 w-full rounded border border-slate-200 px-2 pr-5 text-right text-[10px] outline-none focus:border-violet-400"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px]">%</span>
                  </div>
                  <span className="min-w-[72px] text-right font-medium text-slate-700">
                    {currencyFormatter.format(discountAmount)}
                  </span>
                </div>
                <div className="grid grid-cols-[1fr_70px_auto] items-center gap-2 text-slate-500">
                  <label htmlFor="invoice-tax">Tax</label>
                  <div className="relative">
                    <input
                      id="invoice-tax"
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={form.taxPercent}
                      onChange={(event) => updateForm("taxPercent", event.target.value)}
                      className="h-7 w-full rounded border border-slate-200 px-2 pr-5 text-right text-[10px] outline-none focus:border-violet-400"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px]">%</span>
                  </div>
                  <span className="min-w-[72px] text-right font-medium text-slate-700">
                    {currencyFormatter.format(taxAmount)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-2 text-sm font-semibold text-slate-900">
                  <span>Total due</span>
                  <span>{currencyFormatter.format(total)}</span>
                </div>
              </div>
            </section>

            <section className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <FormLabel htmlFor="invoice-payment-terms">Payment terms</FormLabel>
                <div className="relative">
                  <select
                    id="invoice-payment-terms"
                    value={form.paymentTerm}
                    onChange={(event) => updatePaymentTerm(event.target.value)}
                    className={`${fieldClassName} appearance-none pr-9`}
                  >
                    <option value="7">Net 7</option>
                    <option value="14">Net 14</option>
                    <option value="30">Net 30</option>
                    <option value="custom">Custom</option>
                  </select>
                  <ChevronDown
                    aria-hidden="true"
                    className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
                  />
                </div>
              </div>
              <div>
                <FormLabel htmlFor="invoice-currency">Currency</FormLabel>
                <div className="relative">
                  <select
                    id="invoice-currency"
                    value={CURRENCY}
                    disabled
                    className={`${fieldClassName} appearance-none pr-9 disabled:bg-slate-50`}
                  >
                    <option value="INR">INR — Indian Rupee</option>
                  </select>
                  <ChevronDown
                    aria-hidden="true"
                    className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
                  />
                </div>
              </div>
            </section>

            {error && (
              <p role="alert" className="mt-4 rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
                {error}
              </p>
            )}
            {notice && (
              <p role="status" className="mt-4 rounded-md bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                {notice}
              </p>
            )}
          </div>

          <footer className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
            <p className="text-[10px] text-slate-400">* Required fields</p>
            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="rounded-md border border-slate-200 bg-white px-3.5 py-2 text-[11px] font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={saving || Boolean(invoiceToEdit)}
                className="rounded-md border border-slate-200 bg-white px-3.5 py-2 text-[11px] font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
              >
                Save as draft
              </button>
              <button
                type="submit"
                disabled={
                  saving ||
                  creationComplete ||
                  customersLoading ||
                  customers.length === 0
                }
                className="cursor-pointer rounded-md bg-violet-600 px-4 py-2 text-[11px] font-semibold text-white shadow-sm transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {creationComplete
                  ? "Invoice created"
                  : saving
                    ? invoiceToEdit
                      ? "Updating…"
                      : "Creating…"
                    : invoiceToEdit
                      ? "Update invoice"
                      : "Create invoice"}
              </button>
            </div>
          </footer>
        </form>
      </section>
    </div>
  );
}