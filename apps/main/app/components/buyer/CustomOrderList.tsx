"use client";
import { generateCustomOrderInvoice } from "@luminbridge/db/client";
import { Button, Card, EmptyState, Skeleton, cn } from "@luminbridge/ui";

import React, { useEffect, useState } from "react";
import {
  FileText,
  X,
  Check,
  XCircle,
  MessageSquare,
  Download,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { createPortal } from "react-dom";
import { CustomOrder, CustomOrderProposal, User } from "@luminbridge/types";
import { ChatBox } from "@/components/ChatBox";

interface CustomOrderListProps {
  customOrders: CustomOrder[];
  proposals: CustomOrderProposal[];
  isLoading: boolean;
  currentUser: User;
  onAcceptProposal: (proposalId: number) => Promise<void>;
  onRejectProposal: (proposalId: number) => Promise<void>;
  unreadMessageOrderIds?: number[];
  onNewRequest?: () => void;
}

export const CustomOrderList = ({
  customOrders,
  proposals,
  isLoading,
  currentUser,
  onAcceptProposal,
  onRejectProposal,
  unreadMessageOrderIds = [],
  onNewRequest,
}: CustomOrderListProps) => {
  const [selectedCustomOrder, setSelectedCustomOrder] =
    useState<CustomOrder | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleViewProposals = (order: CustomOrder) => {
    setSelectedCustomOrder(order);
    setShowChat(false);
  };

  const handleCloseProposals = () => {
    setSelectedCustomOrder(null);
    setShowChat(false);
  };

  const getProposalsForOrder = (orderId: number) => {
    return proposals.filter(
      (p) => p.custom_order_id === orderId && p.status !== "pending",
    );
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card
              key={i}
              className="overflow-hidden border-0 shadow-lg bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-[2.5rem] p-6"
            >
              <div className="flex flex-col sm:flex-row gap-6">
                <Skeleton className="w-full sm:w-32 h-48 sm:h-32 rounded-2xl flex-shrink-0" />
                <div className="flex-1 space-y-4 py-2">
                  <Skeleton className="w-1/2 h-5 rounded-md" />
                  <Skeleton className="w-full h-12 rounded-xl" />
                  <div className="flex justify-end pt-4">
                    <Skeleton className="w-28 h-10 rounded-full" />
                  </div>
                </div>
              </div>
            </Card>
          ))
        ) : customOrders.length === 0 ? (
          <div className="col-span-full py-12">
            <EmptyState
              icon={FileText}
              title="No custom orders"
              description="You haven't submitted any custom requests yet."
              actionLabel="New Request"
              onAction={onNewRequest}
            />
          </div>
        ) : (
          customOrders.map((co) => {
            const orderProposals = getProposalsForOrder(co.id);
            const hasUnread = unreadMessageOrderIds.includes(co.id);

            return (
              <Card
                key={co.id}
                className="overflow-hidden border-0 shadow-lg hover:shadow-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-[2.5rem] transition-all duration-500 group"
              >
                <div className="p-8 flex flex-col sm:flex-row gap-8">
                  <div className="w-full sm:w-36 h-48 sm:h-36 bg-zinc-100 dark:bg-zinc-800/50 rounded-3xl overflow-hidden flex-shrink-0 relative shadow-inner">
                    {co.photo ? (
                      <img
                        src={co.photo}
                        alt="Requirement"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-700 dark:text-zinc-300 group-hover:scale-110 transition-transform duration-1000 ease-out">
                        <FileText size={40} strokeWidth={1} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
                            Request #{co.id}
                          </span>
                          {hasUnread && (
                            <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.7)]"></span>
                          )}
                        </div>
                        <span
                          className={cn(
                            "px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm backdrop-blur-md border",
                            co.status === "pending" &&
                              "bg-amber-50 text-amber-600 border-amber-200/50 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
                            co.status === "proposal_sent" &&
                              "bg-blue-50 text-blue-600 border-blue-200/50 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
                            co.status === "accepted" &&
                              "bg-emerald-50 text-emerald-600 border-emerald-200/50 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
                            co.status === "rejected" &&
                              "bg-red-50 text-red-600 border-red-200/50 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20",
                          )}
                        >
                          {co.status.replace("_", " ")}
                        </span>
                      </div>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-3 mb-8 leading-relaxed font-medium">
                        {co.requirements}
                      </p>
                    </div>
                    <div className="flex justify-between items-center pt-6 border-t border-zinc-100 dark:border-zinc-800/20">
                      <div>
                        {orderProposals.length > 0 ? (
                          <span className="text-[11px] font-extrabold uppercase tracking-widest text-zinc-900 dark:text-white bg-zinc-100 dark:bg-zinc-800 px-4 py-1.5 rounded-full">
                            {orderProposals.length} Proposal
                            {orderProposals.length > 1 ? "s" : ""}
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 px-1">
                            Searching factories...
                          </span>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewProposals(co)}
                        className="relative h-12 rounded-full px-8 hover:bg-white dark:bg-zinc-900 hover:text-zinc-950 dark:text-white transition-all"
                      >
                        View Details
                        {hasUnread && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white dark:border-zinc-900 shadow-md"></span>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {isMounted &&
        createPortal(
          <AnimatePresence>
            {selectedCustomOrder && (
              <div className="fixed inset-0 z-[100] overflow-y-auto">
                <div className="min-h-full p-4 lg:p-10 flex items-center justify-center">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 backdrop-blur-md"
                    onClick={handleCloseProposals}
                  />
                  <motion.div
                    initial={{
                      opacity: 0,
                      scale: 0.95,
                      y: 30,
                      filter: "blur(10px)",
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      y: 0,
                      filter: "blur(0px)",
                    }}
                    exit={{
                      opacity: 0,
                      scale: 0.95,
                      y: 30,
                      filter: "blur(10px)",
                    }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl rounded-[2rem] sm:rounded-[3rem] w-full max-w-4xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] overflow-hidden relative z-10 border border-white/20 dark:border-zinc-800/50 flex flex-col max-h-[90vh]"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 sm:p-10 border-b border-zinc-100 dark:border-zinc-800/50 shrink-0">
                      <div className="space-y-1">
                        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                          Custom Sourcing Details
                        </h2>
                        <p className="text-sm text-zinc-500">
                          Request #{selectedCustomOrder.id}
                        </p>
                      </div>
                      <div className="flex w-full sm:w-auto items-center justify-between sm:justify-end gap-2 sm:gap-4">
                        <Button
                          variant={showChat ? "secondary" : "outline"}
                          size="sm"
                          onClick={() => setShowChat(!showChat)}
                          className="relative h-11 sm:h-12 rounded-full px-4 sm:px-8 text-xs sm:text-sm whitespace-nowrap"
                        >
                          <MessageSquare size={18} className="mr-2" />
                          {showChat ? "View Proposals" : "Support Chat"}
                          {unreadMessageOrderIds.includes(
                            selectedCustomOrder.id,
                          ) && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white dark:border-zinc-900 shadow-md"></span>
                          )}
                        </Button>
                        <button
                          onClick={handleCloseProposals}
                          className="p-3 text-zinc-500 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-700 dark:bg-zinc-800 rounded-full transition-all"
                        >
                          <X size={24} />
                        </button>
                      </div>
                    </div>

                    <div className="p-8 sm:p-10 overflow-y-auto custom-scrollbar flex-1 space-y-12">
                      <div className="p-8 bg-zinc-50 dark:bg-zinc-800/40 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800/50 flex flex-col md:flex-row gap-10">
                        {selectedCustomOrder.photo && (
                          <div className="w-full md:w-48 h-64 md:h-48 bg-white dark:bg-zinc-800 rounded-3xl overflow-hidden flex-shrink-0 shadow-lg border border-white dark:border-zinc-700">
                            <img
                              src={selectedCustomOrder.photo}
                              alt="Req"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1 space-y-4">
                          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400 px-1">
                            Global Requirements
                          </span>
                          <p className="text-lg text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">
                            {selectedCustomOrder.requirements}
                          </p>
                        </div>
                      </div>

                      {showChat ? (
                        <div className="h-[500px] border border-zinc-200/50 dark:border-zinc-800/50 rounded-[2.5rem] overflow-hidden bg-white/50 dark:bg-zinc-900/50 shadow-inner">
                          <ChatBox
                            customOrderId={selectedCustomOrder.id}
                            currentUser={currentUser}
                            recipientRole="Admin"
                          />
                        </div>
                      ) : (
                        <div className="space-y-8 pb-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                              Active Proposals
                            </h3>
                            <span className="text-[11px] font-extrabold bg-white dark:bg-zinc-800 text-zinc-950 dark:text-zinc-100 px-4 py-1.5 rounded-full">
                              {
                                getProposalsForOrder(selectedCustomOrder.id)
                                  .length
                              }{" "}
                              UNLOCKED
                            </span>
                          </div>

                          <div className="grid gap-6">
                            {getProposalsForOrder(selectedCustomOrder.id)
                              .length === 0 ? (
                              <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
                                <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-zinc-500 dark:text-zinc-400">
                                  <FileText size={32} />
                                </div>
                                <div>
                                  <h4 className="font-bold text-zinc-900 dark:text-white">
                                    Awaiting Factory Proposals
                                  </h4>
                                  <p className="text-zinc-500 max-w-sm mt-1">
                                    Our global factory network is currently
                                    reviewing your requirements. You'll be
                                    notified as soon as a proposal is sent.
                                  </p>
                                </div>
                              </div>
                            ) : (
                              getProposalsForOrder(selectedCustomOrder.id).map(
                                (p) => (
                                  <Card
                                    key={p.id}
                                    className="p-8 border-0 shadow-xl rounded-[2.5rem] bg-white/80 dark:bg-zinc-800/50 hover:bg-white dark:hover:bg-zinc-800/70 transition-all duration-300"
                                  >
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                                      <div className="space-y-3">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                                          Global Proposal ID: {p.id}
                                        </span>
                                        <div className="flex items-baseline gap-2">
                                          <span className="text-4xl font-mono font-bold tracking-tighter text-zinc-900 dark:text-white">
                                            ₹
                                            {p.price_inr?.toLocaleString() ||
                                              "TBD"}
                                          </span>
                                          <span className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">
                                            per unit
                                          </span>
                                        </div>
                                      </div>
                                      <span
                                        className={cn(
                                          "px-4 py-2 rounded-full text-[10px] font-extrabold uppercase tracking-[0.15em] shadow-sm border",
                                          p.status === "published" &&
                                            "bg-blue-50 text-blue-600 border-blue-200/50 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
                                          p.status === "accepted" &&
                                            "bg-emerald-50 text-emerald-600 border-emerald-200/50 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
                                          p.status === "rejected" &&
                                            "bg-red-50 text-red-600 border-red-200/50 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20",
                                        )}
                                      >
                                        {p.status === "published"
                                          ? "NEEDS REVIEW"
                                          : p.status}
                                      </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6 mb-8">
                                      <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-100 dark:border-zinc-800/50">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-1 block">
                                          Production Time
                                        </span>
                                        <span className="text-lg font-bold text-zinc-900 dark:text-white">
                                          {p.production_time} Working Days
                                        </span>
                                      </div>
                                      <div className="p-4 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/5 dark:text-emerald-400 rounded-2xl border border-emerald-100 dark:border-emerald-500/10">
                                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1 block">
                                          luminbridge Verified
                                        </span>
                                        <span className="text-lg font-bold">
                                          Factory Secured
                                        </span>
                                      </div>
                                    </div>

                                    {p.notes && (
                                      <div className="mb-8 p-6 bg-zinc-50/50 dark:bg-zinc-900/50 rounded-2xl text-sm font-medium text-zinc-600 dark:text-zinc-400 leading-relaxed italic border border-dashed border-zinc-200 dark:border-zinc-700">
                                        "{p.notes}"
                                      </div>
                                    )}

                                    <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t border-zinc-100 dark:border-zinc-800/20">
                                      {p.status === "published" && (
                                        <>
                                          <Button
                                            variant="outline"
                                            onClick={() =>
                                              onRejectProposal(p.id)
                                            }
                                            className="h-14 rounded-2xl px-10 text-red-600 border-red-100 font-bold hover:bg-red-50 transition-all"
                                          >
                                            <XCircle
                                              size={20}
                                              className="mr-2"
                                            />
                                            Reject Deal
                                          </Button>
                                          <Button
                                            onClick={() =>
                                              onAcceptProposal(p.id)
                                            }
                                            className="h-14 rounded-2xl px-12 font-bold shadow-xl shadow-zinc-900/10 transition-all"
                                          >
                                            <Check size={20} className="mr-2" />
                                            Accept & Sign
                                          </Button>
                                        </>
                                      )}

                                      {p.status === "accepted" && (
                                        <Button
                                          variant="outline"
                                          onClick={() =>
                                            generateCustomOrderInvoice(
                                              selectedCustomOrder,
                                              p,
                                              currentUser,
                                            )
                                          }
                                          className="h-14 rounded-2xl px-10 font-bold border-zinc-300 dark:border-zinc-700 shadow-xl"
                                        >
                                          <Download
                                            size={20}
                                            className="mr-2"
                                          />
                                          Download Purchase Order
                                        </Button>
                                      )}
                                    </div>
                                  </Card>
                                ),
                              )
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>
              </div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
};
