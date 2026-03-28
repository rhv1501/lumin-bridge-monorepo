"use client";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { TrendingUp, Users, Package, ShoppingCart, FileText, Settings as SettingsIcon } from "lucide-react";
import { useState } from "react";
import { AdminDashboard } from "@/portals/AdminDashboard";
import {
  User as UserType,
  Product,
  Order,
  CustomOrder,
  Settings,
} from "@luminbridge/types";
import { usePortalState } from "@/portals/usePortalState";
import { useRealtimeData } from "@/portals/useRealtimeData";
import PortalShellClient from "@/portals/PortalShellClient";

type Props = {
  user: UserType;
  initialProducts: Product[];
  initialOrders: Order[];
  initialCustomOrders: CustomOrder[];
  initialSettings: Settings;
};

export default function AdminPageClient({
  user,
  initialProducts,
  initialOrders,
  initialCustomOrders,
  initialSettings,
}: Props) {
  const products = useRealtimeData<Product[]>(
    user.id,
    "products",
    () => fetch("/api/products?role=admin").then((r) => r.json()),
    initialProducts,
  );

  const orders = useRealtimeData<Order[]>(
    user.id,
    "orders",
    () => fetch(`/api/orders?role=admin&userId=${user.id}`).then((r) => r.json()),
    initialOrders,
  );

  const customOrders = useRealtimeData<CustomOrder[]>(
    user.id,
    "custom-orders",
    () => fetch(`/api/custom-orders?role=admin`).then((r) => r.json()),
    initialCustomOrders,
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

  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'products' | 'orders' | 'custom-orders' | 'settings'>('overview');

  const adminTabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'custom-orders', label: 'Custom', icon: FileText },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <PortalShellClient
      user={user}
      hasNewOrders={hasNewOrders}
      hasNewCustomOrders={hasNewCustomOrders}
      tabs={adminTabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onLogout={async () => {
        await handleLogout();
        router.replace("/login");
      }}
    >
      <AdminDashboard
        user={user}
        initialProducts={products}
        initialOrders={orders}
        initialCustomOrders={customOrders}
        initialSettings={initialSettings}
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
