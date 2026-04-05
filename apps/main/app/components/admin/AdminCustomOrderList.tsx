"use client";
import { generateCustomOrderInvoice } from "@luminbridge/db/client";
import { Button, Card, EmptyState, Input, Skeleton, cn } from "@luminbridge/ui";
import React, { useState } from 'react';
import { FileText, X, MessageSquare, ChevronDown, Download } from 'lucide-react';
import { CustomOrder, CustomOrderProposal, User } from "@luminbridge/types";
import { ChatBox } from "@/components/ChatBox";

interface AdminCustomOrderListProps {
  customOrders: CustomOrder[];
  proposals: CustomOrderProposal[];
  isLoading: boolean;
  currentUser: User;
  factories: User[];
  unreadMessageOrderIds?: number[];
  onPublishProposal: (proposalId: number, priceInr: number) => Promise<void>;
  onUpdateStatus: (orderId: number, status: string) => Promise<void>;
}

export const AdminCustomOrderList = ({ customOrders, proposals, isLoading, currentUser, factories, unreadMessageOrderIds = [], onPublishProposal, onUpdateStatus }: AdminCustomOrderListProps) => {
  const [selectedCustomOrder, setSelectedCustomOrder] = useState<CustomOrder | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [chatRecipientId, setChatRecipientId] = useState<number | null>(null);
  const [chatRecipientRole, setChatRecipientRole] = useState<string>('');
  const [showFactoryDropdown, setShowFactoryDropdown] = useState(false);
  const [editingProposalId, setEditingProposalId] = useState<number | null>(null);
  const [proposalPriceInr, setProposalPriceInr] = useState<string>('');

  const handleViewDetails = (order: CustomOrder) => {
    setSelectedCustomOrder(order);
    setShowChat(false);
    setChatRecipientId(null);
    setShowFactoryDropdown(false);
  };

  const handleCloseDetails = () => {
    setSelectedCustomOrder(null);
    setShowChat(false);
    setChatRecipientId(null);
    setShowFactoryDropdown(false);
  };

  const openChatWithBuyer = () => {
    if (selectedCustomOrder) {
      setChatRecipientId(selectedCustomOrder.buyer_id);
      setChatRecipientRole('Buyer');
      setShowChat(true);
      setShowFactoryDropdown(false);
    }
  };

  const openChatWithFactory = (factoryId: number) => {
    setChatRecipientId(factoryId);
    setChatRecipientRole('Factory');
    setShowChat(true);
    setShowFactoryDropdown(false);
  };

  const getProposalsForOrder = (orderId: number) => {
    return proposals.filter(p => p.custom_order_id === orderId);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="overflow-hidden border-0 shadow-lg bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-[2rem]">
              <div className="flex gap-4 p-6">
                <Skeleton className="w-24 h-24 rounded-[2rem]" />
                <div className="flex-1 space-y-3">
                  <Skeleton className="w-3/4 h-6 rounded-full" />
                  <Skeleton className="w-1/2 h-4 rounded-full" />
                  <Skeleton className="w-20 h-6 rounded-full" />
                </div>
              </div>
            </Card>
          ))
        ) : customOrders.length === 0 ? (
          <div className="col-span-full">
            <EmptyState 
              icon={FileText} 
              title="No custom requests" 
              description="There are no custom manufacturing requests in the system." 
            />
          </div>
        ) : (
          customOrders.map(co => (
            <Card key={co.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-[2rem] group h-full flex flex-col">
              <div className="p-6 flex gap-6 flex-1">
                <div className="w-32 h-32 bg-zinc-100 dark:bg-zinc-800 rounded-3xl overflow-hidden flex-shrink-0 shadow-inner">
                  {co.photo ? (
                    <img src={co.photo} alt="Requirement" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-700 dark:text-zinc-300 dark:text-zinc-600">
                      <FileText size={40} strokeWidth={1} />
                    </div>
                  )}
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase text-zinc-500 dark:text-zinc-400 tracking-widest">Request #{co.id}</span>
                        {unreadMessageOrderIds.includes(co.id) && (
                          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                        )}
                      </div>
                      <span className={cn(
                        "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        co.status === 'pending' && "bg-amber-100 text-amber-700",
                        co.status === 'proposal_sent' && "bg-blue-100 text-blue-700",
                        co.status === 'accepted' && "bg-emerald-100 text-emerald-700",
                        co.status === 'rejected' && "bg-red-100 text-red-700"
                      )}>
                        {co.status}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-500 line-clamp-2 leading-relaxed mb-4">{co.requirements}</p>
                  </div>
                  <div className="flex justify-end">
                    <Button size="sm" onClick={() => handleViewDetails(co)} className="rounded-full px-6">
                      Manage
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {selectedCustomOrder && (
        <div className="fixed inset-0 bg-white dark:bg-zinc-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8 relative border-0 shadow-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl rounded-[3rem] custom-scrollbar">
            <button 
              onClick={handleCloseDetails}
              className="absolute top-8 right-8 p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-100 dark:bg-zinc-800 transition-colors"
            >
              <X size={20} className="text-zinc-500 dark:text-zinc-400" />
            </button>
            
            <div className="flex justify-between items-center mb-8 pr-12">
              <h2 className="text-2xl font-bold tracking-tight">Requirement Overview</h2>
              {!showChat && (
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm" onClick={openChatWithBuyer} className="rounded-full px-4">
                    <MessageSquare size={16} className="mr-2" />
                    Buyer
                  </Button>
                  <div className="relative">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setShowFactoryDropdown(!showFactoryDropdown)}
                      className="rounded-full px-4"
                    >
                      <MessageSquare size={16} className="mr-2" />
                      Factory
                      <ChevronDown size={14} className="ml-1.5" />
                    </Button>
                    {showFactoryDropdown && (
                      <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-800 rounded-2xl shadow-xl border border-zinc-100 dark:border-zinc-700 z-10 py-2">
                        {factories.map(factory => (
                          <button
                            key={factory.id}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
                            onClick={() => openChatWithFactory(factory.id)}
                          >
                            {factory.company_name || factory.email}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
              <div className="md:col-span-1">
                <div className="aspect-square bg-zinc-100 dark:bg-zinc-800 rounded-3xl overflow-hidden shadow-inner">
                  {selectedCustomOrder.photo ? (
                    <img src={selectedCustomOrder.photo} alt="Requirement" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-700 dark:text-zinc-300">
                      <FileText size={48} strokeWidth={1} />
                    </div>
                  )}
                </div>
              </div>
              <div className="md:col-span-2 flex flex-col justify-between">
                <div>
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-2">Description</h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed bg-zinc-50 dark:bg-zinc-800/50 p-6 rounded-3xl border border-zinc-100">
                    {selectedCustomOrder.requirements}
                  </p>
                </div>
                <div className="flex gap-4 mt-6">
                  {selectedCustomOrder.status === 'pending' && (
                    <>
                      <Button variant="outline" className="flex-1 rounded-2xl" onClick={() => onUpdateStatus(selectedCustomOrder.id, 'rejected')}>Reject</Button>
                      <Button className="flex-1 rounded-2xl" onClick={() => onUpdateStatus(selectedCustomOrder.id, 'sourcing')}>Source Factories</Button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {showChat && chatRecipientId ? (
              <div className="h-[450px]">
                <ChatBox 
                  customOrderId={selectedCustomOrder.id} 
                  currentUser={currentUser} 
                  recipientId={chatRecipientId}
                  recipientRole={chatRecipientRole}
                />
              </div>
            ) : (
              <div className="space-y-6">
                <h3 className="text-lg font-bold tracking-tight flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-white dark:bg-zinc-900 dark:bg-white rounded-full"></span>
                  Factory Proposals
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {getProposalsForOrder(selectedCustomOrder.id).length === 0 ? (
                    <div className="py-12 text-center text-zinc-500 dark:text-zinc-400 italic bg-zinc-50/50 rounded-3xl border border-dashed">
                      Waiting for factory responses...
                    </div>
                  ) : (
                    getProposalsForOrder(selectedCustomOrder.id).map(p => (
                      <Card key={p.id} className="p-6 border-0 shadow-md bg-white dark:bg-zinc-800/30 rounded-3xl">
                        <div className="flex justify-between items-center mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-xs font-bold font-mono">
                              {p.factory_id}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Factory Proposal</p>
                              <p className="text-xl font-mono font-bold">¥{p.price_cny} <span className="text-xs font-normal text-zinc-500 dark:text-zinc-400">/ unit</span></p>
                            </div>
                          </div>
                          <div className="text-right">
                            {editingProposalId === p.id ? (
                              <div className="flex items-center gap-2">
                                <Input 
                                  placeholder="Pub. INR Price" 
                                  className="w-32 h-10 rounded-xl"
                                  value={proposalPriceInr}
                                  onChange={(e) => setProposalPriceInr(e.target.value)}
                                />
                                <Button size="sm" className="rounded-xl h-10" onClick={() => {
                                  onPublishProposal(p.id, parseFloat(proposalPriceInr));
                                  setEditingProposalId(null);
                                }}>Push</Button>
                              </div>
                            ) : p.status === 'pending' ? (
                              <Button size="sm" className="rounded-full" onClick={() => setEditingProposalId(p.id)}>Publish to Buyer</Button>
                            ) : (
                              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                Published @ ₹{p.price_inr}
                              </span>
                            )}
                          </div>
                        </div>
                        {p.notes && <p className="text-xs text-zinc-500 italic mt-2">"{p.notes}"</p>}
                      </Card>
                    ))
                  )}
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
    </>
  );
};
