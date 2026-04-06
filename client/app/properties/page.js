"use client";

import { useEffect, useState } from "react";
import PropertyCard from "../../components/PropertyCard";
import { API_BASE_URL, getApiErrorMessage } from "../../lib/api";
import { canUseAdminFeatures, getAuthSession } from "../../lib/auth";

export default function Properties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [authSession, setAuthSession] = useState(null);
  const [actionMessage, setActionMessage] = useState("");
  const [deletingPropertyId, setDeletingPropertyId] = useState("");

  useEffect(() => {
    const session = getAuthSession();
    setAuthSession(session);

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
  }, []);

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
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Browse Properties</h1>
        <p className="mt-2 text-slate-500">
          Explore student-submitted places and open a property to read or add reviews.
        </p>
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
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {properties.map((property) => (
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
