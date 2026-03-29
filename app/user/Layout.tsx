"use client";

import React from "react";
import Link from "next/link";
import CartSync from "@/components/user/CartSync";

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CartSync />

      <div className="min-h-screen flex flex-col bg-black text-white">
        {/* HEADER */}
        <header className="bg-gradient-to-r from-slate-900 to-black border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-6">
                <Link href="/" className="text-2xl font-extrabold text-cyan-400">
                  mipan Sarl
                </Link>

                <nav className="hidden md:flex items-center gap-4">
                  <Link href="/user/products" className="text-white/80 hover:text-white transition text-sm">
                    Produits
                  </Link>
                  <Link href="/user/services" className="text-white/80 hover:text-white transition text-sm">
                    Services
                  </Link>
                  <Link href="/user/pricing" className="text-white/80 hover:text-white transition text-sm">
                    Tarifs
                  </Link>
                </nav>
              </div>

              <div className="flex items-center gap-4">
                <Link
                  href="/user/cart"
                  className="relative inline-flex items-center gap-2 px-3 py-2 rounded-md bg-white/5 hover:bg-white/10 transition"
                >
                  <svg className="w-5 h-5 text-cyan-300" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M3 3h2l.4 2M7 13h10l4-8H5.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="10" cy="20" r="1" fill="currentColor"/>
                    <circle cx="18" cy="20" r="1" fill="currentColor"/>
                  </svg>
                  <span className="text-sm text-white/90">Panier</span>
                </Link>

                <Link href="/user/profile" className="text-white/60 hover:text-white transition text-sm">
                  Mon compte
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* MAIN */}
        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>

        {/* FOOTER */}
        <footer className="border-t border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-sm text-white/60 flex items-center justify-between">
            <div>© {new Date().getFullYear()} mipan Sarl</div>
            <div className="flex gap-4">
              <Link href="/user/contact" className="hover:text-white">Contact</Link>
              <Link href="/user/quote" className="hover:text-white">Devis</Link>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
