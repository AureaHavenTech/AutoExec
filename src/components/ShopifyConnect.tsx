"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Store,
  CheckCircle2,
  XCircle,
  Loader2,
  Plug,
  ExternalLink,
  RefreshCw,
} from "lucide-react";

interface ShopifyConnectProps {
  onStatusChange?: (connected: boolean) => void;
}

export function ShopifyConnect({ onStatusChange }: ShopifyConnectProps) {
  const [storeUrl, setStoreUrl] = useState("");
  const [adminToken, setAdminToken] = useState("");
  const [status, setStatus] = useState<"disconnected" | "connecting" | "connected" | "error">(
    "disconnected"
  );
  const [error, setError] = useState("");
  const [storeName, setStoreName] = useState("");

  // Load saved config on mount
  useEffect(() => {
    const saved = localStorage.getItem("axel_shopify_config");
    if (saved) {
      try {
        const { storeUrl: url, adminToken: token } = JSON.parse(saved);
        if (url) setStoreUrl(url);
        if (token) setAdminToken(token);
      } catch {}
    }
  }, []);

  const handleConnect = async () => {
    if (!storeUrl.trim() || !adminToken.trim()) {
      setError("Both store URL and admin token are required.");
      return;
    }

    setStatus("connecting");
    setError("");

    // Save locally
    localStorage.setItem(
      "axel_shopify_config",
      JSON.stringify({ storeUrl: storeUrl.trim(), adminToken: adminToken.trim() })
    );

    try {
      const res = await fetch(
        `/api/shopify?action=test`,
        {
          headers: {
            "x-shopify-store-url": storeUrl.trim(),
            "x-shopify-admin-token": adminToken.trim(),
          },
        }
      );
      const data = await res.json();

      if (data.connected) {
        setStatus("connected");
        setStoreName(data.storeName || "");
        onStatusChange?.(true);
      } else {
        setStatus("error");
        setError(data.error || "Connection failed. Check your store URL and admin token.");
        onStatusChange?.(false);
      }
    } catch (err: any) {
      setStatus("error");
      setError(err.message || "Failed to connect to Shopify.");
      onStatusChange?.(false);
    }
  };

  const handleDisconnect = () => {
    localStorage.removeItem("axel_shopify_config");
    setStatus("disconnected");
    setStoreName("");
    setError("");
    onStatusChange?.(false);
  };

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
          <Store className="h-5 w-5 text-green-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Shopify</h3>
          <p className="text-sm text-slate-400">
            Connect your Shopify store to manage orders, products, and customers
          </p>
        </div>
        {status === "connected" && (
          <Badge variant="success" className="ml-auto">
            <CheckCircle2 className="h-3 w-3 mr-1" /> Connected
          </Badge>
        )}
        {status === "connecting" && (
          <Badge variant="info" className="ml-auto">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" /> Connecting
          </Badge>
        )}
        {status === "error" && (
          <Badge variant="danger" className="ml-auto">
            <XCircle className="h-3 w-3 mr-1" /> Error
          </Badge>
        )}
      </div>

      {storeName && (
        <p className="text-sm text-emerald-400 mb-4">
          Connected to: <strong>{storeName}</strong>
        </p>
      )}

      {status !== "connected" ? (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Store URL
            </label>
            <input
              type="text"
              value={storeUrl}
              onChange={(e) => setStoreUrl(e.target.value)}
              placeholder="your-store.myshopify.com"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-brand-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Admin API Token
            </label>
            <input
              type="password"
              value={adminToken}
              onChange={(e) => setAdminToken(e.target.value)}
              placeholder="shpat_..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-brand-500"
            />
            <p className="text-xs text-slate-500 mt-1">
              Create a private app in Shopify Admin → Settings → Apps → Develop apps
            </p>
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-500/5 border border-red-500/20 rounded-lg p-2">
              {error}
            </p>
          )}

          <div className="flex gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={handleConnect}
              disabled={status === "connecting"}
              className="flex-1"
            >
              {status === "connecting" ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" /> Connecting...
                </>
              ) : (
                <>
                  <Plug className="h-4 w-4 mr-1" /> Connect
                </>
              )}
            </Button>
            <a
              href="https://admin.shopify.com/store/settings/apps/development"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4 mr-1" /> Setup Guide
              </Button>
            </a>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleConnect}
            className="flex-1"
          >
            <RefreshCw className="h-4 w-4 mr-1" /> Reconnect
          </Button>
          <Button variant="ghost" size="sm" onClick={handleDisconnect}>
            Disconnect
          </Button>
        </div>
      )}
    </div>
  );
}
