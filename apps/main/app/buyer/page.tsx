import {
  getBuyerCustomOrders,
  getBuyerOrders,
  getBuyerProducts,
  getBuyerProposals,
} from "@luminbridge/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { User } from "@luminbridge/types";
import BuyerPageClient from "@/buyer/BuyerPageClient";

export default async function BuyerPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("lumina_session");
  if (!session?.value) redirect("/login");

  let user: User;
  try {
    user = JSON.parse(session.value) as User;
  } catch {
    redirect("/login");
  }

  if (user.role !== "buyer") {
    redirect("/login");
  }

  const [
    initialProducts,
    initialOrders,
    initialCustomOrders,
    initialAllProposals,
  ] = await Promise.all([
    getBuyerProducts(),
    getBuyerOrders(user.id),
    getBuyerCustomOrders(user.id),
    getBuyerProposals(user.id),
  ]);

  return (
    <BuyerPageClient
      user={user}
      initialProducts={initialProducts}
      initialOrders={initialOrders}
      initialCustomOrders={initialCustomOrders}
      initialAllProposals={initialAllProposals}
    />
  );
}
