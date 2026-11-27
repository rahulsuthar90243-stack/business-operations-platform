export interface PaymentInvoice {
  totalAmount?: number | string;
  paidAmount?: number | string;
  status?: string;
}

export interface PaymentStatusMetrics {
  collected: { amount: number; count: number };
  pending: { amount: number; count: number };
  successRate: { rate: number; paidCount: number; invoiceCount: number };
}

const getAmount = (value: number | string | undefined) => {
  const amount = Number(value);
  return Number.isFinite(amount) ? Math.max(amount, 0) : 0;
};

export function getPaymentStatusMetrics(
  invoices: PaymentInvoice[],
): PaymentStatusMetrics {
  const metrics: PaymentStatusMetrics = {
    collected: { amount: 0, count: 0 },
    pending: { amount: 0, count: 0 },
    successRate: { rate: 0, paidCount: 0, invoiceCount: 0 },
  };

  invoices.forEach((invoice) => {
    const status = String(invoice.status ?? "").toUpperCase();
    if (status === "DRAFT" || status === "CANCELLED") return;

    const total = getAmount(invoice.totalAmount);
    const paid = Math.min(getAmount(invoice.paidAmount), total);
    const balance = Math.max(total - paid, 0);

    metrics.successRate.invoiceCount += 1;
    metrics.collected.amount += paid;

    if (paid > 0) metrics.collected.count += 1;
    if (balance > 0) {
      metrics.pending.amount += balance;
      metrics.pending.count += 1;
    }
    if (total > 0 && balance === 0) metrics.successRate.paidCount += 1;
  });

  metrics.successRate.rate =
    metrics.successRate.invoiceCount > 0
      ? (metrics.successRate.paidCount / metrics.successRate.invoiceCount) * 100
      : 0;

  return metrics;
}