"use client";
import { Order } from "@luminbridge/types";
import { Button, cn } from "@luminbridge/ui";
import { X, Package, User, Calendar, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { createPortal } from "react-dom";

interface OrderDetailsModalProps {
  order: Order | null;
  onClose: () => void;
}

export const OrderDetailsModal = ({
  order,
  onClose,
}: OrderDetailsModalProps) => {
  if (!order) return null;

  return createPortal(
    <AnimatePresence>
      {order && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 dark:bg-black/60 z-40 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200/50 dark:border-zinc-800/50">
              {/* Header */}
              <div className="sticky top-0 flex items-center justify-between p-8 border-b border-zinc-200/50 dark:border-zinc-800/50 bg-white dark:bg-zinc-900 rounded-t-3xl">
                <div>
                  <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
                    Order Details
                  </h2>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                    Order #{order.id}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                >
                  <X size={20} className="text-zinc-500" />
                </button>
              </div>

              {/* Content */}
              <div className="p-8 space-y-8">
                {/* Product Section */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-zinc-900 dark:text-white flex items-center gap-2">
                    <Package size={18} className="text-blue-500" />
                    Product Information
                  </h3>
                  <div className="flex gap-6 p-6 bg-zinc-50/50 dark:bg-zinc-800/30 rounded-2xl">
                    {order.product_photo && (
                      <img
                        src={order.product_photo}
                        alt={order.product_name}
                        className="w-32 h-32 object-cover rounded-lg shadow-md"
                      />
                    )}
                    <div className="flex-1 space-y-2">
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                        Product
                      </p>
                      <p className="text-xl font-semibold text-zinc-900 dark:text-white">
                        {order.product_name}
                      </p>
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                            Quantity
                          </p>
                          <p className="text-lg font-semibold text-zinc-900 dark:text-white">
                            {order.quantity} units
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                            Total Price
                          </p>
                          <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                            ₹{order.total_price?.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Buyer Section */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-zinc-900 dark:text-white flex items-center gap-2">
                    <User size={18} className="text-blue-500" />
                    Buyer Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6 bg-zinc-50/50 dark:bg-zinc-800/30 rounded-2xl">
                    <div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                        Company
                      </p>
                      <p className="text-sm font-semibold text-zinc-900 dark:text-white mt-1">
                        {order.buyer_company || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                        Email
                      </p>
                      <p className="text-sm font-semibold text-zinc-900 dark:text-white mt-1 truncate">
                        {order.buyer_email}
                      </p>
                    </div>
                    {order.buyer_whatsapp && (
                      <div className="sm:col-span-2">
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                          WhatsApp
                        </p>
                        <p className="text-sm font-semibold text-zinc-900 dark:text-white mt-1">
                          {order.buyer_whatsapp}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Section */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-zinc-900 dark:text-white flex items-center gap-2">
                    <Calendar size={18} className="text-blue-500" />
                    Order Status
                  </h3>
                  <div className="p-6 bg-zinc-50/50 dark:bg-zinc-800/30 rounded-2xl space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                          Current Status
                        </p>
                        <div className="mt-2">
                          <span
                            className={cn(
                              "px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider inline-flex items-center",
                              order.status === "pending" &&
                                "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
                              order.status === "accepted" &&
                                "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
                              order.status === "fulfilled" &&
                                "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
                              order.status === "rejected" &&
                                "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400",
                            )}
                          >
                            {order.status}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                          Order Date
                        </p>
                        <p className="text-sm font-semibold text-zinc-900 dark:text-white mt-1">
                          {new Date(order.created_at).toLocaleDateString(
                            "en-IN",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            },
                          )}
                        </p>
                      </div>
                    </div>

                    {order.rejection_reason && (
                      <div className="p-4 bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/20 rounded-lg flex gap-3">
                        <AlertCircle
                          size={18}
                          className="text-red-600 dark:text-red-400 shrink-0 mt-0.5"
                        />
                        <div>
                          <p className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider">
                            Rejection Reason
                          </p>
                          <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                            {order.rejection_reason}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Order IDs for reference */}
                <div className="grid grid-cols-3 gap-4 p-4 bg-zinc-50/50 dark:bg-zinc-800/30 rounded-2xl text-xs">
                  <div>
                    <p className="text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      Product ID
                    </p>
                    <p className="font-mono font-semibold text-zinc-900 dark:text-white mt-1">
                      {order.product_id}
                    </p>
                  </div>
                  <div>
                    <p className="text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      Buyer ID
                    </p>
                    <p className="font-mono font-semibold text-zinc-900 dark:text-white mt-1">
                      {order.buyer_id}
                    </p>
                  </div>
                  <div>
                    <p className="text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      Factory ID
                    </p>
                    <p className="font-mono font-semibold text-zinc-900 dark:text-white mt-1">
                      {order.factory_id}
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 p-6 border-t border-zinc-200/50 dark:border-zinc-800/50 bg-white dark:bg-zinc-900 rounded-b-3xl flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="rounded-full"
                >
                  Close
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
};
