export function getLocalDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function createEditForm(invoice) {
  const issueDate = getLocalDate(
    new Date(invoice?.invoiceDate || invoice?.createdAt || new Date()),
  );
  const dueDate = getLocalDate(new Date(invoice.dueDate));
  const subtotal = Number(invoice.subtotal) || 0;

  return {
    customerId: String(invoice.customerId?._id ?? invoice.customerId ?? ""),
    issueDate,
    dueDate,
    paymentTerm: "custom",
    notes: invoice.notes || "",
    taxPercent:
      subtotal > 0
        ? String(
            (((Number(invoice.taxAmount) || 0) / subtotal) * 100).toFixed(2),
          )
        : "0",
    discountPercent:
      subtotal > 0
        ? String(
            (((Number(invoice.discountAmount) || 0) / subtotal) * 100).toFixed(2,),
          )
        : "0",
    items: Array.isArray(invoice.items)
      ? invoice.items.map((item) => ({
          description: item.description || "",
          quantity: String(item.quantity ?? "1"),
          unitPrice: String(item.unitPrice ?? ""),
        }))
      : [{ description: "", quantity: "1", unitPrice: "" }],
  };
}