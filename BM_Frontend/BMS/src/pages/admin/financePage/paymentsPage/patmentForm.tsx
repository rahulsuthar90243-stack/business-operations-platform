import { useEffect, useMemo, useState, type FormEvent } from "react";
import { CalendarDays, X } from "lucide-react";
import { getInvoices, recordManualPayment } from "../../../../services/financeService.js";
import { getAllUser } from "../../../../services/adminService.js";
import UserSearch, { type SearchableUser } from "./userSearch";

type Customer = SearchableUser & {
  role?: string;
  userRole?: string;
};
type Invoice = {
  _id: string;
  invoiceNumber?: string;
  totalAmount?: number;
  paidAmount?: number;
  status?: string;
  customerId?: string | { _id?: string; username?: string };
};

const methods = [
  ["bank_transfer", "Bank transfer"],
  ["credit_card", "Credit card"],
  ["debit_card", "Debit card"],
  ["cash", "Cash"],
  ["cheque", "Cheque"],
  ["other", "Other"],
];
const inputClass =
  "mt-1.5 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100";
const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const money = (amount: number) => currencyFormatter.format(amount);
const today = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
const customerIdOf = (value: Invoice["customerId"]) =>
  typeof value === "string" ? value : value?._id ?? "";
const customerId = (customer: SearchableUser) => customer._id;
const hasOutstandingBalance = (invoice: Invoice) =>
  Number(invoice.totalAmount ?? 0) > Number(invoice.paidAmount ?? 0) &&
  !["DRAFT", "CANCELLED"].includes(String(invoice.status ?? "").toUpperCase());

interface Props {
  onClose: () => void;
  onSaved: () => void;
}

