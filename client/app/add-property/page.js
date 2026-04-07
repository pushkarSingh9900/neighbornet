"use client";

import { useEffect, useState } from "react";
import { API_BASE_URL, getApiErrorMessage } from "../../lib/api";
import { getAuthSession } from "../../lib/auth";

const MAX_IMAGE_COUNT = 4;
const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024;

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error(`Could not read ${file.name}`));
    reader.readAsDataURL(file);
  });
}

export default function AddProperty() {
  const [formData, setFormData] = useState({
    area: "",
    rent_range: "",
    property_type: "Apartment",
    distance_to_campus: "",
    image_urls: [],
    created_by: ""
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const session = getAuthSession();

    if (session?.user?.email) {
      setFormData((currentFormData) => ({
        ...currentFormData,
        created_by: session.user.email
      }));
    }
  }, []);

  function handleInputChange(e) {
    const { name, value } = e.target;

    setFormData((currentFormData) => ({
      ...currentFormData,
      [name]: value
    }));
  }

  async function handleImageChange(e) {
    try {
      setError("");
      const selectedFiles = Array.from(e.target.files || []);

      if (selectedFiles.length === 0) {
        return;
      }

      if (selectedFiles.length > MAX_IMAGE_COUNT) {
        throw new Error(`You can upload up to ${MAX_IMAGE_COUNT} images`);
      }

      selectedFiles.forEach((file) => {
        if (file.size > MAX_IMAGE_SIZE_BYTES) {
          throw new Error(`${file.name} is too large. Keep each image under 2MB.`);
        }
      });

      const imageUrls = await Promise.all(selectedFiles.map(readFileAsDataUrl));

      setFormData((currentFormData) => ({
        ...currentFormData,
        image_urls: imageUrls
      }));
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not process images"));
    }
  }

  function handleRemoveImage(indexToRemove) {
    setFormData((currentFormData) => ({
      ...currentFormData,
      image_urls: currentFormData.image_urls.filter((_, index) => index !== indexToRemove)
    }));
  }

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
          area: formData.area,
          rent_range: formData.rent_range,
          property_type: formData.property_type,
          distance_to_campus: formData.distance_to_campus
            ? Number(formData.distance_to_campus)
            : undefined,
          image_urls: formData.image_urls,
          created_by: formData.created_by
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Could not add property");
      }

      setMessage("Property added successfully.");
      setFormData((currentFormData) => ({
        ...currentFormData,
        area: "",
        rent_range: "",
        property_type: "Apartment",
        distance_to_campus: "",
        image_urls: []
      }));
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not add property"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <section className="rounded-[32px] bg-gradient-to-br from-slate-900 via-teal-700 to-emerald-500 p-8 text-white shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
          New Listing
        </p>
        <h1 className="mt-4 text-4xl font-bold leading-tight">Add a property students will actually want to explore</h1>
        <p className="mt-4 max-w-xl leading-7 text-white/85">
          Strong listings give students the basics fast: where the place is, how much it costs,
          what type of home it is, how far it is from campus, and what it actually looks like.
        </p>

        <div className="mt-8 grid gap-4">
          <div className="rounded-3xl bg-white/12 p-5 backdrop-blur">
            <p className="text-sm uppercase tracking-[0.2em] text-white/75">Best results</p>
            <p className="mt-2 text-lg font-semibold">Upload up to 4 photos and fill in the distance field.</p>
          </div>

          <div className="rounded-3xl bg-white/12 p-5 backdrop-blur">
            <p className="text-sm uppercase tracking-[0.2em] text-white/75">Trust signal</p>
            <p className="mt-2 text-lg font-semibold">Listings connected to student accounts look more credible.</p>
          </div>
        </div>
      </section>

      <section className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-3xl font-bold text-slate-900">Add Property</h2>
        <p className="mt-2 text-slate-500">
          Add a student housing listing with the details other students care about most.
        </p>

        {formData.created_by ? (
          <p className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Posting as {formData.created_by}
          </p>
        ) : (
          <p className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Sign in first if you want this listing connected to your student account.
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Property Area or Address
            </label>
            <input
              name="area"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-400"
              placeholder="123 College Street"
              value={formData.area}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Rent Range
              </label>
              <input
                name="rent_range"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-400"
                placeholder="$700 - $900"
                value={formData.rent_range}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Property Type
              </label>
              <select
                name="property_type"
                value={formData.property_type}
                onChange={handleInputChange}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-400"
              >
                <option>Apartment</option>
                <option>House</option>
                <option>Townhouse</option>
                <option>Studio</option>
                <option>Basement</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Distance to Campus (km)
              </label>
              <input
                name="distance_to_campus"
                type="number"
                min="0"
                step="0.1"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-400"
                placeholder="1.2"
                value={formData.distance_to_campus}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Posted By
              </label>
              <input
                name="created_by"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-500 outline-none"
                value={formData.created_by}
                readOnly
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Property Pictures
            </label>
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-[28px] border border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center transition hover:border-emerald-300 hover:bg-emerald-50/40">
              <span className="text-sm font-semibold text-slate-900">Upload up to 4 images</span>
              <span className="mt-2 text-sm text-slate-500">PNG or JPG works best. Keep each image under 2MB.</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
              />
            </label>

            {formData.image_urls.length > 0 ? (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {formData.image_urls.map((imageUrl, index) => (
                  <div key={index} className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imageUrl}
                      alt={`Property preview ${index + 1}`}
                      className="h-40 w-full object-cover"
                    />
                    <div className="p-3">
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="rounded-full border border-red-200 px-3 py-1 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                      >
                        Remove image
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
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
            {submitting ? "Adding..." : "Add Property"}
          </button>
        </form>
      </section>
    </div>
  );
}
