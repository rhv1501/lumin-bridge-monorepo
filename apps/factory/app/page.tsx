import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { User } from "@luminbridge/types";
import {
  getFactoryProducts,
  getFactoryOrders,
  getFactoryCustomOrders,
} from "@luminbridge/db";
import FactoryPageClient from "./FactoryPageClient";

export default async function FactoryPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("lumina_session");
  if (!session?.value) redirect("/login");

  let user: User;
  try {
    user = JSON.parse(session.value) as User;
  } catch {
    redirect("/login");
  }

  if (user.role !== "factory") {
    redirect("/login");
  }

  const [initialProducts, initialOrders, initialCustomOrders] =
    await Promise.all([
      getFactoryProducts(user.id),
      getFactoryOrders(user.id),
      getFactoryCustomOrders(),
    ]);

  return (
    <FactoryPageClient
      user={user}
      initialProducts={initialProducts}
      initialOrders={initialOrders}
      initialCustomOrders={initialCustomOrders}
    />
  );
}
