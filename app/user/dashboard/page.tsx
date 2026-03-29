"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  ShoppingCart,
  Package,
  FileText,
  User,
  Globe,
  Star,
  ChevronRight,
  Clock,
} from "lucide-react";

const supabase = createClient();

type Profile = {
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  address?: string | null;
  email?: string | null;
};

type Order = {
  id: string;
  order_number?: string | null;
  total?: number | null;
  status?: string | null;
  created_at?: string | null;
  items?: { title?: string; qty?: number }[] | null;
};

type Quote = {
  id: string;
  title?: string | null;
  status?: string | null;
  created_at?: string | null;
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending_payment: { label: "En attente paiement", color: "text-yellow-300" },
  paid:            { label: "Payé",                color: "text-blue-300" },
  processing:      { label: "En préparation",      color: "text-purple-300" },
  shipped:         { label: "Expédié",             color: "text-cyan-300" },
  delivered:       { label: "Livré",               color: "text-green-300" },
  cancelled:       { label: "Annulé",              color: "text-red-300" },
};

const QUOTE_STATUS: Record<string, string> = {
  new:     "Nouveau",
  read:    "Lu",
  replied: "Répondu",
};

const fmt = (v: number) =>
  new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(v) + " FCFA";

export default function UserDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      try {
        const { data: authData } = await supabase.auth.getUser();
        const user = authData?.user ?? null;
        if (!user || !mounted) return;

        setUserId(user.id);
        setEmail(user.email ?? null);

        // Profil via API (évite les problèmes RLS)
        const profRes = await fetch("/api/profile");
        if (profRes.ok) {
          const profJson = await profRes.json();
          if (mounted) setProfile(profJson.profile ?? null);
        }

        // Commandes récentes (3 dernières)
        const { data: ord } = await supabase
          .from("orders")
          .select("id, order_number, total, status, created_at, items")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(3);
        if (mounted) setOrders((ord ?? []) as Order[]);

        // Devis récents (3 derniers)
        const { data: quo } = await supabase
          .from("quotes")
          .select("id, title, status, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(3);
        if (mounted) setQuotes((quo ?? []) as Quote[]);

        // Panier local
        try {
          const raw = localStorage.getItem("user/cart") || localStorage.getItem("cart") || "[]";
          const items = JSON.parse(raw);
          if (mounted && Array.isArray(items)) setCartCount(items.length);
        } catch {}
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, []);

  // Initiales avatar
  const initials = (() => {
    if (profile?.first_name || profile?.last_name) {
      return [profile.first_name?.[0], profile.last_name?.[0]].filter(Boolean).join("").toUpperCase();
    }
    return email?.[0]?.toUpperCase() ?? "?";
  })();

  const displayName =
    [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || email || "Utilisateur";

  // Complétion du profil
  const profileFields = [profile?.first_name, profile?.last_name, profile?.phone, profile?.address];
  const filledFields = profileFields.filter(Boolean).length;
  const profilePct = Math.round((filledFields / profileFields.length) * 100);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#000] text-white p-6">
        <div className="max-w-5xl mx-auto space-y-4 animate-pulse">
          <div className="h-32 bg-white/5 rounded-2xl" />
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-white/5 rounded-xl" />)}
          </div>
          <div className="h-64 bg-white/5 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="min-h-screen bg-[#000] text-white p-6 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-white/60">Vous devez être connecté pour accéder à votre espace.</p>
          <Link href="/auth/login" className="inline-block px-6 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-sm font-medium transition">
            Se connecter
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#000] text-white p-6">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* ── Bannière utilisateur ─────────────────────────────────────── */}
        <section className="bg-gradient-to-r from-cyan-900/30 to-slate-900/60 border border-white/8 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-cyan-600/30 border border-cyan-500/30 flex items-center justify-center text-2xl font-bold text-cyan-300 flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold">Bonjour, {displayName} 👋</h1>
            <p className="text-white/50 text-sm mt-0.5">{email}</p>
          </div>
          <Link
            href="/user/profile"
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/8 hover:bg-white/12 text-sm text-white/80 hover:text-white transition"
          >
            <User size={14} /> Modifier le profil
          </Link>
        </section>

        {/* ── Stats rapides ────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link href="/user/orders" className="group bg-white/5 border border-white/8 rounded-xl p-4 flex items-center gap-4 hover:border-cyan-500/30 transition">
            <div className="w-10 h-10 rounded-lg bg-cyan-600/20 flex items-center justify-center">
              <Package size={18} className="text-cyan-400" />
            </div>
            <div>
              <div className="text-2xl font-bold">{orders.length > 0 ? orders.length : "—"}</div>
              <div className="text-xs text-white/50">Commandes récentes</div>
            </div>
            <ChevronRight size={14} className="ml-auto text-white/20 group-hover:text-white/60 transition" />
          </Link>

          <Link href="/user/cart" className="group bg-white/5 border border-white/8 rounded-xl p-4 flex items-center gap-4 hover:border-cyan-500/30 transition">
            <div className="w-10 h-10 rounded-lg bg-purple-600/20 flex items-center justify-center">
              <ShoppingCart size={18} className="text-purple-400" />
            </div>
            <div>
              <div className="text-2xl font-bold">{cartCount}</div>
              <div className="text-xs text-white/50">Articles dans le panier</div>
            </div>
            <ChevronRight size={14} className="ml-auto text-white/20 group-hover:text-white/60 transition" />
          </Link>

          <Link href="/user/quote" className="group bg-white/5 border border-white/8 rounded-xl p-4 flex items-center gap-4 hover:border-cyan-500/30 transition">
            <div className="w-10 h-10 rounded-lg bg-amber-600/20 flex items-center justify-center">
              <FileText size={18} className="text-amber-400" />
            </div>
            <div>
              <div className="text-2xl font-bold">{quotes.length > 0 ? quotes.length : "—"}</div>
              <div className="text-xs text-white/50">Demandes de devis</div>
            </div>
            <ChevronRight size={14} className="ml-auto text-white/20 group-hover:text-white/60 transition" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Colonne gauche ────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Commandes récentes */}
            <section className="bg-white/5 border border-white/8 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-white/6">
                <h2 className="font-semibold flex items-center gap-2">
                  <Package size={16} className="text-cyan-400" /> Commandes récentes
                </h2>
                <Link href="/user/orders" className="text-xs text-cyan-400 hover:text-cyan-300 transition">
                  Voir tout →
                </Link>
              </div>

              {orders.length === 0 ? (
                <div className="p-6 text-center text-white/40 text-sm">
                  Aucune commande.{" "}
                  <Link href="/user/products" className="text-cyan-400 underline">Visiter la boutique</Link>
                </div>
              ) : (
                <ul className="divide-y divide-white/6">
                  {orders.map((o) => {
                    const st = STATUS_LABELS[o.status ?? ""] ?? { label: o.status ?? "—", color: "text-white/50" };
                    return (
                      <li key={o.id} className="p-4 flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">{o.order_number ?? o.id.substring(0, 8)}</div>
                          <div className="text-xs text-white/50 flex items-center gap-1 mt-0.5">
                            <Clock size={10} />
                            {o.created_at ? new Date(o.created_at).toLocaleDateString("fr-FR") : "—"}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-xs font-medium ${st.color}`}>{st.label}</div>
                          {o.total != null && (
                            <div className="text-sm font-semibold text-cyan-300 mt-0.5">{fmt(Number(o.total))}</div>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            {/* Devis récents */}
            <section className="bg-white/5 border border-white/8 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-white/6">
                <h2 className="font-semibold flex items-center gap-2">
                  <FileText size={16} className="text-amber-400" /> Demandes de devis
                </h2>
                <Link href="/user/quote?tab=list" className="text-xs text-cyan-400 hover:text-cyan-300 transition">
                  Voir tout →
                </Link>
              </div>

              {quotes.length === 0 ? (
                <div className="p-6 text-center text-white/40 text-sm">
                  Aucune demande.{" "}
                  <Link href="/user/quote" className="text-cyan-400 underline">Faire une demande</Link>
                </div>
              ) : (
                <ul className="divide-y divide-white/6">
                  {quotes.map((q) => (
                    <li key={q.id} className="p-4 flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{q.title ?? `Devis ${q.id.substring(0, 8)}`}</div>
                        <div className="text-xs text-white/50 flex items-center gap-1 mt-0.5">
                          <Clock size={10} />
                          {q.created_at ? new Date(q.created_at).toLocaleDateString("fr-FR") : "—"}
                        </div>
                      </div>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        q.status === "replied"
                          ? "bg-green-600/20 text-green-300"
                          : q.status === "read"
                          ? "bg-yellow-600/20 text-yellow-300"
                          : "bg-white/8 text-white/60"
                      }`}>
                        {QUOTE_STATUS[q.status ?? ""] ?? q.status ?? "Nouveau"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          {/* ── Colonne droite ────────────────────────────────────────── */}
          <div className="space-y-6">

            {/* Complétion du profil */}
            <section className="bg-white/5 border border-white/8 rounded-xl p-4 space-y-3">
              <h2 className="font-semibold flex items-center gap-2 text-sm">
                <User size={14} className="text-cyan-400" /> Profil
              </h2>
              <div className="flex items-center justify-between text-xs text-white/60">
                <span>Complété à {profilePct}%</span>
                <span>{filledFields}/{profileFields.length} champs</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-1.5">
                <div
                  className="bg-cyan-500 h-1.5 rounded-full transition-all"
                  style={{ width: `${profilePct}%` }}
                />
              </div>
              {profilePct < 100 && (
                <Link href="/user/profile" className="text-xs text-cyan-400 hover:text-cyan-300 transition">
                  Compléter mon profil →
                </Link>
              )}
            </section>

            {/* Accès rapides */}
            <section className="bg-white/5 border border-white/8 rounded-xl p-4 space-y-2">
              <h2 className="font-semibold text-sm mb-3">Accès rapides</h2>

              {[
                { href: "/user/products",  icon: <Star size={14} />,         label: "Boutique",         color: "text-cyan-400" },
                { href: "/user/services",  icon: <Package size={14} />,      label: "Nos services",     color: "text-purple-400" },
                { href: "/user/pricing",   icon: <FileText size={14} />,     label: "Nos tarifs",       color: "text-amber-400" },
                { href: "/user/exchange",  icon: <Globe size={14} />,        label: "Exchange EUR/XOF", color: "text-green-400" },
                { href: "/user/quote",     icon: <FileText size={14} />,     label: "Demander un devis",color: "text-pink-400" },
                { href: "/user/contact",   icon: <User size={14} />,         label: "Nous contacter",   color: "text-orange-400" },
              ].map(({ href, icon, label, color }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/8 transition group"
                >
                  <span className={color}>{icon}</span>
                  <span className="text-sm text-white/70 group-hover:text-white transition">{label}</span>
                  <ChevronRight size={12} className="ml-auto text-white/20 group-hover:text-white/50 transition" />
                </Link>
              ))}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
