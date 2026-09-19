// components/ui/Logo.tsx
import React from "react";

type LogoProps = {
  color?: string;
  size?: number;
  className?: string;
};

export default function Logo({ color = "text-white", size = 20, className = "" }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={color}
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        {/* Conteneur maritime isométrique minimaliste */}
        <g
          stroke="currentColor"
          strokeWidth={1.75}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Face avant du conteneur */}
          <path d="M3.5 9.5 L12 14 L12 21 L3.5 16.5 Z" />
          {/* Face latérale droite */}
          <path d="M12 14 L20.5 9.5 L20.5 16.5 L12 21" />
          {/* Toit */}
          <path d="M3.5 9.5 L12 5 L20.5 9.5 L12 14 Z" />
          {/* Nervures face avant */}
          <path d="M6 11.25 L6 18.25" />
          <path d="M8.5 12.5 L8.5 19.5" />
          {/* Nervures face latérale */}
          <path d="M14.5 12.5 L14.5 19.5" />
          <path d="M17 11.25 L17 18.25" />
        </g>
        {/* Petit accent : pastille dorée sur le toit (point d'origine/échange) */}
        <circle cx="12" cy="5" r="1.4" fill="currentColor" opacity="0.85" />
      </svg>
      <span className={`font-bold tracking-tight ${color}`} style={{ fontSize: size * 0.9 }}>
        mipan <span className="font-normal">Sarl</span>
      </span>
    </div>
  );
}
