"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  Play, 
  Terminal, 
  CheckCircle2, 
  Loader2, 
  Clock, 
  AlertTriangle,
  FileSpreadsheet,
  RefreshCw,
  Search,
  Mail,
  Compass
} from "lucide-react";

export default function DashboardPage() {
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [recentTask, setRecentTask] = useState<any>(null);
  const [usageStats, setUsageStats] = useState({ used: 42, limit: 200, tier: "pro" });
  const [logs, setLogs] = useState<string[]>([]);
  const router = useRouter();

  const loadRecentTask = async () => {
    try {
      const res = await fetch("/api/tasks");
      const data = await res.json();
      if (data.success && data.tasks.length > 0) {
        // Find if there is a running/pending task, or just show the newest one
        const activeTask = data.tasks.find((t: any) => t.status === "running" || t.status === "pending") || data.tasks[0];
        setRecentTask(activeTask);
        
        // If task is active, stream mock logs
        if (activeTask.status === "running") {
          simulateLogs();
        } else if (activeTask.status === "completed" && activeTask.result) {
          setLogs(activeTask.result.logs || ["Task finished successfully."]);
        }
      }
    } catch (err) {
      console.error("Error loading tasks:", err);
    }
  };

  const fetchSession = async () => {
    try {
      const res = await fetch("/api/auth");
      const data = await res.json();
      if (data.success && data.user.subscription) {
        const tier = data.user.subscription.tier;
        const limits = { starter: 50, pro: 200, unlimited: 10000 };
        setUsageStats({
          used: tier === "starter" ? 12 : tier === "pro" ? 42 : 115,
          limit: limits[tier as keyof typeof limits] || 200,
          tier
        });
      }
    } catch (err) {
      console.error("Error fetching usage stats:", err);
    }
  };

  useEffect(() => {
    fetchSession();
    loadRecentTask();
  }, []);

  const simulateLogs = () => {
    const mockLogs = [
      "Initializing web browser daemon in secure cloud sandbox...",
      "Navigating search directories and targeted domain sources...",
      "Bypassing anti-bot challenges and rendering target pages...",
      "Extracting leads, contact entries, and structured parameters...",
      "Verifying professional email delivery status with MX lookups...",
      "Drafting hyper-personalized outbound email copies via Agent Core...",
      "AutoExec autonomous execution completed. Saving results..."
    ];
    
    setLogs([]);
    mockLogs.forEach((log, index) => {
      setTimeout(() => {
        setLogs(prev => [...prev, log]);
      }, (index + 1) * 1200);
    });
  };

  const handleLaunch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setLoading(true);
    setLogs(["Connecting to AutoExec Cloud API...", "Queuing job on execution pipeline..."]);

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });
      const data = await res.json();

      if (data.success) {
        setDescription("");
        // Load recent task immediately to capture "pending" state
        await loadRecentTask();
        
        // Simulate running logs in the console
        simulateLogs();

        // Increment usage statistic
        setUsageStats(prev => ({ ...prev, used: prev.used + 1 }));

        // Periodically refresh task state to capture "completed" state transition
        let intervals = 0;
        const intervalId = setInterval(async () => {
          intervals++;
          await loadRecentTask();
          if (intervals >= 8) {
            clearInterval(intervalId);
          }
        }, 2000);
      }
    } catch (err) {
      console.error("Error launching task:", err);
      setLogs(prev => [...prev, "ERROR: Failed to connect to agent cluster."]);
    } finally {
      setLoading(false);
    }
  };

  // Helper to color-code statuses
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="success" className="text-[10px]">Completed</Badge>;
      case "running":
        return <Badge variant="warning" className="text-[10px] animate-pulse">Running</Badge>;
      case "pending":
        return <Badge variant="info" className="text-[10px]">Pending</Badge>;
      case "failed":
        return <Badge variant="danger" className="text-[10px]">Failed</Badge>;
      default:
        return <Badge variant="secondary" className="text-[10px]">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>Workplace Workspace</span>
            <Sparkles className="h-6 w-6 text-brand-400 animate-pulse" />
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Delegate research, scraping, and email campaigns to your autonomous browser agent.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" onClick={() => { loadRecentTask(); fetchSession(); }} className="h-9">
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh State
          </Button>
        </div>
      </div>

      {/* Usage Progress Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="p-6 bg-slate-900/30 border-slate-900">
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
          {/* Progress bar */}
          <div className="w-full bg-slate-800 h-2 rounded-full mt-4 overflow-hidden">
            <div 
              className="bg-brand-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(100, (usageStats.used / usageStats.limit) * 100)}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Resets on July 14, 2026</p>
        </Card>

        <Card className="p-6 bg-slate-900/30 border-slate-900 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Browser Speed</p>
            <h3 className="text-2xl font-bold text-white mt-1">1.5 Gbps</h3>
            <p className="text-[11px] text-emerald-400 mt-1">Secure Sandboxed Proxies</p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-accent-500/10 flex items-center justify-center text-accent-400">
            <Compass className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-6 bg-slate-900/30 border-slate-900 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Inbox Connected</p>
            <h3 className="text-2xl font-bold text-white mt-1">demo@autoexec.ai</h3>
            <p className="text-[11px] text-slate-500 mt-1">Active GSuite SMTP integration</p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-brand-500/10 flex items-center justify-center text-brand-400">
            <Mail className="h-5 w-5" />
          </div>
        </Card>
      </div>

      {/* Main launch interface */}
      <div className="grid lg:grid-cols-5 gap-8 items-start">
        {/* Job Creator Form */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="bg-slate-900/20 border-slate-900">
            <CardHeader>
              <CardTitle className="text-lg text-white">Instruct AutoExec Agent</CardTitle>
              <CardDescription>
                Write in plain language what data to gather, sites to navigate, or emails to draft.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLaunch} className="space-y-4">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., Scrape list of early-stage AI startups raising Seed rounds in SF, validate founder names, and draft a personalized outreach pitch in my name..."
                  className="w-full h-40 bg-slate-950/80 border border-slate-800 rounded-lg p-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none leading-relaxed transition-all"
                  disabled={loading}
                />
                <div className="flex items-center justify-between pt-2">
                  <div className="text-xs text-slate-500 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-brand-400" />
                    <span>Uses 1 task credit on launch</span>
                  </div>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={loading || !description.trim()}
                    className="px-6 py-2.5"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin mr-2 h-4 w-4" /> Deploying Agent...
                      </>
                    ) : (
                      <>
                        <Play className="fill-white mr-2 h-4 w-4" /> Launch AutoExec
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Prompt Presets / Inspiration */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Example Agent Blueprints</h4>
            <div className="grid sm:grid-cols-2 gap-4">
              <button 
                onClick={() => setDescription("Find me 50 SaaS companies hiring senior React developers in California, find their Lead Recruiter emails, and compile a CSV list.")}
                className="text-left p-3.5 rounded-lg border border-slate-900 bg-slate-900/30 hover:bg-slate-900/50 hover:border-slate-800 transition-all text-xs space-y-1.5 group"
              >
                <div className="flex items-center space-x-1.5 text-brand-400 font-semibold">
                  <Search className="h-3.5 w-3.5" />
                  <span>Prospect List Building</span>
                </div>
                <p className="text-slate-400 group-hover:text-slate-300 transition-colors leading-relaxed">
                  &quot;Find 50 SaaS companies hiring React devs in CA and extract Recruiter emails...&quot;
                </p>
              </button>
              <button 
                onClick={() => setDescription("Locate the top 20 venture capitalists investing in Web3 or AI at pre-seed, extract active email contact routes, and draft customized intro pitches.")}
                className="text-left p-3.5 rounded-lg border border-slate-900 bg-slate-900/30 hover:bg-slate-900/50 hover:border-slate-800 transition-all text-xs space-y-1.5 group"
              >
                <div className="flex items-center space-x-1.5 text-accent-400 font-semibold">
                  <Mail className="h-3.5 w-3.5" />
                  <span>Investor Warm Pitching</span>
                </div>
                <p className="text-slate-400 group-hover:text-slate-300 transition-colors leading-relaxed">
                  &quot;Locate top 20 VCs in Web3/AI at pre-seed, extract emails and draft intros...&quot;
                </p>
              </button>
            </div>
          </div>
        </div>

        {/* Live Terminal Logger */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-slate-950 border-slate-900/80 overflow-hidden h-full flex flex-col min-h-[460px]">
            <CardHeader className="bg-slate-900/40 border-b border-slate-900 px-6 py-4 flex flex-row items-center justify-between">
              <div className="flex items-center space-x-2">
                <Terminal className="h-4 w-4 text-brand-400" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">Agent Exec Logs</span>
              </div>
              {recentTask && getStatusBadge(recentTask.status)}
            </CardHeader>
            
            <CardContent className="p-6 flex-grow font-mono text-[11px] leading-relaxed text-slate-400 overflow-y-auto space-y-3.5 h-[360px] max-h-[360px]">
              {recentTask ? (
                <>
                  <div className="text-slate-500 italic text-[10px] pb-2 border-b border-slate-900">
                    Task ID: {recentTask.id} | Created: {new Date(recentTask.created_at).toLocaleTimeString()}
                  </div>
                  
                  {logs.length > 0 ? (
                    logs.map((log, idx) => (
                      <div key={idx} className="flex items-start space-x-2">
                        <span className="text-brand-500 select-none">✔</span>
                        <span className={idx === logs.length - 1 && recentTask.status === "running" ? "text-slate-100" : "text-slate-400"}>
                          {log}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-600 text-center py-20 italic">
                      Task initialized. Waiting for agent stream connection...
                    </div>
                  )}

                  {recentTask.status === "running" && (
                    <div className="flex items-center space-x-2 text-brand-400 pl-4 animate-pulse">
                      <Loader2 className="animate-spin h-3.5 w-3.5" />
                      <span>Agent working... scrolling, scraping, evaluating</span>
                    </div>
                  )}

                  {recentTask.status === "completed" && recentTask.result && (
                    <div className="mt-4 pt-4 border-t border-slate-900 space-y-3">
                      <div className="bg-slate-900/40 border border-slate-800/50 p-3 rounded-lg text-slate-300 text-xs">
                        <p className="font-bold text-white mb-1">Execution Summary</p>
                        <p className="text-[11px] leading-relaxed text-slate-400">{recentTask.result.summary}</p>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => router.push("/dashboard/tasks")} 
                        className="w-full text-xs font-sans h-8"
                      >
                        Inspect Result Table <FileSpreadsheet className="h-3.5 w-3.5 ml-1.5" />
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-slate-600 text-center py-36 italic">
                  No active agent deployment found. Submit an instruction to begin.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
