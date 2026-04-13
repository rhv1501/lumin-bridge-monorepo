"use client";
import { useRouter } from "next/navigation";
import { BuyerDashboard } from "@/portals/BuyerDashboard";
import {
  User as UserType,
  Product,
  Order,
  CustomOrder,
  CustomOrderProposal,
} from "@luminbridge/types";
import { usePortalState } from "@/portals/usePortalState";
import { useRealtimeData } from "@/portals/useRealtimeData";
import PortalShellClient from "@/portals/PortalShellClient";
import {
  ShoppingBag,
  Package,
  FileText,
  Settings as SettingsIcon,
} from "lucide-react";
import { useState } from "react";

type Props = {
  user: UserType;
  initialProducts: Product[];
  initialOrders: Order[];
  initialCustomOrders: CustomOrder[];
  initialAllProposals: CustomOrderProposal[];
};

export default function BuyerPageClient({
  user,
  initialProducts,
  initialOrders,
  initialCustomOrders,
  initialAllProposals,
}: Props) {
  const products = useRealtimeData<Product[]>(
    user.id,
    "products",
    () => fetch("/api/products").then((r) => r.json()),
    initialProducts,
  );

  const orders = useRealtimeData<Order[]>(
    user.id,
    "orders",
    () =>
      fetch(`/api/orders?role=buyer&userId=${user.id}`).then((r) => r.json()),
    initialOrders,
  );

  const customOrders = useRealtimeData<CustomOrder[]>(
    user.id,
    "custom-orders",
    () =>
      fetch(`/api/custom-orders?role=buyer&userId=${user.id}`).then((r) =>
        r.json(),
      ),
    initialCustomOrders,
  );

  const allProposals = useRealtimeData<CustomOrderProposal[]>(
    user.id,
    "custom-order-proposals",
    () =>
      fetch(`/api/custom-order-proposals?role=buyer&userId=${user.id}`).then(
        (r) => r.json(),
      ),
    initialAllProposals,
  );
  const router = useRouter();
  const {
    seenOrderIds,
    seenCustomOrderIds,
    markAsSeen,
    hasNewOrders,
    hasNewCustomOrders,
    handleLogout,
  } = usePortalState(user.role);

  const [activeTab, setActiveTab] = useState<
    "products" | "orders" | "custom-orders" | "settings"
  >("products");

  const buyerTabs = [
    { id: "products", label: "Marketplace", icon: ShoppingBag },
    {
      id: "orders",
      label: "My Orders",
      icon: Package,
      badge: hasNewOrders(initialOrders),
    },
    {
      id: "custom-orders",
      label: "Custom Requests",
      icon: FileText,
      badge: hasNewCustomOrders(initialCustomOrders),
    },
    { id: "settings", label: "Profile Settings", icon: SettingsIcon },
  ];

  return (
    <PortalShellClient
      user={user}
      hasNewOrders={hasNewOrders}
      hasNewCustomOrders={hasNewCustomOrders}
      tabs={buyerTabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onLogout={async () => {
        await handleLogout();
        router.replace("/login");
      }}
    >
      <BuyerDashboard
        user={user}
        initialProducts={products}
        initialOrders={orders}
        initialCustomOrders={customOrders}
        initialAllProposals={allProposals}
        seenOrderIds={seenOrderIds}
        seenCustomOrderIds={seenCustomOrderIds}
        markAsSeen={markAsSeen}
        hasNewOrders={hasNewOrders}
        hasNewCustomOrders={hasNewCustomOrders}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
    </PortalShellClient>
  );
}
