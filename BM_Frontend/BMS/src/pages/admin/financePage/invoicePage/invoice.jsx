import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { getInvoices } from "../../../../services/financeService.js";
import CreateInvoiceForm from "./createInvo.form.jsx";
import InvoiceStatus from "./invoiceStatus.jsx";
import InvoiceTable from "./invoiceTable.jsx";

export default function InvoicePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [invoiceToEdit, setInvoiceToEdit] = useState(null);

  useEffect(() => {
    if (!location.state?.openCreateInvoice) return;

    setShowCreateForm(true);
    navigate(location.pathname, { replace: true, state: null });
  }, [location, navigate]);

  useEffect(() => {
    let active = true;
    let isFetching = false;

    const loadInvoices = async () => {
      if (isFetching) return;
      isFetching = true;
      setLoading(true);
      setError("");

      try {
        const result = await getInvoices();
        if (!Array.isArray(result)) {
          throw new Error("Invoice data was not returned in the expected format.");
        }
        if (active) {
          setInvoices(result);
          setHasLoaded(true);
        }
      } catch (requestError) {
        if (active) {
          setError(requestError.message || "Unable to load invoice data.");
        }
      } finally {
        isFetching = false;
        if (active) setLoading(false);
      }
    };

    loadInvoices();
    const intervalId = window.setInterval(loadInvoices, 60_000);

    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [refreshKey]);

  return (
    <div className="mx-auto flex w-full min-w-0 flex-col gap-5">
      <header>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-900">
              Invoices
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Create, track, and manage customer invoices.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-3.5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-violet-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600 cursor-pointer"
          >
            <Plus aria-hidden="true" className="size-4" />
            Create invoice
          </button>
        </div>
      </header>
      {loading && !hasLoaded ? (
        <section
          aria-live="polite"
          className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500"
        >
          Loading invoice data…
        </section>
      ) : error && !hasLoaded ? (
        <section
          role="alert"
          className="rounded-xl border border-red-200 bg-white p-5 text-sm text-red-700"
        >
          <p className="font-semibold">Invoice data could not be loaded.</p>
          <p className="mt-1">{error}</p>
          <button
            type="button"
            onClick={() => setRefreshKey((key) => key + 1)}
            className="mt-3 rounded-lg bg-violet-600 px-4 py-2 font-medium text-white hover:bg-violet-700"
          >
            Try again
          </button>
        </section>
      ) : (
        <>
          {error && (
            <p
              role="alert"
              className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
            >
              Refresh failed: {error}. Showing the last loaded data.
              <button
                type="button"
                onClick={() => setRefreshKey((key) => key + 1)}
                className="ml-2 font-semibold underline"
              >
                Try again
              </button>
            </p>
          )}
          <InvoiceStatus invoices={invoices} />
          <InvoiceTable
            invoices={invoices}
            onEditInvoice={(invoice) => setInvoiceToEdit(invoice)}
            onDeletedInvoice={() =>
              setRefreshKey((key) => key + 1)
            }
          />
        </>
      )}
      {showCreateForm && (
        <CreateInvoiceForm
          onClose={() => setShowCreateForm(false)}
          onCreated={() => setRefreshKey((key) => key + 1)}
        />
      )}
      {invoiceToEdit && (
        <CreateInvoiceForm
          invoiceToEdit={invoiceToEdit}
          onClose={() => setInvoiceToEdit(null)}
          onUpdated={() => setRefreshKey((key) => key + 1)}
        />
      )}
    </div>
  );
}