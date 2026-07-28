"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "push_optin_dismissed";

export default function PushOptIn() {
  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState<"idle" | "granted" | "denied" | "unsupported">("idle");

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (dismissed) return;

    // Only show on mobile browsers
    const isMobile = /Android|iPhone|iPad|iPod|webOS/i.test(navigator.userAgent);
    if (!isMobile) return;

    // Check if notifications are supported
    if (!("Notification" in window)) {
      setStatus("unsupported");
      return;
    }

    // Don't show if already granted or denied
    if (Notification.permission === "granted" || Notification.permission === "denied") {
      return;
    }

    // Show after a short delay
    const timer = setTimeout(() => setVisible(true), 15000);
    return () => clearTimeout(timer);
  }, []);

  const requestPermission = async () => {
    try {
      const result = await Notification.requestPermission();
      if (result === "granted") {
        setStatus("granted");
        // Register with service worker for push
        if ("serviceWorker" in navigator) {
          const registration = await navigator.serviceWorker.ready;
          // Push subscription would happen here with VAPID key
          console.log("SW ready for push:", registration.scope);
        }
      } else {
        setStatus("denied");
      }
      localStorage.setItem(STORAGE_KEY, "true");
      setTimeout(() => setVisible(false), 2000);
    } catch {
      setStatus("denied");
      localStorage.setItem(STORAGE_KEY, "true");
    }
  };

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(STORAGE_KEY, "true");
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-40 animate-slide-up md:left-auto md:right-4 md:w-80">
      <div className="rounded-xl border border-[#c9a96e]/20 bg-[#1a1a24]/95 p-4 shadow-2xl backdrop-blur-xl">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[#c9a96e]/10">
            <svg className="h-4 w-4 text-[#c9a96e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            {status === "idle" && (
              <>
                <p className="text-sm font-semibold text-[#e8e0d4]">Want updates?</p>
                <p className="text-xs text-[#e8e0d4]/50 mt-0.5">Get notified about new features and deals.</p>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={requestPermission}
                    className="rounded-lg bg-gradient-to-r from-[#c9a96e] to-[#d4b87a] px-3 py-1.5 text-xs font-semibold text-[#12121a] transition-opacity hover:opacity-90"
                  >
                    Allow
                  </button>
                  <button
                    onClick={dismiss}
                    className="rounded-lg border border-[#e8e0d4]/15 px-3 py-1.5 text-xs text-[#e8e0d4]/50 transition-colors hover:border-[#e8e0d4]/30"
                  >
                    No thanks
                  </button>
                </div>
              </>
            )}
            {status === "granted" && (
              <p className="text-sm text-[#c9a96e]">🎉 Notifications enabled!</p>
            )}
            {status === "denied" && (
              <p className="text-sm text-[#e8e0d4]/50">No worries. You can enable them later in settings.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
