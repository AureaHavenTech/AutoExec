"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Users, Key, BarChart3, Gift, Shield, Copy, Check, 
  Loader2, RefreshCw, Plus, Trash2, Crown, Activity,
  UserCheck, Clock, AlertCircle
} from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [adminData, setAdminData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [newGiftDesc, setNewGiftDesc] = useState("");
  const [newGiftUses, setNewGiftUses] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [ownerCodeInput, setOwnerCodeInput] = useState("");
  const [redeeming, setRedeeming] = useState(false);

  useEffect(() => {
    fetchSession();
  }, []);

  const fetchSession = async () => {
    try {
      const res = await fetch("/api/auth");
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        // Check if admin
        const adminRes = await fetch(`/api/admin?userId=${data.user.id}`);
        const adminData = await adminRes.json();
        if (adminData.success) {
          setAdminData(adminData.data);
        } else if (adminRes.status === 403) {
          setError("You don't have admin access. Enter your owner code below.");
        }
      } else {
        setError("Not authenticated");
      }
    } catch (err) {
      setError("Failed to load session");
    } finally {
      setLoading(false);
    }
  };

  const handleRedeemOwnerCode = async () => {
    if (!ownerCodeInput.trim() || !user) return;
    setRedeeming(true);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "redeem_owner_code",
          userId: user.id,
          code: ownerCodeInput.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        setOwnerCodeInput("");
        fetchSession(); // Refresh to get admin status
      } else {
        setError(data.error || "Invalid code");
      }
    } catch (err) {
      setError("Failed to redeem code");
    } finally {
      setRedeeming(false);
    }
  };

  const handleGenerateGiftCode = async () => {
    if (!user) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/admin/codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          description: newGiftDesc || "Free gift code",
          maxUses: newGiftUses
        })
      });
      const data = await res.json();
      if (data.success) {
        setNewGiftDesc("");
        setNewGiftUses(1);
        fetchSession(); // Refresh
      } else {
        setError(data.error || "Failed to generate code");
      }
    } catch (err) {
      setError("Failed to generate code");
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-brand-400" />
      </div>
    );
  }

  // If not admin, show owner code redemption screen
  if (!adminData && user) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <div className="text-center mb-8">
          <Crown className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">Owner Dashboard</h1>
          <p className="text-slate-400">Enter your owner registration code to unlock admin access</p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8">
          <div className="flex gap-3 mb-6">
            <input
              type="text"
              value={ownerCodeInput}
              onChange={(e) => setOwnerCodeInput(e.target.value)}
              placeholder="Enter owner code (e.g. AUREA2026)"
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
              onKeyDown={(e) => e.key === 'Enter' && handleRedeemOwnerCode()}
            />
            <button
              onClick={handleRedeemOwnerCode}
              disabled={redeeming || !ownerCodeInput.trim()}
              className="bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2"
            >
              {redeeming ? <Loader2 className="h-5 w-5 animate-spin" /> : <Shield className="h-5 w-5" />}
              Verify
            </button>
          </div>
          {error && (
            <div className="flex items-center gap-2 text-rose-400 bg-rose-500/10 p-3 rounded-xl text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}
          <p className="text-xs text-slate-500 mt-4 text-center">
            Contact the founder if you don&apos;t have an owner code
          </p>
        </div>
      </div>
    );
  }

  // Admin Dashboard
  const stats = adminData?.stats;
  const users = adminData?.users || [];
  const codes = adminData?.codes || [];
  const giftCodes = codes.filter((c: any) => c.is_gift);
  const activeGiftCodes = giftCodes.filter((c: any) => c.used < c.max_uses);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Crown className="h-8 w-8 text-yellow-400" />
            CEO Command Center
          </h1>
          <p className="text-slate-400 mt-1">Manage users, gift codes, and monitor platform activity</p>
        </div>
        <button
          onClick={() => fetchSession()}
          className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-all"
        >
          <RefreshCw className="h-5 w-5" />
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <Users className="h-5 w-5 text-brand-400" />
            <span className="text-2xl font-bold text-white">{stats?.total_users || 0}</span>
          </div>
          <p className="text-sm text-slate-400">Total Users</p>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <Activity className="h-5 w-5 text-emerald-400" />
            <span className="text-2xl font-bold text-white">{stats?.total_tasks || 0}</span>
          </div>
          <p className="text-sm text-slate-400">Total Tasks</p>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <Clock className="h-5 w-5 text-cyan-400" />
            <span className="text-2xl font-bold text-white">{stats?.tasks_today || 0}</span>
          </div>
          <p className="text-sm text-slate-400">Tasks Today</p>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <Gift className="h-5 w-5 text-yellow-400" />
            <span className="text-2xl font-bold text-white">{activeGiftCodes.length}</span>
          </div>
          <p className="text-sm text-slate-400">Active Gift Codes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Gift Code Generator */}
        <div className="lg:col-span-1">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
              <Gift className="h-5 w-5 text-yellow-400" />
              Generate Gift Code
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-slate-400 block mb-1">Description</label>
                <input
                  type="text"
                  value={newGiftDesc}
                  onChange={(e) => setNewGiftDesc(e.target.value)}
                  placeholder="e.g. Beta tester access"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="text-sm text-slate-400 block mb-1">Max uses</label>
                <input
                  type="number"
                  value={newGiftUses}
                  onChange={(e) => setNewGiftUses(parseInt(e.target.value) || 1)}
                  min={1}
                  max={999}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <button
                onClick={handleGenerateGiftCode}
                disabled={generating}
                className="w-full bg-brand-500 hover:bg-brand-600 text-white py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
              >
                {generating ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Plus className="h-5 w-5" />
                )}
                Generate Code
              </button>
            </div>

            {/* Gift Codes List */}
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-slate-400 mb-3">Recent Gift Codes</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {giftCodes.slice(0, 10).map((code: any) => (
                  <div key={code.id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-mono text-yellow-400">{code.code}</code>
                        <button
                          onClick={() => copyToClipboard(code.code)}
                          className="text-slate-500 hover:text-white transition-colors"
                        >
                          {copiedCode === code.code ? (
                            <Check className="h-4 w-4 text-emerald-400" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        code.used >= code.max_uses 
                          ? 'bg-rose-500/10 text-rose-400' 
                          : 'bg-emerald-500/10 text-emerald-400'
                      }`}>
                        {code.used}/{code.max_uses} used
                      </span>
                    </div>
                    {code.description && (
                      <p className="text-xs text-slate-500 mt-1">{code.description}</p>
                    )}
                    {code.claimed_by_name && (
                      <p className="text-xs text-slate-600 mt-1">Claimed by {code.claimed_by_name}</p>
                    )}
                  </div>
                ))}
                {giftCodes.length === 0 && (
                  <p className="text-sm text-slate-500 text-center py-4">No gift codes generated yet</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Users List */}
        <div className="lg:col-span-2">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
              <Users className="h-5 w-5 text-brand-400" />
              All Users ({users.length})
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-800">
                    <th className="text-left py-3 px-2 font-medium">Name</th>
                    <th className="text-left py-3 px-2 font-medium">Email</th>
                    <th className="text-left py-3 px-2 font-medium">Role</th>
                    <th className="text-left py-3 px-2 font-medium">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u: any) => (
                    <tr key={u.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-2 text-white">{u.name || "—"}</td>
                      <td className="py-3 px-2 text-slate-400">{u.email}</td>
                      <td className="py-3 px-2">
                        {u.is_admin ? (
                          <span className="flex items-center gap-1 text-yellow-400 text-xs font-semibold">
                            <Crown className="h-3 w-3" /> Owner
                          </span>
                        ) : (
                          <span className="text-slate-500 text-xs">User</span>
                        )}
                      </td>
                      <td className="py-3 px-2 text-slate-500 text-xs">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-slate-500">No users found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Error toast */}
      {error && (
        <div className="fixed bottom-6 right-6 bg-rose-500/20 border border-rose-500/30 text-rose-400 px-4 py-3 rounded-xl flex items-center gap-2 backdrop-blur-md">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">{error}</span>
          <button onClick={() => setError("")} className="ml-2 text-rose-400/70 hover:text-rose-400">✕</button>
        </div>
      )}
    </div>
  );
}