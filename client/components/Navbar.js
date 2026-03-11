import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-blue-600 text-white px-8 py-4 flex justify-between items-center shadow-md">

      <h1 className="text-2xl font-bold">
        NeighborNet
      </h1>

      <div className="flex gap-6 font-medium">

        <Link href="/" className="hover:underline">
          Home
        </Link>

        <Link href="/properties" className="hover:underline">
          Browse
        </Link>

        <Link href="/add-property" className="hover:underline">
          Add Property
        </Link>

        <Link href="/login" className="hover:underline">
          Login
        </Link>

      </div>

    </nav>
  );
}