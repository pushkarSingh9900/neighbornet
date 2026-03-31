"use client";

import { useEffect, useState } from "react";
import PropertyCard from "../../components/PropertyCard";
import { API_BASE_URL, getApiErrorMessage } from "../../lib/api";

export default function Properties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
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

      {properties.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-slate-500 shadow-sm">
          No properties have been added yet.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {properties.map((property) => (
          <PropertyCard key={property._id} property={property} />
        ))}
        </div>
      )}
    </div>
  );
}
