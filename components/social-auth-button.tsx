// components/auth/SocialAuthButton.tsx
"use client";

import React from "react";
import Button from "@/components/ui/Button";

interface SocialButtonProps {
  children: React.ReactNode;
  action: () => Promise<void> | void;
  leftIcon?: React.ReactNode;
  isLoading?: boolean;
  className?: string;
}

export default function SocialAuthButton({
  children,
  action,
  leftIcon,
  isLoading = false,
  className = "",
}: SocialButtonProps) {
  const handleClick = async () => {
    try {
      await action();
    } catch (err) {
      // Optionnel : gérer l'erreur ici ou laisser l'appelant la gérer
      console.error("Social auth error:", err);
    }
  };

  return (
    <Button
      onClick={handleClick}
      variant="outline"
      size="md"
      isLoading={isLoading}
      leftIcon={leftIcon}
      className={`w-full ${className}`}
    >
      {children}
    </Button>
  );
}
