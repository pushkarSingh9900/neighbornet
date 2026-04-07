"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { canUseAdminFeatures, clearAuthSession, getAuthSession } from "../lib/auth";

export default function Navbar() {
  const pathname = usePathname();
  const [authSession, setAuthSession] = useState(null);

  useEffect(() => {
    function syncAuthState() {
      setAuthSession(getAuthSession());
    }

    syncAuthState();

    window.addEventListener("auth-changed", syncAuthState);
    window.addEventListener("storage", syncAuthState);

    return () => {
      window.removeEventListener("auth-changed", syncAuthState);
      window.removeEventListener("storage", syncAuthState);
    };
  }, []);

  function handleLogout() {
    clearAuthSession();
  }

  const user = authSession?.user || null;
  const firstName = user?.name?.trim()?.split(" ")[0] || "Student";
  const initials = user?.name
    ? user.name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("")
    : "NN";

  function getLinkClasses(href, isPrimary = false, isAdmin = false) {
    const isActive = pathname === href;

    if (isPrimary) {
      return `rounded-full px-4 py-2 text-sm font-semibold transition ${
        isActive
          ? "bg-slate-900 text-white shadow-sm"
          : "bg-teal-500 text-white hover:bg-teal-600"
      }`;
    }

    if (isAdmin) {
      return `rounded-full px-4 py-2 text-sm font-semibold transition ${
        isActive
          ? "bg-amber-500 text-white shadow-sm"
          : "border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
      }`;
    }

    return `rounded-full px-4 py-2 text-sm font-medium transition ${
      isActive
        ? "bg-slate-900 text-white shadow-sm"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    }`;
  }

  return (
    <nav className="sticky top-0 z-30 border-b border-white/60 bg-white/80 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 text-lg font-bold text-white shadow-sm">
            N
          </div>

          <div>
            <p className="text-xl font-bold text-slate-900">NeighborNet</p>
            <p className="text-xs tracking-[0.14em] text-slate-500 uppercase">Student housing reviews</p>
          </div>
        </Link>

        <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-slate-600">
          <Link href="/" className={getLinkClasses("/")}>
            Home
          </Link>

          <Link href="/properties" className={getLinkClasses("/properties")}>
            Browse
          </Link>

          <Link href="/chat" className={getLinkClasses("/chat")}>
            Chat
          </Link>

          <Link href="/add-property" className={getLinkClasses("/add-property", true)}>
            Add Property
          </Link>

          {user ? (
            <>
              {canUseAdminFeatures(authSession) ? (
                <Link
                  href="/admin"
                  className={getLinkClasses("/admin", false, true)}
                >
                  Admin Panel
                </Link>
              ) : null}

              <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-3 py-2 text-slate-700 shadow-sm">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                  {initials}
                </div>
                <div className="pr-1">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Signed in</p>
                  <p className="text-sm font-semibold text-slate-900">{firstName}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full px-4 py-2 text-sm font-medium transition hover:bg-slate-100 hover:text-slate-900"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/signup" className={getLinkClasses("/signup")}>
                Signup
              </Link>

              <Link href="/login" className={getLinkClasses("/login")}>
                Login
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
