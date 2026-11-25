// src/services/financeService.js

const API_BASE_URL = "http://localhost:4000/api";

async function apiRequest(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Finance API request failed");
    }

    return result.data ?? result.revenues ?? result.expenses ?? result.invoices;
  } catch (error) {
    console.error("Finance API request error:", error);
    throw error;
  }
}

async function getRevenues() {
  return apiRequest("/revenues");
}

async function createRevenue(revenueData) {
  return apiRequest("/revenue", {
    method: "POST",
    body: JSON.stringify(revenueData),
  });
}

async function getRevenueById(revenueId) {
  return apiRequest(`/revenue/${encodeURIComponent(revenueId)}`);
}

async function deleteRevenue(revenueId) {
  return apiRequest(`/delete/revenue/${encodeURIComponent(revenueId)}`, {
    method: "POST",
  });
}

async function getExpenses() {
  return apiRequest("/expense");
}

async function createExpense(expenseData) {
  return apiRequest("/expense", {
    method: "POST",
    body: JSON.stringify(expenseData),
  });
}

async function getExpenseById(expenseId) {
  return apiRequest(`/expense/${encodeURIComponent(expenseId)}`);
}

async function updateExpenseStatus(expenseId, status) {
  return apiRequest(`/update/expense/${encodeURIComponent(expenseId)}`, {
    method: "POST",
    body: JSON.stringify({ status }),
  });
}

async function deleteExpense(expenseId) {
  return apiRequest(`/delete/expense/${encodeURIComponent(expenseId)}`, {
    method: "POST",
  });
}

async function getInvoices() {
  const invoices = [];
  let page = 1;
  let pageData;

  do {
    pageData = await apiRequest(`/getInvoices?limit=100&page=${page}`);
    if (Array.isArray(pageData)) {
      invoices.push(...pageData);
    }
    page += 1;
  } while (Array.isArray(pageData) && pageData.length === 100);

  return invoices;
}

async function createInvoice(invoiceData) {
  return apiRequest("/invoice", {
    method: "POST",
    body: JSON.stringify(invoiceData),
  });
}

async function getInvoiceById(invoiceId) {
  return apiRequest(`/getInvoices/${encodeURIComponent(invoiceId)}`);
}

async function updateInvoice(invoiceId, invoiceData) {
  return apiRequest(`/invoice/${encodeURIComponent(invoiceId)}`, {
    method: "PATCH",
    body: JSON.stringify(invoiceData),
  });
}

async function deleteInvoice(invoiceId) {
  return apiRequest(`/invoice/${encodeURIComponent(invoiceId)}`, {
    method: "DELETE",
  });
}

async function recordManualPayment(paymentData) {
  return apiRequest("/payment/menual", {
    method: "POST",
    body: JSON.stringify(paymentData),
  });
}

async function getFinanceDashboardData() {
  const [revenues, expenses, invoices] = await Promise.all([
    getRevenues(),
    getExpenses(),
    getInvoices(),
  ]);

  return { revenues, expenses, invoices };
}

async function getRevenueExpenseData() {
  const [revenues, expenses] = await Promise.all([
    getRevenues(),
    getExpenses(),
  ]);

  return { revenues, expenses };
}

export {
  getRevenues,
  createRevenue,
  getRevenueById,
  deleteRevenue,
  getExpenses,
  createExpense,
  getExpenseById,
  updateExpenseStatus,
  deleteExpense,
  getInvoices,
  createInvoice,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
  recordManualPayment,
  getFinanceDashboardData,
  getRevenueExpenseData,
};
