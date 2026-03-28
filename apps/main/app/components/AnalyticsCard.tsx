"use client";
import { Card, cn } from "@luminbridge/ui";
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
}

export const AnalyticsCard = ({ title, value, icon: Icon, trend, trendUp }: AnalyticsCardProps) => {
  return (
    <Card className="p-6 group hover:scale-[1.02] transition-all duration-300 ease-out border-0 shadow-lg bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-[2rem]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">{title}</h3>
        <div className="w-10 h-10 bg-zinc-100/80 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 rounded-2xl flex items-center justify-center shadow-inner">
          <Icon size={18} strokeWidth={1.5} />
        </div>
      </div>
      <div className="flex items-end gap-3">
        <span className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">{value}</span>
        {trend && (
          <span className={cn(
            "text-sm font-medium mb-1.5",
            trendUp ? "text-emerald-500" : "text-red-500"
          )}>
            {trend}
          </span>
        )}
      </div>
    </Card>
  );
};
