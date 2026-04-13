"use client";
import { Button, Card, EmptyState, Skeleton, cn } from "@luminbridge/ui";
import React from "react";
import { ShoppingBag, Package, Star } from "lucide-react";
import { Product } from "@luminbridge/types";

interface ProductGridProps {
  products: Product[];
  isLoading: boolean;
  onSelect: (product: Product) => void;
}

export const ProductGrid = ({
  products,
  isLoading,
  onSelect,
}: ProductGridProps) => {
  const handleCardKeyDown = (
    e: React.KeyboardEvent<HTMLElement>,
    product: Product,
  ) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect(product);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
      {isLoading ? (
        Array.from({ length: 8 }).map((_, i) => (
          <Card
            key={i}
            className="overflow-hidden border-0 shadow-lg bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-[2rem]"
          >
            <Skeleton className="w-full h-64 rounded-none" />
            <div className="p-6 space-y-5">
              <Skeleton className="w-3/4 h-7 rounded-lg" />
              <div className="flex justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800/50">
                <Skeleton className="w-20 h-6 rounded-md" />
                <Skeleton className="w-16 h-6 rounded-md" />
              </div>
            </div>
          </Card>
        ))
      ) : products.length === 0 ? (
        <div className="col-span-full py-12">
          <EmptyState
            icon={Package}
            title="No products found"
            description="Check back later for new products."
          />
        </div>
      ) : (
        products.map((p) => (
          <Card
            key={p.id}
            onClick={() => onSelect(p)}
            onKeyDown={(e) => handleCardKeyDown(e, p)}
            role="button"
            tabIndex={0}
            aria-label={`Open product details for ${p.name}`}
            className="overflow-hidden group border-0 shadow-lg hover:shadow-xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-[2rem] transition-all duration-500 flex flex-col h-full"
          >
            <div className="aspect-[4/3] bg-zinc-100 dark:bg-zinc-800/50 relative overflow-hidden">
              {p.photo ? (
                <>
                  <img
                    src={p.photo}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-700 dark:text-zinc-300 group-hover:scale-105 transition-transform duration-700">
                  <Package size={48} strokeWidth={1} />
                </div>
              )}
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(p);
                  }}
                  className="shadow-lg bg-white/90 dark:bg-zinc-900/90 text-zinc-900 dark:text-white rounded-full px-4"
                >
                  <ShoppingBag size={14} className="mr-2" />
                  Buy Now
                </Button>
              </div>
            </div>
            <div className="p-6 flex flex-col flex-1">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 line-clamp-1 text-lg">
                  {p.name}
                </h3>
                {p.average_rating ? (
                  <div className="flex items-center text-amber-500 bg-amber-50 dark:bg-amber-500/10 px-2 py-1 rounded-full text-[10px] font-bold ml-2 shrink-0">
                    <Star size={10} className="fill-current mr-1" />
                    {p.average_rating.toFixed(1)}
                  </div>
                ) : null}
              </div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-6 leading-relaxed flex-1">
                {p.description}
              </p>
              <div className="flex items-center justify-between pt-5 border-t border-zinc-100 dark:border-zinc-800/50 mt-auto">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase text-zinc-500 dark:text-zinc-400 mb-1">
                    Price
                  </span>
                  <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-50 text-lg">
                    ₹{p.buyer_price_inr?.toLocaleString() || "N/A"}
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-bold uppercase text-zinc-500 dark:text-zinc-400 mb-1">
                    MOQ
                  </span>
                  <span className="font-mono font-medium text-zinc-700 dark:text-zinc-300">
                    {p.moq || 1} units
                  </span>
                </div>
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  );
};
