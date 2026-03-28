"use client";

import { useRouter } from "next/navigation";
import { Login } from "@/portals/Login";
import type { User } from "@luminbridge/types";

export default function PortalLoginClient() {
  const router = useRouter();

  return (
    <Login
      initialRole="factory"
      lockedRole="factory"
      allowSignup={true}
      showPortalSwitch={false}
      showDemoAccounts={true}
      onLogin={(user: User) => {
        // Cookie is already set by POST /api/auth/login response.
        localStorage.setItem("lumina_user", JSON.stringify(user));
        // Factory portal: always go to / (the factory dashboard)
        // If somehow a non-factory user logs in here, page.tsx will bounce them.
        router.replace("/");
      }}
    />
  );
}
