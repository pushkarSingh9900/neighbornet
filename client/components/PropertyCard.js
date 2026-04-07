import Link from "next/link";
import PropertyImage from "./PropertyImage";

export default function PropertyCard({ property, isAdmin = false, onDelete, isDeleting = false }) {
  const propertyImage = property.image_urls?.[0] || "";
  const hasDistance =
    property.distance_to_campus !== undefined &&
    property.distance_to_campus !== null &&
    property.distance_to_campus !== "";

  return (
    <div className="overflow-hidden rounded-[30px] border border-white/70 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(15,23,42,0.12)]">
      <Link href={`/properties/${property._id}`} className="block">
        <div className="relative">
          <PropertyImage
            src={propertyImage}
            alt={property.area}
            overlayLabel="Student Listing"
            className="h-56 w-full"
          />

          <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-4 p-4">
            <span className="rounded-full bg-white/85 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-800 backdrop-blur">
              {property.property_type || "Student Listing"}
            </span>

            <span className="rounded-2xl bg-slate-900/80 px-3 py-2 text-sm font-semibold text-white backdrop-blur">
              {property.rent_range || "Rent not added"}
            </span>
          </div>
        </div>

        <div className="p-5">
          <h2 className="text-xl font-semibold text-slate-900">
            {property.area}
          </h2>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Distance</p>
              <p className="mt-2 font-semibold text-slate-900">
                {hasDistance ? `${property.distance_to_campus} km to campus` : "Not added yet"}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Posted by</p>
              <p className="mt-2 font-semibold text-slate-900">
                {property.created_by || "Anonymous Student"}
              </p>
            </div>
          </div>
        </div>
      </Link>

      {isAdmin ? (
        <div className="flex gap-3 border-t border-slate-100 px-5 py-4">
          <Link
            href={`/properties/${property._id}`}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Moderate
          </Link>

          <button
            type="button"
            onClick={() => onDelete?.(property._id)}
            disabled={isDeleting}
            className="rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {isDeleting ? "Removing..." : "Remove Property"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
