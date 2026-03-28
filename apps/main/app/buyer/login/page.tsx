import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { User } from "@luminbridge/types";
import PortalLoginClient from "@/login/PortalLoginClient";

export default async function BuyerLoginPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("lumina_session");
  if (session?.value) {
    try {
      const user = JSON.parse(session.value) as User;
      if (user.role === "factory") redirect("/login");
      redirect("/");
    } catch {
      // invalid cookie – fall through to show login
    }
  }

  return <PortalLoginClient role="buyer" allowSignup={true} />;
}
