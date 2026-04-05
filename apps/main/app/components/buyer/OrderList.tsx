"use client";
import { exportOrdersToExcel, generateInvoice } from "@luminbridge/db/client";
import { Button, Card, EmptyState, Skeleton, cn } from "@luminbridge/ui";
import React, { useState } from 'react';
import { ShoppingBag, Download, Star, FileSpreadsheet, Package } from 'lucide-react';
import { Order, User } from "@luminbridge/types";
import { ReviewModal } from './ReviewModal';
import { toast } from 'react-hot-toast';

interface OrderListProps {
  orders: Order[];
  isLoading: boolean;
  currentUser: User;
  onBrowseProducts?: () => void;
}

export const OrderList = ({ orders, isLoading, currentUser, onBrowseProducts }: OrderListProps) => {
  const [reviewOrder, setReviewOrder] = useState<Order | null>(null);

  const handleReviewSubmit = async (rating: number, comment: string) => {
    if (!reviewOrder) return;
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: reviewOrder.id,
          product_id: reviewOrder.product_id,
          factory_id: reviewOrder.factory_id,
          buyer_id: currentUser.id,
          rating,
          comment
        })
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to submit review');
      }
      toast.success('Review submitted successfully!');
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to submit review');
    }
  };

  return (
    <>
      <Card className="overflow-hidden border-0 shadow-lg bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-[2rem]">
        <div className="flex justify-between items-center p-8 border-b border-zinc-200/50 dark:border-zinc-800/50">
          <h3 className="font-semibold text-xl tracking-tight text-zinc-900 dark:text-white">Order History</h3>
          {orders.length > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => exportOrdersToExcel(orders, 'My_Orders')}
              className="rounded-full"
            >
              <FileSpreadsheet size={16} className="mr-2" />
              Export
            </Button>
          )}
        </div>
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200/50 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-800/20">
                <th className="p-6 text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">Order ID</th>
                <th className="p-6 text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">Product</th>
                <th className="p-6 text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">Qty</th>
                <th className="p-6 text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">Total</th>
                <th className="p-6 text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">Status</th>
                <th className="p-6 text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="p-6"><Skeleton className="w-16 h-4 rounded-md" /></td>
                    <td className="p-6"><Skeleton className="w-32 h-4 rounded-md" /></td>
                    <td className="p-6"><Skeleton className="w-8 h-4 rounded-md" /></td>
                    <td className="p-6"><Skeleton className="w-16 h-4 rounded-md" /></td>
                    <td className="p-6"><Skeleton className="w-20 h-6 rounded-full" /></td>
                    <td className="p-6"><div className="flex justify-end gap-2"><Skeleton className="w-8 h-8 rounded-full" /></div></td>
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12">
                    <EmptyState 
                      icon={ShoppingBag} 
                      title="No orders" 
                      description="You haven't placed any orders yet." 
                    />
                  </td>
                </tr>
              ) : (
                orders.map(o => (
                  <tr key={o.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-100 dark:bg-zinc-800/30 transition-colors group">
                    <td className="p-6 font-mono text-xs text-zinc-500">#{o.id}</td>
                    <td className="p-6 text-sm font-semibold text-zinc-900 dark:text-zinc-100">{o.product_name}</td>
                    <td className="p-6 font-mono text-sm">{o.quantity}</td>
                    <td className="p-6 font-mono text-sm font-semibold">₹{o.total_price?.toLocaleString()}</td>
                    <td className="p-6">
                      <span className={cn(
                        "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center",
                        o.status === 'pending' && "bg-amber-100 text-amber-700",
                        o.status === 'accepted' && "bg-blue-100 text-blue-700",
                        o.status === 'fulfilled' && "bg-emerald-100 text-emerald-700",
                        o.status === 'rejected' && "bg-red-100 text-red-700"
                      )}>
                        {o.status}
                      </span>
                    </td>
                    <td className="p-6">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {o.status === 'fulfilled' && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setReviewOrder(o)}
                            className="h-8 w-8 p-0 rounded-full"
                          >
                            <Star size={14} />
                          </Button>
                        )}
                        {(o.status === 'accepted' || o.status === 'fulfilled') && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => generateInvoice(o, currentUser)}
                            className="h-8 w-8 p-0 rounded-full"
                          >
                            <Download size={14} />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
      
      {reviewOrder && (
        <ReviewModal
          order={reviewOrder}
          onClose={() => setReviewOrder(null)}
          onSubmit={handleReviewSubmit}
        />
      )}
    </>
  );
};
