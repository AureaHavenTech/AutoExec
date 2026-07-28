"use client";

import { useState, useEffect, useCallback } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const VISIT_COUNT_KEY = "pwa_visit_count";
const PROMPT_SHOWN_KEY = "pwa_prompt_shown";
const REQUIRED_VISITS = 3;

export default function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already in standalone mode
    if (typeof window !== "undefined") {
      const standalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone;
      setIsStandalone(standalone);
      if (standalone) return;
    }

    // Track visits
    const visits = parseInt(localStorage.getItem(VISIT_COUNT_KEY) || "0", 10);
    const wasShown = localStorage.getItem(PROMPT_SHOWN_KEY) === "true";
    const newVisits = visits + 1;
    localStorage.setItem(VISIT_COUNT_KEY, String(newVisits));

    // Show prompt after N visits, if not already shown and not dismissed
    if (newVisits >= REQUIRED_VISITS && !wasShown) {
      setShowPrompt(true);
    }

    // Listen for beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // If they've visited enough, show prompt immediately when event fires
      if (newVisits >= REQUIRED_VISITS && !wasShown) {
        setShowPrompt(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = useCallback(async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === "accepted") {
          localStorage.setItem(PROMPT_SHOWN_KEY, "true");
        }
      } catch {}
    }
    setShowPrompt(false);
    setDismissed(true);
    // Fallback: show instructions for iOS
    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    if (isIOS && !deferredPrompt) {
      alert(
        'To install this app:\n\n1. Tap the Share button\n2. Scroll down and tap "Add to Home Screen"\n3. Tap "Add"'
      );
    }
  }, [deferredPrompt]);

  const handleDismiss = useCallback(() => {
    setShowPrompt(false);
    setDismissed(true);
    localStorage.setItem(PROMPT_SHOWN_KEY, "true");
  }, []);

  if (!showPrompt || isStandalone || dismissed) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-slide-up md:left-auto md:right-4 md:w-96">
      <div className="rounded-2xl border border-[#c9a96e]/30 bg-[#1a1a24] p-4 shadow-2xl backdrop-blur-xl">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#c9a96e] to-[#d4b87a] text-[#12121a]">
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m0 0l-4-4m4 4l4-4"
              />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#e8e0d4]">
              Install for quick access
            </p>
            <p className="mt-0.5 text-xs text-[#e8e0d4]/60">
              Add to your home screen for a native app experience
            </p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={handleInstall}
                className="rounded-lg bg-gradient-to-r from-[#c9a96e] to-[#d4b87a] px-4 py-1.5 text-xs font-semibold text-[#12121a] transition-opacity hover:opacity-90"
              >
                Install
              </button>
              <button
                onClick={handleDismiss}
                className="rounded-lg border border-[#e8e0d4]/15 px-3 py-1.5 text-xs text-[#e8e0d4]/50 transition-colors hover:border-[#e8e0d4]/30 hover:text-[#e8e0d4]"
              >
                Not now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
