import React from "react";
import { cn } from "./cn";

export function Card({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  key?: React.Key;
  onClick?: (e: React.MouseEvent) => void;
}) {
  return (
    <div
      className={cn(
        "bg-zinc-900/70 backdrop-blur-xl border border-white/10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.1)] overflow-hidden transition-all duration-300",
        onClick && "cursor-pointer hover:shadow-[0_20px_40px_rgb(0,0,0,0.12)] hover:-translate-y-1 hover:bg-zinc-900/90",
        className,
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
