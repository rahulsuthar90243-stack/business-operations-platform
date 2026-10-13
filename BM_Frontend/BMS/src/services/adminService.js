// src/services/adminService.js

const API_BASE_URL = "http://localhost:4000/api";

// Common fetch helper function jo cookies (credentials) aur errors handle karega
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
      throw new Error(result.message || "API request failed");
    }

    return result.data ?? result.users;
  } catch (error) {
    console.error("API request error:", error);
    throw error;
  }
}

async function getAdminCardStats() {
  return apiRequest("/status/card");
}

async function getProjectStatus() {
  return apiRequest("/status/project");
}

async function getAllUser() {
  return apiRequest("/users");
}

async function getActivityLogs() {
  return apiRequest("/activity/logs");
}

export { getAdminCardStats, getProjectStatus, getAllUser, getActivityLogs };