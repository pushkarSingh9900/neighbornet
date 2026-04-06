import Link from "next/link";

export default function PropertyCard({ property, isAdmin = false, onDelete, isDeleting = false }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <Link href={`/properties/${property._id}`} className="block">
        <h2 className="mb-2 text-xl font-semibold text-slate-900">
          {property.area}
        </h2>

        <p className="mb-2 text-slate-600">
          Rent: {property.rent_range || "Not added yet"}
        </p>

        <p className="text-sm text-slate-500">
          Added recently
        </p>
      </Link>

      {isAdmin ? (
        <div className="mt-5 flex gap-3">
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
