"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";

export default function IntegrationsPage() {
  const [connecting, setConnecting] = useState<string | null>(null);

  const services = [
    { id: "shopify", name: "Shopify", desc: "Manage products, orders, and store settings", color: "bg-emerald-600" },
    { id: "tiktok", name: "TikTok", desc: "Post content, schedule videos, analyze performance", color: "bg-black" },
    { id: "instagram", name: "Instagram", desc: "Auto-post images, carousels, reels", color: "bg-pink-600" },
    { id: "facebook", name: "Facebook", desc: "Share content to pages and groups", color: "bg-blue-600" },
    { id: "twitter", name: "X (Twitter)", desc: "Tweet, schedule threads, track engagement", color: "bg-slate-800" },
    { id: "linkedin", name: "LinkedIn", desc: "Post articles, share updates to your network", color: "bg-blue-700" },
    { id: "gmail", name: "Gmail", desc: "Send and manage emails from your account", color: "bg-red-500" },
    { id: "vercel", name: "Vercel", desc: "Auto-deploy apps from GitHub", color: "bg-black" },
  ];

  const handleConnect = (serviceId: string) => {
    setConnecting(serviceId);
    // In production: redirect to OAuth flow
    setTimeout(() => {
      setConnecting(null);
      alert(`${serviceId} connected! AutoExec can now manage it autonomously.`);
    }, 1500);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Integrations</h1>
        <p className="text-slate-400 mt-2">Connect your accounts once. AutoExec handles the rest.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {services.map((service) => (
          <div key={service.id} className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${service.color}`} />
                <h3 className="text-white font-semibold">{service.name}</h3>
              </div>
              <p className="text-slate-400 text-sm mt-1">{service.desc}</p>
            </div>
            <Button
              onClick={() => handleConnect(service.id)}
              disabled={connecting === service.id}
              variant="secondary"
              size="sm"
            >
              {connecting === service.id ? "Connecting..." : "Connect"}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}