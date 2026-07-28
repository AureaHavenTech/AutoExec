"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface CalendarStatus {
  connected: boolean;
}

export default function CalendarConnect() {
  const [status, setStatus] = useState<CalendarStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/calendar?action=status");
      const data = await res.json();
      setStatus(data);
    } catch {
      setStatus({ connected: false });
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = () => {
    setConnecting(true);
    window.location.href = "/api/auth/google";
  };

  const handleDisconnect = async () => {
    try {
      await fetch("/api/calendar", { method: "DELETE" });
      await fetchStatus();
    } catch {
      // Silently fail — user can try again
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse flex items-center gap-3">
        <div className="w-3 h-3 rounded-full bg-slate-600" />
        <div className="h-5 w-40 bg-slate-700 rounded" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div
          className={`w-3 h-3 rounded-full ${
            status?.connected ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-slate-500"
          }`}
        />
        <div>
          <h3 className="text-white font-semibold">Google Calendar</h3>
          <p className="text-slate-400 text-sm">
            {status?.connected
              ? "Connected — read, create, and manage events"
              : "Manage your schedule, create events, check availability"}
          </p>
        </div>
      </div>
      {status?.connected ? (
        <div className="flex items-center gap-2">
          <span className="text-xs text-emerald-400 font-medium">Active</span>
          <Button
            onClick={handleDisconnect}
            variant="outline"
            size="sm"
            className="text-red-400 border-red-800 hover:bg-red-900/20 text-xs"
          >
            Disconnect
          </Button>
        </div>
      ) : (
        <Button
          onClick={handleConnect}
          disabled={connecting}
          variant="secondary"
          size="sm"
          className="bg-[#c9a96e] text-black hover:bg-[#d4b87a] font-medium"
        >
          {connecting ? "Redirecting..." : "Connect"}
        </Button>
      )}
    </div>
  );
}
