"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import PropertyCard from "../../components/PropertyCard";
import { API_BASE_URL, getApiErrorMessage } from "../../lib/api";
import { canUseAdminFeatures, getAuthSession } from "../../lib/auth";

export default function Properties() {
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [authSession, setAuthSession] = useState(null);
  const [actionMessage, setActionMessage] = useState("");
  const [deletingPropertyId, setDeletingPropertyId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [propertyTypeFilter, setPropertyTypeFilter] = useState("all");

  useEffect(() => {
    const session = getAuthSession();
    setAuthSession(session);
    setSearchTerm(searchParams.get("search") || "");

    async function fetchProperties() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(`${API_BASE_URL}/api/properties`);

        if (!res.ok) {
          throw new Error("Could not load properties");
        }

        const data = await res.json();
        setProperties(data);
      } catch (err) {
        setError(getApiErrorMessage(err, "Could not load properties"));
      } finally {
        setLoading(false);
      }
    }

    fetchProperties();
  }, [searchParams]);

  const filteredProperties = properties.filter((property) => {
    const searchableText = `${property.area || ""} ${property.property_type || ""}`.toLowerCase();
    const matchesSearch = searchableText.includes(searchTerm.toLowerCase());
    const matchesType =
      propertyTypeFilter === "all" ||
      property.property_type?.toLowerCase() === propertyTypeFilter.toLowerCase();

    return matchesSearch && matchesType;
  });

  async function handleDeleteProperty(propertyId) {
    try {
      setDeletingPropertyId(propertyId);
      setActionMessage("");
      setError("");

      const res = await fetch(`${API_BASE_URL}/api/admin/properties/${propertyId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authSession?.token}`
        }
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Could not remove property");
      }

      setProperties((currentProperties) =>
        currentProperties.filter((property) => property._id !== propertyId)
      );
      setActionMessage("Property removed successfully.");
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not remove property"));
    } finally {
      setDeletingPropertyId("");
    }
  }

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-slate-500">Loading properties...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-red-100 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-slate-900">Browse Properties</h1>
        <p className="mt-4 text-red-600">{error}</p>
        <p className="mt-2 text-sm text-slate-500">
          Once your backend connects successfully, this page will show the saved properties.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-6 bg-gradient-to-r from-slate-900 via-teal-700 to-emerald-500 px-8 py-10 text-white lg:grid-cols-[1fr_320px]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
              Browse Properties
            </p>
            <h1 className="mt-3 text-4xl font-bold leading-tight">Student housing with real context, not just empty listings</h1>
            <p className="mt-4 max-w-2xl text-white/85">
              Explore student-submitted places, compare rent and distance, preview photos, and
              open each property for reviews and reported issues.
            </p>
          </div>

          <div className="rounded-[28px] bg-white/12 p-5 backdrop-blur">
            <p className="text-sm uppercase tracking-[0.2em] text-white/70">Live overview</p>
            <div className="mt-4 grid gap-3">
              <div className="rounded-2xl bg-white/12 p-4">
                <p className="text-sm text-white/70">All listings</p>
                <p className="mt-1 text-3xl font-bold">{properties.length}</p>
              </div>
              <div className="rounded-2xl bg-white/12 p-4">
                <p className="text-sm text-white/70">Matching results</p>
                <p className="mt-1 text-3xl font-bold">{filteredProperties.length}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-[1fr_220px]">
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by area or property type"
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-400"
        />

        <select
          value={propertyTypeFilter}
          onChange={(e) => setPropertyTypeFilter(e.target.value)}
          className="rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-400"
        >
          <option value="all">All property types</option>
          <option value="apartment">Apartment</option>
          <option value="house">House</option>
          <option value="townhouse">Townhouse</option>
          <option value="studio">Studio</option>
          <option value="basement">Basement</option>
        </select>
      </div>

      {actionMessage ? (
        <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {actionMessage}
        </p>
      ) : null}

      {canUseAdminFeatures(authSession) ? (
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
          Admin mode is active here. You can remove a property directly from this page or
          open it to moderate reviews and reports.
        </div>
      ) : null}

      {properties.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-slate-500 shadow-sm">
          No properties have been added yet.
        </div>
      ) : filteredProperties.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-slate-500 shadow-sm">
          No properties match your current search or filter.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredProperties.map((property) => (
            <PropertyCard
              key={property._id}
              property={property}
              isAdmin={canUseAdminFeatures(authSession)}
              onDelete={handleDeleteProperty}
              isDeleting={deletingPropertyId === property._id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
