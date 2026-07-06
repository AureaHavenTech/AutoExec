"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  User, Camera, Upload, CheckCircle2, Loader2, X, Save,
  Palette, Layout, Monitor, Moon, Sun, Bell, Shield,
  Trash2, Image as ImageIcon, RefreshCw, GripHorizontal,
  Eye, EyeOff, Settings2, Smartphone, Grid3X3, List,
  Sparkles, Zap, Clock, Globe, AtSign
} from "lucide-react";

interface UserProfile {
  id: string;
  email: string;
  name: string;
  is_admin: number;
  created_at?: string;
  subscription?: { tier: string; status: string };
}

interface DashboardPrefs {
  theme: "dark" | "light";
  density: "comfortable" | "compact" | "cozy";
  sidebarCollapsed: boolean;
  showRecentTasks: boolean;
  showAnalytics: boolean;
  accentColor: "gold" | "emerald" | "blue" | "rose";
  defaultView: "grid" | "list";
}

const DEFAULT_PREFS: DashboardPrefs = {
  theme: "dark",
  density: "comfortable",
  sidebarCollapsed: false,
  showRecentTasks: true,
  showAnalytics: true,
  accentColor: "gold",
  defaultView: "grid",
};

export default function SettingsPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [nameSaved, setNameSaved] = useState(false);
  const [nameError, setNameError] = useState("");

  // Profile picture
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [uploadingPic, setUploadingPic] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dashboard preferences
  const [prefs, setPrefs] = useState<DashboardPrefs>(DEFAULT_PREFS);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [prefsSaved, setPrefsSaved] = useState(false);

  // Active section
  const [activeSection, setActiveSection] = useState<"profile" | "dashboard">("profile");

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/auth/profile");
        const data = await res.json();
        if (data.success) {
          setUser(data.user);
          setDisplayName(data.user.name || "");
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Load prefs + profile pic from localStorage
  useEffect(() => {
    try {
      const savedPrefs = localStorage.getItem("axel_ai_dashboard_prefs");
      if (savedPrefs) setPrefs(JSON.parse(savedPrefs));

      const savedPic = localStorage.getItem("axel_ai_profile_pic");
      if (savedPic) setProfilePic(savedPic);
    } catch {}
  }, []);

  // ============================================================
  // PROFILE PICTURE
  // ============================================================
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setNameError("Please select an image file (JPEG, PNG, WebP)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setNameError("Image too large — max 5MB");
      return;
    }

    setUploadingPic(true);
    setNameError("");

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setProfilePic(dataUrl);
      localStorage.setItem("axel_ai_profile_pic", dataUrl);
      setUploadingPic(false);
    };
    reader.onerror = () => {
      setNameError("Failed to read image file");
      setUploadingPic(false);
    };
    reader.readAsDataURL(file);
  }, []);

  const removeProfilePic = () => {
    setProfilePic(null);
    localStorage.removeItem("axel_ai_profile_pic");
  };

  // ============================================================
  // DISPLAY NAME
  // ============================================================
  const saveDisplayName = async () => {
    if (!displayName.trim()) {
      setNameError("Name cannot be empty");
      return;
    }
    if (displayName.trim().length > 100) {
      setNameError("Name too long (max 100 chars)");
      return;
    }

    setSavingName(true);
    setNameError("");
    setNameSaved(false);

    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: displayName.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setNameSaved(true);
        setTimeout(() => setNameSaved(false), 3000);
      } else {
        setNameError(data.error || "Failed to save name");
      }
    } catch (err) {
      setNameError("Network error — try again");
    } finally {
      setSavingName(false);
    }
  };

  // ============================================================
  // DASHBOARD PREFERENCES
  // ============================================================
  const updatePrefs = (key: keyof DashboardPrefs, value: any) => {
    setPrefs((prev) => {
      const updated = { ...prev, [key]: value };
      localStorage.setItem("axel_ai_dashboard_prefs", JSON.stringify(updated));
      return updated;
    });
  };

  const resetPrefs = () => {
    setPrefs(DEFAULT_PREFS);
    localStorage.setItem("axel_ai_dashboard_prefs", JSON.stringify(DEFAULT_PREFS));
    setPrefsSaved(true);
    setTimeout(() => setPrefsSaved(false), 2000);
  };

  const saveAllPrefs = () => {
    setSavingPrefs(true);
    localStorage.setItem("axel_ai_dashboard_prefs", JSON.stringify(prefs));
    setTimeout(() => {
      setSavingPrefs(false);
      setPrefsSaved(true);
      setTimeout(() => setPrefsSaved(false), 3000);
    }, 400);
  };

  const accentColors = [
    { id: "gold" as const, label: "Gold", class: "bg-brand-500", ring: "ring-brand-500" },
    { id: "emerald" as const, label: "Emerald", class: "bg-emerald-500", ring: "ring-emerald-500" },
    { id: "blue" as const, label: "Blue", class: "bg-blue-500", ring: "ring-blue-500" },
    { id: "rose" as const, label: "Rose", class: "bg-rose-500", ring: "ring-rose-500" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-400 mx-auto" />
          <p className="text-slate-400 mt-3 text-sm">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Settings2 className="h-8 w-8 text-brand-400" />
            <span>Settings</span>
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            Customize your profile, preferences, and dashboard experience.
          </p>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex items-center gap-1 bg-slate-900/60 rounded-xl p-1 w-fit border border-slate-800">
        <button onClick={() => setActiveSection("profile")}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
            activeSection === "profile"
              ? "bg-brand-500 text-slate-950 shadow-lg"
              : "text-slate-400 hover:text-white"}`}>
          <User className="h-4 w-4" /> Profile
        </button>
        <button onClick={() => setActiveSection("dashboard")}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
            activeSection === "dashboard"
              ? "bg-brand-500 text-slate-950 shadow-lg"
              : "text-slate-400 hover:text-white"}`}>
          <Layout className="h-4 w-4" /> Dashboard
        </button>
      </div>

      {/* ==================== PROFILE SECTION ==================== */}
      {activeSection === "profile" && (
        <>
          {/* Profile Picture */}
          <Card className="p-6 bg-slate-900/40 border-slate-800">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
              <Camera className="h-4 w-4 text-brand-400" /> Profile Picture
            </h2>
            <div className="flex items-center gap-6">
              {/* Avatar */}
              <div className="relative group">
                <div className="h-24 w-24 rounded-full bg-slate-800 border-2 border-slate-700 overflow-hidden flex items-center justify-center">
                  {profilePic ? (
                    <img src={profilePic} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-brand-400/20 to-slate-700 flex items-center justify-center">
                      <User className="h-10 w-10 text-slate-500" />
                    </div>
                  )}
                </div>
                {/* Upload overlay */}
                <button onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Camera className="h-6 w-6 text-white" />
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                  onChange={handleFileSelect} />
              </div>

              <div className="space-y-2">
                <p className="text-sm text-white font-semibold">
                  {profilePic ? "Tap to change photo" : "Upload a profile photo"}
                </p>
                <p className="text-[10px] text-slate-500">JPEG, PNG, WebP — max 5MB</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}
                    className="text-xs h-8 border-slate-700 hover:border-brand-500/50">
                    {uploadingPic ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Upload className="h-3 w-3 mr-1" />}
                    Upload
                  </Button>
                  {profilePic && (
                    <Button size="sm" variant="outline" onClick={removeProfilePic}
                      className="text-xs h-8 border-slate-700 hover:border-rose-500/50 text-rose-400">
                      <Trash2 className="h-3 w-3 mr-1" /> Remove
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Display Name */}
          <Card className="p-6 bg-slate-900/40 border-slate-800">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
              <AtSign className="h-4 w-4 text-brand-400" /> Display Name
            </h2>
            <div className="max-w-md space-y-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Name
                </label>
                <Input value={displayName}
                  onChange={(e) => { setDisplayName(e.target.value); setNameError(""); }}
                  placeholder="Your display name"
                  className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus:ring-brand-500/30" />
              </div>
              {nameError && (
                <p className="text-xs text-rose-400 flex items-center gap-1">
                  <X className="h-3 w-3" /> {nameError}
                </p>
              )}
              <div className="flex items-center gap-3">
                <Button onClick={saveDisplayName} disabled={savingName || nameSaved}
                  className="text-xs font-bold bg-brand-500 hover:bg-brand-600 text-slate-950">
                  {savingName ? <><Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> Saving...</>
                  : nameSaved ? <><CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> Saved!</>
                  : <><Save className="h-3.5 w-3.5 mr-1.5" /> Save Name</>}
                </Button>
                <p className="text-[10px] text-slate-500">
                  This name appears on your dashboard and in communications.
                </p>
              </div>
            </div>
          </Card>

          {/* Account Info */}
          <Card className="p-6 bg-slate-900/40 border-slate-800">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
              <Shield className="h-4 w-4 text-brand-400" /> Account Information
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Email</p>
                <p className="text-sm text-white mt-1">{user?.email || "—"}</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Plan</p>
                <Badge variant="info" className="mt-1.5 text-[10px] px-2 py-0.5 uppercase">
                  {user?.subscription?.tier || "Starter"}
                </Badge>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Role</p>
                <p className="text-sm text-white mt-1">
                  {user?.is_admin ? "🔑 Owner" : "👤 Member"}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Member Since</p>
                <p className="text-sm text-white mt-1">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}
                </p>
              </div>
            </div>
          </Card>
        </>
      )}

      {/* ==================== DASHBOARD SECTION ==================== */}
      {activeSection === "dashboard" && (
        <>
          {/* Theme & Accent */}
          <Card className="p-6 bg-slate-900/40 border-slate-800 space-y-5">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Palette className="h-4 w-4 text-brand-400" /> Theme & Appearance
            </h2>

            {/* Accent Color */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> Accent Color
              </label>
              <div className="flex gap-3">
                {accentColors.map((accent) => (
                  <button key={accent.id} onClick={() => updatePrefs("accentColor", accent.id)}
                    className={`h-10 w-10 rounded-full ${accent.class} flex items-center justify-center
                      transition-all ring-2 ring-offset-2 ring-offset-slate-950
                      ${prefs.accentColor === accent.id ? accent.ring + " scale-110" : "ring-transparent hover:scale-105"}`}>
                    {prefs.accentColor === accent.id && <CheckCircle2 className="h-5 w-5 text-white" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Layout Density */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                <Layout className="h-3 w-3" /> Layout Density
              </label>
              <div className="flex gap-2">
                {([
                  { id: "comfortable" as const, label: "Comfortable", icon: GripHorizontal },
                  { id: "cozy" as const, label: "Cozy", icon: Grid3X3 },
                  { id: "compact" as const, label: "Compact", icon: List },
                ]).map((d) => {
                  const Icon = d.icon;
                  return (
                    <button key={d.id} onClick={() => updatePrefs("density", d.id)}
                      className={`px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 border transition-all ${
                        prefs.density === d.id
                          ? "bg-brand-500/20 border-brand-500 text-brand-400"
                          : "bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700"}`}>
                      <Icon className="h-4 w-4" /> {d.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </Card>

          {/* Default View */}
          <Card className="p-6 bg-slate-900/40 border-slate-800 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Monitor className="h-4 w-4 text-brand-400" /> Default View
            </h2>
            <div className="flex gap-3">
              <button onClick={() => updatePrefs("defaultView", "grid")}
                className={`flex-1 p-4 rounded-xl border text-center transition-all ${
                  prefs.defaultView === "grid"
                    ? "bg-brand-500/10 border-brand-500"
                    : "bg-slate-950/50 border-slate-800 hover:border-slate-700"}`}>
                <Grid3X3 className={`h-6 w-6 mx-auto mb-1 ${prefs.defaultView === "grid" ? "text-brand-400" : "text-slate-500"}`} />
                <span className={`text-xs font-semibold ${prefs.defaultView === "grid" ? "text-brand-400" : "text-slate-400"}`}>Grid</span>
              </button>
              <button onClick={() => updatePrefs("defaultView", "list")}
                className={`flex-1 p-4 rounded-xl border text-center transition-all ${
                  prefs.defaultView === "list"
                    ? "bg-brand-500/10 border-brand-500"
                    : "bg-slate-950/50 border-slate-800 hover:border-slate-700"}`}>
                <List className={`h-6 w-6 mx-auto mb-1 ${prefs.defaultView === "list" ? "text-brand-400" : "text-slate-500"}`} />
                <span className={`text-xs font-semibold ${prefs.defaultView === "list" ? "text-brand-400" : "text-slate-400"}`}>List</span>
              </button>
            </div>
          </Card>

          {/* Dashboard Widgets */}
          <Card className="p-6 bg-slate-900/40 border-slate-800 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Layout className="h-4 w-4 text-brand-400" /> Dashboard Widgets
            </h2>
            <div className="space-y-3">
              {[
                { key: "showRecentTasks" as const, label: "Recent Tasks", desc: "Show your most recent tasks on the dashboard" },
                { key: "showAnalytics" as const, label: "Analytics Cards", desc: "Show usage stats and analytics cards" },
              ].map((widget) => (
                <div key={widget.key} className="flex items-center justify-between p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                  <div>
                    <p className="text-sm font-semibold text-white">{widget.label}</p>
                    <p className="text-[10px] text-slate-500">{widget.desc}</p>
                  </div>
                  <button onClick={() => updatePrefs(widget.key, !prefs[widget.key])}
                    className={`relative h-6 w-11 rounded-full transition-all ${
                      prefs[widget.key] ? "bg-brand-500" : "bg-slate-700"
                    }`}>
                    <div className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                      prefs[widget.key] ? "translate-x-5" : "translate-x-0"
                    }`} />
                  </button>
                </div>
              ))}
            </div>
          </Card>

          {/* Actions */}
          <div className="flex items-center gap-3 justify-end">
            <Button onClick={resetPrefs} variant="outline"
              className="text-xs border-slate-700 hover:border-slate-600">
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Reset to Defaults
            </Button>
            <Button onClick={saveAllPrefs} disabled={savingPrefs || prefsSaved}
              className="text-xs font-bold bg-brand-500 hover:bg-brand-600 text-slate-950">
              {savingPrefs ? <><Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> Saving...</>
              : prefsSaved ? <><CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> Preferences Saved!</>
              : <><Save className="h-3.5 w-3.5 mr-1.5" /> Save Preferences</>}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}