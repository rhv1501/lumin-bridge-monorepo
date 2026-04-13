"use client";
import { Button, Input, cn } from "@luminbridge/ui";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Package,
  ShoppingCart,
  FileText,
  Users,
  Search,
  Filter,
  Settings as SettingsIcon,
  Star,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { FactoryAnalytics } from "@/components/factory/FactoryAnalytics";
import { ProductList } from "@/components/factory/ProductList";
import { ProductForm } from "@/components/factory/ProductForm";
import { OrderList } from "@/components/factory/OrderList";
import { CustomOrderList } from "@/components/factory/CustomOrderList";
import { ReviewTable } from "@/components/ReviewTable";
import { ProfileSettings } from "@/components/ProfileSettings";
import {
  User,
  Product,
  Order,
  CustomOrder,
  CustomOrderProposal,
  Review,
} from "@luminbridge/types";

interface FactoryDashboardProps {
  user: User;
  onUpdateUser: (user: User) => void;
  markAsSeen: (
    type: "order" | "custom-order" | "proposal" | "order-status",
    id: number,
    status?: string,
  ) => void;
  seenOrderIds: number[];
  seenCustomOrderIds: number[];
  seenOrderStatuses: Record<number, string>;
  hasNewOrders: (orders: Order[]) => boolean;
  hasNewCustomOrders: (
    customOrders: CustomOrder[],
    proposals?: CustomOrderProposal[],
  ) => boolean;
  unreadMessageOrderIds?: number[];
  initialProducts?: Product[];
  initialOrders?: Order[];
  initialCustomOrders?: CustomOrder[];
  activeTab:
    | "overview"
    | "products"
    | "orders"
    | "custom-orders"
    | "reviews"
    | "settings";
  setActiveTab: (tab: any) => void;
}

