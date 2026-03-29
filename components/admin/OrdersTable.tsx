"use client";

import { useEffect, useState } from "react";

type OrderItem = {
  product_id?: string;
  title?: string;
  price?: number;
  qty?: number;
};

type Order = {
  id: string;
  order_number?: string | null;
  customer_name?: string | null;
  user_email?: string | null;
  items?: OrderItem[] | null;
  total?: number | null;
  status?: string | null;
  created_at?: string | null;
};

const STATUS_OPTIONS = [
  { value: "pending_payment", label: "En attente",    color: "bg-yellow-600/20 text-yellow-300" },
  { value: "confirmed",       label: "Confirmer ✓",   color: "bg-blue-600/20 text-blue-300" },
  { value: "paid",            label: "Payé",          color: "bg-blue-600/20 text-blue-300" },
  { value: "processing",      label: "En préparation",color: "bg-purple-600/20 text-purple-300" },
  { value: "shipped",         label: "Expédié",       color: "bg-cyan-600/20 text-cyan-300" },
  { value: "delivered",       label: "Livré",         color: "bg-green-600/20 text-green-300" },
  { value: "cancelled",       label: "Annulé",        color: "bg-red-600/20 text-red-300" },
];

const statusMeta = (s: string | null | undefined) =>
  STATUS_OPTIONS.find((o) => o.value === s) ?? { label: s ?? "—", color: "bg-white/10 text-white/60" };

const fmt = (v: number) =>
  new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(v) + " FCFA";

export default function OrdersTable({ compact }: { compact?: boolean }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    const limit = compact ? 10 : 100;
    fetch(`/api/admin/orders?limit=${limit}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.error) setUnavailable(true);
        else setOrders((json.orders ?? []) as Order[]);
      })
      .catch(() => setUnavailable(true))
      .finally(() => setLoading(false));
  }, [compact]);

  const updateStatus = async (id: string, status: string) => {
    const res = await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) {
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    }
  };

  if (loading) return <div className="text-white/60 text-sm">Chargement commandes...</div>;

  if (unavailable)
    return (
      <div className="text-white/40 text-sm p-4 text-center bg-white/3 rounded">
        La table <code className="text-cyan-400">orders</code> n&apos;est pas encore créée dans Supabase.
      </div>
    );

  if (orders.length === 0)
    return <div className="text-white/40 text-sm p-4 text-center">Aucune commande pour le moment.</div>;

  return (
    <div className="space-y-2">
      {orders.map((o) => {
        const meta = statusMeta(o.status);
        const isExpanded = expanded === o.id;

        return (
          <div key={o.id} className="bg-white/3 border border-white/6 rounded-lg overflow-hidden">
            <div
              className="flex flex-wrap items-center gap-3 p-3 cursor-pointer hover:bg-white/5 transition"
              onClick={() => setExpanded(isExpanded ? null : o.id)}
            >
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{o.order_number ?? o.id.substring(0, 8)}</div>
                <div className="text-xs text-white/50">{o.customer_name ?? o.user_email ?? "—"}</div>
              </div>

              <div className="text-cyan-300 font-semibold text-sm">
                {o.total != null ? fmt(Number(o.total)) : "—"}
              </div>

              <span className={`px-2 py-0.5 rounded text-xs font-medium ${meta.color}`}>
                {meta.label}
              </span>

              {!compact && (
                <div className="text-xs text-white/40">
                  {o.created_at ? new Date(o.created_at).toLocaleDateString("fr-FR") : "—"}
                </div>
              )}

              <span className="text-white/30 text-xs ml-auto">{isExpanded ? "▲" : "▼"}</span>
            </div>

            {isExpanded && (
              <div className="border-t border-white/6 p-3 space-y-3 bg-black/20">
                {Array.isArray(o.items) && o.items.length > 0 && (
                  <div>
                    <div className="text-xs text-white/50 mb-1">Articles</div>
                    <ul className="space-y-0.5">
                      {o.items.map((item, i) => (
                        <li key={i} className="flex justify-between text-xs text-white/70">
                          <span>{item.title ?? item.product_id} × {item.qty}</span>
                          <span>{item.price != null ? fmt(Number(item.price) * Number(item.qty ?? 1)) : "—"}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Bouton confirmation rapide */}
                {o.status === "pending_payment" && (
                  <button
                    onClick={() => updateStatus(o.id, "confirmed")}
                    className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition flex items-center justify-center gap-2"
                  >
                    ✓ Confirmer la commande (envoyer le bon au client)
                  </button>
                )}

                <div>
                  <div className="text-xs text-white/50 mb-2">Changer le statut</div>
                  <div className="flex flex-wrap gap-2">
                    {STATUS_OPTIONS.map((s) => (
                      <button
                        key={s.value}
                        onClick={() => updateStatus(o.id, s.value)}
                        className={`px-2 py-1 rounded text-xs transition ${
                          o.status === s.value
                            ? s.color + " ring-1 ring-white/20"
                            : "bg-white/5 text-white/60 hover:bg-white/10"
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
