import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500 text-lg font-bold text-white">
            N
          </div>

          <div>
            <p className="text-xl font-bold text-slate-900">NeighborNet</p>
            <p className="text-xs text-slate-500">Student housing reviews</p>
          </div>
        </Link>

        <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
          <Link href="/" className="rounded-full px-4 py-2 transition hover:bg-slate-100 hover:text-slate-900">
            Home
          </Link>

          <Link href="/properties" className="rounded-full px-4 py-2 transition hover:bg-slate-100 hover:text-slate-900">
            Browse
          </Link>

          <Link href="/add-property" className="rounded-full bg-teal-500 px-4 py-2 text-white transition hover:bg-teal-600">
            Add Property
          </Link>

          <Link href="/login" className="rounded-full px-4 py-2 transition hover:bg-slate-100 hover:text-slate-900">
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
}
