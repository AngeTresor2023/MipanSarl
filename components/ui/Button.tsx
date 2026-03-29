// components/ui/Button.tsx
"use client";

import React from "react";
import { cn } from "@/lib/utils";

type Variant = "default" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
};

function Spinner({ className = "" }: { className?: string }) {
  return (
    <svg
      className={cn("animate-spin", className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      width="18"
      height="18"
      aria-hidden
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}

export default function Button({
  children,
  variant = "default",
  size = "md",
  isLoading = false,
  leftIcon,
  rightIcon,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const base = "inline-flex items-center justify-center rounded-md font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2";
  const variants: Record<Variant, string> = {
    default: "bg-white/8 hover:bg-white/12 text-white border border-white/6",
    outline: "bg-transparent border border-white/6 text-white hover:bg-white/3",
    ghost: "bg-transparent text-white hover:bg-white/5",
    danger: "bg-red-600 hover:bg-red-700 text-white",
  };
  const sizes: Record<Size, string> = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-3 text-base",
  };

  const isDisabled = disabled || isLoading;

  return (
    <button
      className={cn(
        base,
        variants[variant],
        sizes[size],
        isDisabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer",
        className
      )}
      disabled={isDisabled}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <Spinner className="text-white" />
          <span className="sr-only">Loading</span>
        </span>
      ) : (
        <>
          {leftIcon && <span className="mr-2 flex items-center">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="ml-2 flex items-center">{rightIcon}</span>}
        </>
      )}
    </button>
  );
}
