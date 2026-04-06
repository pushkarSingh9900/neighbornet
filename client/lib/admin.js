import { API_BASE_URL } from "./api";

export function summarizeIssues(issues = []) {
  return {
    openIssues: issues.filter((issue) => issue.status === "open").length,
    reviewingIssues: issues.filter((issue) => issue.status === "reviewing").length,
    closedIssues: issues.filter((issue) => issue.status === "resolved").length
  };
}

export async function fetchAdminDashboard(token) {
  const res = await fetch(`${API_BASE_URL}/api/admin/dashboard`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Could not load admin dashboard");
  }

  return data;
}
