"use client";
import { Button, Input, cn } from "@luminbridge/ui";
import React, { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import { Message, User } from "@luminbridge/types";

interface ChatBoxProps {
  customOrderId: number;
  currentUser: User;
  recipientId?: number;
  recipientRole: string;
}

export const ChatBox = ({ customOrderId, currentUser, recipientId, recipientRole }: ChatBoxProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessageContent, setNewMessageContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/messages?custom_order_id=${customOrderId}`);
      const data = await res.json();
      
      // Filter if needed for admin view
      const filteredData = currentUser.role === 'admin' && recipientId
        ? data.filter((m: Message) => m.sender_id === recipientId || m.receiver_id === recipientId)
        : data;
      setMessages(filteredData);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    
    // Listen for new messages via window event (published by NotificationBell or similar)
    const handleNewMessage = (e: any) => {
      const msg = e.detail;
      if (msg.custom_order_id === customOrderId) {
        setMessages(prev => [...prev, msg]);
      }
    };

    window.addEventListener('new_message', handleNewMessage);
    return () => window.removeEventListener('new_message', handleNewMessage);
  }, [customOrderId, currentUser.id, recipientId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageContent.trim()) return;

    try {
      // Find admin if needed
      let rId = recipientId;
      if (!rId && currentUser.role !== 'admin') {
        const res = await fetch('/api/users?role=admin');
        const admins = await res.json();
        if (admins.length > 0) rId = admins[0].id;
      }

      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          custom_order_id: customOrderId,
          sender_id: currentUser.id,
          receiver_id: rId || 0,
          content: newMessageContent.trim()
        })
      });

      if (res.ok) {
        const sentMsg = await res.json();
        setMessages(prev => [...prev, sentMsg]);
        setNewMessageContent('');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  if (isLoading) {
    return <div className="p-4 text-center text-zinc-500 dark:text-zinc-400">Loading messages...</div>;
  }

  return (
    <div className="flex flex-col h-[450px] bg-zinc-950/50 rounded-[2rem] border border-white/5 overflow-hidden shadow-2xl backdrop-blur-xl">
      <div className="bg-zinc-900/80 p-5 border-b border-zinc-800/50 backdrop-blur-md z-10">
        <h4 className="font-semibold text-sm tracking-tight text-white">Chat with {recipientRole}</h4>
      </div>
      
      <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-sm text-zinc-400 dark:text-zinc-500 font-medium text-center px-4">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === currentUser.id;
            return (
              <div key={msg.id} className={cn("flex flex-col", isMe ? "items-end" : "items-start")}>
                <div className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed shadow-sm",
                  isMe 
                    ? "bg-zinc-50 text-zinc-900 rounded-br-sm" 
                    : "bg-zinc-800 border border-zinc-700/50 text-zinc-200 rounded-bl-sm"
                )}>
                  {msg.content}
                </div>
                <span className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500 mt-1.5 px-1">
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="p-4 bg-zinc-900/80 border-t border-zinc-800/50 flex gap-3 backdrop-blur-md z-10">
        <Input 
          value={newMessageContent}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewMessageContent(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 rounded-full bg-zinc-800/50 border-transparent focus:bg-zinc-800"
        />
        <Button type="submit" disabled={!newMessageContent.trim()} className="rounded-full w-10 h-10 p-0 flex items-center justify-center shrink-0">
          <Send size={16} className="ml-0.5" strokeWidth={2} />
        </Button>
      </form>
    </div>
  );
};
