"use client";

import React, { useState, useEffect } from "react";
import { Mail, CheckCircle2, XCircle, ExternalLink, Unlink, Shield, Eye, Send, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface GmailStatus {
  connected: boolean;
  permissions: {
    canRead: boolean;
    canSend: boolean;
    canDraft: boolean;
  };
}

export function GmailConnect() {
  const [status, setStatus] = useState<GmailStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/gmail?action=status");
      const data = await res.json();
      setStatus(data);
    } catch {
      setStatus(null);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = () => {
    setActionLoading(true);
    window.location.href = "/api/auth/google";
  };

  const handleDisconnect = async () => {
    setActionLoading(true);
    try {
      await fetch("/api/gmail", { method: "DELETE" });
      await fetchStatus();
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6 bg-slate-950/60 border border-slate-800">
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 text-slate-400 animate-spin" />
          <span className="text-sm text-slate-400">Checking Gmail connection...</span>
        </div>
      </Card>
    );
  }

  const isConnected = status?.connected || false;

  return (
    <Card className="p-6 bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
            isConnected
              ? "bg-emerald-500/10 border border-emerald-500/30"
              : "bg-slate-800 border border-slate-700"
          }`}>
            <Mail className={`h-5 w-5 ${isConnected ? "text-emerald-400" : "text-slate-400"}`} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Gmail</h3>
            <p className="text-xs text-slate-400">
              {isConnected ? "Connected" : "Not connected"}
            </p>
          </div>
        </div>

        <div>
          {isConnected ? (
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-xs text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Active
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDisconnect}
                disabled={actionLoading}
                className="text-xs text-slate-500 hover:text-red-400 hover:bg-red-500/10"
              >
                <Unlink className="h-3.5 w-3.5 mr-1" />
                Disconnect
              </Button>
            </div>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={handleConnect}
              disabled={actionLoading}
              className="text-xs"
            >
              {actionLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
              ) : (
                <ExternalLink className="h-3.5 w-3.5 mr-1" />
              )}
              Connect Gmail
            </Button>
          )}
        </div>
      </div>

      {/* Permissions */}
      {isConnected && status?.permissions && (
        <div className="space-y-2 pt-3 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <Shield className="h-3.5 w-3.5 text-slate-500" />
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              Permissions granted
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <PermissionBadge
              icon={<Eye className="h-3 w-3" />}
              label="Read email"
              granted={status.permissions.canRead}
            />
            <PermissionBadge
              icon={<FileText className="h-3 w-3" />}
              label="Create drafts"
              granted={status.permissions.canDraft}
            />
            <PermissionBadge
              icon={<Send className="h-3 w-3" />}
              label="Send email"
              granted={status.permissions.canSend}
            />
          </div>
        </div>
      )}

      {/* Not connected info */}
      {!isConnected && (
        <div className="pt-3 border-t border-slate-800">
          <p className="text-xs text-slate-500">
            Connect your Gmail to let Axel AI read, draft, and send emails on your behalf.
            You control what Axel AI can access.
          </p>
        </div>
      )}
    </Card>
  );
}

function PermissionBadge({
  icon,
  label,
  granted,
}: {
  icon: React.ReactNode;
  label: string;
  granted: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-all ${
        granted
          ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
          : "bg-slate-800/50 border border-slate-700/50 text-slate-600"
      }`}
    >
      {granted ? (
        <CheckCircle2 className="h-3 w-3 text-emerald-400" />
      ) : (
        <XCircle className="h-3 w-3 text-slate-600" />
      )}
      {icon}
      <span>{label}</span>
    </div>
  );
}
