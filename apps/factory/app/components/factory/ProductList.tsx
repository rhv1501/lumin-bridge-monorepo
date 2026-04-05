"use client";
import { Button, Card, EmptyState, Skeleton, cn } from "@luminbridge/ui";
import React from 'react';
import { Edit, Trash2, Package, Upload, Plus, Star } from 'lucide-react';
import { Product } from "@luminbridge/types";

interface ProductListProps {
  products: Product[];
  isLoading: boolean;
  onEdit: (product: Product) => void;
  onDelete: (id: number) => Promise<void>;
  onAdd: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ProductList = ({ products, isLoading, onEdit, onDelete, onAdd, onImport }: ProductListProps) => {
  return (
    <div className="space-y-8">
      <div className="flex justify-end gap-3">
        <div className="relative">
          <input 
            type="file" 
            accept=".xlsx,.xls" 
            onChange={onImport}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <Button variant="outline" className="rounded-full">
            <Upload size={16} className="mr-2" />
            Import Excel
          </Button>
        </div>
        <Button onClick={onAdd} className="rounded-full">
          <Plus size={16} className="mr-2" />
          Add Product
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="overflow-hidden border-0 shadow-lg bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl">
              <Skeleton className="w-full aspect-[4/3] rounded-none" />
              <div className="p-5 space-y-4">
                <Skeleton className="w-3/4 h-6 rounded-md" />
                <Skeleton className="w-full h-4 rounded-md" />
                <div className="flex justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800/50">
                  <Skeleton className="w-20 h-8 rounded-md" />
                  <Skeleton className="w-16 h-8 rounded-md" />
                </div>
              </div>
            </Card>
          ))
        ) : products.length === 0 ? (
          <div className="col-span-full py-12">
            <EmptyState 
              icon={Package} 
              title="No products found" 
              description="Add your first product or import from Excel to get started." 
            />
          </div>
        ) : (
          products.map(p => (
            <Card key={p.id} className="overflow-hidden group hover:shadow-xl transition-all duration-500 border-0 shadow-lg bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl flex flex-col h-full rounded-2xl">
              <div className="aspect-[4/3] bg-zinc-100 dark:bg-zinc-800 relative overflow-hidden">
                {p.photo ? (
                  <img 
                    src={p.photo} 
                    alt={p.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-700 dark:text-zinc-300 dark:text-zinc-600">
                    <Package size={48} />
                  </div>
                )}
                
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => onEdit(p)} className="p-2 bg-white/90 dark:bg-zinc-900/90 rounded-full hover:bg-white text-zinc-600"><Edit size={14} /></button>
                  <button onClick={() => onDelete(p.id)} className="p-2 bg-white/90 dark:bg-zinc-900/90 rounded-full hover:bg-white text-red-600"><Trash2 size={14} /></button>
                </div>
                <div className="absolute top-3 left-3">
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm",
                    p.status === 'published' ? "bg-emerald-500 text-zinc-950 dark:text-white" : "bg-amber-500 text-zinc-950 dark:text-white"
                  )}>
                    {p.status}
                  </span>
                </div>
              </div>
              <div className="p-5 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2 gap-2">
                  <h3 className="font-semibold text-base tracking-tight text-zinc-900 dark:text-white line-clamp-1">{p.name}</h3>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-4 flex-1">{p.description}</p>
                <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800/50 mt-auto">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase text-zinc-500 dark:text-zinc-400 mb-0.5">Price</span>
                    <span className="font-mono font-semibold text-base text-zinc-900 dark:text-white">¥{p.factory_price_cny}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-bold uppercase text-zinc-500 dark:text-zinc-400 mb-0.5">MOQ</span>
                    <span className="font-mono font-medium text-xs text-zinc-700 dark:text-zinc-300">{p.moq || 1} units</span>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
