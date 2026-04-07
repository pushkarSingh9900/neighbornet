"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import PropertyImage from "../../../components/PropertyImage";
import { API_BASE_URL, getApiErrorMessage } from "../../../lib/api";
import { canUseAdminFeatures, getAuthSession } from "../../../lib/auth";

const ISSUE_TYPE_OPTIONS = [
  { value: "mold", label: "Mold" },
  { value: "pests", label: "Pests" },
  { value: "heat", label: "Heat" },
  { value: "noise", label: "Noise" },
  { value: "safety", label: "Safety" },
  { value: "maintenance", label: "Maintenance" },
  { value: "other", label: "Other" }
];

export default function PropertyDetailsPage() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [submittingIssue, setSubmittingIssue] = useState(false);
  const [issueMessage, setIssueMessage] = useState("");
  const [issueError, setIssueError] = useState("");
  const [adminActionMessage, setAdminActionMessage] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [authSession, setAuthSession] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [formData, setFormData] = useState({
    reviewer_name: "",
    rating: "5",
    comment: ""
  });
  const [issueFormData, setIssueFormData] = useState({
    issue_type: "mold",
    description: ""
  });

  function getDisplayValue(value, fallback = "Not added yet") {
    if (value === undefined || value === null || value === "") {
      return fallback;
    }

    return value;
  }

  const averageRating = reviews.length
    ? (reviews.reduce((total, review) => total + review.rating, 0) / reviews.length).toFixed(1)
    : null;
  const openIssueCount = issues.filter((issue) => issue.status === "open").length;
  const reviewingIssueCount = issues.filter((issue) => issue.status === "reviewing").length;
  const closedIssueCount = issues.filter((issue) => issue.status === "resolved").length;
  const isAdmin = canUseAdminFeatures(authSession);
  const propertyImages = property?.image_urls || [];
  const activeImage = propertyImages[selectedImageIndex] || "";
  const hasDistance =
    property?.distance_to_campus !== undefined &&
    property?.distance_to_campus !== null &&
    property?.distance_to_campus !== "";

  useEffect(() => {
    const authSession = getAuthSession();
    setAuthSession(authSession);
    setCurrentUser(authSession?.user || null);
    setSelectedImageIndex(0);
    setFormData((currentFormData) => ({
      ...currentFormData,
      reviewer_name: authSession?.user?.name || ""
    }));

    async function fetchPropertyAndReviews() {
      try {
        setLoading(true);
        setError("");

        const propertyRes = await fetch(`${API_BASE_URL}/api/properties/${id}`);

        if (!propertyRes.ok) {
          throw new Error("Property not found");
        }

        const propertyData = await propertyRes.json();
        setProperty(propertyData);

        const reviewRes = await fetch(`${API_BASE_URL}/api/reviews/property/${id}`);

        if (reviewRes.ok) {
          const reviewData = await reviewRes.json();
          setReviews(reviewData);
        } else {
          setReviews([]);
        }

        const issueRes = await fetch(`${API_BASE_URL}/api/issues/property/${id}`);

        if (issueRes.ok) {
          const issueData = await issueRes.json();
          setIssues(issueData);
        } else {
          setIssues([]);
        }
      } catch (err) {
        setError(getApiErrorMessage(err, "Could not load property details"));
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchPropertyAndReviews();
    }
  }, [id]);

  async function handleReviewSubmit(e) {
    e.preventDefault();

    try {
      setSubmittingReview(true);
      setReviewMessage("");
      setReviewError("");

      const res = await fetch(`${API_BASE_URL}/api/reviews/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          property: id,
          reviewer_name: formData.reviewer_name,
          rating: Number(formData.rating),
          comment: formData.comment
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Could not submit review");
      }

      setReviews((currentReviews) => [data, ...currentReviews]);
      setFormData({
        reviewer_name: currentUser?.name || "",
        rating: "5",
        comment: ""
      });
      setReviewMessage("Review added successfully.");
    } catch (err) {
      setReviewError(getApiErrorMessage(err, "Could not submit review"));
    } finally {
      setSubmittingReview(false);
    }
  }

  function handleInputChange(e) {
    const { name, value } = e.target;

    setFormData((currentFormData) => ({
      ...currentFormData,
      [name]: value
    }));
  }

  function handleIssueInputChange(e) {
    const { name, value } = e.target;

    setIssueFormData((currentIssueFormData) => ({
      ...currentIssueFormData,
      [name]: value
    }));
  }

  async function handleIssueSubmit(e) {
    e.preventDefault();

    try {
      setSubmittingIssue(true);
      setIssueMessage("");
      setIssueError("");

      const res = await fetch(`${API_BASE_URL}/api/issues/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          property: id,
          issue_type: issueFormData.issue_type,
          description: issueFormData.description,
          reported_by: currentUser?.email || "Anonymous Student"
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Could not report issue");
      }

      setIssues((currentIssues) => [data, ...currentIssues]);
      setIssueFormData({
        issue_type: "mold",
        description: ""
      });
      setIssueMessage("Issue reported successfully.");
    } catch (err) {
      setIssueError(getApiErrorMessage(err, "Could not report issue"));
    } finally {
      setSubmittingIssue(false);
    }
  }

  async function handleDeleteReview(reviewId) {
    try {
      setAdminActionMessage("");
      setError("");

      const res = await fetch(`${API_BASE_URL}/api/admin/reviews/${reviewId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authSession?.token}`
        }
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Could not remove review");
      }

      setReviews((currentReviews) => currentReviews.filter((review) => review._id !== reviewId));
      setAdminActionMessage("Review removed successfully.");
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not remove review"));
    }
  }

  async function handleIssueStatusChange(issueId, status) {
    try {
      setAdminActionMessage("");
      setError("");

      const res = await fetch(`${API_BASE_URL}/api/admin/issues/${issueId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authSession?.token}`
        },
        body: JSON.stringify({ status })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Could not update issue");
      }

      setIssues((currentIssues) =>
        currentIssues.map((issue) => (issue._id === issueId ? data.issue : issue))
      );
      setAdminActionMessage("Report status updated successfully.");
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not update issue"));
    }
  }

  async function handleDeleteProperty() {
    try {
      setAdminActionMessage("");
      setError("");

      const res = await fetch(`${API_BASE_URL}/api/admin/properties/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authSession?.token}`
        }
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Could not remove property");
      }

      window.location.href = "/properties";
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not remove property"));
    }
  }

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

      {adminActionMessage ? (
        <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {adminActionMessage}
        </p>
      ) : null}

      {isAdmin ? (
        <div className="flex flex-wrap items-center gap-3 rounded-3xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-sm font-medium text-amber-800">
            Admin moderation is active on this property.
          </p>

          <button
            type="button"
            onClick={handleDeleteProperty}
            className="rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
          >
            Remove Property
          </button>
        </div>
      ) : null}

      <section className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
        <div className="bg-gradient-to-r from-teal-500 via-emerald-400 to-cyan-300 px-8 py-10 text-white">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-white/80">
            Property Details
          </p>

          <h1 className="max-w-2xl text-4xl font-bold leading-tight">
            {getDisplayValue(property.area, "Unnamed Property")}
          </h1>

          <p className="mt-3 max-w-2xl text-base text-white/90">
            Explore student reviews, submit issue reports, and use shared housing knowledge
            before making a rental decision.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <span className="rounded-full bg-white/20 px-4 py-2 text-sm font-medium backdrop-blur">
              Rent: {getDisplayValue(property.rent_range)}
            </span>
            <span className="rounded-full bg-white/20 px-4 py-2 text-sm font-medium backdrop-blur">
              Type: {getDisplayValue(property.property_type)}
            </span>
            <span className="rounded-full bg-white/20 px-4 py-2 text-sm font-medium backdrop-blur">
              Reviews: {reviews.length}
            </span>
            <span className="rounded-full bg-white/20 px-4 py-2 text-sm font-medium backdrop-blur">
              Open issues: {openIssueCount}
            </span>
            <span className="rounded-full bg-white/20 px-4 py-2 text-sm font-medium backdrop-blur">
              In review: {reviewingIssueCount}
            </span>
            <span className="rounded-full bg-white/20 px-4 py-2 text-sm font-medium backdrop-blur">
              Closed: {closedIssueCount}
            </span>
          </div>
        </div>

        <div className="px-8 py-8">
          <div className="overflow-hidden rounded-[30px] border border-slate-200 bg-slate-100 shadow-sm">
            <PropertyImage
              src={activeImage}
              alt={property.area}
              overlayLabel="Property Photos"
              className="h-[380px] w-full"
            />
          </div>

          {propertyImages.length > 1 ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {propertyImages.map((imageUrl, index) => (
                <button
                  key={`${imageUrl}-${index}`}
                  type="button"
                  onClick={() => setSelectedImageIndex(index)}
                  className={`overflow-hidden rounded-[22px] border transition ${
                    index === selectedImageIndex
                      ? "border-teal-400 shadow-md"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrl}
                    alt={`${property.area} view ${index + 1}`}
                    className="h-28 w-full object-cover"
                  />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="grid gap-6 px-8 pb-8 lg:grid-cols-[1.5fr_1fr]">
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
                {hasDistance ? `${property.distance_to_campus} km` : "Not added yet"}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Student contributors can share how close the property is to campus.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-medium text-slate-500">Added By</p>
              <p className="mt-3 text-2xl font-semibold text-slate-900">
                {getDisplayValue(property.created_by, "Anonymous")}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Listings keep track of the student who posted them.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
              Review Summary
            </p>
            <h2 className="mt-3 text-2xl font-bold text-slate-900">
              Student feedback starts here
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              This property can now collect reviews from students. That gives NeighborNet
              its core value: real experiences tied to a real place.
            </p>

            <Link
              href="/chat"
              className="mt-6 inline-flex rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Open Student Chat
            </Link>

            <div className="mt-6 space-y-3">
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <p className="text-sm font-medium text-slate-500">Average rating</p>
                <p className="mt-1 text-3xl font-bold text-slate-900">
                  {averageRating ? `${averageRating}/5` : "No ratings yet"}
                </p>
              </div>

              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <p className="text-sm font-medium text-slate-500">Total reviews</p>
                <p className="mt-1 text-3xl font-bold text-slate-900">{reviews.length}</p>
              </div>

              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <p className="text-sm font-medium text-slate-500">Open issues</p>
                <p className="mt-1 text-3xl font-bold text-slate-900">{openIssueCount}</p>
              </div>

              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <p className="text-sm font-medium text-slate-500">In review</p>
                <p className="mt-1 text-3xl font-bold text-slate-900">{reviewingIssueCount}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 border-t border-slate-200 px-8 py-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Reviews
                </p>
                <h2 className="mt-2 text-2xl font-bold text-slate-900">
                  What students are saying
                </h2>
              </div>

              <div className="rounded-2xl bg-white px-4 py-3 text-right shadow-sm">
                <p className="text-sm text-slate-500">Average</p>
                <p className="text-xl font-bold text-slate-900">
                  {averageRating ? `${averageRating}/5` : "No ratings"}
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {reviews.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-slate-500">
                  No reviews yet. Be the first student to leave one.
                </div>
              ) : (
                reviews.map((review) => (
                  <div key={review._id} className="rounded-2xl bg-white p-5 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {getDisplayValue(review.reviewer_name, "Anonymous Student")}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
                        Rating: {review.rating}/5
                      </div>
                    </div>

                    <p className="mt-4 leading-7 text-slate-700">{review.comment}</p>

                    {isAdmin ? (
                      <div className="mt-4">
                        <button
                          type="button"
                          onClick={() => handleDeleteReview(review._id)}
                          className="rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
                        >
                          Remove Review
                        </button>
                      </div>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Add Review
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              Share your experience
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Keep this simple for now: name, rating, and one honest comment.
            </p>

            <form onSubmit={handleReviewSubmit} className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Your Name
                </label>
                <input
                  name="reviewer_name"
                  value={formData.reviewer_name}
                  onChange={handleInputChange}
                  placeholder="Optional name"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Rating
                </label>
                <select
                  name="rating"
                  value={formData.rating}
                  onChange={handleInputChange}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-400"
                >
                  <option value="5">5 - Excellent</option>
                  <option value="4">4 - Good</option>
                  <option value="3">3 - Okay</option>
                  <option value="2">2 - Poor</option>
                  <option value="1">1 - Very bad</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Comment
                </label>
                <textarea
                  name="comment"
                  value={formData.comment}
                  onChange={handleInputChange}
                  placeholder="What should other students know about this place?"
                  rows="5"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-400"
                  required
                />
              </div>

              {reviewMessage ? (
                <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {reviewMessage}
                </p>
              ) : null}

              {reviewError ? (
                <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
                  {reviewError}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={submittingReview}
                className="w-full rounded-2xl bg-teal-500 px-4 py-3 font-semibold text-white transition hover:bg-teal-600 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {submittingReview ? "Submitting review..." : "Submit Review"}
              </button>
            </form>
          </div>
        </div>

        <div className="grid gap-6 border-t border-slate-200 px-8 py-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Issues
                </p>
                <h2 className="mt-2 text-2xl font-bold text-slate-900">
                  Reported property issues
                </h2>
              </div>

              <div className="rounded-2xl bg-white px-4 py-3 text-right shadow-sm">
                <p className="text-sm text-slate-500">Open issues</p>
                <p className="text-xl font-bold text-slate-900">{openIssueCount}</p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {issues.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-slate-500">
                  No issues have been reported for this property yet.
                </div>
              ) : (
                issues.map((issue) => (
                  <div key={issue._id} className="rounded-2xl bg-white p-5 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold capitalize text-slate-900">
                          {issue.issue_type}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          Reported by {getDisplayValue(issue.reported_by, "Anonymous Student")} on{" "}
                          {new Date(issue.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-700 capitalize">
                        {issue.status === "resolved" ? "closed" : issue.status}
                      </div>
                    </div>

                    <p className="mt-4 leading-7 text-slate-700">{issue.description}</p>

                    {isAdmin ? (
                      <div className="mt-4 flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => handleIssueStatusChange(issue._id, "reviewing")}
                          className="rounded-full border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
                        >
                          Mark Reviewing
                        </button>

                        <button
                          type="button"
                          onClick={() => handleIssueStatusChange(issue._id, "resolved")}
                          className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600"
                        >
                          Close Report
                        </button>

                        <button
                          type="button"
                          onClick={() => handleIssueStatusChange(issue._id, "open")}
                          className="rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-100"
                        >
                          Reopen
                        </button>
                      </div>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Report Issue
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              Help other students stay informed
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Report problems like mold, pests, heat, or safety concerns so future renters
              know what to expect.
            </p>

            {currentUser ? (
              <p className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                Reporting as {currentUser.email}
              </p>
            ) : null}

            <form onSubmit={handleIssueSubmit} className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Issue Type
                </label>
                <select
                  name="issue_type"
                  value={issueFormData.issue_type}
                  onChange={handleIssueInputChange}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-400"
                >
                  {ISSUE_TYPE_OPTIONS.map((issueTypeOption) => (
                    <option key={issueTypeOption.value} value={issueTypeOption.value}>
                      {issueTypeOption.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Description
                </label>
                <textarea
                  name="description"
                  value={issueFormData.description}
                  onChange={handleIssueInputChange}
                  placeholder="Describe the issue students should know about"
                  rows="5"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-400"
                  required
                />
              </div>

              {issueMessage ? (
                <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {issueMessage}
                </p>
              ) : null}

              {issueError ? (
                <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
                  {issueError}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={submittingIssue}
                className="w-full rounded-2xl bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {submittingIssue ? "Reporting issue..." : "Report Issue"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
