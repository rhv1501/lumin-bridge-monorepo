"use client";
import { Button, Card, Input, cn } from "@luminbridge/ui";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useForm } from 'react-hook-form';
import { 
    Users, Package, ShoppingCart, Settings as SettingsIcon, 
    Search, Filter, Save, Download, FileText, Star, TrendingUp 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { AdminAnalytics } from "@/components/admin/AdminAnalytics";
import { UserTable } from "@/components/admin/UserTable";
import { ProductTable } from "@/components/admin/ProductTable";
import { OrderTable } from "@/components/admin/OrderTable";
import { AdminCustomOrderList } from "@/components/admin/AdminCustomOrderList";
import { ProfileSettings } from "@/components/ProfileSettings";
import { User, Product, Order, Settings, CustomOrder, CustomOrderProposal } from "@luminbridge/types";

export const AdminDashboard = ({ 
    user, 
    initialProducts, 
    initialOrders, 
    initialCustomOrders,
    initialSettings,
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
    initialSettings?: Settings;
    seenOrderIds: number[];
    seenCustomOrderIds: number[];
    markAsSeen: (type: 'order' | 'custom-order' | 'proposal' | 'order-status', id: number, status?: string) => void;
    hasNewOrders: (orders: Order[]) => boolean;
    hasNewCustomOrders: (customOrders: CustomOrder[], proposals?: CustomOrderProposal[]) => boolean;
    unreadMessageOrderIds?: number[];
    activeTab: 'overview' | 'users' | 'products' | 'orders' | 'custom-orders' | 'settings';
    setActiveTab: (tab: any) => void;
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [products, setProducts] = useState<Product[]>(initialProducts || []);
    const [orders, setOrders] = useState<Order[]>(initialOrders || []);
    const [customOrders, setCustomOrders] = useState<CustomOrder[]>(initialCustomOrders || []);
    const [proposals, setProposals] = useState<CustomOrderProposal[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [settings, setSettings] = useState<Settings>(initialSettings || { exchange_rate: '12.0', admin_markup: '1.3' });
    const [isLoading, setIsLoading] = useState(false);

    const { register: registerSettings, handleSubmit: handleSubmitSettings, setValue: setSettingsValue } = useForm<Settings>();

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [pRes, oRes, coRes, propRes, uRes, sRes] = await Promise.all([
                fetch("/api/products?role=admin"),
                fetch("/api/orders?role=admin"),
                fetch("/api/custom-orders?role=admin"),
                fetch("/api/custom-order-proposals?role=admin"),
                fetch("/api/admin/users"),
                fetch("/api/settings"),
            ]);
            if (pRes.ok) setProducts(await pRes.json());
            if (oRes.ok) setOrders(await oRes.json());
            if (coRes.ok) setCustomOrders(await coRes.json());
            if (propRes.ok) setProposals(await propRes.json());
            if (uRes.ok) setUsers(await uRes.json());
            if (sRes.ok) {
                const sData = await sRes.json();
                setSettings(sData);
                setSettingsValue('exchange_rate', sData.exchange_rate);
                setSettingsValue('admin_markup', sData.admin_markup);
            }
        } catch (error) {
            console.error("Failed to fetch admin data:", error);
            toast.error("Failed to refresh dashboard");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!initialProducts) fetchData();
    }, []);

    const handleSettingsUpdate = async (data: Settings) => {
        try {
            const res = await fetch("/api/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (res.ok) {
                toast.success("Settings updated successfully");
                setSettings(data);
            } else {
                toast.error("Failed to update settings");
            }
        } catch (error) {
            toast.error("Network error");
        }
    };

    const adminTabs = [
        { id: 'overview', label: 'Overview', icon: TrendingUp },
        { id: 'users', label: 'Users', icon: Users },
        { id: 'products', label: 'Products', icon: Package },
        { id: 'orders', label: 'Orders', icon: ShoppingCart, badge: hasNewOrders(orders) },
        { id: 'custom-orders', label: 'Custom', icon: FileText, badge: hasNewCustomOrders(customOrders, proposals) },
        { id: 'settings', label: 'Settings', icon: SettingsIcon },
    ];

    return (
        <div className="space-y-10 pb-20">
            {/* Admin Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-950 dark:text-white">Admin Control Center</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 text-base sm:text-lg max-w-2xl">Global platform management and system configuration.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="rounded-full h-11 sm:h-12 px-5 sm:px-6 text-sm">
                        <Download size={18} className="mr-2" />
                        Export Data
                    </Button>
                </div>
            </div>

            {/* Main Navigation and Content */}
            <div className="grid grid-cols-12 gap-6 lg:gap-10">
                {/* Sidebar Navigation - Hidden on mobile/tablet, moved to Drawer */}
                <div className="hidden lg:block lg:col-span-3 space-y-3">
                    {adminTabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={cn(
                                "w-full flex items-center gap-4 px-6 py-4 rounded-3xl text-sm font-semibold transition-all duration-300 relative group text-left",
                                activeTab === tab.id
                                    ? "text-zinc-950 dark:text-white"
                                    : "text-zinc-500 hover:text-zinc-950 dark:text-white"
                            )}
                        >
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="activeTabAdmin"
                                    className="absolute inset-0 bg-zinc-100 dark:bg-zinc-800 rounded-3xl shadow-lg border border-zinc-700"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <tab.icon size={20} className={cn("relative z-10 transition-transform group-hover:scale-110", activeTab === tab.id ? "text-zinc-950 dark:text-white" : "text-zinc-500 dark:text-zinc-400")} />
                            <span className="relative z-10">{tab.label}</span>
                            {tab.badge && (
                                <span className="absolute right-6 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.6)] animate-pulse" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Dashboard Panels */}
                <div className="col-span-12 lg:col-span-9">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 15, filter: "blur(10px)" }}
                            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                            exit={{ opacity: 0, y: -15, filter: "blur(10px)" }}
                            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        >
                            {activeTab === 'overview' && <AdminAnalytics />}

                            {activeTab === 'users' && (
                                <div className="space-y-6">
                                    <div className="relative group">
                                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400" size={20} />
                                        <Input 
                                            placeholder="Search users by name, email or company..." 
                                            className="pl-14 h-16 rounded-[2rem] bg-white dark:bg-zinc-900 border-0 shadow-sm transition-all"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <UserTable 
                                        users={users.filter(u => u.email.includes(searchTerm) || u.company_name?.includes(searchTerm))} 
                                        isLoading={isLoading} 
                                        onUpdate={async (id, data) => {
                                            const res = await fetch(`/api/admin/users/${id}`, {
                                                method: "PATCH",
                                                headers: { "Content-Type": "application/json" },
                                                body: JSON.stringify(data),
                                            });
                                            if (res.ok) {
                                                toast.success("User updated");
                                                fetchData();
                                            }
                                        }}
                                        onDelete={async (id) => {
                                            if (confirm("Are you sure?")) {
                                                const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
                                                if (res.ok) {
                                                    toast.success("User deleted");
                                                    fetchData();
                                                }
                                            }
                                        }}
                                    />
                                </div>
                            )}

                            {activeTab === 'products' && (
                                <ProductTable 
                                    products={products} 
                                    isLoading={isLoading} 
                                    settings={settings}
                                    onUpdate={async (id, data) => {
                                        const res = await fetch(`/api/products/${id}`, {
                                            method: "PATCH",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify(data),
                                        });
                                        if (res.ok) {
                                            toast.success("Product updated");
                                            fetchData();
                                        }
                                    }}
                                    onDelete={async (id) => {
                                        if (confirm("Are you sure?")) {
                                            const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
                                            if (res.ok) {
                                                toast.success("Product deleted");
                                                fetchData();
                                            }
                                        }
                                    }}
                                />
                            )}

                            {activeTab === 'orders' && (
                                <OrderTable 
                                    orders={orders} 
                                    isLoading={isLoading} 
                                />
                            )}

                            {activeTab === 'custom-orders' && (
                                <AdminCustomOrderList 
                                    customOrders={customOrders} 
                                    proposals={proposals}
                                    isLoading={isLoading} 
                                    currentUser={user}
                                    factories={users.filter(u => u.role === 'factory')}
                                    unreadMessageOrderIds={unreadMessageOrderIds}
                                    onPublishProposal={async (proposalId, priceInr) => {
                                        const res = await fetch(`/api/custom-order-proposals/${proposalId}`, {
                                            method: "PATCH",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({ status: 'published', price_inr: priceInr }),
                                        });
                                        if (res.ok) {
                                            toast.success("Proposal published to buyer");
                                            fetchData();
                                        }
                                    }}
                                    onUpdateStatus={async (id, status) => {
                                        const res = await fetch(`/api/custom-orders/${id}`, {
                                            method: "PATCH",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({ status }),
                                        });
                                        if (res.ok) {
                                            toast.success(`Status updated to ${status}`);
                                            fetchData();
                                        }
                                    }}
                                />
                            )}

                            {activeTab === 'settings' && (
                                <div className="space-y-10">
                                    <ProfileSettings user={user} onUpdate={() => toast.success("Profile saved")} />
                                    
                                    <Card className="p-8 border-0 shadow-xl bg-white dark:bg-zinc-900/90 backdrop-blur-xl rounded-[2.5rem]">
                                        <div className="flex items-center gap-3 mb-8">
                                            <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center">
                                                <SettingsIcon size={20} className="text-zinc-900" />
                                            </div>
                                            <h3 className="text-2xl font-bold tracking-tight">System Configuration</h3>
                                        </div>
                                        
                                        <form onSubmit={handleSubmitSettings(handleSettingsUpdate)} className="space-y-8">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                                <div className="space-y-3">
                                                    <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 ml-1">Exchange Rate (CNY → INR)</label>
                                                    <Input 
                                                        {...registerSettings('exchange_rate')} 
                                                        placeholder="e.g., 12.0"
                                                        className="h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border-0 focus:ring-2 ring-zinc-700 text-lg font-mono"
                                                    />
                                                    <p className="text-xs text-zinc-500 dark:text-zinc-400 ml-1 italic">Conversion factor for pricing calculation.</p>
                                                </div>
                                                <div className="space-y-3">
                                                    <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 ml-1">Profit Margin Multiplier</label>
                                                    <Input 
                                                        {...registerSettings('admin_markup')} 
                                                        placeholder="e.g., 1.3"
                                                        className="h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border-0 focus:ring-2 ring-zinc-700 text-lg font-mono"
                                                    />
                                                    <p className="text-xs text-zinc-500 dark:text-zinc-400 ml-1 italic">Markup applied to factory unit prices.</p>
                                                </div>
                                            </div>
                                            <div className="flex justify-end pt-6 border-t border-zinc-200 dark:border-zinc-800">
                                                <Button type="submit" className="h-14 px-10 rounded-2xl shadow-xl shadow-zinc-900/10">
                                                    <Save size={20} className="mr-2" />
                                                    Apply System Changes
                                                </Button>
                                            </div>
                                        </form>
                                    </Card>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};
