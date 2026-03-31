export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export function getApiErrorMessage(error, fallbackMessage = "Something went wrong") {
  if (error?.message === "Failed to fetch") {
    return `Could not reach the backend server at ${API_BASE_URL}. Make sure the Express server is running on that port.`;
  }

  return error?.message || fallbackMessage;
}
