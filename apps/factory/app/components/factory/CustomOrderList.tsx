"use client";
import { generateCustomOrderInvoice } from "@luminbridge/db/client";
import { Button, Card, EmptyState, Input, Skeleton, cn } from "@luminbridge/ui";
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { FileText, X, Send, MessageSquare, Download } from 'lucide-react';
import { CustomOrder, CustomOrderProposal, User } from "@luminbridge/types";
import { ChatBox } from "@/components/ChatBox";

const proposalSchema = z.object({
  price_cny: z.number().min(0.01, 'Price must be greater than 0'),
  production_time: z.number().int().min(1, 'Production time must be at least 1 day'),
  notes: z.string().optional(),
});

type ProposalFormData = z.infer<typeof proposalSchema>;

interface CustomOrderListProps {
  customOrders: CustomOrder[];
  proposals: CustomOrderProposal[];
  isLoading: boolean;
  currentUser: User;
  onSubmitProposal: (customOrderId: number, data: any) => Promise<void>;
  unreadMessageOrderIds?: number[];
}

export const CustomOrderList = ({ customOrders, proposals, isLoading, currentUser, onSubmitProposal, unreadMessageOrderIds = [] }: CustomOrderListProps) => {
  const [selectedCustomOrder, setSelectedCustomOrder] = useState<CustomOrder | null>(null);
  const [showChat, setShowChat] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProposalFormData>({
    resolver: zodResolver(proposalSchema),
    defaultValues: {
      price_cny: 0,
      production_time: 1,
      notes: ''
    }
  });

  const handleOpenProposal = (order: CustomOrder) => {
    setSelectedCustomOrder(order);
    setShowChat(hasSubmittedProposal(order.id));
    reset();
  };

  const handleCloseProposal = () => {
    setSelectedCustomOrder(null);
    setShowChat(false);
    reset();
  };

  const onFormSubmit = async (data: ProposalFormData) => {
    if (selectedCustomOrder) {
      await onSubmitProposal(selectedCustomOrder.id, data);
      handleCloseProposal();
    }
  };

  const hasSubmittedProposal = (orderId: number) => {
    return proposals.some(p => p.custom_order_id === orderId && p.factory_id === currentUser.id);
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
          customOrders.map(co => {
            const submitted = hasSubmittedProposal(co.id);
            return (
              <Card key={co.id} className="overflow-hidden border-0 shadow-lg bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl hover:shadow-xl transition-all duration-300 rounded-[2rem] group">
                <div className="p-6 flex gap-6">
                  <div className="w-32 h-32 bg-zinc-100 dark:bg-zinc-800 rounded-2xl overflow-hidden flex-shrink-0">
                    {co.photo ? (
                      <img src={co.photo} alt="Requirement" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-700 dark:text-zinc-300">
                        <FileText size={32} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Request #{co.id}</span>
                        <span className={cn(
                          "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase",
                          co.status === 'pending' && "bg-amber-100 text-amber-700",
                          co.status === 'accepted' && "bg-emerald-100 text-emerald-700"
                        )}>
                          {co.status}
                        </span>
                      </div>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-3 mb-4">{co.requirements}</p>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button size="sm" onClick={() => handleOpenProposal(co)} className="rounded-full">
                        {submitted ? 'View & Chat' : 'Submit Proposal'}
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
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <Card className="w-full max-w-lg p-8 relative bg-white/90 dark:bg-zinc-900/90 backdrop-blur-2xl rounded-[2rem] border-0">
            <button onClick={handleCloseProposal} className="absolute top-6 right-6 p-2 rounded-full hover:bg-zinc-100">
              <X size={20} />
            </button>
            <h2 className="text-2xl font-semibold mb-8">Details</h2>
            
            {hasSubmittedProposal(selectedCustomOrder.id) ? (
              <div className="space-y-6">
                {proposals.filter(p => p.custom_order_id === selectedCustomOrder.id && p.factory_id === currentUser.id).map(p => (
                  <div key={p.id} className="p-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl space-y-3">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Price (CNY)</span>
                      <span className="font-bold">¥{p.price_cny}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Production Time</span>
                      <span className="font-medium">{p.production_time} days</span>
                    </div>
                    {p.status === 'accepted' && (
                      <Button size="sm" variant="outline" onClick={() => generateCustomOrderInvoice(selectedCustomOrder, p, currentUser)} className="w-full">
                        <Download size={16} className="mr-2" /> Download PO
                      </Button>
                    )}
                  </div>
                ))}
                <ChatBox customOrderId={selectedCustomOrder.id} currentUser={currentUser} recipientRole="Admin" />
              </div>
            ) : (
              <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-5">
                <Input label="Price (CNY)" type="number" step="0.01" {...register('price_cny', { valueAsNumber: true })} />
                <Input label="Production Time (Days)" type="number" {...register('production_time', { valueAsNumber: true })} />
                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={handleCloseProposal}>Cancel</Button>
                  <Button type="submit">Send Proposal</Button>
                </div>
              </form>
            )}
          </Card>
        </div>
      )}
    </>
  );
};
