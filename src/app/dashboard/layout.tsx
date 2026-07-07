"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Bot, 
  LayoutDashboard,
  History,
  CreditCard,
  LogOut,
  Zap,
  User,
  Menu,
  X,
  RefreshCw,
  Shield,
  ShoppingBag,
  FolderKanban, Bell,
  Settings2,
  ChevronDown,
  LogOut as SignOutIcon
  } from "lucide-react";
import { NotificationPopover } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Sync user session/subscription status from local SQLite DB
  const fetchSession = async () => {
    try {
      const res = await fetch("/api/auth");
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
      }
    } catch (err) {
      console.error("Failed to fetch session:", err);
    } finally {
      setLoading(false);
    }
  };

  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications);
        setUnreadCount(data.notifications.filter((n: any) => !n.is_read).length);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  useEffect(() => {
    fetchSession();
    fetchNotifications();
    
    // Load profile pic from localStorage
    try {
      const savedPic = localStorage.getItem("axel_ai_profile_pic");
      if (savedPic) setProfilePic(savedPic);
    } catch {}

    // Click outside handler for user menu
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    
    // Refresh notifications every minute
    const interval = setInterval(fetchNotifications, 60000);
    return () => {
      clearInterval(interval);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [pathname]);

  const markAsRead = async (id: string) => {
    try {
      await fetch("/api/notifications", {
        method: "POST",
        body: JSON.stringify({ action: "mark_read", id })
      });
      fetchNotifications();
    } catch (err) {}
  };

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Organizer", href: "/dashboard/organizer", icon: FolderKanban },
    { name: "Marketing", href: "/dashboard/marketing", icon: Zap },
    { name: "Storefront", href: "/dashboard/storefront", icon: ShoppingBag },
    { name: "Tasks Board", href: "/dashboard/tasks", icon: History },
    { name: "Billing", href: "/dashboard/billing", icon: CreditCard },
    { name: "Settings", href: "/dashboard/settings", icon: Settings2 },
  ];

  const isAdmin = user?.is_admin === 1 || user?.is_admin === "1";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <Link href="/" className="flex items-center">
          <img src="/logo.svg" alt="Axel AI Logo" className="h-7 w-auto" />
        </Link>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-slate-400 hover:text-white"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </header>

      {/* Sidebar navigation */}
      <aside className={`
        fixed inset-y-0 left-0 transform ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0 md:relative md:flex flex-col w-64 bg-slate-900/60 border-r border-slate-900/80 p-6 
        transition-transform duration-200 ease-in-out z-50 md:z-0 min-h-screen justify-between
      `}>
        <div className="space-y-8">
          {/* Logo */}
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center">
              <img src="/logo.svg" alt="Axel AI Logo" className="h-9 w-auto" />
            </Link>
            <button className="md:hidden text-slate-400 hover:text-white" onClick={() => setMobileMenuOpen(false)}>
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-brand-500/10 text-brand-400 border-l-2 border-brand-500"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? "text-brand-400" : "text-slate-400"}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          {/* Admin Link - only visible to owner */}
          {isAdmin && (
            <Link
              href="/dashboard/admin"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                pathname === "/dashboard/admin"
                  ? "bg-yellow-500/10 text-yellow-400 border-l-2 border-yellow-500"
                  : "text-slate-400 hover:text-yellow-400 hover:bg-yellow-500/5"
              }`}
            >
              <Shield className={`h-5 w-5 ${pathname === "/dashboard/admin" ? "text-yellow-400" : "text-slate-400"}`} />
              <span>Owner Dashboard</span>
            </Link>
          )}
          </nav>
        </div>

        {/* User Card footer */}
        <div className="border-t border-slate-800/80 pt-6 space-y-4">
          {user ? (
            <div className="flex items-center space-x-3 bg-slate-900/80 p-3 rounded-lg border border-slate-800">
              <div className="h-10 w-10 rounded-full bg-brand-500/10 flex items-center justify-center border border-brand-500/20 text-brand-400">
                <User className="h-5 w-5" />
              </div>
              <div className="flex-grow min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                <div className="flex items-center space-x-1.5 mt-0.5">
                  <Badge variant="info" className="px-1.5 py-0 text-[10px] uppercase font-bold tracking-wider">
                    {user.subscription?.tier || "Starter"}
                  </Badge>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-14 bg-slate-900/40 rounded-lg animate-pulse" />
          )}

          <Link href="/" className="flex items-center space-x-3 px-4 py-3 text-slate-400 hover:text-rose-400 hover:bg-rose-500/5 rounded-lg text-sm transition-colors">
            <LogOut className="h-5 w-5" />
            <span>Sign Out</span>
          </Link>
        </div>
      </aside>

      {/* Main Content frame */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header with User Menu + Notifications */}
        <header className="h-16 border-b border-slate-900/60 flex items-center justify-end px-6 md:px-10 shrink-0 gap-3">
          {/* User Menu Dropdown */}
          <div className="relative" ref={userMenuRef}>
            <button onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 p-1.5 pr-3 rounded-lg hover:bg-slate-800/50 transition-colors">
              <div className="h-8 w-8 rounded-full overflow-hidden bg-slate-800 border border-slate-700 flex items-center justify-center">
                {profilePic ? (
                  <img src={profilePic} alt="" className="h-full w-full object-cover" />
                ) : (
                  <User className="h-4 w-4 text-slate-400" />
                )}
              </div>
              <span className="text-sm font-medium text-white hidden sm:block max-w-[120px] truncate">
                {user?.name || "User"}
              </span>
              <ChevronDown className={`h-3.5 w-3.5 text-slate-500 transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown Menu */}
            {userMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl shadow-black/50 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                {/* User info header */}
                <div className="p-4 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full overflow-hidden bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                      {profilePic ? (
                        <img src={profilePic} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <User className="h-5 w-5 text-slate-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{user?.name || "User"}</p>
                      <p className="text-[10px] text-slate-500 truncate">{user?.email || ""}</p>
                    </div>
                  </div>
                </div>

                {/* Menu items */}
                <div className="p-2 space-y-0.5">
                  <Link href="/dashboard/settings"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors">
                    <Settings2 className="h-4 w-4 text-slate-500" />
                    Settings
                  </Link>
                  <Link href="/dashboard/billing"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors">
                    <CreditCard className="h-4 w-4 text-slate-500" />
                    Billing & Plan
                  </Link>
                </div>

                {/* Sign out */}
                <div className="border-t border-slate-800 p-2">
                  <Link href="/"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors">
                    <SignOutIcon className="h-4 w-4" />
                    Sign Out
                  </Link>
                </div>
              </div>
            )}
          </div>

          <NotificationPopover 
            unreadCount={unreadCount} 
            notifications={notifications} 
            markAsRead={markAsRead} 
            markAllRead={() => fetch("/api/notifications", { method: "POST", body: JSON.stringify({ action: "mark_all_read" }) }).then(fetchNotifications)}
          />
        </header>

        <div className="flex-1 p-6 md:p-10 max-w-6xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
