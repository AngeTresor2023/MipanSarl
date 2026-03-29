// components/admin/AdminStats.tsx
"use client";

import { useEffect, useState } from "react";

type Stats = {
  users: number;
  products: number;
  quotes: number;
  services: number;
  exchanges: number;
};

export default function AdminStats() {
  const [stats, setStats] = useState<Stats>({ users: 0, products: 0, quotes: 0, services: 0, exchanges: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((json) => {
        if (!json.error) setStats(json);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: "Utilisateurs",        value: stats.users,     icon: "👥", color: "text-blue-300" },
    { label: "Produits",             value: stats.products,  icon: "📦", color: "text-purple-300" },
    { label: "Devis en attente",     value: stats.quotes,    icon: "📝", color: "text-amber-300" },
    { label: "Services",             value: stats.services,  icon: "🧰", color: "text-green-300" },
    { label: "Échanges en attente",  value: stats.exchanges, icon: "💱", color: "text-cyan-300" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
      {cards.map((c) => (
        <div key={c.label} className="p-4 bg-white/4 rounded-lg border border-white/6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl">{c.icon}</span>
            <span className={`text-2xl font-bold ${c.color}`}>
              {loading ? "…" : c.value}
            </span>
          </div>
          <div className="text-xs text-white/60">{c.label}</div>
        </div>
      ))}
    </div>
  );
}
