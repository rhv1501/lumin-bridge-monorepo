"use client";
import { Button, Card, Input, cn } from "@luminbridge/ui";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
    ShoppingBag, Package, FileText, Settings as SettingsIcon, 
    Search, Filter, Plus, TrendingUp, Star 
} from "lucide-react";
import { toast } from "react-hot-toast";
import { User, Product, Order, CustomOrder, CustomOrderProposal } from "@luminbridge/types";
import { ProductGrid } from "@/components/buyer/ProductGrid";
import { OrderList } from "@/components/buyer/OrderList";
import { CustomOrderList } from "@/components/buyer/CustomOrderList";
import { CustomOrderForm } from "@/components/buyer/CustomOrderForm";
import { ProductModal } from "@/components/buyer/ProductModal";
import { ProfileSettings } from "@/components/ProfileSettings";
import { AnalyticsCard } from "@/components/AnalyticsCard";

export const BuyerDashboard = ({ 
    user, 
    initialProducts, 
    initialOrders, 
    initialCustomOrders,
    initialAllProposals,
    seenOrderIds,
    seenCustomOrderIds,
    markAsSeen,
    hasNewOrders,
    hasNewCustomOrders,
    unreadMessageOrderIds,
    activeTab,
    setActiveTab
}: { 
    user: User;
    initialProducts?: Product[];
    initialOrders?: Order[];
    initialCustomOrders?: CustomOrder[];
    initialAllProposals?: CustomOrderProposal[];
    seenOrderIds: number[];
    seenCustomOrderIds: number[];
    markAsSeen: (type: 'order' | 'custom-order' | 'proposal' | 'order-status', id: number, status?: string) => void;
    hasNewOrders: (orders: Order[]) => boolean;
    hasNewCustomOrders: (customOrders: CustomOrder[], proposals?: CustomOrderProposal[]) => boolean;
    unreadMessageOrderIds?: number[];
    activeTab: 'products' | 'orders' | 'custom-orders' | 'settings';
    setActiveTab: (tab: any) => void;
}) => {
    const [products, setProducts] = useState<Product[]>(initialProducts || []);
    const [orders, setOrders] = useState<Order[]>(initialOrders || []);
    const [customOrders, setCustomOrders] = useState<CustomOrder[]>(initialCustomOrders || []);
    const [allProposals, setAllProposals] = useState<CustomOrderProposal[]>(initialAllProposals || []);
    const [isLoading, setIsLoading] = useState(false);
    
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [showCustomOrderModal, setShowCustomOrderModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [pRes, oRes, coRes, propRes] = await Promise.all([
                fetch("/api/products?role=buyer"),
                fetch(`/api/orders?role=buyer&userId=${user.id}`),
                fetch(`/api/custom-orders?role=buyer&userId=${user.id}`),
                fetch(`/api/custom-order-proposals?role=buyer&userId=${user.id}`),
            ]);
            if (pRes.ok) setProducts(await pRes.json());
            if (oRes.ok) setOrders(await oRes.json());
            if (coRes.ok) setCustomOrders(await coRes.json());
            if (propRes.ok) setAllProposals(await propRes.json());
        } catch (error) {
            console.error("Failed to fetch dashboard data:", error);
            toast.error("Failed to refresh data");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!initialProducts) fetchData();
    }, []);

    const handleCreateOrder = async (quantity: number) => {
        if (!selectedProduct) return;
        try {
            const res = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    product_id: selectedProduct.id,
                    buyer_id: user.id,
                    quantity: quantity,
                }),
            });
            if (res.ok) {
                toast.success("Order placed successfully!");
                fetchData();
                setActiveTab('orders');
            } else {
                const err = await res.json();
                toast.error(err.error || "Failed to place order");
            }
        } catch (error) {
            toast.error("Network error while placing order");
        }
    };

    const handleCustomOrderSubmit = async (data: any) => {
        try {
            const res = await fetch("/api/custom-orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    buyer_id: user.id,
                    photo: data.photo,
                    requirements: data.requirements
                }),
            });
            if (res.ok) {
                toast.success("Custom request submitted!");
                fetchData();
                setShowCustomOrderModal(false);
                setActiveTab('custom-orders');
            } else {
                toast.error("Failed to submit request");
            }
        } catch (error) {
            toast.error("Network error while submitting request");
        }
    };

    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = [
        { title: "Total Orders", value: orders.length, icon: Package, trend: "+10%", trendUp: true },
        { title: "Active Requests", value: customOrders.filter(o => o.status === 'pending' || o.status === 'sourcing' || o.status === 'proposal_sent').length, icon: FileText },
        { title: "Successful Deals", value: orders.filter(o => o.status === 'fulfilled').length, icon: TrendingUp },
    ];

    const buyerTabs = [
        { id: 'products', label: 'Marketplace', icon: ShoppingBag },
        { id: 'orders', label: 'My Orders', icon: Package, badge: hasNewOrders(orders) },
        { id: 'custom-orders', label: 'Custom Requests', icon: FileText, badge: hasNewCustomOrders(customOrders, allProposals) },
        { id: 'settings', label: 'Profile Settings', icon: SettingsIcon },
    ];

    return (
        <div className="space-y-10 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">Welcome, {user.company_name || 'Guest'}</h1>
                    <p className="text-zinc-400 text-base sm:text-lg max-w-2xl">Manage your global sourcing and manufacturing orders.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button 
                        onClick={() => setShowCustomOrderModal(true)} 
                        className="rounded-full shadow-xl shadow-zinc-900/10 h-11 sm:h-12 px-5 sm:px-6 text-sm"
                    >
                        <Plus size={18} className="mr-2" />
                        Custom Request
                    </Button>
                </div>
            </div>

            {/* Main Tabs and Content */}
            <div className="grid grid-cols-12 gap-6 lg:gap-10">
                {/* Side Navigation - Hidden on mobile/tablet */}
                <div className="hidden lg:block lg:col-span-3 space-y-3">
                    {buyerTabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={cn(
                                "w-full flex items-center gap-4 px-6 py-4 rounded-3xl text-sm font-semibold transition-all duration-300 relative group text-left",
                                activeTab === tab.id 
                                    ? "text-white" 
                                    : "text-zinc-500 hover:text-white"
                            )}
                        >
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-zinc-900 rounded-3xl shadow-lg border border-zinc-800"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <tab.icon size={20} className={cn("relative z-10 transition-transform group-hover:scale-110", activeTab === tab.id ? "text-white" : "text-zinc-400")} />
                            <span className="relative z-10">{tab.label}</span>
                            {tab.badge && (
                                <span className="absolute right-6 top-1/2 -translate-y-1/2 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Tab Panels */}
                <div className="col-span-12 lg:col-span-9">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10, filter: "blur(10px)" }}
                            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                            exit={{ opacity: 0, y: -10, filter: "blur(10px)" }}
                            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                        >
                            {activeTab === 'products' && (
                                <div className="space-y-8">
                                    {/* Analytics Overview */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {stats.map((stat, i) => (
                                            <AnalyticsCard key={i} {...stat} />
                                        ))}
                                    </div>

                                    <div className="relative group">
                                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400 transition-colors group-focus-within:text-zinc-900" size={20} />
                                        <Input 
                                            placeholder="Search premium product catalog..." 
                                            className="pl-14 h-16 rounded-[2rem] bg-zinc-900 border-0 shadow-sm focus:shadow-md transition-all text-lg"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <ProductGrid 
                                        products={filteredProducts} 
                                        isLoading={isLoading} 
                                        onSelect={setSelectedProduct} 
                                    />
                                </div>
                            )}

                            {activeTab === 'orders' && (
                                <OrderList 
                                    orders={orders} 
                                    isLoading={isLoading} 
                                    currentUser={user}
                                />
                            )}

                            {activeTab === 'custom-orders' && (
                                <div className="space-y-6">
                                    <CustomOrderList 
                                        customOrders={customOrders} 
                                        proposals={allProposals}
                                        isLoading={isLoading} 
                                        currentUser={user}
                                        unreadMessageOrderIds={unreadMessageOrderIds}
                                        onAcceptProposal={async (id) => {
                                            const res = await fetch(`/api/custom-order-proposals/${id}`, {
                                                method: "PATCH",
                                                headers: { "Content-Type": "application/json" },
                                                body: JSON.stringify({ status: 'accepted' }),
                                            });
                                            if (res.ok) {
                                                toast.success("Proposal accepted!");
                                                fetchData();
                                            }
                                        }}
                                        onRejectProposal={async (id) => {
                                            const res = await fetch(`/api/custom-order-proposals/${id}`, {
                                                method: "PATCH",
                                                headers: { "Content-Type": "application/json" },
                                                body: JSON.stringify({ status: 'rejected' }),
                                            });
                                            if (res.ok) {
                                                toast.success("Proposal rejected");
                                                fetchData();
                                            }
                                        }}
                                    />
                                </div>
                            )}

                            {activeTab === 'settings' && (
                                <div className="max-w-2xl">
                                    <ProfileSettings user={user} onUpdate={(updated) => {
                                        toast.success("Profile updated");
                                    }} />
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Global Modals */}
            <AnimatePresence>
                {selectedProduct && (
                    <ProductModal 
                        product={selectedProduct} 
                        onClose={() => setSelectedProduct(null)} 
                        onConfirm={handleCreateOrder} 
                    />
                )}
                {showCustomOrderModal && (
                    <CustomOrderForm 
                        onSubmit={handleCustomOrderSubmit} 
                        onCancel={() => setShowCustomOrderModal(false)} 
                    />
                )}
            </AnimatePresence>
        </div>
    );
};
