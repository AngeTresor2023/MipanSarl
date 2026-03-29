// components/ui/Logo.tsx
import React from "react";

type LogoProps = {
  color?: string;      // ex: "text-white" ou "text-red-500"
  size?: number;       // taille en px pour le texte
  className?: string;
};

export default function Logo({ color = "text-white", size = 20, className = "" }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* icône simple SVG + texte, modifiable */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={color}
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M6 8h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>

      <span className={`font-bold tracking-tight ${color}`} style={{ fontSize: size * 0.9 }}>
        mipan <span className="font-normal">Sarl</span>
      </span>
    </div>
  );
}
