// components/ui/Logo.tsx
import React from "react";
import Image from "next/image";

type LogoProps = {
  color?: string;
  size?: number;
  className?: string;
};

export default function Logo({ color = "text-white", size = 20, className = "" }: LogoProps) {
  // L'emblème est plus détaillé que l'ancien pictogramme : on l'affiche un
  // peu plus grand que le texte pour que le navire et le M restent lisibles.
  const emblem = Math.round(size * 1.9);
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <Image
        src="/brand/mipan-emblem.png"
        alt=""
        width={emblem}
        height={emblem}
        priority
        className="shrink-0"
        aria-hidden
      />
      <span
        className={`font-serif font-bold tracking-wide ${color}`}
        style={{ fontSize: size * 0.95 }}
      >
        MIPAN <span className="font-semibold text-[#c9a227]">SARL</span>
      </span>
    </div>
  );
}
