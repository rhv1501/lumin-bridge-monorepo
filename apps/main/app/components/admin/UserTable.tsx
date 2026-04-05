"use client";
import { Button, Card, EmptyState, Input, Skeleton, cn } from "@luminbridge/ui";
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Edit, Save, Trash2, X, Users } from 'lucide-react';
import { User } from "@luminbridge/types";

const userSchema = z.object({
  company_name: z.string().optional(),
  mobile_number: z.string().optional(),
  wechat_id: z.string().optional(),
});

type UserFormData = z.infer<typeof userSchema>;

interface UserTableProps {
  users: User[];
  isLoading: boolean;
  onUpdate: (id: number, data: Partial<User>) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export const UserTable = ({ users, isLoading, onUpdate, onDelete }: UserTableProps) => {
  const [editingUser, setEditingUser] = useState<number | null>(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<UserFormData>({
    resolver: zodResolver(userSchema)
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const totalPages = Math.ceil(users.length / itemsPerPage);
  const paginatedUsers = users.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleEdit = (user: User) => {
    setEditingUser(user.id);
    reset({
      company_name: user.company_name || '',
      mobile_number: user.mobile_number || '',
      wechat_id: user.wechat_id || ''
    });
  };

  const handleCancel = () => {
    setEditingUser(null);
    reset();
  };

  const onSubmit = async (data: UserFormData) => {
    if (editingUser) {
      await onUpdate(editingUser, data);
      setEditingUser(null);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden border-0 shadow-lg bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-[2rem]">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200/50 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-800/20">
                <th className="p-6 text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">ID</th>
                <th className="p-6 text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">User Profile</th>
                <th className="p-6 text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">Role</th>
                <th className="p-6 text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">Contact Details</th>
                <th className="p-6 text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="p-6"><Skeleton className="w-8 h-4 rounded-full" /></td>
                    <td className="p-6"><div className="space-y-2"><Skeleton className="w-32 h-4 rounded-full" /><Skeleton className="w-48 h-3 rounded-full" /></div></td>
                    <td className="p-6"><Skeleton className="w-20 h-6 rounded-full" /></td>
                    <td className="p-6"><div className="space-y-2"><Skeleton className="w-24 h-4 rounded-full" /><Skeleton className="w-24 h-4 rounded-full" /></div></td>
                    <td className="p-6"><div className="flex justify-end gap-2"><Skeleton className="w-8 h-8 rounded-full" /></div></td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center">
                    <EmptyState 
                      icon={Users} 
                      title="No users found" 
                      description="There are currently no users in the platform." 
                    />
                  </td>
                </tr>
              ) : (
                paginatedUsers.map(u => (
                  <tr key={u.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-100 dark:bg-zinc-800/30 transition-colors group">
                    <td className="p-6 font-mono text-xs text-zinc-500">#{u.id}</td>
                    <td className="p-6">
                      {editingUser === u.id ? (
                        <div className="space-y-2 max-w-xs">
                          <Input {...register('company_name')} placeholder="Company Name" className="text-sm h-10 rounded-xl" />
                          <div className="text-xs text-zinc-500 dark:text-zinc-400 pl-2">{u.email}</div>
                        </div>
                      ) : (
                        <div>
                          <div className="font-semibold text-zinc-900 dark:text-zinc-100">{u.company_name || 'Individual'}</div>
                          <div className="text-sm text-zinc-500">{u.email}</div>
                        </div>
                      )}
                    </td>
                    <td className="p-6">
                      <span className={cn(
                        "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center",
                        u.role === 'admin' && "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400",
                        u.role === 'factory' && "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
                        u.role === 'buyer' && "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                      )}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-6">
                      {editingUser === u.id ? (
                        <div className="space-y-2 max-w-xs">
                          <Input {...register('mobile_number')} placeholder="Mobile" className="text-sm h-10 rounded-xl" />
                          <Input {...register('wechat_id')} placeholder="WeChat" className="text-sm h-10 rounded-xl" />
                        </div>
                      ) : (
                        <div className="text-sm space-y-1">
                          {u.mobile_number && <div className="text-zinc-700 dark:text-zinc-300">📱 {u.mobile_number}</div>}
                          {u.wechat_id && <div className="text-zinc-500">💬 {u.wechat_id}</div>}
                          {!u.mobile_number && !u.wechat_id && <span className="text-zinc-500 dark:text-zinc-400 italic">No contact info</span>}
                        </div>
                      )}
                    </td>
                    <td className="p-6 text-right">
                      {editingUser === u.id ? (
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={handleCancel} className="rounded-full h-8 w-8 p-0">
                            <X size={14} />
                          </Button>
                          <Button size="sm" onClick={handleSubmit(onSubmit)} className="rounded-full h-8 w-8 p-0">
                            <Save size={14} />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(u)} className="rounded-full h-8 w-8 p-0">
                            <Edit size={14} />
                          </Button>
                          <Button size="sm" variant="danger" onClick={() => onDelete(u.id)} className="rounded-full h-8 w-8 p-0">
                            <Trash2 size={14} />
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
      
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-2">
          <div className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="rounded-full px-4">
              Prev
            </Button>
            <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="rounded-full px-4">
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
