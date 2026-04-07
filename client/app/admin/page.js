"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { API_BASE_URL, getApiErrorMessage } from "../../lib/api";
import { fetchAdminDashboard } from "../../lib/admin";
import { canUseAdminFeatures, getAuthSession, hasAuthToken, isAdminUser } from "../../lib/auth";

export default function AdminPage() {
  const [authSession, setAuthSession] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  const refreshDashboard = useCallback(async (sessionToUse) => {

    if (!sessionToUse?.token) {
      return;
    }

    const data = await fetchAdminDashboard(sessionToUse.token);
    setDashboardData(data);
  }, []);

  useEffect(() => {
    const session = getAuthSession();
    setAuthSession(session);

    async function fetchDashboard() {
      try {
        setLoading(true);
        setError("");

        if (!session?.user) {
          throw new Error("Log in first to access the admin dashboard.");
        }

        if (isAdminUser(session.user) && !hasAuthToken(session)) {
          throw new Error("Your admin profile is loaded, but this browser session is incomplete. Log out and log in again.");
        }

        if (!canUseAdminFeatures(session)) {
          throw new Error("Admin access required. Add your Lakehead email to ADMIN_EMAILS in server/.env and log in again.");
        }

        await refreshDashboard(session);
      } catch (err) {
        setError(getApiErrorMessage(err, "Could not load admin dashboard"));
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, [refreshDashboard]);

  async function handleIssueStatusChange(issueId, status) {
    try {
      setActionMessage("");
      setError("");

      const res = await fetch(`${API_BASE_URL}/api/admin/issues/${issueId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authSession.token}`
        },
        body: JSON.stringify({ status })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Could not update issue");
      }

      await refreshDashboard(authSession);
      setActionMessage("Issue updated successfully.");
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not update issue"));
    }
  }

  async function handleDeleteReview(reviewId) {
    try {
      setActionMessage("");
      setError("");

      const res = await fetch(`${API_BASE_URL}/api/admin/reviews/${reviewId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authSession.token}`
        }
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Could not remove review");
      }

      await refreshDashboard(authSession);
      setActionMessage("Review removed successfully.");
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not remove review"));
    }
  }

  async function handleDeleteProperty(propertyId) {
    try {
      setActionMessage("");
      setError("");

      const res = await fetch(`${API_BASE_URL}/api/admin/properties/${propertyId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authSession.token}`
        }
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Could not remove property");
      }

      await refreshDashboard(authSession);
      setActionMessage("Property removed successfully.");
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not remove property"));
    }
  }

  async function handleWarnUser(userId) {
    try {
      setActionMessage("");
      setError("");

      const res = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/warn`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authSession.token}`
        },
        body: JSON.stringify({
          reason: "Admin warning issued for harmful or misleading platform content."
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Could not warn user");
      }

      await refreshDashboard(authSession);
      setActionMessage("User warned successfully.");
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not warn user"));
    }
  }

  async function handleUserStatusChange(userId, status) {
    try {
      setActionMessage("");
      setError("");

      const res = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authSession.token}`
        },
        body: JSON.stringify({
          status,
          reason:
            status === "banned"
              ? "Account banned by admin after repeated moderation issues."
              : ""
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Could not update user status");
      }

      await refreshDashboard(authSession);
      setActionMessage(
        status === "banned" ? "User banned successfully." : "User account restored successfully."
      );
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not update user status"));
    }
  }

  if (loading) {
    return (
      <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-slate-500">Loading admin dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[32px] border border-red-100 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="mt-4 text-red-600">{error}</p>
        <p className="mt-2 text-sm text-slate-500">
          If you already see an admin label elsewhere, your saved browser session is probably old.
          Log out, log back in, and then open `/admin` again.
        </p>
      </div>
    );
  }

  const { summary, properties, reviews, issues, users } = dashboardData;

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-600">
          Admin Dashboard
        </p>
        <h1 className="mt-3 text-4xl font-bold text-slate-900">
          Moderate content and protect students
        </h1>
        <p className="mt-3 max-w-3xl text-slate-600">
          Review reports, resolve or mark them under review, remove bad reviews, and delete
          properties that should not stay on the platform.
        </p>

        {actionMessage ? (
          <p className="mt-6 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {actionMessage}
          </p>
        ) : null}
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Properties</p>
          <p className="mt-3 text-4xl font-bold text-slate-900">{summary.properties}</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Reviews</p>
          <p className="mt-3 text-4xl font-bold text-slate-900">{summary.reviews}</p>
        </div>

        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
          <p className="text-sm text-amber-700">Open issues</p>
          <p className="mt-3 text-4xl font-bold text-slate-900">{summary.openIssues}</p>
        </div>

        <div className="rounded-3xl border border-sky-200 bg-sky-50 p-6 shadow-sm">
          <p className="text-sm text-sky-700">In review</p>
          <p className="mt-3 text-4xl font-bold text-slate-900">{summary.reviewingIssues}</p>
        </div>

        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm">
          <p className="text-sm text-emerald-700">Closed reports</p>
          <p className="mt-3 text-4xl font-bold text-slate-900">{summary.closedIssues}</p>
        </div>

        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
          <p className="text-sm text-amber-700">Warned users</p>
          <p className="mt-3 text-4xl font-bold text-slate-900">{summary.warnedUsers}</p>
        </div>

        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 shadow-sm">
          <p className="text-sm text-rose-700">Banned users</p>
          <p className="mt-3 text-4xl font-bold text-slate-900">{summary.bannedUsers}</p>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                Reports
              </p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">Issue moderation</h2>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {issues.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-slate-500">
                No issues reported yet.
              </div>
            ) : (
              issues.map((issue) => (
                <div key={issue._id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-lg font-semibold capitalize text-slate-900">
                        {issue.issue_type}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {issue.property?.area || "Unknown property"} • {issue.reported_by || "Lakehead Student"}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {new Date(issue.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold capitalize text-slate-700">
                      {issue.status}
                    </span>
                  </div>

                  <p className="mt-4 leading-7 text-slate-700">{issue.description}</p>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => handleIssueStatusChange(issue._id, "reviewing")}
                      className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                    >
                      Mark Reviewing
                    </button>

                    <button
                      type="button"
                      onClick={() => handleIssueStatusChange(issue._id, "resolved")}
                      className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600"
                    >
                      Close
                    </button>

                    <button
                      type="button"
                      onClick={() => handleIssueStatusChange(issue._id, "open")}
                      className="rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-100"
                    >
                      Reopen
                    </button>

                    {issue.reporter?._id ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleWarnUser(issue.reporter._id)}
                          className="rounded-full border border-amber-200 bg-white px-4 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-50"
                        >
                          Warn User
                        </button>

                        <button
                          type="button"
                          onClick={() => handleUserStatusChange(issue.reporter._id, "banned")}
                          className="rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                        >
                          Ban User
                        </button>
                      </>
                    ) : null}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Reviews
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">Remove harmful reviews</h2>

            <div className="mt-6 space-y-4">
              {reviews.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-slate-500">
                  No reviews available.
                </div>
              ) : (
                reviews.map((review) => (
                  <div key={review._id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {review.property?.area || "Unknown property"}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          Rating {review.rating}/5
                        </p>
                        {review.reviewer ? (
                          <p className="mt-1 text-sm text-slate-500">
                            {review.reviewer.name || review.reviewer.email}
                          </p>
                        ) : null}
                      </div>

                      <div className="flex flex-wrap gap-3">
                        {review.reviewer?._id ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleWarnUser(review.reviewer._id)}
                              className="rounded-full border border-amber-200 bg-white px-4 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-50"
                            >
                              Warn User
                            </button>

                            <button
                              type="button"
                              onClick={() => handleUserStatusChange(review.reviewer._id, "banned")}
                              className="rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                            >
                              Ban User
                            </button>
                          </>
                        ) : null}

                        <button
                          type="button"
                          onClick={() => handleDeleteReview(review._id)}
                          className="rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
                        >
                          Remove Review
                        </button>
                      </div>
                    </div>

                    <p className="mt-4 text-sm leading-6 text-slate-700">{review.comment}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Properties
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">Remove bad listings</h2>

            <div className="mt-6 space-y-4">
              {properties.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-slate-500">
                  No properties available.
                </div>
              ) : (
                properties.map((property) => (
                  <div key={property._id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-slate-900">{property.area}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          Rent: {property.rent_range || "Not added yet"}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          Posted by {property.created_by || "Lakehead Student"}
                        </p>
                      </div>

                      <div className="flex gap-3">
                        {property.created_by_user?._id ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleWarnUser(property.created_by_user._id)}
                              className="rounded-full border border-amber-200 bg-white px-4 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-50"
                            >
                              Warn User
                            </button>

                            <button
                              type="button"
                              onClick={() => handleUserStatusChange(property.created_by_user._id, "banned")}
                              className="rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                            >
                              Ban User
                            </button>
                          </>
                        ) : null}

                        <Link
                          href={`/properties/${property._id}`}
                          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                        >
                          View
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleDeleteProperty(property._id)}
                          className="rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
                        >
                          Remove Property
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Users
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">Warnings and bans</h2>

            <div className="mt-6 space-y-4">
              {users.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-slate-500">
                  No users available.
                </div>
              ) : (
                users.map((user) => (
                  <div key={user._id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {user.name}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">{user.email}</p>
                        <p className="mt-2 text-sm text-slate-500">
                          Warnings: {user.warning_count}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <span
                          className={`rounded-full px-3 py-1 text-sm font-semibold capitalize ${
                            user.status === "banned"
                              ? "bg-red-100 text-red-700"
                              : user.warning_count > 0
                                ? "bg-amber-100 text-amber-700"
                                : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {user.status}
                        </span>

                        {user.role !== "admin" ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleWarnUser(user._id)}
                              className="rounded-full border border-amber-200 bg-white px-4 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-50"
                            >
                              Warn
                            </button>

                            {user.status === "banned" ? (
                              <button
                                type="button"
                                onClick={() => handleUserStatusChange(user._id, "active")}
                                className="rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
                              >
                                Restore
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleUserStatusChange(user._id, "banned")}
                                className="rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                              >
                                Ban
                              </button>
                            )}
                          </>
                        ) : (
                          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-semibold text-slate-600">
                            Admin account
                          </span>
                        )}
                      </div>
                    </div>

                    {user.moderation_reason ? (
                      <p className="mt-4 text-sm leading-6 text-slate-600">
                        {user.moderation_reason}
                      </p>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
