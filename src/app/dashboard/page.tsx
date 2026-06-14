"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChatInterface } from "@/components/chat/ChatInterface";
import {
  Sparkles,
  RefreshCw,
  Compass,
  Mail,
  Zap,
} from "lucide-react";

export default function DashboardPage() {
  const [usageStats, setUsageStats] = useState({ used: 42, limit: 200, tier: "pro" });

  const fetchSession = async () => {
    try {
      const res = await fetch("/api/auth");
      const data = await res.json();
      if (data.success && data.user.subscription) {
        const tier = data.user.subscription.tier;
        const limits: Record<string, number> = { starter: 50, pro: 200, unlimited: 10000 };
        setUsageStats({
          used: tier === "starter" ? 12 : tier === "pro" ? 42 : 115,
          limit: limits[tier] || 200,
          tier,
        });
      }
    } catch (err) {
      console.error("Error fetching usage stats:", err);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>AutoExec Workspace</span>
            <Sparkles className="h-6 w-6 text-brand-400 animate-pulse" />
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Describe any task in plain language. AutoExec handles the rest.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchSession} className="h-9">
          <RefreshCw className="h-4 w-4 mr-2" /> Refresh
        </Button>
      </div>

      {/* Usage Stats Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="p-4 bg-slate-900/30 border-slate-900">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Plan Usage</p>
              <h3 className="text-2xl font-bold text-white mt-1">
                {usageStats.used} <span className="text-slate-500 text-base font-normal">/ {usageStats.limit} tasks</span>
              </h3>
            </div>
            <Badge variant="info" className="uppercase font-bold tracking-wider px-2 py-0.5 text-[9px]">
              {usageStats.tier} Tier
            </Badge>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-brand-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (usageStats.used / usageStats.limit) * 100)}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5">Resets on July 14, 2026</p>
        </Card>

        <Card className="p-4 bg-slate-900/30 border-slate-900 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Agent Speed</p>
            <h3 className="text-2xl font-bold text-white mt-1">Real-time</h3>
            <p className="text-[11px] text-emerald-400 mt-1">Streaming AI Engine</p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-accent-500/10 flex items-center justify-center text-accent-400">
            <Compass className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-4 bg-slate-900/30 border-slate-900 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Inbox</p>
            <h3 className="text-2xl font-bold text-white mt-1">demo@autoexec.ai</h3>
            <p className="text-[11px] text-slate-500 mt-1">Connected for outreach</p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-brand-500/10 flex items-center justify-center text-brand-400">
            <Mail className="h-5 w-5" />
          </div>
        </Card>
      </div>

      {/* Chat Interface */}
      <div className="flex-1 bg-slate-900/20 border border-slate-900/80 rounded-2xl p-6 shadow-xl min-h-[500px] flex flex-col">
        <ChatInterface />
      </div>
    </div>
  );
}