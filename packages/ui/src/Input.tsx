import React from "react";
import { cn } from "./cn";

export const Input = React.forwardRef<
  HTMLInputElement,
  { label?: string } & React.InputHTMLAttributes<HTMLInputElement>
>(function Input({ label, className, ...props }, ref) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-sm font-medium text-zinc-300 ml-1">
          {label}
        </label>
      )}
      <input
        ref={ref}
        {...props}
        className={cn(
          "w-full px-4 py-3 border-0 rounded-2xl focus:outline-none focus:ring-2 focus:ring-white/20 bg-zinc-800/50 text-zinc-50 transition-all duration-300 placeholder:text-zinc-500",
          className,
        )}
      />
    </div>
  );
});

Input.displayName = "Input";
