"use client";
import { Button, Card, EmptyState, Input, Skeleton, cn } from "@luminbridge/ui";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Edit, Save, Trash2, X, Package, Star } from "lucide-react";
import { Product, Settings } from "@luminbridge/types";

const productSchema = z.object({
  buyer_price_inr: z.preprocess(
    (val) =>
      val === "" || val === null || val === undefined ? undefined : Number(val),
    z.number().min(0, "Price must be 0 or more").optional(),
  ),
  status: z.enum(["draft", "published"]).optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductTableProps {
  products: Product[];
  isLoading: boolean;
  settings: Settings;
  onUpdate: (id: number, data: Partial<Product>) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export const ProductTable = ({
  products,
  isLoading,
  settings,
  onUpdate,
  onDelete,
}: ProductTableProps) => {
  const [editingProduct, setEditingProduct] = useState<number | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema) as any,
  });

  const handleEdit = (product: Product) => {
    setEditingProduct(product.id);
    reset({
      buyer_price_inr:
        product.buyer_price_inr ||
        parseFloat(
          (
            product.factory_price_cny *
            parseFloat(settings.exchange_rate) *
            parseFloat(settings.admin_markup)
          ).toFixed(2),
        ),
      status: product.status as any,
    });
  };

  const handleCancel = () => {
    setEditingProduct(null);
    reset();
  };

  const onSubmit = async (data: ProductFormData) => {
    if (editingProduct) {
      await onUpdate(editingProduct, {
        ...data,
        buyer_price_inr: data.buyer_price_inr
          ? parseFloat(data.buyer_price_inr.toString())
          : undefined,
      });
      setEditingProduct(null);
    }
  };

  return (
    <Card className="overflow-hidden border-0 shadow-lg bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-[2rem]">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-200/50 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-800/20">
              <th className="p-6 text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                Product
              </th>
              <th className="p-6 text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                Performance
              </th>
              <th className="p-6 text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                Factory
              </th>
              <th className="p-6 text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                F. Price (CNY)
              </th>
              <th className="p-6 text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                B. Price (INR)
              </th>
              <th className="p-6 text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                Status
              </th>
              <th className="p-6 text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-10 h-10 rounded-xl" />
                      <Skeleton className="w-32 h-4 rounded-full" />
                    </div>
                  </td>
                  <td className="p-6">
                    <Skeleton className="w-16 h-4 rounded-full" />
                  </td>
                  <td className="p-6">
                    <Skeleton className="w-24 h-4 rounded-full" />
                  </td>
                  <td className="p-6">
                    <Skeleton className="w-16 h-4 rounded-full" />
                  </td>
                  <td className="p-6">
                    <Skeleton className="w-16 h-4 rounded-full" />
                  </td>
                  <td className="p-6">
                    <Skeleton className="w-20 h-6 rounded-full" />
                  </td>
                  <td className="p-6">
                    <div className="flex justify-end gap-2">
                      <Skeleton className="w-8 h-8 rounded-full" />
                    </div>
                  </td>
                </tr>
              ))
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-12 text-center">
                  <EmptyState
                    icon={Package}
                    title="No products"
                    description="No products have been added yet."
                  />
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr
                  key={p.id}
                  className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/70 dark:bg-zinc-800/30 transition-colors group"
                >
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                      {p.photo && (
                        <img
                          src={p.photo}
                          alt={p.name}
                          className="w-10 h-10 object-cover rounded-xl shadow-sm"
                        />
                      )}
                      <span className="font-semibold text-zinc-900">
                        {p.name}
                      </span>
                    </div>
                  </td>
                  <td className="p-6">
                    {p.average_rating ? (
                      <div className="flex items-center text-amber-500 font-bold text-xs">
                        <Star size={12} className="fill-current mr-1" />
                        {p.average_rating.toFixed(1)}
                        <span className="text-zinc-500 dark:text-zinc-400 font-normal ml-1">
                          ({p.review_count})
                        </span>
                      </div>
                    ) : (
                      <span className="text-zinc-500 dark:text-zinc-400 text-xs italic">
                        Brand New
                      </span>
                    )}
                  </td>
                  <td className="p-6 text-sm text-zinc-500 font-medium">
                    {p.factory_company}
                  </td>
                  <td className="p-6 font-mono text-sm text-zinc-500 dark:text-zinc-400">
                    ¥{p.factory_price_cny}
                  </td>
                  <td className="p-6 font-mono text-sm font-bold text-zinc-900">
                    {editingProduct === p.id ? (
                      <Input
                        type="number"
                        step="0.01"
                        {...register("buyer_price_inr")}
                        className="w-28 h-10 rounded-xl"
                      />
                    ) : (
                      <span>
                        ₹{p.buyer_price_inr?.toLocaleString() || "N/A"}
                      </span>
                    )}
                  </td>
                  <td className="p-6">
                    {editingProduct === p.id ? (
                      <select
                        {...register("status")}
                        defaultValue={p.status}
                        className="px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white outline-none"
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                      </select>
                    ) : (
                      <span
                        className={cn(
                          "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center",
                          p.status === "published"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700",
                        )}
                      >
                        {p.status}
                      </span>
                    )}
                  </td>
                  <td className="p-6 text-right">
                    {editingProduct === p.id ? (
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancel}
                          className="rounded-full h-8 w-8 p-0"
                        >
                          <X size={14} />
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleSubmit(onSubmit)}
                          className="rounded-full h-8 w-8 p-0"
                        >
                          <Save size={14} />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(p)}
                          className="rounded-full h-8 w-8 p-0"
                        >
                          <Edit size={14} />
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => onDelete(p.id)}
                          className="rounded-full h-8 w-8 p-0"
                        >
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
  );
};
