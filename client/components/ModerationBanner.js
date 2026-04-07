"use client";

import { useEffect, useState } from "react";
import { getAuthSession, refreshAuthSessionFromServer } from "../lib/auth";

export default function ModerationBanner() {
  const [authSession, setAuthSession] = useState(null);

  useEffect(() => {
    let isMounted = true;

    function syncLocalSession() {
      if (!isMounted) {
        return;
      }

      setAuthSession(getAuthSession());
    }

    async function syncSessionFromServer() {
      syncLocalSession();
      const refreshedSession = await refreshAuthSessionFromServer();

      if (!isMounted) {
        return;
      }

      setAuthSession(refreshedSession);
    }

    syncSessionFromServer();

    window.addEventListener("auth-changed", syncLocalSession);
    window.addEventListener("storage", syncLocalSession);
    window.addEventListener("focus", syncSessionFromServer);

    return () => {
      isMounted = false;
      window.removeEventListener("auth-changed", syncLocalSession);
      window.removeEventListener("storage", syncLocalSession);
      window.removeEventListener("focus", syncSessionFromServer);
    };
  }, []);

  const user = authSession?.user;

  if (!user || user.status === "active") {
    return null;
  }

  if (user.status === "warned") {
    return (
      <div className="border-b border-amber-200 bg-amber-50">
        <div className="mx-auto flex max-w-7xl items-start gap-3 px-4 py-3 text-sm sm:px-6">
          <div className="mt-0.5 h-2.5 w-2.5 rounded-full bg-amber-500" />
          <div>
            <p className="font-semibold text-amber-900">
              Account warning on your NeighborNet profile
            </p>
            <p className="mt-1 text-amber-800">
              {user.moderation_reason ||
                "An admin has warned your account for content that may be misleading, inappropriate, or against platform rules."}
            </p>
            <p className="mt-1 text-amber-700">
              Warning count: {user.warning_count || 1}. You can still use the platform, but repeated violations may lead to account restrictions.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border-b border-red-200 bg-red-50">
      <div className="mx-auto flex max-w-7xl items-start gap-3 px-4 py-3 text-sm sm:px-6">
        <div className="mt-0.5 h-2.5 w-2.5 rounded-full bg-red-500" />
        <div>
          <p className="font-semibold text-red-900">Your account is currently restricted</p>
          <p className="mt-1 text-red-800">
            {user.moderation_reason ||
              "An admin has restricted your account because of repeated moderation issues."}
          </p>
          <p className="mt-1 text-red-700">
            You can still browse NeighborNet, but posting properties, reviews, issue reports, and messages is disabled.
          </p>
        </div>
      </div>
    </div>
  );
}
