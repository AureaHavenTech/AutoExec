"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { getCreditSummary, hasAnyCredits, getCreditBalance } from "@/lib/credits";
import {
  Sparkles,
  RefreshCw,
  Compass,
  Mail,
  Zap,
  Upload,
  Camera,
  CheckCircle2,
  Loader2,
  Image as ImageIcon,
  X,
  ShoppingCart,
  Coins,
} from "lucide-react";

export default function DashboardPage() {
  const [usageStats, setUsageStats] = useState({ used: 42, limit: 200, tier: "pro" });
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [creditSummary, setCreditSummary] = useState(getCreditSummary());
  const [showCreditPurchase, setShowCreditPurchase] = useState(false);

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

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);
    setUploadedUrl(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        setUploadedUrl(data.url);
      } else {
        setUploadError(data.error || "Upload failed");
      }
    } catch (err) {
      setUploadError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>Axel AI Workspace</span>
            <Sparkles className="h-6 w-6 text-brand-400 animate-pulse" />
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Describe any task in plain language. Axel AI handles the rest.
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
            <h3 className="text-2xl font-bold text-white mt-1">hello@axelai.app</h3>
            <p className="text-[11px] text-slate-500 mt-1">Connected for outreach</p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-brand-500/10 flex items-center justify-center text-brand-400">
            <Mail className="h-5 w-5" />
          </div>
        </Card>
      </div>

      {/* Credit Balance Card */}
      {hasAnyCredits() && (
        <Card className="p-4 bg-slate-900/30 border-slate-900">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-brand-400" />
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Your Credits</p>
            </div>
            <Link href="/dashboard/settings" className="text-[10px] text-brand-400 hover:text-brand-300 font-semibold">
              Manage Credits →
            </Link>
          </div>
          <div className="flex gap-3 flex-wrap">
            {creditSummary.filter((c) => c.owned > 0).map((c) => (
              <div key={c.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-sm">{c.icon}</span>
                <div>
                  <p className="text-sm font-bold text-white">{c.owned}</p>
                  <p className="text-[9px] text-slate-500">{c.label.split(" ")[0]}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Marketing Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/dashboard/marketing">
          <Card className="p-4 bg-slate-900/30 border-slate-900 hover:border-brand-500/50 transition-all cursor-pointer group">
             <div className="flex items-center gap-4">
               <div className="h-12 w-12 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-400 group-hover:bg-brand-500 group-hover:text-slate-950 transition-all">
                 <Zap className="h-6 w-6" />
               </div>
               <div>
                 <h3 className="text-lg font-bold text-white">Marketing Engine</h3>
                 <p className="text-xs text-slate-500">Research channels & strategy</p>
               </div>
             </div>
          </Card>
        </Link>
        <Link href="/dashboard/tools/ad-generator">
          <Card className="p-4 bg-slate-900/30 border-slate-900 hover:border-brand-500/50 transition-all cursor-pointer group">
             <div className="flex items-center gap-4">
               <div className="h-12 w-12 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-400 group-hover:bg-brand-500 group-hover:text-slate-950 transition-all">
                 <ImageIcon className="h-6 w-6" />
               </div>
               <div>
                 <h3 className="text-lg font-bold text-white">Ad Generator</h3>
                 <p className="text-xs text-slate-500">Create visuals & copy</p>
               </div>
             </div>
          </Card>
        </Link>
      </div>

      {/* Photo Upload */}
      <Card className="p-4 bg-slate-900/30 border-slate-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Camera className="h-5 w-5 text-brand-400" />
            <div>
              <p className="text-sm font-semibold text-white">Profile Photo</p>
              <p className="text-[11px] text-slate-500">Upload your photo to personalize your profile and About page</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {uploadedUrl && (
              <div className="flex items-center gap-2">
                <img src={uploadedUrl} alt="Uploaded" className="h-10 w-10 rounded-full object-cover border-2 border-emerald-400" />
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleUpload}
              className="hidden"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="h-9"
            >
              {uploading ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-1.5" /> Uploading...</>
              ) : (
                <><Upload className="h-4 w-4 mr-1.5" /> Upload Photo</>
              )}
            </Button>
            {uploadedUrl && (
              <Button variant="ghost" size="sm" onClick={() => setUploadedUrl(null)} className="h-9 text-slate-500">
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        {uploadError && (
          <p className="text-xs text-rose-400 mt-2">{uploadError}</p>
        )}
      </Card>

      {/* Chat Interface */}
      <div className="flex-1 bg-slate-900/20 border border-slate-900/80 rounded-2xl p-6 shadow-xl min-h-[500px] flex flex-col">
        <ChatInterface />
      </div>
    </div>
  );
}