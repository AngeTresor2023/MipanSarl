"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import Logo from "@/components/ui/Logo";
import { LangToggle, type AuthLang } from "@/lib/auth-i18n";

type AuthSplitLayoutProps = {
  children: React.ReactNode;
  /**
   * Accroche courte affichée à gauche (desktop) / en haut (mobile).
   */
  headline: string;
  /**
   * Sous-texte de confiance complétant l'accroche.
   */
  subtext: string;
  lang: AuthLang;
  setLang: (lang: AuthLang) => void;
  /**
   * Optionnel : texte affiché dans la pastille (ex. "📍 Douala, Cameroun — Logistique & Commerce").
   */
  badge?: string;
};

/**
 * Écran partagé (split-screen) réutilisé par les 3 formulaires d'auth.
 * - Desktop (≥ md) : colonne gauche ~45% avec hero.jpg + dégradé sombre,
 *   colonne droite = conteneur du formulaire (fond uni sombre, sans carte).
 * - Mobile (< md) : bandeau compact en haut (logo + accroche + pastille),
 *   puis le formulaire en dessous pleine largeur.
 */
export function AuthSplitLayout({
  children,
  headline,
  subtext,
  lang,
  setLang,
  badge,
}: AuthSplitLayoutProps) {
  return (
    <div className="min-h-screen w-full bg-[#05070d] text-white md:grid md:grid-cols-[45fr_55fr]">
      {/* ===== Panneau gauche — desktop ===== */}
      <aside className="relative hidden md:flex md:flex-col md:justify-between md:p-10 lg:p-14">
        <Image
          src="/assets/hero.jpg"
          alt=""
          fill
          priority
          sizes="(min-width: 768px) 45vw, 100vw"
          className="object-cover"
        />
        {/* Dégradé sombre sur la photo */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-[#080d18]"
        />

        {/* Logo + LangToggle en haut */}
        <div className="relative z-10 flex items-start justify-between gap-4">
          <Link href="/" className="inline-flex items-center gap-3">
            <Logo />
          </Link>
          <div className="[&_button]:text-white/70 [&_button:hover]:text-white [&_button[aria-current='true']]:text-white [&_span]:text-white/30">
            <LangToggle lang={lang} setLang={setLang} />
          </div>
        </div>

        {/* Accroche + sous-texte en bas */}
        <div className="relative z-10 max-w-md">
          {badge && (
            <span className="mb-6 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80 backdrop-blur-sm">
              <MapPin size={12} />
              {badge}
            </span>
          )}
          <h2 className="text-3xl font-semibold leading-tight tracking-tight lg:text-4xl">
            {headline}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-white/70">
            {subtext}
          </p>
        </div>
      </aside>

      {/* ===== Bandeau mobile ===== */}
      <div className="relative flex flex-col gap-6 overflow-hidden bg-gradient-to-br from-[#0b1424] via-[#080d18] to-[#05070d] px-6 pb-8 pt-6 md:hidden">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="inline-flex items-center gap-2">
            <Logo />
          </Link>
          <div className="[&_button]:text-white/70 [&_button:hover]:text-white [&_button[aria-current='true']]:text-white [&_span]:text-white/30">
            <LangToggle lang={lang} setLang={setLang} />
          </div>
        </div>
        <div className="max-w-md">
          <h1 className="text-2xl font-semibold leading-tight tracking-tight">
            {headline}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-white/70">
            {subtext}
          </p>
        </div>
      </div>

      {/* ===== Colonne droite — formulaire (desktop) / suite mobile ===== */}
      <main className="flex w-full items-start justify-start px-6 pb-12 pt-8 md:items-center md:px-12 md:py-12 lg:px-20">
        <div className="w-full max-w-sm">{children}</div>
      </main>
    </div>
  );
}