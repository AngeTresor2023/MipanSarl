// components/ui/UserMenu.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Props = { isAdmin: boolean; hasUser: boolean };

export default function UserMenu({ isAdmin, hasUser }: Props) {
  const supabase = createClient();
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  const close = () => setOpen(false);

  useEffect(() => {
    if (!hasUser) return;
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user;
      if (!u) return;
      setEmail(u.email ?? null);
      const meta = u.user_metadata ?? {};
      setDisplayName(meta.first_name ?? meta.given_name ?? meta.name ?? null);
    });
  }, [hasUser, supabase]);

  // Fermer le menu si clic en dehors
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const initials = (() => {
    const name = displayName || email || "";
    const parts = String(name).split(" ").filter(Boolean);
    if (parts.length === 0) return email?.[0]?.toUpperCase() ?? "?";
    return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
  })();

  const signOut = async () => {
    close();
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  };

  if (!hasUser) {
    return (
      <Link
        href="/auth/login"
        className="px-3 py-1 rounded-md bg-white/6 hover:bg-white/10 text-white text-sm transition"
      >
        Se connecter
      </Link>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-10 h-10 rounded-full bg-white/8 flex items-center justify-center text-white font-semibold hover:bg-white/12 transition"
        aria-haspopup="true"
        aria-expanded={open}
        title={email ?? undefined}
      >
        {initials}
      </button>

      {/* Dropdown */}
      <div
        role="menu"
        className={`absolute right-0 mt-2 w-52 bg-black/95 border border-white/10 rounded-lg shadow-xl backdrop-blur-sm z-50 transition-all duration-150 ${
          open ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-1 pointer-events-none"
        }`}
      >
        {/* En-tête */}
        <div className="p-3 border-b border-white/8">
          <div className="font-medium text-white text-sm">{displayName ?? email}</div>
          <div className="text-xs text-white/50 truncate">{email}</div>
          {isAdmin && (
            <span className="mt-1 inline-block px-2 py-0.5 rounded text-xs bg-cyan-600/20 text-cyan-300">
              Administrateur
            </span>
          )}
        </div>

        {/* Liens */}
        <div className="flex flex-col p-1.5 gap-0.5">
          <Link
            href={isAdmin ? "/admin" : "/user/dashboard"}
            onClick={close}
            className={`px-3 py-2 rounded text-sm transition font-medium ${
              isAdmin
                ? "bg-cyan-600/10 hover:bg-cyan-600/20 text-cyan-300"
                : "hover:bg-white/5 text-white/80 hover:text-white"
            }`}
          >
            🏠 Mon espace
          </Link>

          {!isAdmin && (
            <>
              <Link href="/user/profile" onClick={close} className="px-3 py-2 rounded hover:bg-white/5 text-white/80 hover:text-white text-sm transition">
                Mon profil
              </Link>
              <Link href="/user/cart" onClick={close} className="px-3 py-2 rounded hover:bg-white/5 text-white/80 hover:text-white text-sm transition">
                Mon panier
              </Link>
              <Link href="/user/orders" onClick={close} className="px-3 py-2 rounded hover:bg-white/5 text-white/80 hover:text-white text-sm transition">
                Mes commandes
              </Link>
            </>
          )}

          {isAdmin && (
            <>
              <Link href="/admin/orders"   onClick={close} className="px-3 py-2 rounded hover:bg-white/5 text-white/70 hover:text-white text-sm transition">Commandes</Link>
              <Link href="/admin/requests" onClick={close} className="px-3 py-2 rounded hover:bg-white/5 text-white/70 hover:text-white text-sm transition">Devis</Link>
              <Link href="/admin/users"    onClick={close} className="px-3 py-2 rounded hover:bg-white/5 text-white/70 hover:text-white text-sm transition">Utilisateurs</Link>
            </>
          )}
        </div>

        <div className="p-1.5 border-t border-white/8">
          <button
            onClick={signOut}
            className="w-full px-3 py-2 rounded bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white text-sm transition"
          >
            Déconnexion
          </button>
        </div>
      </div>
    </div>
  );
}
