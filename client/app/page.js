"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import PropertyImage from "../components/PropertyImage";
import { API_BASE_URL, getApiErrorMessage } from "../lib/api";
import { fetchAdminDashboard } from "../lib/admin";
import { canUseAdminFeatures, getAuthSession } from "../lib/auth";

export default function Home() {
  const router = useRouter();
  const [authSession, setAuthSession] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchDraft, setSearchDraft] = useState("");
  const formatDistance = (distanceToCampus) =>
    distanceToCampus !== undefined && distanceToCampus !== null && distanceToCampus !== ""
      ? `${distanceToCampus} km from campus`
      : "Distance not added yet";

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
          const res = await fetch(`${API_BASE_URL}/api/properties`);

          if (!res.ok) {
            throw new Error("Could not load featured properties");
          }

          const data = await res.json();
          setFeaturedProperties(data.slice(0, 3));
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

  function handleSearchSubmit(e) {
    e.preventDefault();
    router.push(`/properties?search=${encodeURIComponent(searchDraft)}`);
  }

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
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[36px] border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-8 bg-gradient-to-r from-teal-500 via-emerald-400 to-cyan-300 px-8 py-12 text-white lg:grid-cols-[1.2fr_0.8fr] lg:px-12">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/80">
              Student Housing Network
            </p>
            <h1 className="mt-4 max-w-3xl text-5xl font-bold leading-tight">
              Find better student housing before you sign anything
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-white/90">
              Browse honest reviews, compare student-submitted properties, report real
              issues, and talk with other Lakehead students about neighborhoods and landlords.
            </p>

            <form onSubmit={handleSearchSubmit} className="mt-8 flex flex-col gap-3 rounded-3xl bg-white/15 p-4 backdrop-blur md:flex-row">
              <input
                value={searchDraft}
                onChange={(e) => setSearchDraft(e.target.value)}
                placeholder="Search by area, street, or property type"
                className="w-full rounded-2xl border border-white/30 bg-white px-4 py-3 text-slate-900 outline-none"
              />

              <button
                type="submit"
                className="rounded-2xl bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-800"
              >
                Search Properties
              </button>
            </form>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-3xl bg-white/15 p-5 backdrop-blur">
              <p className="text-sm uppercase tracking-[0.2em] text-white/80">Trusted student input</p>
              <p className="mt-3 text-2xl font-bold">Reviews + issue reports</p>
            </div>

            <div className="rounded-3xl bg-white/15 p-5 backdrop-blur">
              <p className="text-sm uppercase tracking-[0.2em] text-white/80">Student-only platform</p>
              <p className="mt-3 text-2xl font-bold">Lakehead email access</p>
            </div>

            <div className="rounded-3xl bg-white/15 p-5 backdrop-blur">
              <p className="text-sm uppercase tracking-[0.2em] text-white/80">Student communication</p>
              <p className="mt-3 text-2xl font-bold">Direct in-app messaging</p>
            </div>
          </div>
        </div>
      </section>

      {error ? (
        <div className="rounded-3xl border border-red-100 bg-white p-5 text-sm text-red-700 shadow-sm">
          {error}
        </div>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
            Why NeighborNet
          </p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900">
            Built for real student housing decisions
          </h2>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl bg-slate-50 p-5">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Browse</p>
              <p className="mt-3 font-semibold text-slate-900">
                Explore listings with rent, type, and distance details.
              </p>
            </div>

            <div className="rounded-3xl bg-slate-50 p-5">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Review</p>
              <p className="mt-3 font-semibold text-slate-900">
                Read and leave honest student experiences about properties.
              </p>
            </div>

            <div className="rounded-3xl bg-slate-50 p-5">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Report</p>
              <p className="mt-3 font-semibold text-slate-900">
                Flag issues like mold, noise, pests, heat, or safety concerns.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
            Quick Actions
          </p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900">
            Start using the platform
          </h2>

          <div className="mt-6 space-y-4">
            <Link
              href="/properties"
              className="block rounded-3xl border border-slate-200 bg-slate-50 p-5 transition hover:bg-slate-100"
            >
              <p className="text-lg font-semibold text-slate-900">Browse student properties</p>
              <p className="mt-2 text-sm text-slate-500">Find listings and compare student feedback.</p>
            </Link>

            <Link
              href="/add-property"
              className="block rounded-3xl border border-slate-200 bg-slate-50 p-5 transition hover:bg-slate-100"
            >
              <p className="text-lg font-semibold text-slate-900">Add a new property</p>
              <p className="mt-2 text-sm text-slate-500">Help other students discover better housing options.</p>
            </Link>

            <Link
              href="/chat"
              className="block rounded-3xl border border-slate-200 bg-slate-50 p-5 transition hover:bg-slate-100"
            >
              <p className="text-lg font-semibold text-slate-900">Talk with other students</p>
              <p className="mt-2 text-sm text-slate-500">Ask questions about listings and neighborhoods.</p>
            </Link>
          </div>
        </div>
      </section>

      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Featured Properties
            </p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">
              Recently added student listings
            </h2>
          </div>

          <Link
            href="/properties"
            className="rounded-full border border-slate-200 px-4 py-2 font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            View all properties
          </Link>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {featuredProperties.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-slate-500">
              No properties added yet. Start by posting one from the Add Property page.
            </div>
          ) : (
            featuredProperties.map((property) => (
              <Link
                key={property._id}
                href={`/properties/${property._id}`}
                className="overflow-hidden rounded-[28px] border border-slate-200 bg-slate-50 transition hover:-translate-y-1 hover:bg-white hover:shadow-md"
              >
                <div className="relative">
                  <PropertyImage
                    src={property.image_urls?.[0]}
                    alt={property.area}
                    overlayLabel="Featured"
                    className="h-52 w-full"
                  />
                  <span className="absolute left-4 top-4 rounded-full bg-white/85 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-800 backdrop-blur">
                    {property.property_type || "Student Listing"}
                  </span>
                </div>

                <div className="p-5">
                  <h3 className="text-xl font-semibold text-slate-900">{property.area}</h3>
                  <p className="mt-2 text-slate-600">{property.rent_range || "Rent not added yet"}</p>
                  <p className="mt-2 text-sm text-slate-500">{formatDistance(property.distance_to_campus)}</p>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
