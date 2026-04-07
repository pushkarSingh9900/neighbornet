"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { API_BASE_URL, getApiErrorMessage } from "../../lib/api";
import { isLakeheadEmail, saveAuthSession } from "../../lib/auth";

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
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
        throw new Error("Only @lakeheadu.ca email addresses can create an account");
      }

      if (formData.password.length < 6) {
        throw new Error("Password must be at least 6 characters long");
      }

      if (formData.password !== formData.confirmPassword) {
        throw new Error("Passwords do not match");
      }

      const res = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Could not create account");
      }

      saveAuthSession(data);
      setMessage("Account created successfully. Redirecting...");
      router.push(data.user.role === "admin" ? "/admin" : "/properties");
      router.refresh();
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not create account"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <section className="rounded-[32px] bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-400 p-8 text-white shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/75">
          Student Access
        </p>
        <h1 className="mt-4 text-4xl font-bold leading-tight">
          Create a verified NeighborNet account
        </h1>
        <p className="mt-4 max-w-xl leading-7 text-white/90">
          Join a Lakehead-only housing platform where students can post properties,
          leave reviews, report issues, and message each other.
        </p>

        <div className="mt-8 grid gap-4">
          <div className="rounded-3xl bg-white/15 p-5 backdrop-blur">
            <p className="text-sm uppercase tracking-[0.2em] text-white/75">Who can join</p>
            <p className="mt-2 text-lg font-semibold">Only @lakeheadu.ca students</p>
          </div>

          <div className="rounded-3xl bg-white/15 p-5 backdrop-blur">
            <p className="text-sm uppercase tracking-[0.2em] text-white/75">What you unlock</p>
            <p className="mt-2 text-lg font-semibold">Reviews, issue reporting, saved chat, and moderation tools</p>
          </div>
        </div>
      </section>

      <section className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          Signup
        </p>
        <h2 className="mt-2 text-3xl font-bold text-slate-900">
          Create your student account
        </h2>
        <p className="mt-4 leading-7 text-slate-600">
          NeighborNet is limited to Lakehead students.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Full Name
            </label>
            <input
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Your full name"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-400"
              required
            />
          </div>

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

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="At least 6 characters"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-400"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Confirm Password
            </label>
            <input
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Re-enter your password"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-400"
              required
            />
          </div>

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
            {submitting ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/login"
            className="rounded-2xl bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-800"
          >
            Go to login
          </Link>

          <Link
            href="/"
            className="rounded-2xl border border-slate-200 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Back home
          </Link>
        </div>
      </section>
    </div>
  );
}
