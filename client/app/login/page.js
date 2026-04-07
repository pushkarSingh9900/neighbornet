"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import PasswordField from "../../components/PasswordField";
import { API_BASE_URL, getApiErrorMessage } from "../../lib/api";
import { isLakeheadEmail, saveAuthSession } from "../../lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function handleInputChange(e) {
    const { name, value } = e.target;

    setFormData((currentFormData) => ({
      ...currentFormData,
      [name]: value
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setSubmitting(true);
      setMessage("");
      setError("");

      if (!isLakeheadEmail(formData.email)) {
        throw new Error("Only @lakeheadu.ca email addresses can sign in");
      }

      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Could not log in");
      }

      saveAuthSession(data);
      setMessage("Login successful. Redirecting...");
      router.push(data.user.role === "admin" ? "/admin" : "/properties");
      router.refresh();
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not log in"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <section className="rounded-[32px] bg-gradient-to-br from-slate-900 via-teal-700 to-emerald-500 p-8 text-white shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
          Welcome Back
        </p>
        <h1 className="mt-4 text-4xl font-bold leading-tight">
          Sign back in to keep building your housing network
        </h1>
        <p className="mt-4 max-w-xl leading-7 text-white/85">
          NeighborNet is built for Lakehead students who want honest housing advice,
          safer rentals, and a better way to compare listings.
        </p>

        <div className="mt-8 grid gap-4">
          <div className="rounded-3xl bg-white/10 p-5 backdrop-blur">
            <p className="text-sm uppercase tracking-[0.2em] text-white/70">Verified access</p>
            <p className="mt-2 text-lg font-semibold">Only @lakeheadu.ca accounts can sign in</p>
          </div>

          <div className="rounded-3xl bg-white/10 p-5 backdrop-blur">
            <p className="text-sm uppercase tracking-[0.2em] text-white/70">Student tools</p>
            <p className="mt-2 text-lg font-semibold">Reviews, reports, messaging, and admin moderation</p>
          </div>
        </div>
      </section>

      <section className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          Login
        </p>
        <h2 className="mt-2 text-3xl font-bold text-slate-900">
          Sign in with your Lakehead email
        </h2>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="yourname@lakeheadu.ca"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-400"
              required
            />
          </div>

          <PasswordField
            label="Password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Enter your password"
            autoComplete="current-password"
            required
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
            className="w-full rounded-2xl bg-teal-500 px-5 py-3 font-semibold text-white transition hover:bg-teal-600 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {submitting ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/signup"
            className="rounded-2xl bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-800"
          >
            Create an account
          </Link>

          <Link
            href="/"
            className="rounded-2xl border border-slate-200 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Back Home
          </Link>
        </div>
      </section>
    </div>
  );
}
