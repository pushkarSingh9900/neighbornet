"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { API_BASE_URL, getApiErrorMessage } from "../../lib/api";
import { fetchAdminDashboard, summarizeIssues } from "../../lib/admin";
import { canUseAdminFeatures, getAuthSession, hasAuthToken, isAdminUser } from "../../lib/auth";

export default function AdminPage() {
  const [authSession, setAuthSession] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");

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

        const data = await fetchAdminDashboard(session.token);
        setDashboardData(data);
      } catch (err) {
        setError(getApiErrorMessage(err, "Could not load admin dashboard"));
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, []);

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

      setDashboardData((currentDashboardData) => {
        const updatedIssues = currentDashboardData.issues.map((issue) =>
          issue._id === issueId ? data.issue : issue
        );

        return {
          ...currentDashboardData,
          issues: updatedIssues,
          summary: {
            ...currentDashboardData.summary,
            ...summarizeIssues(updatedIssues)
          }
        };
      });

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

      setDashboardData((currentDashboardData) => ({
        ...currentDashboardData,
        reviews: currentDashboardData.reviews.filter((review) => review._id !== reviewId),
        summary: {
          ...currentDashboardData.summary,
          reviews: currentDashboardData.summary.reviews - 1
        }
      }));

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

      setDashboardData((currentDashboardData) => {
        const remainingProperties = currentDashboardData.properties.filter(
          (property) => property._id !== propertyId
        );
        const remainingReviews = currentDashboardData.reviews.filter(
          (review) => review.property?._id !== propertyId
        );
        const remainingIssues = currentDashboardData.issues.filter(
          (issue) => issue.property?._id !== propertyId
        );

        return {
          summary: {
            properties: remainingProperties.length,
            reviews: remainingReviews.length,
            ...summarizeIssues(remainingIssues)
          },
          properties: remainingProperties,
          reviews: remainingReviews,
          issues: remainingIssues
        };
      });

      setActionMessage("Property removed successfully.");
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not remove property"));
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

  const { summary, properties, reviews, issues } = dashboardData;

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

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
                        {issue.property?.area || "Unknown property"} • {issue.reported_by || "Anonymous Student"}
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
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteReview(review._id)}
                        className="rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
                      >
                        Remove Review
                      </button>
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
                      </div>

                      <div className="flex gap-3">
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
        </div>
      </section>
    </div>
  );
}
