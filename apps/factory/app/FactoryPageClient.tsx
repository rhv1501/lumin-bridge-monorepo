"use client";
import { useRouter } from "next/navigation";
import { FactoryDashboard } from "./portals/FactoryDashboard";

import { User as UserType, Product, Order, CustomOrder } from "@luminbridge/types";
import { usePortalState } from "./portals/usePortalState";
import { useRealtimeData } from "./portals/useRealtimeData";
import PortalShellClient from "./portals/PortalShellClient";
import { Package, ShoppingCart, FileText, Users, Settings as SettingsIcon, Star } from "lucide-react";
import { useState } from "react";

type Props = {
  user: UserType;
  initialProducts: Product[];
  initialOrders: Order[];
  initialCustomOrders: CustomOrder[];
};

export default function FactoryPageClient({
  user,
  initialProducts,
  initialOrders,
  initialCustomOrders,
}: Props) {
  const products = useRealtimeData<Product[]>(
    user.id,
    "products",
    () => fetch(`/api/products?role=factory&userId=${user.id}`).then((r) => r.json()),
    initialProducts,
  );

  const orders = useRealtimeData<Order[]>(
    user.id,
    "orders",
    () => fetch(`/api/orders?role=factory&userId=${user.id}`).then((r) => r.json()),
    initialOrders,
  );

  const customOrders = useRealtimeData<CustomOrder[]>(
    user.id,
    "custom-orders",
    () => fetch(`/api/custom-orders?role=factory`).then((r) => r.json()),
    initialCustomOrders,
  );
  const router = useRouter();
  const {
    seenOrderIds,
    seenCustomOrderIds,
    seenOrderStatuses,
    markAsSeen,
    hasNewOrders,
    hasNewCustomOrders,
    handleLogout,
  } = usePortalState(user.role);

  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'custom-orders' | 'reviews' | 'settings'>('overview');

  const factoryTabs = [
    { id: 'overview', label: 'Overview', icon: Users },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingCart, badge: hasNewOrders(initialOrders) },
    { id: 'custom-orders', label: 'Custom Requests', icon: FileText, badge: hasNewCustomOrders(initialCustomOrders) },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <PortalShellClient
      user={user}
      hasNewOrders={hasNewOrders}
      hasNewCustomOrders={hasNewCustomOrders}
      tabs={factoryTabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onLogout={async () => {
        await handleLogout();
        router.replace("/login");
      }}
    >
      <FactoryDashboard
        user={user}
        onUpdateUser={() => {}} // Placeholder as FactoryDashboard uses onUpdateUser
        markAsSeen={markAsSeen}
        seenOrderIds={seenOrderIds}
        seenCustomOrderIds={seenCustomOrderIds}
        seenOrderStatuses={seenOrderStatuses}
        hasNewOrders={hasNewOrders}
        hasNewCustomOrders={hasNewCustomOrders}
        initialProducts={products}
        initialOrders={orders}
        initialCustomOrders={customOrders}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
    </PortalShellClient>
  );
}
