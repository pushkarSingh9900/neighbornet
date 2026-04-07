import { API_BASE_URL } from "./api";

const AUTH_STORAGE_KEY = "neighbornet-auth";
const LAKEHEAD_EMAIL_DOMAIN = "@lakeheadu.ca";

export function isLakeheadEmail(email = "") {
  return email.trim().toLowerCase().endsWith(LAKEHEAD_EMAIL_DOMAIN);
}

export function saveAuthSession(authData) {
  if (typeof window === "undefined") {
    return;
  }

  const normalizedSession = normalizeAuthSession(authData);
  const currentSession = getAuthSession();

  if (serializeSession(currentSession) === serializeSession(normalizedSession)) {
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(normalizedSession));
  window.dispatchEvent(new Event("auth-changed"));
}

export function getAuthSession() {
  if (typeof window === "undefined") {
    return null;
  }

  const storedValue = window.localStorage.getItem(AUTH_STORAGE_KEY);

  if (!storedValue) {
    return null;
  }

  try {
    return normalizeAuthSession(JSON.parse(storedValue));
  } catch {
    return null;
  }
}

export function clearAuthSession() {
  if (typeof window === "undefined") {
    return;
  }

  if (!window.localStorage.getItem(AUTH_STORAGE_KEY)) {
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
  window.dispatchEvent(new Event("auth-changed"));
}

export function isAdminUser(user) {
  return user?.role === "admin";
}

export function hasAuthToken(session) {
  return Boolean(session?.token);
}

export function canUseAdminFeatures(session) {
  return hasAuthToken(session) && isAdminUser(session?.user);
}

export async function refreshAuthSessionFromServer() {
  const currentSession = getAuthSession();

  if (!currentSession?.token) {
    return currentSession;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${currentSession.token}`
      }
    });

    const data = await res.json();

    if (!res.ok) {
      if (res.status === 401) {
        clearAuthSession();
        return null;
      }

      return currentSession;
    }

    const updatedSession = normalizeAuthSession(data);

    if (serializeSession(currentSession) !== serializeSession(updatedSession)) {
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedSession));
      window.dispatchEvent(new Event("auth-changed"));
    }

    return updatedSession;
  } catch {
    return currentSession;
  }
}

function normalizeAuthSession(authData) {
  if (!authData || typeof authData !== "object") {
    return null;
  }

  const user = authData.user && typeof authData.user === "object" ? authData.user : null;
  const token = typeof authData.token === "string" ? authData.token : "";

  if (!user) {
    return null;
  }

  return {
    message: typeof authData.message === "string" ? authData.message : "",
    token,
    user
  };
}

function serializeSession(session) {
  return JSON.stringify(session || null);
}
