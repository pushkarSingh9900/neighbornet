import Link from "next/link";

export default function PropertyCard({ property }) {
  return (
    <Link href={`/properties/${property._id}`} className="block">
      <div className="border rounded-lg shadow-md p-5 hover:shadow-lg transition">
        <h2 className="text-xl font-semibold mb-2">
          {property.area}
        </h2>

        <p className="text-gray-600 mb-2">
          Rent: {property.rent_range}
        </p>

        <p className="text-sm text-gray-500">
          Added recently
        </p>
      </div>
    </Link>
  );
}
