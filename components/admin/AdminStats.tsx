// components/admin/AdminStats.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Stats = {
  users: number;
  products: number;
  quotes: number;
  services: number;
  exchanges: number;
  totalSales: number;
  totalLocalSales: number;
  totalOnlineSales: number;
  totalExpenses: number;
  cashInHand: number;
  netValue: number;
};

const ZERO: Stats = { users: 0, products: 0, quotes: 0, services: 0, exchanges: 0, totalSales: 0, totalLocalSales: 0, totalOnlineSales: 0, totalExpenses: 0, cashInHand: 0, netValue: 0 };
const fmt = (v: number) => new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(v) + " FCFA";

export default function AdminStats() {
  const [stats, setStats] = useState<Stats>(ZERO);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((json) => { if (!json.error) setStats(json); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const countCards = [
    { label: "Utilisateurs",       value: stats.users,     icon: "👥", color: "text-blue-300" },
    { label: "Produits",            value: stats.products,  icon: "📦", color: "text-purple-300" },
    { label: "Devis en attente",    value: stats.quotes,    icon: "📝", color: "text-amber-300" },
    { label: "Services",            value: stats.services,  icon: "🧰", color: "text-green-300" },
    { label: "Échanges en attente", value: stats.exchanges, icon: "💱", color: "text-cyan-300" },
  ];

  const financeCards = [
    { label: "Ventes totales",  value: fmt(stats.totalSales),    sub: `Local: ${fmt(stats.totalLocalSales)} · En ligne: ${fmt(stats.totalOnlineSales)}`, color: "text-cyan-300",    bg: "bg-cyan-500/10 border-cyan-500/20" },
    { label: "Cash en caisse",  value: fmt(stats.cashInHand),    sub: "Ventes locales − Dépenses",                                                        color: stats.cashInHand >= 0 ? "text-emerald-300" : "text-red-300", bg: stats.cashInHand >= 0 ? "bg-emerald-500/10 border-emerald-500/20" : "bg-red-500/10 border-red-500/20" },
    { label: "Dépenses",        value: fmt(stats.totalExpenses), sub: "Sorties de caisse enregistrées",                                                   color: "text-orange-300",  bg: "bg-orange-500/10 border-orange-500/20" },
    { label: "Valeur nette",    value: fmt(stats.netValue),      sub: "Toutes ventes − Dépenses",                                                         color: stats.netValue >= 0 ? "text-green-300" : "text-red-300",     bg: stats.netValue >= 0 ? "bg-green-500/10 border-green-500/20" : "bg-red-500/10 border-red-500/20" },
  ];

  return (
    <div className="space-y-4 mb-8">
      {/* Compteurs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {countCards.map((c) => (
          <div key={c.label} className="p-4 bg-white/4 rounded-lg border border-white/6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-3xl">{c.icon}</span>
              <span className={`text-2xl font-bold ${c.color}`}>{loading ? "…" : c.value}</span>
            </div>
            <div className="text-xs text-white/60">{c.label}</div>
          </div>
        ))}
      </div>

      {/* Finances */}
      <div className="bg-white/3 border border-white/6 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wide">💰 Finances</h2>
          <Link href="/admin/stock" className="text-xs text-cyan-400 hover:text-cyan-300 transition">Gérer →</Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {financeCards.map((c) => (
            <div key={c.label} className={`rounded-xl border p-3 ${c.bg}`}>
              <div className="text-xs text-white/40 mb-1">{c.label}</div>
              <div className={`text-base font-bold ${c.color}`}>{loading ? "…" : c.value}</div>
              <div className="text-[10px] text-white/30 mt-0.5">{c.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
