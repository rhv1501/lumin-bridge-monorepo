"use client";
import { Button, Card } from "@luminbridge/ui";
import React, { useState } from "react";
import { Star, X } from "lucide-react";
import { Order } from "@luminbridge/types";
import { motion, AnimatePresence } from "motion/react";

interface ReviewModalProps {
  order: Order;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => Promise<void>;
}

export const ReviewModal = ({ order, onClose, onSubmit }: ReviewModalProps) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(rating, comment);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-white dark:bg-zinc-900/40 backdrop-blur-sm"
      />
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 350 }}
        className="relative w-full max-w-md"
      >
        <Card className="p-8 border-0 shadow-2xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl rounded-[2.5rem]">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-700 dark:bg-zinc-800 transition-colors"
          >
            <X size={18} className="text-zinc-500 dark:text-zinc-400" />
          </button>

          <div className="mb-8">
            <h3 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white mb-2">
              Leave a Review
            </h3>
            <p className="text-sm text-zinc-500">
              How was your experience with {order.product_name}?
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="flex flex-col items-center gap-4">
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(null)}
                    className="p-1.5 transition-transform hover:scale-110 active:scale-95"
                  >
                    <Star
                      size={36}
                      className={cn(
                        "transition-all duration-300",
                        (
                          hoveredRating !== null
                            ? star <= hoveredRating
                            : star <= rating
                        )
                          ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]"
                          : "text-zinc-200 dark:text-zinc-700",
                      )}
                    />
                  </button>
                ))}
              </div>
              <span className="text-sm font-bold uppercase tracking-widest text-amber-500">
                {rating === 5
                  ? "Excellent"
                  : rating === 4
                    ? "Very Good"
                    : rating === 3
                      ? "Good"
                      : rating === 2
                        ? "Fair"
                        : "Poor"}
              </span>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 ml-1">
                Your Comments
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
                placeholder="Describe your satisfaction with the product and service..."
                className="w-full px-5 py-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-900/5 dark:focus:ring-white/5 focus:border-zinc-300 dark:focus:border-white transition-all h-32 resize-none text-sm leading-relaxed"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-14 rounded-2xl shadow-xl shadow-zinc-900/10 active:scale-[0.98] transition-transform"
              loading={isSubmitting}
            >
              Submit Review
            </Button>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};

const cn = (...classes: any[]) => classes.filter(Boolean).join(" ");
