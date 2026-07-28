"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "email_capture_dismissed";

interface EmailCaptureProps {
  appName?: string;
}

export default function EmailCapture({ appName = "axel" }: EmailCaptureProps) {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (dismissed) return;

    const timer = setTimeout(() => setVisible(true), 10000);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email");
      return;
    }
    setError("");

    try {
      const res = await fetch("/api/email-capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: appName }),
      });
      if (res.ok) {
        setSubmitted(true);
        localStorage.setItem(STORAGE_KEY, "true");
      } else {
        setError("Something went wrong. Try again.");
      }
    } catch {
      setError("Network error. Try again.");
    }
  };

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(STORAGE_KEY, "true");
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40 animate-slide-up">
      <div className="w-80 rounded-2xl border border-[#c9a96e]/20 bg-[#1a1a24]/95 p-5 shadow-2xl backdrop-blur-xl">
        <button
          onClick={dismiss}
          className="absolute right-3 top-3 text-[#e8e0d4]/30 hover:text-[#e8e0d4]/70 transition-colors"
          aria-label="Close"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>

        {!submitted ? (
          <>
            <p className="text-sm font-semibold text-[#e8e0d4] mb-1">
              Get 20% off your first month
            </p>
            <p className="text-xs text-[#e8e0d4]/50 mb-3">
              Join our list for exclusive deals and product updates.
            </p>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 rounded-lg border border-[#e8e0d4]/15 bg-[#0a0a0f] px-3 py-2 text-xs text-[#e8e0d4] placeholder:text-[#e8e0d4]/30 outline-none focus:border-[#c9a96e]/50"
              />
              <button
                type="submit"
                className="rounded-lg bg-gradient-to-r from-[#c9a96e] to-[#d4b87a] px-3 py-2 text-xs font-semibold text-[#12121a] transition-opacity hover:opacity-90"
              >
                Claim
              </button>
            </form>
            {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
          </>
        ) : (
          <div className="text-center py-2">
            <p className="text-[#c9a96e] text-lg mb-1">✨</p>
            <p className="text-sm font-semibold text-[#e8e0d4]">You're in!</p>
            <p className="text-xs text-[#e8e0d4]/50 mt-1">Check your inbox for your discount.</p>
          </div>
        )}
      </div>
    </div>
  );
}
