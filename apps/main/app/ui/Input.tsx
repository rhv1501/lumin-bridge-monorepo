import React from "react";
import { cn } from "./cn";

export function Input({
  label,
  className,
  ...props
}: { label?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 ml-1">
          {label}
        </label>
      )}
      <input
        {...props}
        className={cn(
          "w-full px-4 py-3 border-0 rounded-2xl focus:outline-none focus:ring-2 focus:ring-white/20 bg-zinc-100 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-50 transition-all duration-300 placeholder:text-zinc-500",
          className,
        )}
      />
    </div>
  );
}
