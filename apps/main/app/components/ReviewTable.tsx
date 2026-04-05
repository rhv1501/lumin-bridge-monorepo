"use client";
import { Button, Card, EmptyState, Skeleton } from "@luminbridge/ui";
import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { Review } from "@luminbridge/types";

interface ReviewTableProps {
  reviews: Review[];
  isLoading: boolean;
}

export function ReviewTable({ reviews, isLoading }: ReviewTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const totalPages = Math.ceil(reviews.length / itemsPerPage);
  const paginatedReviews = reviews.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-0 shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-50/50 dark:bg-zinc-800/30 border-b border-zinc-200/50 dark:border-zinc-800/50">
              <tr>
                <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 dark:text-zinc-500">Date</th>
                <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 dark:text-zinc-500">Buyer</th>
                <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 dark:text-zinc-500">Product</th>
                <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 dark:text-zinc-500">Factory</th>
                <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 dark:text-zinc-500">Rating</th>
                <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 dark:text-zinc-500">Comment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="p-4"><Skeleton className="w-24 h-4 rounded-full" /></td>
                    <td className="p-4"><Skeleton className="w-32 h-4 rounded-full" /></td>
                    <td className="p-4"><Skeleton className="w-32 h-4 rounded-full" /></td>
                    <td className="p-4"><Skeleton className="w-32 h-4 rounded-full" /></td>
                    <td className="p-4"><Skeleton className="w-20 h-4 rounded-full" /></td>
                    <td className="p-4"><Skeleton className="w-48 h-4 rounded-full" /></td>
                  </tr>
                ))
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8">
                    <EmptyState icon={Star} title="No reviews found" description="There are no reviews yet." />
                  </td>
                </tr>
              ) : (
                paginatedReviews.map(r => (
                  <tr key={r.id} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-100 dark:bg-zinc-800/50 transition-colors duration-200">
                    <td className="p-4 text-sm text-zinc-500 dark:text-zinc-400 whitespace-nowrap group-hover:text-zinc-700 dark:group-hover:text-zinc-700 dark:text-zinc-300 transition-colors">
                      {new Date(r.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-sm font-medium text-zinc-900 dark:text-zinc-100 group-hover:text-black dark:group-hover:text-zinc-950 dark:text-white transition-colors">{r.buyer_company || 'Anonymous'}</td>
                    <td className="p-4 text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-black dark:group-hover:text-zinc-950 dark:text-white transition-colors">{r.product_name || 'Unknown Product'}</td>
                    <td className="p-4 text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-black dark:group-hover:text-zinc-950 dark:text-white transition-colors">{r.factory_company || 'Unknown Factory'}</td>
                    <td className="p-4">
                      <div className="flex items-center text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} size={14} className={i < r.rating ? "fill-current" : "text-zinc-700 dark:text-zinc-300 dark:text-zinc-600"} />
                        ))}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-zinc-600 dark:text-zinc-400 max-w-xs truncate group-hover:text-zinc-900 dark:group-hover:text-zinc-200 transition-colors" title={r.comment}>
                      {r.comment || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
      
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-zinc-500 dark:text-zinc-400">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, reviews.length)} of {reviews.length} reviews
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="rounded-full px-4"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="rounded-full px-4"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