export default function PaymentForm({ onClose, onSaved }: Props) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customerIdValue, setCustomerIdValue] = useState("");
  const [invoiceId, setInvoiceId] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(today());
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [depositTo, setDepositTo] = useState("business-checking");
  const [transactionId, setTransactionId] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadFormData = async () => {
      try {
        const [userResult, invoiceList] = await Promise.all([
          getAllUser(),
          getInvoices(),
        ]);
        const userList = Array.isArray(userResult)
          ? userResult
          : userResult?.users;
        if (!Array.isArray(userList)) {
          throw new Error(
            "Customer data was not returned in the expected format.",
          );
        }
        if (!Array.isArray(invoiceList)) {
          throw new Error(
            "Invoice data was not returned in the expected format.",
          );
        }

        if (!active) return;
        setCustomers(
          userList.filter(
            (user: Customer) =>
              String(user.role ?? user.userRole ?? "").toLowerCase() ===
              "customer",
          ),
        );
        setInvoices(invoiceList as Invoice[]);
      } catch (requestError) {
        if (active) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Could not load customers and invoices.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadFormData();

    return () => {
      active = false;
    };
  }, []);

  const customerInvoices = useMemo(
    () =>
      invoices.filter(
        (invoice) =>
          customerIdOf(invoice.customerId) === customerIdValue &&
          hasOutstandingBalance(invoice),
      ),
    [customerIdValue, invoices],
  );
  const selectedInvoice = customerInvoices.find(
    (invoice) => invoice._id === invoiceId,
  );
  const invoiceTotal = Number(selectedInvoice?.totalAmount ?? 0);
  const previouslyPaid = Number(selectedInvoice?.paidAmount ?? 0);
  const balance = Math.max(invoiceTotal - previouslyPaid, 0);
  const received = Number(amount) || 0;

  const changeCustomer = (customer: SearchableUser) => {
    const selectedId = customerId(customer);
    const firstOutstandingInvoice = invoices.find(
      (invoice) =>
        customerIdOf(invoice.customerId) === selectedId &&
        hasOutstandingBalance(invoice),
    );
    setCustomerIdValue(selectedId);
    setInvoiceId(firstOutstandingInvoice?._id ?? "");
    setAmount("");
    setError("");
  };

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedInvoice) {
      setError("Select an outstanding invoice.");
      return;
    }
    if (!Number.isFinite(received) || received <= 0 || received > balance) {
      setError(
        `Enter an amount greater than zero and no more than ${money(balance)}.`,
      );
      return;
    }

    setSaving(true);
    setError("");
    try {
      await recordManualPayment({
        invoiceId,
        customerId: customerIdValue,
        amount: received,
        paymentMethod,
        paymentDate: new Date(`${paymentDate}T12:00:00`).toISOString(),
        transactionId: transactionId.trim(),
        notes: [
          notes.trim(),
          `Deposit to: ${depositTo}`,
        ]
          .filter(Boolean)
          .join(" | "),
      });
      onSaved();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Payment could not be recorded.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-950/30"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-form-title"
        className="flex h-full max-h-screen w-full max-w-3xl flex-col overflow-hidden border-l border-slate-200 bg-white shadow-2xl"
      >
        <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2
                  id="payment-form-title"
                  className="text-lg font-semibold text-slate-900"
                >
                  Payment details
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Apply a payment to an outstanding customer invoice.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close payment form"
                className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
              >
                <X aria-hidden="true" className="size-4" />
              </button>
            </div>

            {error && (
              <p
                role="alert"
                className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
              >
                {error}
              </p>
            )}

            {loading ? (
              <p className="py-8 text-sm text-slate-500">
                Loading customers and invoices…
              </p>
            ) : (
              <>
                <div className="mt-5 grid gap-4">
                  <UserSearch
                    users={customers}
                    selectedUserId={customerIdValue}
                    onSelect={changeCustomer}
                  />

                  <label className="text-sm font-medium text-slate-700">
                    Invoice *
                    <select
                      required
                      value={invoiceId}
                      onChange={(event) => {
                        setInvoiceId(event.target.value);
                        setAmount("");
                        setError("");
                      }}
                      disabled={!customerIdValue}
                      className={inputClass}
                    >
                      <option value="">
                        {customerIdValue
                          ? "Select an invoice"
                          : "Select a customer first"}
                      </option>
                      {customerInvoices.map((invoice) => (
                        <option key={invoice._id} value={invoice._id}>
                          {invoice.invoiceNumber ?? "Invoice"} —{" "}
                          {money(Number(invoice.totalAmount ?? 0))}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                {customerIdValue && customerInvoices.length === 0 && (
                  <p className="mt-3 text-sm text-slate-500">
                    This customer has no outstanding invoices.
                  </p>
                )}

                {selectedInvoice && (
                  <div className="mt-3 rounded-md bg-slate-50 px-3 py-3 text-sm">
                    <p className="mb-2 font-semibold text-slate-800">
                      Outstanding invoice
                    </p>
                    <div className="space-y-2 text-slate-500">
                      <div className="flex justify-between">
                        <span>Invoice total</span>
                        <span className="text-slate-800">
                          {money(invoiceTotal)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Previously paid</span>
                        <span className="text-slate-800">
                          {money(previouslyPaid)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Balance due</span>
                        <span className="font-medium text-slate-800">
                          {money(balance)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="my-5 border-t border-slate-100" />
                <h3 className="text-base font-semibold text-slate-900">
                  Transaction
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Enter the amount received and where it was deposited.
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <label className="text-sm font-medium text-slate-700">
                    Amount received *
                    <input
                      required
                      type="number"
                      min="0.01"
                      max={balance || undefined}
                      step="0.01"
                      value={amount}
                      onChange={(event) => setAmount(event.target.value)}
                      placeholder="0.00"
                      className={inputClass}
                    />
                  </label>
                  <label className="text-sm font-medium text-slate-700">
                    Payment date *
                    <span className="relative block">
                      <input
                        required
                        type="date"
                        value={paymentDate}
                        onChange={(event) =>
                          setPaymentDate(event.target.value)
                        }
                        className={inputClass}
                      />
                      <CalendarDays
                        aria-hidden="true"
                        className="pointer-events-none absolute right-3 top-3 size-4 text-slate-500"
                      />
                    </span>
                  </label>
                  <label className="text-sm font-medium text-slate-700">
                    Payment method *
                    <select
                      value={paymentMethod}
                      onChange={(event) =>
                        setPaymentMethod(event.target.value)
                      }
                      className={inputClass}
                    >
                      {methods.map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-sm font-medium text-slate-700">
                    Deposit to *
                    <select
                      value={depositTo}
                      onChange={(event) => setDepositTo(event.target.value)}
                      className={inputClass}
                    >
                      <option value="business-checking">
                        Business checking •• 4821
                      </option>
                      <option value="business-savings">
                        Business savings
                      </option>
                      <option value="cash">Cash on hand</option>
                    </select>
                  </label>
                  <label className="text-sm font-medium text-slate-700">
                    Transaction reference
                    <input
                      value={transactionId}
                      onChange={(event) =>
                        setTransactionId(event.target.value)
                      }
                      className={inputClass}
                    />
                  </label>
                  <div>
                    <span className="text-sm font-medium text-slate-700">
                      Currency
                    </span>
                    <div
                      className={`${inputClass} flex items-center bg-slate-50`}
                      aria-label="Currency: Indian Rupee"
                    >
                      INR — Indian Rupee
                    </div>
                  </div>
                </div>
                <label className="mt-4 block text-sm font-medium text-slate-700">
                  Internal note
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    className="mt-1.5 w-full resize-y rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                  />
                </label>
                <div className="mt-4 rounded-md bg-slate-50 px-3 py-3 text-sm">
                  <p className="font-semibold text-slate-800">
                    After this payment
                  </p>
                  <div className="mt-3 flex justify-between text-slate-500">
                    <span>Payment received</span>
                    <span className="text-slate-800">{money(received)}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-slate-500">
                    <span>Remaining balance</span>
                    <span className="text-xl font-semibold text-violet-600">
                      {money(Math.max(balance - received, 0))}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

          <footer className="flex shrink-0 items-center justify-between border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:px-6">
            <span className="text-xs text-slate-400">* Required fields</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || saving || !selectedInvoice}
                className="rounded-md bg-violet-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
              >
                {saving ? "Recording…" : "Record payment"}
              </button>
            </div>
          </footer>
        </form>
      </section>
    </div>
  );
}
