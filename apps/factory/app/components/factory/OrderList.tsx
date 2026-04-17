"use client";
import { exportOrdersToExcel, generateInvoice } from "@luminbridge/db/client";
import { Button, Card, EmptyState, Skeleton, cn } from "@luminbridge/ui";
import React, { useState } from "react";
import { ShoppingCart, Download, FileSpreadsheet, Eye } from "lucide-react";
import { Order } from "@luminbridge/types";
import { OrderDetailsModal } from "./OrderDetailsModal";

interface OrderListProps {
  orders: Order[];
  isLoading: boolean;
  onUpdateStatus: (id: number, status: string) => Promise<void>;
}

export const OrderList = ({
  orders,
  isLoading,
  onUpdateStatus,
}: OrderListProps) => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  return (
    <Card className="overflow-hidden border-0 shadow-lg bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl">
      <div className="flex justify-between items-center p-6 border-b border-zinc-200/50 dark:border-zinc-800/50">
        <h3 className="font-semibold text-xl tracking-tight text-zinc-900 dark:text-white">
          Recent Orders
        </h3>
        {orders.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportOrdersToExcel(orders)}
            className="rounded-full"
          >
            <FileSpreadsheet size={16} className="mr-2" />
            Export to Excel
          </Button>
        )}
      </div>
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-200/50 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-800/20">
              <th className="p-4 text-[11px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                Order ID
              </th>
              <th className="p-4 text-[11px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                Product
              </th>
              <th className="p-4 text-[11px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                Buyer
              </th>
              <th className="p-4 text-[11px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                Qty
              </th>
              <th className="p-4 text-[11px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                Status
              </th>
              <th className="p-4 text-[11px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 whitespace-nowrap text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td className="p-4">
                    <Skeleton className="w-16 h-4 rounded-md" />
                  </td>
                  <td className="p-4">
                    <Skeleton className="w-32 h-4 rounded-md" />
                  </td>
                  <td className="p-4">
                    <Skeleton className="w-24 h-4 rounded-md" />
                  </td>
                  <td className="p-4">
                    <Skeleton className="w-8 h-4 rounded-md" />
                  </td>
                  <td className="p-4">
                    <Skeleton className="w-20 h-6 rounded-full" />
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      <Skeleton className="w-20 h-8 rounded-full" />
                    </div>
                  </td>
                </tr>
              ))
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8">
                  <EmptyState
                    icon={ShoppingCart}
                    title="No orders"
                    description="You haven't received any orders yet."
                  />
                </td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr
                  key={o.id}
                  onClick={() => setSelectedOrder(o)}
                  className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/70 dark:bg-zinc-800/30 transition-colors group cursor-pointer"
                >
                  <td className="p-4 font-mono text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    #{o.id}
                  </td>
                  <td className="p-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {o.product_name}
                  </td>
                  <td className="p-4 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                    {o.buyer_company || o.buyer_email}
                  </td>
                  <td className="p-4 font-mono text-sm text-zinc-700 dark:text-zinc-300">
                    {o.quantity}
                  </td>
                  <td className="p-4">
                    <span
                      className={cn(
                        "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center",
                        o.status === "pending" &&
                          "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
                        o.status === "accepted" &&
                          "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
                        o.status === "fulfilled" &&
                          "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
                        o.status === "rejected" &&
                          "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400",
                      )}
                    >
                      {o.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      {o.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onUpdateStatus(o.id, "rejected")}
                            className="rounded-full"
                          >
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => onUpdateStatus(o.id, "accepted")}
                            className="rounded-full"
                          >
                            Accept
                          </Button>
                        </>
                      )}
                      {o.status === "accepted" && (
                        <Button
                          size="sm"
                          onClick={() => onUpdateStatus(o.id, "fulfilled")}
                          className="rounded-full"
                        >
                          Mark Fulfilled
                        </Button>
                      )}
                      {(o.status === "accepted" ||
                        o.status === "fulfilled") && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => generateInvoice(o)}
                          title="Download Invoice"
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

      <OrderDetailsModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </Card>
  );
};
