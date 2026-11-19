const API_BASE_URL = "http://localhost:4000/api";

async function ticketRequest(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });
  const result = await response.json().catch(() => ({}));

  if (!response.ok || result.success === false) {
    throw new Error(result.message || "Ticket request failed.");
  }

  return result;
}

export async function getTickets() {
  const result = await ticketRequest("/tickets");
  return result.tickets;
}

export async function createTicket(projectId, ticket) {
  const result = await ticketRequest(
    `/ticket/${encodeURIComponent(projectId)}`,
    {
      method: "POST",
      body: JSON.stringify(ticket),
    },
  );
  return result.ticket;
}

export async function updateTicket(ticketId, updates) {
  const result = await ticketRequest(
    `/update/ticket/${encodeURIComponent(ticketId)}`,
    {
      method: "POST",
      body: JSON.stringify(updates),
    },
  );
  return result.ticket;
}
