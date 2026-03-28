"use client";
import { Button, Card, Input, Skeleton, cn } from "@luminbridge/ui";
import React, { useState, useEffect } from 'react';
import { X, ShoppingBag, Star, Minus, Plus } from 'lucide-react';
import { Product } from "@luminbridge/types";
import { motion, AnimatePresence } from 'motion/react';

interface ProductModalProps {
  product: Product;
  onClose: () => void;
  onConfirm: (quantity: number) => Promise<void>;
}

interface Review {
  id: number;
  rating: number;
  comment: string;
  buyer_company: string;
  created_at: string;
}

export const ProductModal = ({ product, onClose, onConfirm }: ProductModalProps) => {
  const [quantity, setQuantity] = useState(product.moq || 1);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch(`/api/reviews?product_id=${product.id}`);
        if (res.ok) {
          const data = await res.json();
          setReviews(data);
        }
      } catch (e) {
        console.error('Failed to fetch reviews', e);
      } finally {
        setIsLoadingReviews(false);
      }
    };
    fetchReviews();
  }, [product.id]);

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      await onConfirm(quantity);
      onClose();
    } finally {
      setIsConfirming(false);
    }
  };

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="w-full max-w-2xl relative z-10 my-auto"
      >
        <Card className="p-8 sm:p-10 shadow-2xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl rounded-[2.5rem]">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
          
          <div className="flex flex-col sm:flex-row gap-8 mb-10">
            <div className="w-full sm:w-48 h-48 bg-zinc-100 dark:bg-zinc-800/50 rounded-3xl overflow-hidden flex-shrink-0 shadow-inner">
              {product.photo && (
                <img src={product.photo} alt={product.name} className="w-full h-full object-cover" />
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-semibold tracking-tight mb-3 dark:text-white">{product.name}</h2>
              
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center text-amber-500 bg-amber-50 dark:bg-amber-500/10 px-2.5 py-1 rounded-full text-xs font-bold">
                  <Star size={12} className="fill-current mr-1" />
                  {averageRating || 'New'}
                </div>
                <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">({reviews.length} reviews)</span>
              </div>
              
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6 leading-relaxed line-clamp-3">{product.description}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-mono font-semibold tracking-tight text-zinc-900 dark:text-white">₹{product.buyer_price_inr?.toLocaleString()}</span>
                <span className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">/ unit</span>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-zinc-50/80 dark:bg-zinc-800/50 p-6 rounded-[2rem] border border-zinc-100 dark:border-zinc-800/50 flex flex-col sm:flex-row justify-between items-center gap-6">
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 ml-1">Quantity</label>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setQuantity(Math.max(product.moq || 1, quantity - 1))}
                    className="w-10 h-10 rounded-xl border border-zinc-200 dark:border-zinc-700 flex items-center justify-center hover:bg-white dark:hover:bg-zinc-800 transition-all active:scale-95"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="text-2xl font-mono font-bold w-12 text-center">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-xl border border-zinc-200 dark:border-zinc-700 flex items-center justify-center hover:bg-white dark:hover:bg-zinc-800 transition-all active:scale-95"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
              
              <div className="text-center sm:text-right">
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-1">Total Impact</p>
                <p className="text-3xl font-mono font-bold tracking-tight text-zinc-900 dark:text-white">₹{((product.buyer_price_inr || 0) * quantity).toLocaleString()}</p>
              </div>
            </div>

            <Button onClick={handleConfirm} className="w-full h-16 rounded-[2rem] text-lg shadow-xl shadow-zinc-900/10 active:scale-[0.98] transition-transform" loading={isConfirming}>
              <ShoppingBag size={20} className="mr-3" />
              Place Pre-Order
            </Button>
          </div>
          
          <div className="mt-10 pt-8 border-t border-zinc-100 dark:border-zinc-800/50 max-h-60 overflow-y-auto custom-scrollbar">
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-6">Verified Reviews</h3>
            {isLoadingReviews ? (
              <div className="space-y-4">
                <Skeleton className="w-full h-20 rounded-2xl" />
                <Skeleton className="w-full h-20 rounded-2xl" />
              </div>
            ) : reviews.length === 0 ? (
              <p className="text-sm text-zinc-500 italic">No reviews yet for this product.</p>
            ) : (
              <div className="space-y-4">
                {reviews.map(review => (
                  <div key={review.id} className="p-4 rounded-2xl bg-zinc-50/50 dark:bg-zinc-800/30 border border-zinc-100 dark:border-zinc-900/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-xs">{review.buyer_company || 'Premium Buyer'}</span>
                      <div className="flex text-amber-500">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} size={10} className={i < review.rating ? "fill-current" : "text-zinc-200"} />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
};
