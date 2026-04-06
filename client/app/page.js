"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getApiErrorMessage } from "../lib/api";
import { fetchAdminDashboard } from "../lib/admin";
import { canUseAdminFeatures, getAuthSession } from "../lib/auth";

export default function Home() {
  const [authSession, setAuthSession] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const session = getAuthSession();
    setAuthSession(session);

    async function loadHomeData() {
      try {
        setLoading(true);
        setError("");

        if (canUseAdminFeatures(session)) {
          const data = await fetchAdminDashboard(session.token);
          setDashboardData(data);
        } else {
          setDashboardData(null);
        }
      } catch (err) {
        setError(getApiErrorMessage(err, "Could not load dashboard summary"));
      } finally {
        setLoading(false);
      }
    }

    loadHomeData();
  }, []);

  if (loading) {
    return (
      <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-slate-500">Loading homepage...</p>
      </div>
    );
  }

  if (canUseAdminFeatures(authSession) && dashboardData) {
    const { summary, properties, reviews, issues } = dashboardData;

    return (
      <div className="space-y-6">
        <section className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-600">
            Admin Overview
          </p>
          <h1 className="mt-3 text-4xl font-bold text-slate-900">
            NeighborNet moderation home
          </h1>
          <p className="mt-3 max-w-3xl text-slate-600">
            See platform activity at a glance, including total properties, total reviews,
            and the current state of student reports.
          </p>

          {error ? (
            <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
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
            <p className="text-sm text-amber-700">Open reports</p>
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
                  Recent Reports
                </p>
                <h2 className="mt-2 text-2xl font-bold text-slate-900">Latest property issues</h2>
              </div>

              <Link
                href="/admin"
                className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Open Admin Dashboard
              </Link>
            </div>

            <div className="mt-6 space-y-4">
              {issues.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-slate-500">
                  No reports yet.
                </div>
              ) : (
                issues.slice(0, 4).map((issue) => (
                  <div key={issue._id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold capitalize text-slate-900">{issue.issue_type}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          {issue.property?.area || "Unknown property"}
                        </p>
                      </div>

                      <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold capitalize text-slate-700">
                        {issue.status === "resolved" ? "closed" : issue.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                Recent Properties
              </p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">Newest listings</h2>

              <div className="mt-6 space-y-4">
                {properties.slice(0, 4).map((property) => (
                  <div key={property._id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <p className="font-semibold text-slate-900">{property.area}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      Rent: {property.rent_range || "Not added yet"}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                Recent Reviews
              </p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">Newest student feedback</h2>

              <div className="mt-6 space-y-4">
                {reviews.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-slate-500">
                    No reviews yet.
                  </div>
                ) : (
                  reviews.slice(0, 3).map((review) => (
                    <div key={review._id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                      <p className="font-semibold text-slate-900">
                        {review.property?.area || "Unknown property"}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Rating {review.rating}/5
                      </p>
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

  return (
    <div className="rounded-[32px] border border-slate-200 bg-white p-10 shadow-sm">
      <h1 className="text-4xl font-bold text-slate-900">
        NeighborNet
      </h1>

      <p className="mt-4 max-w-2xl text-lg text-slate-600">
        A student housing review platform where Lakehead students can browse listings,
        leave honest reviews, and report real rental issues before someone signs a lease.
      </p>

      <div className="mt-8 flex gap-4">
        <Link
          href="/properties"
          className="rounded-full bg-teal-500 px-5 py-3 font-semibold text-white transition hover:bg-teal-600"
        >
          Browse Properties
        </Link>

        <Link
          href="/signup"
          className="rounded-full border border-slate-200 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Join NeighborNet
        </Link>
      </div>
    </div>
  );
}
