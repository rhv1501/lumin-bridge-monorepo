"use client";
import { cn } from "@luminbridge/ui";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { User as UserType, Order } from "@luminbridge/types";
import NotificationBell from "@/components/NotificationBell";
import { ThemeToggle } from "@/components/ThemeToggle";

type PortalShellClientProps = {
  user: UserType;
  onLogout: () => void;
  hasNewOrders: (orders: Order[]) => boolean;
  hasNewCustomOrders: (
    customOrders: import("@luminbridge/types").CustomOrder[],
    proposals?: import("@luminbridge/types").CustomOrderProposal[],
  ) => boolean;
  tabs?: {
    id: string;
    label: string;
    icon: React.ElementType;
    badge?: boolean;
  }[];
  activeTab?: string;
  onTabChange?: (tabId: any) => void;
  children: React.ReactNode;
};

const roleBadge: Record<string, string> = {
  admin: "bg-violet-100 text-violet-700",
  factory: "bg-amber-100  text-amber-700",
  buyer: "bg-emerald-100 text-emerald-700",
};

const roleLabel: Record<string, string> = {
  admin: "Admin",
  factory: "Factory",
  buyer: "Buyer",
};

function initials(user: UserType) {
  const name = user.company_name || user.email;
  return name
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

export default function PortalShellClient({
  user,
  onLogout,
  hasNewOrders,
  hasNewCustomOrders,
  tabs = [],
  activeTab,
  onTabChange,
  children,
}: PortalShellClientProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [changePwdOpen, setChangePwdOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [changingPassword, setChangingPassword] = useState(false);
  const userInitials = initials(user);
  const badge = roleBadge[user.role] ?? "bg-zinc-100 text-zinc-500";
  const label = roleLabel[user.role] ?? user.role;

  const submitPasswordChange = async () => {
    setPasswordError(null);
    setPasswordMessage(null);
    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirm password do not match");
      return;
    }

    setChangingPassword(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (!res.ok) {
        const payload = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        setPasswordError(payload?.error || "Unable to change password");
        return;
      }
      setPasswordMessage("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setPasswordError("Network error while changing password");
    } finally {
      setChangingPassword(false);
    }
  };

  // Never allow the mobile drawer to remain open on desktop.
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setDrawerOpen(false);
    };
    window.addEventListener("resize", onResize);
    onResize();
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
      {/* ── Navbar ── */}
      <nav className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex flex-nowrap items-center justify-between gap-3">
          {/* Logo */}
          <div className="flex items-center gap-2 flex-shrink-1 min-w-0">
            <div className="w-8 h-8 bg-black dark:bg-zinc-900 text-white rounded-lg flex items-center justify-center flex-shrink-0">
              <Globe size={18} />
            </div>
            <span className="font-serif font-bold text-xl tracking-tight truncate sm:whitespace-nowrap">
              luminbridge
            </span>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {/* Navbar always shows notifications */}
            <NotificationBell
              userId={user.id}
              userRole={user.role}
              hasNewOrders={hasNewOrders}
              hasNewCustomOrders={hasNewCustomOrders}
            />

            {/* Desktop: everything visible inline, no hamburger, no sidebar */}
            <div className="hidden md:flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-zinc-900 rounded-full border border-zinc-200 dark:border-zinc-800">
                <div className="w-7 h-7 rounded-full bg-black dark:bg-zinc-900 text-white flex items-center justify-center text-[11px] font-bold flex-shrink-0 select-none">
                  {userInitials}
                </div>
                <div className="flex flex-col min-w-0">
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full w-fit ${badge}`}
                  >
                    {label}
                  </span>
                  <span className="text-xs font-medium text-zinc-700 leading-none mt-1 max-w-[220px] truncate">
                    {user.company_name || user.email}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setChangePwdOpen(true)}
                className="text-sm text-zinc-500 hover:text-zinc-950 dark:hover:text-zinc-900 dark:text-zinc-100 transition-colors focus:outline-none rounded-lg px-2 py-1"
              >
                Change Password
              </button>

              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400 hover:text-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:focus:ring-zinc-100/10 focus:ring-offset-2 rounded-lg px-2 py-1"
              >
                <LogOut size={16} />
                <span className="font-medium">Logout</span>
              </button>
            </div>

            {/* Mobile: hamburger opens sidebar with user + logout */}
            <button
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
              className="p-2 text-zinc-500 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-zinc-100 transition-colors focus:outline-none rounded-lg lg:hidden"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile drawer (< md) ── */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 bg-black/40 z-50 md:hidden"
            />

            {/* Drawer */}
            <motion.aside
              key="drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 240 }}
              className="fixed top-0 right-0 h-full w-80 bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 z-50 lg:hidden flex flex-col"
            >
              {/* Header */}
              <div className="h-16 flex items-center justify-between px-6 border-b border-zinc-200 dark:border-zinc-900 flex-shrink-0">
                <span className="font-serif font-bold text-base text-zinc-950 dark:text-zinc-100 uppercase tracking-widest opacity-50">
                  Menu
                </span>
                <button
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Close menu"
                  className="p-1.5 text-zinc-500 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-zinc-100 transition-colors rounded-lg focus:outline-none"
                >
                  <X size={20} />
                </button>
              </div>

              {/* User card */}
              <div className="px-6 py-6 border-b border-zinc-300 dark:border-zinc-900">
                {/* Avatar + name row */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-black dark:bg-zinc-900 text-white flex items-center justify-center text-sm font-bold flex-shrink-0 select-none border border-zinc-200 dark:border-zinc-800">
                    {userInitials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate leading-tight">
                      {user.company_name || user.email}
                    </p>
                    {user.company_name && (
                      <p className="text-[10px] text-zinc-500 truncate mt-1">
                        {user.email}
                      </p>
                    )}
                  </div>
                </div>

                {/* Role badge */}
                <span
                  className={`inline-block text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${badge}`}
                >
                  {label}
                </span>
              </div>

              {/* Navigation Tabs */}
              {tabs.length > 0 && (
                <div className="px-4 py-6 space-y-1">
                  <p className="px-4 mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                    Navigation
                  </p>
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        onTabChange?.(tab.id);
                        setDrawerOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200",
                        activeTab === tab.id
                          ? "bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white shadow-lg shadow-black/20"
                          : "text-zinc-500 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-white dark:hover:bg-zinc-800/70",
                      )}
                    >
                      <tab.icon
                        size={18}
                        className={
                          activeTab === tab.id
                            ? "text-zinc-950 dark:text-white"
                            : "text-zinc-500"
                        }
                      />
                      <span>{tab.label}</span>
                      {tab.badge && (
                        <span className="ml-auto w-2 h-2 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.4)]" />
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Details */}
              {(user.mobile_number ||
                user.wechat_id ||
                user.whatsapp_number) && (
                <div className="px-6 py-6 space-y-3 border-t border-zinc-300 dark:border-zinc-900">
                  {user.mobile_number && (
                    <InfoLine label="Mobile" value={user.mobile_number} />
                  )}
                  {user.wechat_id && (
                    <InfoLine label="WeChat" value={user.wechat_id} />
                  )}
                  {user.whatsapp_number && (
                    <InfoLine label="WhatsApp" value={user.whatsapp_number} />
                  )}
                </div>
              )}

              <div className="flex-1" />

              {/* Sign out */}
              <div className="px-6 pb-8 pt-6 border-t border-zinc-300 dark:border-zinc-900 bg-white dark:bg-zinc-900/30">
                <button
                  onClick={() => {
                    setDrawerOpen(false);
                    setChangePwdOpen(true);
                  }}
                  className="w-full mb-3 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-300 text-sm font-semibold hover:text-zinc-950 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all active:scale-[0.98]"
                >
                  Change password
                </button>
                <button
                  onClick={() => {
                    setDrawerOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-zinc-50 text-zinc-950 text-sm font-bold hover:bg-white transition-all active:scale-[0.98] shadow-lg shadow-black/20"
                >
                  <LogOut size={16} />
                  Log out
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {changePwdOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50"
              onClick={() => setChangePwdOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              className="fixed z-50 inset-0 flex items-center justify-center p-4"
            >
              <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-3">
                <h3 className="text-lg font-semibold">Change Password</h3>
                {user.must_change_password && (
                  <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded p-2">
                    You are using a temporary password. Please set a new one.
                  </p>
                )}
                {passwordMessage && (
                  <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded p-2">
                    {passwordMessage}
                  </p>
                )}
                {passwordError && (
                  <p className="text-xs text-red-700 bg-red-50 border border-red-100 rounded p-2">
                    {passwordError}
                  </p>
                )}
                <input
                  type="password"
                  placeholder="Current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg"
                />
                <input
                  type="password"
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg"
                />
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg"
                />
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    className="flex-1 py-2 rounded-lg border border-zinc-300 text-sm"
                    onClick={() => setChangePwdOpen(false)}
                    disabled={changingPassword}
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    className="flex-1 py-2 rounded-lg bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white text-sm disabled:opacity-60"
                    onClick={submitPasswordChange}
                    disabled={changingPassword}
                  >
                    {changingPassword ? "Saving..." : "Update"}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 mt-8">{children}</main>

      <footer className="py-12 border-t border-zinc-200 dark:border-zinc-800 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 opacity-50">
            <Globe size={16} />
            <span className="font-serif font-bold text-sm">luminbridge</span>
          </div>
          <div className="flex gap-8 text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
            <a href="#" className="hover:text-zinc-900 transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-zinc-900 transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-zinc-900 transition-colors">
              Support
            </a>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            © 2026 luminbridge. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 w-16 flex-shrink-0">
        {label}
      </span>
      <span className="text-sm text-zinc-700 dark:text-zinc-300 truncate">
        {value}
      </span>
    </div>
  );
}

type IconProps = {
  size?: number;
  className?: string;
};

function Globe({ size = 16, className }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function LogOut({ size = 16, className }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function Menu({ size = 16, className }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function X({ size = 16, className }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
