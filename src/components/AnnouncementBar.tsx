"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "announcement_dismissed";

interface AnnouncementBarProps {
  appName?: string;
}

const ANNOUNCEMENTS: Record<string, { message: string; link: string; linkText: string }> = {
  axel: {
    message: "🚀 New: Axel AI now connects to Shopify!",
    link: "/dashboard",
    linkText: "Learn more →",
  },
  onepost: {
    message: "✨ OnePost AI now auto-generates viral hashtags!",
    link: "/dashboard",
    linkText: "Try it →",
  },
};

export default function AnnouncementBar({ appName = "axel" }: AnnouncementBarProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (!dismissed) {
      setVisible(true);
    }
  }, []);

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(STORAGE_KEY, "true");
  };

  if (!visible) return null;

  const ann = ANNOUNCEMENTS[appName] || ANNOUNCEMENTS.axel;

  return (
    <div className="relative z-50 w-full bg-gradient-to-r from-[#c9a96e]/20 via-[#c9a96e]/10 to-[#c9a96e]/20 border-b border-[#c9a96e]/20">
      <div className="flex items-center justify-center gap-2 px-4 py-2 text-sm">
        <span className="text-[#e8e0d4]">{ann.message}</span>
        <a
          href={ann.link}
          className="font-medium text-[#c9a96e] hover:text-[#d4b87a] transition-colors underline-offset-2 hover:underline"
        >
          {ann.linkText}
        </a>
        <button
          onClick={dismiss}
          className="ml-2 flex h-5 w-5 items-center justify-center rounded-full text-[#e8e0d4]/40 hover:text-[#e8e0d4] hover:bg-[#e8e0d4]/10 transition-colors"
          aria-label="Dismiss announcement"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M1 1L11 11M11 1L1 11"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
