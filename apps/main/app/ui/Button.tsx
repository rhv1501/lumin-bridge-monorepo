import React from "react";
import { cn } from "./cn";

export function Button({
  children,
  onClick,
  variant = "primary",
  size = "md",
  className,
  type = "button",
  disabled = false,
  loading = false,
  title,
}: {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  loading?: boolean;
  title?: string;
}) {
  const variants = {
    primary: "bg-zinc-50 text-zinc-900 hover:bg-zinc-200 shadow-sm active:scale-[0.97]",
    secondary: "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-700 shadow-sm active:scale-[0.97]",
    outline: "bg-transparent border border-zinc-700 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:bg-zinc-800 shadow-sm active:scale-[0.97]",
    danger: "bg-red-500 text-zinc-950 dark:text-white hover:bg-red-600 shadow-sm active:scale-[0.97]",
    ghost: "bg-transparent hover:bg-zinc-100 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:text-zinc-100"
  };

  const sizes = {
    sm: "px-4 py-1.5 text-sm",
    md: "px-5 py-2.5",
    lg: "px-8 py-3.5 text-lg"
  };

  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      title={title}
      className={cn(
        "rounded-full font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2",
        variants[variant],
        sizes[size],
        className,
      )}
    >
      {loading && (
        <span className="inline-flex" aria-hidden="true">
          <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
        </span>
      )}
      {children}
    </button>
  );
}
