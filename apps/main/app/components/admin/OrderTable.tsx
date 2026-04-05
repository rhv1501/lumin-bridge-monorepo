"use client";
import { generateInvoice, getPusherClient, userChannelName } from "@luminbridge/db/client";
import { Button, Card, EmptyState, Skeleton, cn } from "@luminbridge/ui";
import React from 'react';
import { ShoppingCart, Download } from 'lucide-react';
import { Order } from "@luminbridge/types";

interface OrderTableProps {
  orders: Order[];
  isLoading: boolean;
}

export const OrderTable = ({ orders, isLoading }: OrderTableProps) => {
  return (
    <Card className="overflow-hidden border-0 shadow-lg bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-[2rem]">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-200/50 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-800/20">
              <th className="p-6 text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">Order ID</th>
              <th className="p-6 text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">Product</th>
              <th className="p-6 text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">Buyer</th>
              <th className="p-6 text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">Qty</th>
              <th className="p-6 text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">Status</th>
              <th className="p-6 text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td className="p-6"><Skeleton className="w-16 h-4 rounded-full" /></td>
                  <td className="p-6"><Skeleton className="w-32 h-4 rounded-full" /></td>
                  <td className="p-6"><Skeleton className="w-24 h-4 rounded-full" /></td>
                  <td className="p-6"><Skeleton className="w-8 h-4 rounded-full" /></td>
                  <td className="p-6"><Skeleton className="w-20 h-6 rounded-full" /></td>
                  <td className="p-6"><div className="flex justify-end"><Skeleton className="w-8 h-8 rounded-full" /></div></td>
                </tr>
              ))
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-12 text-center">
                  <EmptyState 
                    icon={ShoppingCart} 
                    title="No orders" 
                    description="No orders have been placed yet." 
                  />
                </td>
              </tr>
            ) : (
              orders.map(o => (
                <tr key={o.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-100 dark:bg-zinc-800/30 transition-colors group">
                  <td className="p-6 font-mono text-xs text-zinc-500">#{o.id}</td>
                  <td className="p-6 text-sm font-semibold text-zinc-900">{o.product_name}</td>
                  <td className="p-6 text-sm text-zinc-600 font-medium">{o.buyer_company || o.buyer_email}</td>
                  <td className="p-6 font-mono text-sm">{o.quantity}</td>
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
                  <td className="p-6 text-right">
                    {(o.status === 'accepted' || o.status === 'fulfilled') && (
                      <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => generateInvoice(o)}
                          className="rounded-full w-8 h-8 p-0"
                        >
                          <Download size={14} />
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
