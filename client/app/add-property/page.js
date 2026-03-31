"use client";

import { useState } from "react";
import { API_BASE_URL, getApiErrorMessage } from "../../lib/api";

export default function AddProperty() {
  const [area, setArea] = useState("");
  const [rent, setRent] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setSubmitting(true);
      setMessage("");
      setError("");

      const res = await fetch(`${API_BASE_URL}/api/properties/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          area,
          rent_range: rent
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Could not add property");
      }

      setMessage("Property added successfully.");
      setArea("");
      setRent("");
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not add property"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="text-3xl font-bold text-slate-900">Add Property</h1>
      <p className="mt-2 text-slate-500">
        Start simple for now: area and rent range.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">

        <input
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-400"
          placeholder="Area"
          value={area}
          onChange={(e) => setArea(e.target.value)}
          required
        />

        <input
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-400"
          placeholder="Rent Range"
          value={rent}
          onChange={(e) => setRent(e.target.value)}
        />

        {message ? (
          <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {message}
          </p>
        ) : null}

        {error ? (
          <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-2xl bg-teal-500 px-5 py-3 font-semibold text-white transition hover:bg-teal-600 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {submitting ? "Adding..." : "Add Property"}
        </button>
      </form>
    </div>
  );
}
