"use client";
import { PageSpinner } from "@luminbridge/ui";

import React from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserRole } from "@luminbridge/types";
import { Login } from "@/portals/Login";
import { FactoryDashboard } from "@/portals/FactoryDashboard";
import { AdminDashboard } from "@/portals/AdminDashboard";
import { BuyerDashboard } from "@/portals/BuyerDashboard";
import NotificationBell from "@/components/NotificationBell";
import LoginPageClient from "@/login/LoginPageClient";

export {
  Login,
  FactoryDashboard,
  AdminDashboard,
  BuyerDashboard,
  NotificationBell,
};

type AppClientProps = {
  forcedRole?: UserRole | "login";
};

function RedirectByRole({ role }: { role: UserRole }) {
  const router = useRouter();

  useEffect(() => {
    const path =
      role === "factory" ? "/factory" : role === "admin" ? "/admin" : "/buyer";
    router.replace(path);
  }, [role, router]);

  return <PageSpinner />;
}

export default function AppClient({ forcedRole }: AppClientProps = {}) {
  if (forcedRole === "factory") return <RedirectByRole role="factory" />;
  if (forcedRole === "admin") return <RedirectByRole role="admin" />;
  if (forcedRole === "buyer") return <RedirectByRole role="buyer" />;
  if (forcedRole === "login") return <LoginPageClient />;
  return <LoginPageClient />;
}
