import {
  getAdminCustomOrders,
  getAdminOrders,
  getAdminProducts,
  getSettings,
} from "@luminbridge/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { User } from "@luminbridge/types";
import AdminPageClient from "@/admin/AdminPageClient";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("lumina_session");
  if (!session?.value) redirect("/login");

  let user: User;
  try {
    user = JSON.parse(session.value) as User;
  } catch {
    redirect("/login");
  }

  if (user.role !== "admin") {
    redirect("/login");
  }

  const [initialProducts, initialOrders, initialCustomOrders, initialSettings] =
    await Promise.all([
      getAdminProducts(),
      getAdminOrders(),
      getAdminCustomOrders(),
      getSettings(),
    ]);

  return (
    <AdminPageClient
      user={user}
      initialProducts={initialProducts}
      initialOrders={initialOrders}
      initialCustomOrders={initialCustomOrders}
      initialSettings={initialSettings}
    />
  );
}
