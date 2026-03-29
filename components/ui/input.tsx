// components/ui/input.tsx
"use client";

import React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  variant?: "default" | "ghost";
  size?: "sm" | "md" | "lg";
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", variant = "default", size = "md", ...props }, ref) => {
    const base =
      "block w-full rounded-md bg-black/60 text-white placeholder:text-white/50 border transition focus:outline-none focus:ring-2 focus:ring-offset-0";
    const variants: Record<string, string> = {
      default: "border-white/6 focus:ring-white/20",
      ghost: "border-transparent focus:ring-white/10 bg-transparent",
    };
    const sizes: Record<string, string> = {
      sm: "px-2 py-1 text-sm",
      md: "px-3 py-2 text-sm",
      lg: "px-4 py-3 text-base",
    };

    return (
      <input
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export default Input;
