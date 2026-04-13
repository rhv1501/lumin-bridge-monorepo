"use client";
import { generateCustomOrderInvoice } from "@luminbridge/db/client";
import { Button, Card, EmptyState, Input, Skeleton, cn } from "@luminbridge/ui";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { FileText, X, Send, MessageSquare, Download } from "lucide-react";
import { CustomOrder, CustomOrderProposal, User } from "@luminbridge/types";
import { ChatBox } from "@/components/ChatBox";

const proposalSchema = z.object({
  price_cny: z.number().min(0.01, "Price must be greater than 0"),
  production_time: z
    .number()
    .int()
    .min(1, "Production time must be at least 1 day"),
  notes: z.string().optional(),
});

type ProposalFormData = z.infer<typeof proposalSchema>;

interface CustomOrderListProps {
  customOrders: CustomOrder[];
  proposals: CustomOrderProposal[];
  isLoading: boolean;
  currentUser: User;
  onSubmitProposal: (customOrderId: number, data: any) => Promise<boolean>;
  unreadMessageOrderIds?: number[];
}

export const CustomOrderList = ({
  customOrders,
  proposals,
  isLoading,
  currentUser,
  onSubmitProposal,
  unreadMessageOrderIds = [],
}: CustomOrderListProps) => {
  const [selectedCustomOrder, setSelectedCustomOrder] =
    useState<CustomOrder | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [isSubmittingProposal, setIsSubmittingProposal] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProposalFormData>({
    resolver: zodResolver(proposalSchema),
    defaultValues: {
      price_cny: 0,
      production_time: 1,
      notes: "",
    },
  });

  const handleOpenProposal = (order: CustomOrder) => {
    const submitted = hasSubmittedProposal(order.id);
    const existing = getFactoryProposal(order.id);

    setSelectedCustomOrder(order);
    setShowChat(submitted);
    setShowProposalForm(!submitted);
    reset({
      price_cny: existing?.price_cny ? Number(existing.price_cny) : 0,
      production_time: existing?.production_time ?? 1,
      notes: existing?.notes ?? "",
    });
  };

  const handleCloseProposal = () => {
    setSelectedCustomOrder(null);
    setShowChat(false);
    setShowProposalForm(false);
    reset();
  };

  const onFormSubmit = async (data: ProposalFormData) => {
    if (selectedCustomOrder) {
      setIsSubmittingProposal(true);
      try {
        const ok = await onSubmitProposal(selectedCustomOrder.id, data);
        if (ok) {
          handleCloseProposal();
        }
      } finally {
        setIsSubmittingProposal(false);
      }
    }
  };

  const hasSubmittedProposal = (orderId: number) => {
    return proposals.some(
      (p) => p.custom_order_id === orderId && p.factory_id === currentUser.id,
    );
  };

  const getFactoryProposal = (orderId: number) => {
    return proposals.find(
      (p) => p.custom_order_id === orderId && p.factory_id === currentUser.id,
    );
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="flex gap-4 p-4">
                <Skeleton className="w-24 h-24 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="w-3/4 h-6" />
                </div>
              </div>
            </Card>
          ))
        ) : customOrders.length === 0 ? (
          <div className="col-span-full">
            <EmptyState
              icon={FileText}
              title="No custom orders"
              description="No custom order requests available."
            />
          </div>
        ) : (
          customOrders.map((co) => {
            const submitted = hasSubmittedProposal(co.id);
            const isNewForFactory = !submitted;
            return (
              <Card
                key={co.id}
                className="overflow-hidden border-0 shadow-lg bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl hover:shadow-xl transition-all duration-300 rounded-4xl group"
              >
                <div className="p-6 flex gap-6">
                  <div className="w-32 h-32 bg-zinc-100 dark:bg-zinc-800 rounded-2xl overflow-hidden shrink-0">
                    {co.photo ? (
                      <img
                        src={co.photo}
                        alt="Requirement"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-700 dark:text-zinc-300">
                        <FileText size={32} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">
                          Request #{co.id}
                        </span>
                        <span
                          className={cn(
                            "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase",
                            co.status === "pending" &&
                              "bg-amber-100 text-amber-700",
                            co.status === "accepted" &&
                              "bg-emerald-100 text-emerald-700",
                          )}
                        >
                          {co.status}
                        </span>
                      </div>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-3 mb-4">
                        {co.requirements}
                      </p>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleOpenProposal(co)}
                        className="rounded-full"
                      >
                        {isNewForFactory ? "Submit Proposal" : "View & Chat"}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {selectedCustomOrder && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-zinc-950/20 p-3 backdrop-blur-sm sm:items-center sm:p-6 dark:bg-zinc-900/70">
          <Card className="relative flex w-full max-w-lg flex-col overflow-hidden rounded-4xl border-0 bg-white/95 p-5 shadow-2xl backdrop-blur-2xl sm:max-h-[calc(100dvh-3rem)] sm:p-8 dark:bg-zinc-900/95">
            <button
              onClick={handleCloseProposal}
              className="absolute right-4 top-4 rounded-full bg-zinc-100 p-2 text-zinc-500 transition-colors hover:bg-zinc-200 hover:text-zinc-700 sm:right-6 sm:top-6 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 dark:hover:text-zinc-100"
            >
              <X size={20} />
            </button>
            <div className="flex min-h-0 flex-1 flex-col pt-6 sm:pt-0">
              <h2 className="mb-5 pr-10 text-2xl font-semibold text-zinc-900 sm:mb-8 dark:text-white">
                Details
              </h2>

              <div className="min-h-0 flex-1 overflow-y-auto pr-1 sm:pr-2">
                {showProposalForm ? (
                  <form
                    onSubmit={handleSubmit(onFormSubmit)}
                    className="space-y-5 pb-2"
                  >
                    <Input
                      label="Price (CNY)"
                      type="number"
                      step="0.01"
                      {...register("price_cny", { valueAsNumber: true })}
                    />
                    <Input
                      label="Production Time (Days)"
                      type="number"
                      {...register("production_time", { valueAsNumber: true })}
                    />
                    <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row sm:justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        disabled={isSubmittingProposal}
                        onClick={() => {
                          setShowProposalForm(false);
                          setShowChat(
                            hasSubmittedProposal(selectedCustomOrder.id),
                          );
                        }}
                      >
                        Back
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmittingProposal}
                        loading={isSubmittingProposal}
                      >
                        Send Proposal
                      </Button>
                    </div>
                  </form>
                ) : hasSubmittedProposal(selectedCustomOrder.id) ? (
                  <div className="space-y-6 pb-2">
                    {proposals
                      .filter(
                        (p) =>
                          p.custom_order_id === selectedCustomOrder.id &&
                          p.factory_id === currentUser.id,
                      )
                      .map((p) => (
                        <div
                          key={p.id}
                          className="space-y-3 rounded-2xl bg-zinc-50 p-6 dark:bg-zinc-800/50"
                        >
                          <div className="flex justify-between gap-4">
                            <span className="text-zinc-500 dark:text-zinc-400">
                              Price (CNY)
                            </span>
                            <span className="font-bold text-zinc-900 dark:text-zinc-100">
                              ¥{p.price_cny}
                            </span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span className="text-zinc-500 dark:text-zinc-400">
                              Production Time
                            </span>
                            <span className="font-medium text-zinc-900 dark:text-zinc-100">
                              {p.production_time} days
                            </span>
                          </div>
                          {p.status === "accepted" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                generateCustomOrderInvoice(
                                  selectedCustomOrder,
                                  p,
                                  currentUser,
                                )
                              }
                              className="w-full"
                            >
                              <Download size={16} className="mr-2" /> Download
                              PO
                            </Button>
                          )}
                        </div>
                      ))}
                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        disabled={isSubmittingProposal}
                        onClick={() => {
                          const existing = getFactoryProposal(
                            selectedCustomOrder.id,
                          );
                          setShowProposalForm(true);
                          setShowChat(false);
                          reset({
                            price_cny: existing?.price_cny
                              ? Number(existing.price_cny)
                              : 0,
                            production_time: existing?.production_time ?? 1,
                            notes: existing?.notes ?? "",
                          });
                        }}
                      >
                        Update Proposal
                      </Button>
                    </div>
                    <div className="pb-1">
                      <ChatBox
                        customOrderId={selectedCustomOrder.id}
                        currentUser={currentUser}
                        recipientRole="Admin"
                      />
                    </div>
                  </div>
                ) : (
                  <form
                    onSubmit={handleSubmit(onFormSubmit)}
                    className="space-y-5 pb-2"
                  >
                    <Input
                      label="Price (CNY)"
                      type="number"
                      step="0.01"
                      {...register("price_cny", { valueAsNumber: true })}
                    />
                    <Input
                      label="Production Time (Days)"
                      type="number"
                      {...register("production_time", { valueAsNumber: true })}
                    />
                    <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row sm:justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        disabled={isSubmittingProposal}
                        onClick={handleCloseProposal}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmittingProposal}
                        loading={isSubmittingProposal}
                      >
                        Send Proposal
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  );
};
