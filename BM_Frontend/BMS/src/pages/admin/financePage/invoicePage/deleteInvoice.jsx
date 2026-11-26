import { useEffect, useState } from "react";
import { Trash2, X } from "lucide-react";
import { deleteInvoice } from "../../../../services/financeService.js";

export default function DeleteInvoice({ invoice, onClose, onDeleted }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !deleting) onClose?.();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [deleting, onClose]);

  async function handleDelete() {
    if (!invoice?._id) {
      setError("Invoice ID is missing.");
      return;
    }

    setDeleting(true);
    setError("");
    try {
      await deleteInvoice(invoice._id);
      onDeleted?.(invoice);
      onClose?.();
    } catch (requestError) {
      setError(requestError.message || "Unable to delete the invoice.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !deleting) onClose?.();
      }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 p-4"
    >
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-invoice-title"
        aria-describedby="delete-invoice-description"
        className="w-full max-w-md rounded-xl border border-slate-200 bg-white shadow-xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
          <div className="flex items-start gap-3">
            <span className="rounded-full bg-red-50 p-2 text-red-600">
              <Trash2 aria-hidden="true" className="size-5" />
            </span>
            <div>
              <h2 id="delete-invoice-title" className="text-base font-semibold text-slate-900">
                Delete invoice
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                {invoice?.invoiceNumber || "This invoice"} will be permanently deleted.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            aria-label="Close delete confirmation"
            className="cursor-pointer rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        </div>

        <div className="px-5 py-4">
          <p id="delete-invoice-description" className="text-sm text-slate-600">
            Are you sure you want to delete this invoice? This action cannot be undone.
          </p>
          {error && (
            <p role="alert" className="mt-3 rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="cursor-pointer rounded-md border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="cursor-pointer rounded-md bg-red-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </section>
    </div>
  );
}
