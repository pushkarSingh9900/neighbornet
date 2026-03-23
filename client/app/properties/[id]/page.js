"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function PropertyDetailsPage() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function getDisplayValue(value, fallback = "Not added yet") {
    if (value === undefined || value === null || value === "") {
      return fallback;
    }

    return value;
  }

  useEffect(() => {
    async function fetchProperty() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(`http://127.0.0.1:8000/api/properties/${id}`);

        if (!res.ok) {
          throw new Error("Property not found");
        }

        const data = await res.json();
        setProperty(data);
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchProperty();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-slate-500">Loading property details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4 rounded-3xl border border-red-100 bg-white p-8 shadow-sm">
        <p className="text-red-600">{error}</p>
        <Link
          href="/properties"
          className="inline-flex rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Back to properties
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href="/properties"
        className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50"
      >
        ← Back to properties
      </Link>

      <section className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
        <div className="bg-gradient-to-r from-teal-500 via-emerald-400 to-cyan-300 px-8 py-10 text-white">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-white/80">
            Property Details
          </p>

          <h1 className="max-w-2xl text-4xl font-bold leading-tight">
            {getDisplayValue(property.area, "Unnamed Property")}
          </h1>

          <p className="mt-3 max-w-2xl text-base text-white/90">
            A student-submitted listing on NeighborNet. This page will later hold reviews,
            issue reports, and helpful notes for future renters.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <span className="rounded-full bg-white/20 px-4 py-2 text-sm font-medium backdrop-blur">
              Rent: {getDisplayValue(property.rent_range)}
            </span>
            <span className="rounded-full bg-white/20 px-4 py-2 text-sm font-medium backdrop-blur">
              Type: {getDisplayValue(property.property_type)}
            </span>
          </div>
        </div>

        <div className="grid gap-6 px-8 py-8 lg:grid-cols-[1.5fr_1fr]">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-medium text-slate-500">Rent Range</p>
              <p className="mt-3 text-2xl font-semibold text-slate-900">
                {getDisplayValue(property.rent_range)}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Useful for students comparing similar listings nearby.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-medium text-slate-500">Property Type</p>
              <p className="mt-3 text-2xl font-semibold text-slate-900">
                {getDisplayValue(property.property_type)}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                House, apartment, studio, townhouse, or something similar.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-medium text-slate-500">Distance To Campus</p>
              <p className="mt-3 text-2xl font-semibold text-slate-900">
                {property.distance_to_campus ? `${property.distance_to_campus} km` : "Not added yet"}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                You can add this later when you expand the add-property form.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-medium text-slate-500">Added By</p>
              <p className="mt-3 text-2xl font-semibold text-slate-900">
                {getDisplayValue(property.created_by, "Anonymous")}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Right now this is simple. Later this can come from user accounts.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
              Coming Next
            </p>
            <h2 className="mt-3 text-2xl font-bold text-slate-900">
              Reviews will fit naturally here
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              This page is now ready for the next small feature: student reviews for a
              single property. We already have the property id in the URL, so adding
              reviews later will be much easier.
            </p>

            <div className="mt-6 space-y-3">
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <p className="text-sm font-medium text-slate-500">Future section</p>
                <p className="mt-1 font-semibold text-slate-900">Average rating and review count</p>
              </div>

              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <p className="text-sm font-medium text-slate-500">Future section</p>
                <p className="mt-1 font-semibold text-slate-900">Student comments about heat, noise, and safety</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
