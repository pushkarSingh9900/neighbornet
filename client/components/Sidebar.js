import Link from "next/link";

export default function Sidebar() {

  return (
    <aside className="w-60 h-screen bg-gray-100 p-6 border-r">

      <h2 className="font-semibold text-lg mb-4">
        Navigation
      </h2>

      <ul className="space-y-3">

        <li>
          <Link href="/" className="hover:text-blue-600">
            Home
          </Link>
        </li>

        <li>
          <Link href="/properties" className="hover:text-blue-600">
            Browse Properties
          </Link>
        </li>

        <li>
          <Link href="/add-property" className="hover:text-blue-600">
            Add Property
          </Link>
        </li>

      </ul>

    </aside>
  );
}