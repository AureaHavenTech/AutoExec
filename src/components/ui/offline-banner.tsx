"use client";

import { useState, useEffect } from "react";
import { WifiOff, Wifi } from "lucide-react";

/**
 * Shows a banner when the user is offline.
 * Dismissible, auto-hides when back online.
 */
export function OfflineBanner() {
  const [offline, setOffline] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [backOnline, setBackOnline] = useState(false);

  useEffect(() => {
    const handleOffline = () => {
      setOffline(true);
      setDismissed(false);
      setBackOnline(false);
    };
    const handleOnline = () => {
      setOffline(false);
      setBackOnline(true);
      // Auto-dismiss "back online" after 3s
      setTimeout(() => setBackOnline(false), 3000);
    };

    // Set initial state
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setOffline(true);
    }

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  if (dismissed && offline) {
    // Show a small reconnect button if still offline after dismiss
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setDismissed(false)}
          className="flex items-center gap-2 px-3 py-2 bg-amber-500/90 text-dark text-xs font-medium rounded-xl shadow-lg backdrop-blur-sm"
        >
          <WifiOff className="w-3.5 h-3.5" />
          Offline
        </button>
      </div>
    );
  }

  if (backOnline) {
    return (
      <div className="sticky top-0 z-50 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500/90 text-white text-xs font-medium backdrop-blur-sm animate-in slide-in-from-top">
        <Wifi className="w-3.5 h-3.5" />
        You're back online — fresh data loaded
      </div>
    );
  }

  if (!offline || dismissed) return null;

  return (
    <div className="sticky top-0 z-50 flex items-center justify-between gap-2 px-4 py-2 bg-amber-500/90 text-dark text-xs font-medium backdrop-blur-sm">
      <span className="flex items-center gap-2">
        <WifiOff className="w-3.5 h-3.5" />
        You're offline — showing cached data
      </span>
      <button
        onClick={() => setDismissed(true)}
        className="text-dark/70 hover:text-dark font-bold text-sm leading-none px-1"
        aria-label="Dismiss offline banner"
      >
        ×
      </button>
    </div>
  );
}
