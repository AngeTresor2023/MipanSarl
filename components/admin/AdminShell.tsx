// components/admin/AdminShell.tsx
"use client";

import React from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { LogOut, Grid, Package, ShoppingCart, Users, FileText, Wrench, ArrowLeftRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const navLinks = [
  { href: "/admin",           label: "Vue d'ensemble", icon: Grid },
  { href: "/admin/users",     label: "Utilisateurs",   icon: Users },
  { href: "/admin/products",  label: "Produits",       icon: Package },
  { href: "/admin/orders",    label: "Commandes",      icon: ShoppingCart },
  { href: "/admin/requests",  label: "Devis",          icon: FileText },
  { href: "/admin/services",  label: "Services",       icon: Wrench },
  { href: "/admin/exchanges", label: "Échanges",       icon: ArrowLeftRight },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 md:py-8">

        {/* Mobile header bar */}
        <div className="md:hidden mb-3">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-base font-bold text-white">mipan Sarl</div>
              <div className="text-[11px] text-white/40">Administration</div>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/" className="text-xs text-white/40 hover:text-white/70 px-2 py-1 rounded bg-white/5">
                ← Site
              </Link>
              <button
                onClick={signOut}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-red-600/80 hover:bg-red-600 text-white text-xs transition"
              >
                <LogOut size={12} /> Déco
              </button>
            </div>
          </div>
          {/* Mobile nav tabs */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            {navLinks.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
                    active
                      ? "bg-cyan-600 text-white"
                      : "bg-white/6 text-white/60 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon size={13} />
                  {label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Desktop layout */}
        <div className="flex gap-6">
          {/* Sidebar - desktop only */}
          <aside className="w-56 hidden md:block flex-shrink-0">
            <div className="p-4 rounded-lg bg-white/3 border border-white/6 sticky top-6">
              <div className="mb-6">
                <div className="text-xl font-bold text-white">mipan Sarl</div>
                <div className="text-sm text-white/50">Administration</div>
              </div>

              <nav className="space-y-1">
                {navLinks.map(({ href, label, icon: Icon }) => {
                  const active = pathname === href;
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={`flex items-center gap-2 px-3 py-2 rounded text-sm transition ${
                        active
                          ? "bg-cyan-600/20 text-cyan-300 font-medium"
                          : "text-white/70 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <Icon size={15} />
                      {label}
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-6 border-t border-white/6 pt-4">
                <Link href="/" className="block text-xs text-white/40 hover:text-white/70 mb-3 text-center">
                  ← Retour au site
                </Link>
                <button
                  onClick={signOut}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded bg-red-600 hover:bg-red-700 text-white text-sm transition"
                >
                  <LogOut size={14} /> Déconnexion
                </button>
              </div>
            </div>
          </aside>

          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