export const FactoryDashboard = ({
  user,
  onUpdateUser,
  markAsSeen,
  seenOrderIds,
  seenCustomOrderIds,
  seenOrderStatuses,
  hasNewOrders,
  hasNewCustomOrders,
  unreadMessageOrderIds = [],
  initialProducts = [],
  initialOrders = [],
  initialCustomOrders = [],
  activeTab,
  setActiveTab,
}: FactoryDashboardProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(
    undefined,
  );

  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [customOrders, setCustomOrders] =
    useState<CustomOrder[]>(initialCustomOrders);
  const [proposals, setProposals] = useState<CustomOrderProposal[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const [pRes, oRes, coRes, propRes, revRes] = await Promise.all([
        fetch(`/api/products?role=factory&userId=${user.id}`),
        fetch(`/api/orders?role=factory&userId=${user.id}`),
        fetch(`/api/custom-orders?role=factory`),
        fetch(`/api/custom-order-proposals?role=factory&userId=${user.id}`),
        fetch(`/api/reviews`),
      ]);

      const p = await pRes.json();
      const o = await oRes.json();
      const co = await coRes.json();
      const props = await propRes.json();
      const revs = await revRes.json();

      setProducts(p);
      setOrders(o);
      setCustomOrders(co);
      setProposals(props);
      setReviews(revs.filter((r: Review) => r.factory_id === user.id));
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      toast.error("Failed to refresh data");
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Listen for refresh events from SSE/Pusher
    const handleRefresh = () => fetchData();
    window.addEventListener("notification-refresh", handleRefresh);
    return () =>
      window.removeEventListener("notification-refresh", handleRefresh);
  }, []);

  const handleProductSubmit = async (data: any) => {
    try {
      const method = editingProduct ? "PATCH" : "POST";
      const url = editingProduct
        ? `/api/products/${editingProduct.id}`
        : "/api/products";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, factory_id: user.id }),
      });

      if (res.ok) {
        toast.success(editingProduct ? "Product updated" : "Product created");
        setIsAddingProduct(false);
        setEditingProduct(undefined);
        fetchData();
      } else {
        toast.error("Failed to save product");
      }
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("An error occurred");
    }
  };

  const handleProductDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Product deleted");
        fetchData();
      } else {
        toast.error("Failed to delete product");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("An error occurred");
    }
  };

  const handleOrderStatusUpdate = async (id: number, status: string) => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        toast.success("Order updated");
        fetchData();
      } else {
        toast.error("Failed to update order");
      }
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("An error occurred");
    }
  };

  const handleProposalSubmit = async (
    customOrderId: number,
    data: any,
  ): Promise<boolean> => {
    try {
      const res = await fetch(`/api/custom-orders/${customOrderId}/proposals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, factory_id: user.id }),
      });
      if (res.ok) {
        const savedProposal = await res.json().catch(() => null);
        if (savedProposal?.id) {
          setProposals((prev) => {
            const next = prev.filter(
              (proposal) =>
                !(
                  proposal.custom_order_id === savedProposal.custom_order_id &&
                  proposal.factory_id === savedProposal.factory_id
                ),
            );
            return [savedProposal, ...next];
          });
        }
        toast.success("Proposal saved");
        await fetchData(true);
        return true;
      } else {
        const errorBody = await res.json().catch(() => null);
        toast.error(errorBody?.error || "Failed to submit proposal");
        return false;
      }
    } catch (error) {
      console.error("Error submitting proposal:", error);
      toast.error("An error occurred");
      return false;
    }
  };

  const factoryTabs = [
    { id: "overview", label: "Overview", icon: Users },
    { id: "products", label: "Products", icon: Package },
    { id: "orders", label: "Orders", icon: ShoppingCart },
    { id: "custom-orders", label: "Custom Requests", icon: FileText },
    { id: "reviews", label: "Reviews", icon: Star },
    { id: "settings", label: "Settings", icon: SettingsIcon },
  ];

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-950 dark:text-white">
            Factory Dashboard
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-base sm:text-lg max-w-2xl">
            Manage your manufacturing operations and product catalog.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 lg:gap-10">
        {/* Sidebar Navigation - Hidden on mobile/tablet */}
        <div className="hidden lg:block lg:col-span-3 space-y-3">
          {factoryTabs.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id as any);
                setSearchTerm("");
              }}
              className={cn(
                "w-full flex items-center gap-4 px-6 py-4 rounded-3xl text-sm font-semibold transition-all duration-300 relative group text-left",
                activeTab === item.id
                  ? "text-zinc-950 dark:text-white"
                  : "text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white",
              )}
            >
              {activeTab === item.id && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute inset-0 bg-zinc-100 dark:bg-zinc-800 rounded-3xl shadow-lg border border-zinc-700/50"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <item.icon
                size={20}
                className={cn(
                  "relative z-10 transition-transform group-hover:scale-110",
                  activeTab === item.id
                    ? "text-zinc-950 dark:text-white"
                    : "text-zinc-500 dark:text-zinc-400 dark:group-hover:text-white",
                )}
              />
              <span className="relative z-10">{item.label}</span>
              {item.id === "orders" && hasNewOrders(orders) && (
                <span className="absolute right-6 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
              )}
              {item.id === "custom-orders" &&
                (hasNewCustomOrders(customOrders, proposals) ||
                  unreadMessageOrderIds.length > 0) && (
                  <span className="absolute right-6 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
                )}
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="col-span-12 lg:col-span-9 min-h-150">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              {activeTab === "overview" && (
                <FactoryAnalytics factoryId={user.id} />
              )}

              {activeTab === "products" &&
                (isAddingProduct || editingProduct ? (
                  <ProductForm
                    initialData={editingProduct}
                    onSubmit={handleProductSubmit}
                    onCancel={() => {
                      setIsAddingProduct(false);
                      setEditingProduct(undefined);
                    }}
                  />
                ) : (
                  <div className="space-y-8">
                    <div className="flex gap-4">
                      <div className="relative flex-1 group">
                        <Search
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400 group-focus-within:text-zinc-950 dark:group-focus-within:text-white transition-colors"
                          size={18}
                        />
                        <Input
                          placeholder="Search your products..."
                          className="pl-12 bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800/50"
                          value={searchTerm}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setSearchTerm(e.target.value)
                          }
                        />
                      </div>
                      <Button variant="outline" className="rounded-2xl">
                        <Filter size={18} />
                      </Button>
                    </div>

                    <ProductList
                      products={products.filter((p) =>
                        p.name.toLowerCase().includes(searchTerm.toLowerCase()),
                      )}
                      isLoading={isLoading}
                      onEdit={(product) => {
                        setEditingProduct(product);
                        setIsAddingProduct(true);
                      }}
                      onDelete={handleProductDelete}
                      onAdd={() => setIsAddingProduct(true)}
                      onImport={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        const reader = new FileReader();
                        reader.onload = async (evt) => {
                          try {
                            const { read, utils } = await import("xlsx");
                            const bstr = evt.target?.result;
                            const wb = read(bstr, { type: "binary" });
                            const wsname = wb.SheetNames[0];
                            const ws = wb.Sheets[wsname];
                            const data = utils.sheet_to_json(ws);

                            const res = await fetch("/api/products/import", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                products: data,
                                factory_id: user.id,
                              }),
                            });

                            if (res.ok) {
                              toast.success("Products imported successfully");
                              fetchData();
                            } else {
                              toast.error("Failed to import products");
                            }
                          } catch (err) {
                            console.error("Import error:", err);
                            toast.error("Error parsing excel file");
                          }
                        };
                        reader.readAsBinaryString(file);
                      }}
                    />
                  </div>
                ))}

              {activeTab === "orders" && (
                <div className="space-y-8">
                  <div className="flex gap-4">
                    <div className="relative flex-1 group">
                      <Search
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400 group-focus-within:text-zinc-950 dark:group-focus-within:text-white transition-colors"
                        size={18}
                      />
                      <Input
                        placeholder="Search orders..."
                        className="pl-12 bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800/50"
                        value={searchTerm}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setSearchTerm(e.target.value)
                        }
                      />
                    </div>
                    <Button variant="outline" className="rounded-2xl">
                      <Filter size={18} />
                    </Button>
                  </div>

                  <OrderList
                    orders={orders.filter(
                      (o) =>
                        o.product_name
                          ?.toLowerCase()
                          .includes(searchTerm.toLowerCase()) ||
                        o.id.toString().includes(searchTerm),
                    )}
                    isLoading={isLoading}
                    onUpdateStatus={handleOrderStatusUpdate}
                  />
                </div>
              )}

              {activeTab === "custom-orders" && (
                <div className="space-y-8">
                  <CustomOrderList
                    customOrders={customOrders}
                    proposals={proposals}
                    isLoading={isLoading}
                    currentUser={user}
                    onSubmitProposal={handleProposalSubmit}
                    unreadMessageOrderIds={unreadMessageOrderIds}
                  />
                </div>
              )}

              {activeTab === "reviews" && (
                <div className="space-y-8">
                  <ReviewTable reviews={reviews} isLoading={isLoading} />
                </div>
              )}

              {activeTab === "settings" && (
                <ProfileSettings user={user} onUpdate={onUpdateUser} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
