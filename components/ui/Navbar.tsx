// components/ui/Navbar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import UserMenu from "./UserMenu";
import {
  ShoppingCart, Globe, LayoutDashboard, Package,
  ClipboardList, Users, FileText, Home, Wrench, ArrowLeftRight,
} from "lucide-react";

const userLinks = [
  { href: "/user/dashboard", label: "Mon espace",    icon: <Home size={13} />,           exact: true },
  { href: "/user/products",  label: "Boutique",                                           exact: false },
  { href: "/user/services",  label: "Nos services",                                       exact: false },
  { href: "/user/pricing",   label: "Nos tarifs",                                         exact: false },
  { href: "/about",          label: "À propos",                                           exact: true },
  { href: "/user/contact",   label: "Nous contacter",                                     exact: false },
  { href: "/user/exchange",  label: "Exchange",      icon: <Globe size={13} />,           exact: false },
];

const publicLinks = [
  { href: "/",      label: "Accueil", exact: true },
  { href: "/about", label: "À propos", exact: true },
];

const adminLinks = [
  { href: "/admin",             label: "Tableau de bord", icon: <LayoutDashboard size={13} />, exact: true },
  { href: "/admin/products",    label: "Produits",        icon: <Package size={13} />,         exact: false },
  { href: "/admin/orders",      label: "Commandes",       icon: <ClipboardList size={13} />,   exact: false },
  { href: "/admin/users",       label: "Utilisateurs",    icon: <Users size={13} />,            exact: false },
  { href: "/admin/requests",    label: "Devis",           icon: <FileText size={13} />,         exact: false },
  { href: "/admin/services",    label: "Services",        icon: <Wrench size={13} />,           exact: false },
  { href: "/admin/exchanges",   label: "Échanges",        icon: <ArrowLeftRight size={13} />,   exact: false },
];

type Props = { isAdmin: boolean; hasUser: boolean };

export default function Navbar({ isAdmin, hasUser }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const close = () => setOpen(false);
  const links = isAdmin ? adminLinks : userLinks;

  return (
    <nav className="w-full sticky top-0 z-40 bg-black/80 backdrop-blur-md border-b border-white/8">
      {/* subtle blue glow top edge */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">

        {/* ── Gauche : Logo ── */}
        <div className="flex items-center gap-3 flex-none">
          <Link href={isAdmin ? "/admin" : "/"} onClick={close} className="flex items-center">
            <Logo color="text-white" size={22} />
          </Link>
          {isAdmin && (
            <span className="hidden sm:inline-flex px-2 py-0.5 rounded-md text-[11px] font-semibold tracking-wide bg-blue-600/20 text-blue-300 border border-blue-500/20">
              Admin
            </span>
          )}
        </div>

        {/* ── Centre : Liens desktop ── */}
        {hasUser && (
          <div className="hidden md:flex flex-1 items-center justify-center gap-0.5">
            {links.map(({ href, label, icon, exact }) => {
              const active = exact ? pathname === href : (pathname === href || pathname.startsWith(href + "/"));
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                    active
                      ? "text-white bg-blue-600/20 border border-blue-500/25"
                      : "text-white/60 hover:text-white hover:bg-white/6"
                  }`}
                >
                  {icon && <span className={active ? "text-blue-400" : "opacity-50"}>{icon}</span>}
                  {label}
                </Link>
              );
            })}
          </div>
        )}

        {/* Liens publics (non connecté) */}
        {!hasUser && (
          <div className="hidden md:flex flex-1 items-center justify-center gap-0.5">
            {publicLinks.map(({ href, label }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                    active
                      ? "text-white bg-blue-600/20 border border-blue-500/25"
                      : "text-white/60 hover:text-white hover:bg-white/6"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        )}

        {/* ── Droite : Panier + UserMenu + Burger ── */}
        <div className="flex items-center gap-2 flex-none">
          {hasUser && !isAdmin && (
            <Link
              href="/user/cart"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/6 transition text-sm"
            >
              <ShoppingCart size={16} />
              <span>Panier</span>
            </Link>
          )}

          <UserMenu isAdmin={isAdmin} hasUser={hasUser} />

          {/* Burger mobile */}
          {hasUser && (
            <button
              onClick={() => setOpen((v) => !v)}
              className="md:hidden p-2 rounded-lg hover:bg-white/6 transition"
              aria-label="Ouvrir le menu"
              aria-expanded={open}
            >
              {open ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M6 6l12 12M6 18L18 6" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>

      {/* ── Menu mobile ── */}
      {hasUser && (
        <div className={`md:hidden overflow-hidden transition-all duration-200 ${open ? "max-h-[32rem]" : "max-h-0"}`}>
          <div className="pt-1 pb-3 border-t border-white/6">
            {links.map(({ href, label, icon, exact }) => {
              const active = exact ? pathname === href : (pathname === href || pathname.startsWith(href + "/"));
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={close}
                  className={`flex w-full items-center gap-3 px-5 py-3 text-sm font-medium transition border-l-2 ${
                    active
                      ? "border-blue-500 bg-blue-600/10 text-white"
                      : "border-transparent text-white/65 hover:bg-white/5 hover:text-white hover:border-white/20"
                  }`}
                >
                  {icon && <span className={active ? "text-blue-400" : "text-white/35"}>{icon}</span>}
                  {label}
                </Link>
              );
            })}

            {!isAdmin && (
              <div className="border-t border-white/6 mt-1 pt-1">
                <Link href="/user/cart" onClick={close} className="flex w-full items-center gap-3 px-5 py-3 border-l-2 border-transparent text-white/65 hover:bg-white/5 hover:text-white text-sm">
                  <ShoppingCart size={14} className="text-white/35" /> Mon panier
                </Link>
                <Link href="/user/orders" onClick={close} className="flex w-full items-center gap-3 px-5 py-3 border-l-2 border-transparent text-white/65 hover:bg-white/5 hover:text-white text-sm">
                  Mes commandes
                </Link>
                <Link href="/user/profile" onClick={close} className="flex w-full items-center gap-3 px-5 py-3 border-l-2 border-transparent text-white/65 hover:bg-white/5 hover:text-white text-sm">
                  Mon profil
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
