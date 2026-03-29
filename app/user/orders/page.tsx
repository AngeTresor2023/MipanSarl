"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle, Clock, Package, Truck, XCircle, Printer, ShoppingBag } from "lucide-react";

type OrderItem = {
  product_id: string;
  title?: string;
  price: number;
  qty: number;
};

type Order = {
  id: string;
  order_number: string;
  customer_name?: string | null;
  items: OrderItem[];
  total?: number | null;
  status: string;
  created_at: string;
};

const STATUS: Record<string, { label: string; color: string; icon: React.ReactNode; step: number }> = {
  pending_payment: { label: "En attente de vérification",  color: "text-yellow-300 bg-yellow-500/10 border-yellow-500/25", icon: <Clock size={13} />,        step: 1 },
  confirmed:       { label: "Commande confirmée",          color: "text-blue-300   bg-blue-500/10   border-blue-500/25",   icon: <CheckCircle size={13} />,   step: 2 },
  paid:            { label: "Paiement reçu",               color: "text-blue-300   bg-blue-500/10   border-blue-500/25",   icon: <CheckCircle size={13} />,   step: 2 },
  processing:      { label: "En préparation",              color: "text-purple-300 bg-purple-500/10 border-purple-500/25", icon: <Package size={13} />,       step: 3 },
  shipped:         { label: "Expédié",                     color: "text-cyan-300   bg-cyan-500/10   border-cyan-500/25",   icon: <Truck size={13} />,         step: 4 },
  delivered:       { label: "Livré",                       color: "text-green-300  bg-green-500/10  border-green-500/25",  icon: <CheckCircle size={13} />,   step: 5 },
  cancelled:       { label: "Annulé",                      color: "text-red-300    bg-red-500/10    border-red-500/25",    icon: <XCircle size={13} />,       step: 0 },
};

const STEPS = [
  { step: 1, label: "Reçue" },
  { step: 2, label: "Confirmée" },
  { step: 3, label: "Préparation" },
  { step: 4, label: "Expédiée" },
  { step: 5, label: "Livrée" },
];

const fmt = (v: number) =>
  new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(v) + " FCFA";

/* ── Bon de retrait (receipt) ───────────────────────────────────────────── */
function Receipt({ order }: { order: Order }) {
  const receiptRef = useRef<HTMLDivElement>(null);

  const date = new Date(order.created_at).toLocaleDateString("fr-FR", {
    day: "2-digit", month: "long", year: "numeric",
  });

  const handlePrint = () => {
    const content = receiptRef.current?.innerHTML ?? "";
    const win = window.open("", "_blank", "width=750,height=900");
    if (!win) return;
    win.document.write(`<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Bon de retrait — ${order.order_number}</title>
  <style>
    @page { margin: 15mm 12mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a2e; background: #fff; }
    .rh { background: linear-gradient(135deg, #0f3460 0%, #16213e 100%); color: white; padding: 26px 32px 22px; }
    .rh-brand { font-size: 22px; font-weight: 800; letter-spacing: 1px; }
    .rh-sub { font-size: 10px; color: rgba(255,255,255,.55); margin-top: 3px; letter-spacing: 2.5px; text-transform: uppercase; }
    .rh-title { margin-top: 16px; font-size: 12px; font-weight: 600; color: rgba(255,255,255,.8); text-transform: uppercase; letter-spacing: 1.5px; }
    .accent { height: 3px; background: linear-gradient(90deg, #00b4d8 0%, #0077b6 60%, transparent 100%); }
    .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 0; background: #f7f9ff; border-bottom: 1px solid #e5eaf5; }
    .meta-cell { padding: 14px 32px; border-right: 1px solid #e5eaf5; }
    .meta-cell:nth-child(even) { border-right: none; }
    .meta-label { font-size: 9px; text-transform: uppercase; letter-spacing: 1.2px; color: #8492a6; font-weight: 700; margin-bottom: 4px; }
    .meta-val { font-size: 13px; font-weight: 600; color: #1a1a2e; }
    .meta-val.mono { font-family: 'Courier New', monospace; font-size: 14px; color: #0077b6; }
    .tbl-wrap { padding: 22px 32px 0; }
    .tbl-title { font-size: 9px; text-transform: uppercase; letter-spacing: 1.5px; color: #8492a6; font-weight: 700; margin-bottom: 10px; }
    table { width: 100%; border-collapse: collapse; }
    thead tr { background: #eef2ff; }
    th { padding: 9px 10px; font-size: 9px; text-transform: uppercase; letter-spacing: .5px; color: #6b7280; font-weight: 700; border-bottom: 2px solid #dde3f0; text-align: left; }
    th.r, td.r { text-align: right; }
    th.c, td.c { text-align: center; }
    td { padding: 9px 10px; font-size: 12px; border-bottom: 1px solid #eef2ff; color: #374151; }
    tr:nth-child(even) td { background: #fafbff; }
    td.name { font-weight: 500; color: #1a1a2e; }
    .total-wrap { margin: 20px 32px; background: linear-gradient(135deg, #0f3460 0%, #16213e 100%); border-radius: 10px; padding: 14px 20px; display: flex; justify-content: space-between; align-items: center; }
    .total-lbl { font-size: 12px; color: rgba(255,255,255,.7); font-weight: 600; }
    .total-amt { font-size: 22px; font-weight: 800; color: #00c9e0; letter-spacing: .5px; }
    .stamp-row { padding: 4px 32px 16px; display: flex; justify-content: flex-end; }
    .stamp { display: inline-block; border: 2.5px solid #0077b6; color: #0077b6; padding: 5px 14px; border-radius: 5px; font-size: 12px; font-weight: 800; letter-spacing: 3px; text-transform: uppercase; transform: rotate(-8deg); opacity: .75; }
    .rf { background: #f7f9ff; border-top: 1px solid #e5eaf5; padding: 14px 32px; }
    .rf-instr { font-size: 11px; color: #374151; line-height: 1.65; margin-bottom: 10px; }
    .rf-contacts { display: flex; gap: 32px; }
    .rf-contact { font-size: 10px; color: #6b7280; line-height: 1.5; }
    .rf-contact strong { display: block; color: #374151; }
    .divider { height: 1px; background: #e5eaf5; margin: 0 32px; }
  </style>
</head>
<body>${content}</body>
</html>`);
    win.document.close();
    win.print();
  };

  return (
    <>
      {/* ── In-app premium view ──────────────────────────────────────────── */}
      <div className="rounded-2xl overflow-hidden border border-blue-500/20 bg-gradient-to-br from-[#0a1628] to-[#0d1f3c]">

        {/* Header */}
        <div className="px-5 pt-5 pb-4 bg-gradient-to-r from-blue-900/60 to-blue-950/60 border-b border-blue-500/15">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[10px] font-bold tracking-[2px] text-blue-300/60 uppercase mb-1">Bon de retrait officiel</div>
              <div className="text-lg font-black text-white tracking-wide">MIPAN SARL</div>
              <div className="text-[10px] text-blue-300/50 tracking-widest uppercase mt-0.5">Transport &amp; Logistique</div>
            </div>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition shadow-md shadow-blue-900/40"
            >
              <Printer size={13} /> Imprimer / PDF
            </button>
          </div>
        </div>

        {/* Reference strip */}
        <div className="flex items-center justify-between gap-4 px-5 py-3 border-b border-blue-500/10 bg-blue-950/30">
          <div>
            <div className="text-[9px] text-white/35 uppercase tracking-widest mb-0.5">Référence</div>
            <div className="font-mono text-blue-300 font-bold text-sm tracking-wider">{order.order_number}</div>
          </div>
          <div className="text-right">
            <div className="text-[9px] text-white/35 uppercase tracking-widest mb-0.5">Date</div>
            <div className="text-white/70 text-xs font-medium">{date}</div>
          </div>
          {order.customer_name && (
            <div className="text-right">
              <div className="text-[9px] text-white/35 uppercase tracking-widest mb-0.5">Client</div>
              <div className="text-white/70 text-xs font-medium">{order.customer_name}</div>
            </div>
          )}
          <div className="border border-blue-400/40 text-blue-400 text-[10px] font-extrabold tracking-[3px] px-2.5 py-1 rounded rotate-[-4deg] opacity-80 uppercase">
            Confirmé
          </div>
        </div>

        {/* Items table */}
        <div className="px-5 py-4">
          <div className="text-[9px] text-white/30 uppercase tracking-widest mb-2">Détail de la commande</div>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-left">
                <th className="pb-2 text-[9px] font-bold text-white/30 uppercase tracking-wider border-b border-white/8 pr-3">Article</th>
                <th className="pb-2 text-[9px] font-bold text-white/30 uppercase tracking-wider border-b border-white/8 text-center w-10">Qté</th>
                <th className="pb-2 text-[9px] font-bold text-white/30 uppercase tracking-wider border-b border-white/8 text-right w-28">Prix unit.</th>
                <th className="pb-2 text-[9px] font-bold text-white/30 uppercase tracking-wider border-b border-white/8 text-right w-28">Sous-total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((it, i) => (
                <tr key={i} className="border-b border-white/5 last:border-0">
                  <td className="py-2.5 text-white/80 font-medium pr-3">{it.title ?? it.product_id}</td>
                  <td className="py-2.5 text-white/55 text-center">{it.qty}</td>
                  <td className="py-2.5 text-white/55 text-right">{fmt(Number(it.price))}</td>
                  <td className="py-2.5 text-white/80 text-right font-semibold">{fmt(Number(it.price) * Number(it.qty))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Total */}
        <div className="mx-5 mb-4 rounded-xl bg-gradient-to-r from-blue-700 to-blue-800 px-5 py-3 flex items-center justify-between">
          <span className="text-blue-200 text-sm font-semibold">Total à payer</span>
          <span className="text-white text-xl font-black tracking-wide">{fmt(Number(order.total))}</span>
        </div>

        {/* Footer instruction */}
        <div className="px-5 pb-5 text-[11px] text-white/35 leading-relaxed border-t border-white/6 pt-3">
          Présentez ce bon à notre entrepôt ou au livreur pour récupérer et régler votre commande.
          Ce bon est valable 30 jours à compter de la date de confirmation.
          <span className="block mt-1 text-blue-400/60">MIPAN SARL — Douala, Cameroun — contact@mipansarl.com</span>
        </div>
      </div>

      {/* ── Hidden print source ──────────────────────────────────────────── */}
      <div ref={receiptRef} style={{ display: "none" }}>
        <div className="rh">
          <div className="rh-brand">MIPAN SARL</div>
          <div className="rh-sub">Transport &amp; Logistique Internationale</div>
          <div className="rh-title">Bon de retrait — Reçu de commande</div>
        </div>
        <div className="accent" />

        <div className="meta">
          <div className="meta-cell">
            <div className="meta-label">Numéro de commande</div>
            <div className="meta-val mono">{order.order_number}</div>
          </div>
          <div className="meta-cell">
            <div className="meta-label">Date d&apos;émission</div>
            <div className="meta-val">{date}</div>
          </div>
          {order.customer_name && (
            <div className="meta-cell">
              <div className="meta-label">Client</div>
              <div className="meta-val">{order.customer_name}</div>
            </div>
          )}
          <div className="meta-cell">
            <div className="meta-label">Statut</div>
            <div className="meta-val">Commande confirmée</div>
          </div>
        </div>

        <div className="tbl-wrap">
          <div className="tbl-title">Détail de la commande</div>
          <table>
            <thead>
              <tr>
                <th>Article</th>
                <th className="c">Qté</th>
                <th className="r">Prix unit.</th>
                <th className="r">Sous-total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((it, i) => (
                <tr key={i}>
                  <td className="name">{it.title ?? it.product_id}</td>
                  <td className="c">{it.qty}</td>
                  <td className="r">{fmt(Number(it.price))}</td>
                  <td className="r">{fmt(Number(it.price) * Number(it.qty))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="total-wrap">
          <span className="total-lbl">Total à payer</span>
          <span className="total-amt">{fmt(Number(order.total))}</span>
        </div>

        <div className="stamp-row">
          <div className="stamp">Confirmé</div>
        </div>

        <div className="rf">
          <div className="rf-instr">
            Présentez ce document à notre entrepôt ou au livreur pour récupérer et régler votre commande.
            Ce bon est valable 30 jours à compter de la date de confirmation.
          </div>
          <div className="rf-contacts">
            <div className="rf-contact"><strong>Adresse</strong>Douala, Cameroun</div>
            <div className="rf-contact"><strong>Email</strong>contact@mipansarl.com</div>
            <div className="rf-contact"><strong>WhatsApp</strong>+237 XXX XXX XXX</div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Page principale ────────────────────────────────────────────────────── */
export default function UserOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/orders");
        if (!res.ok) {
          const err = await res.json();
          setError(err.error ?? "Erreur lors du chargement.");
          return;
        }
        const json = await res.json();
        setOrders(json.orders ?? []);
      } catch {
        setError("Erreur réseau.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen text-white px-4 py-8 bg-[#080d18]">
      <div className="max-w-4xl mx-auto space-y-6">

        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Mes commandes</h1>
            <p className="text-white/45 text-sm mt-0.5">Suivez l&apos;état de vos commandes en temps réel.</p>
          </div>
          <Link href="/user/products">
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition">
              <ShoppingBag size={14} /> Nouvelle commande
            </button>
          </Link>
        </header>

        {/* Loading */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse bg-white/4 border border-white/8 rounded-xl h-32" />
            ))}
          </div>
        )}

        {/* Erreur */}
        {!loading && error && (
          <div className="bg-red-900/20 border border-red-500/20 p-5 rounded-xl">
            <p className="text-red-300 text-sm">{error}</p>
            <p className="text-white/40 text-xs mt-1">
              Si vous n&apos;êtes pas connecté,{" "}
              <Link href="/auth/login" className="text-blue-300 underline">connectez-vous</Link>.
            </p>
          </div>
        )}

        {/* Vide */}
        {!loading && !error && orders.length === 0 && (
          <div className="bg-white/4 border border-white/8 p-12 rounded-2xl text-center space-y-4">
            <Package size={40} className="mx-auto text-white/20" />
            <p className="text-white/55 text-sm">Vous n&apos;avez pas encore de commandes.</p>
            <Link href="/user/products">
              <button className="mt-1 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition">
                Découvrir la boutique <ArrowRight size={14} />
              </button>
            </Link>
          </div>
        )}

        {/* Liste commandes */}
        {!loading && !error && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order) => {
              const meta = STATUS[order.status] ?? { label: order.status, color: "text-white/60 bg-white/6 border-white/12", icon: null, step: 0 };
              const showReceipt = ["confirmed", "paid", "processing", "shipped", "delivered"].includes(order.status);
              const isCancelled = order.status === "cancelled";

              return (
                <article key={order.id} className="bg-white/4 border border-white/8 rounded-2xl overflow-hidden">
                  {/* En-tête */}
                  <div className="flex flex-wrap items-start justify-between gap-3 p-5">
                    <div>
                      <div className="font-bold text-white">{order.order_number}</div>
                      <div className="text-xs text-white/40 mt-0.5">
                        {new Date(order.created_at).toLocaleDateString("fr-FR", {
                          day: "2-digit", month: "long", year: "numeric",
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${meta.color}`}>
                        {meta.icon} {meta.label}
                      </span>
                      {order.total != null && (
                        <span className="text-blue-400 font-bold text-sm">{fmt(Number(order.total))}</span>
                      )}
                    </div>
                  </div>

                  {/* Barre de progression */}
                  {!isCancelled && (
                    <div className="px-5 pb-4">
                      <div className="flex items-center gap-0">
                        {STEPS.map((s, i) => {
                          const done = meta.step >= s.step;
                          const active = meta.step === s.step;
                          return (
                            <div key={s.step} className="flex items-center flex-1 last:flex-none">
                              <div className="flex flex-col items-center gap-1">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center border text-xs font-bold transition-all ${
                                  done ? "bg-blue-600 border-blue-500 text-white" :
                                  active ? "bg-blue-600/30 border-blue-400 text-blue-300" :
                                  "bg-white/5 border-white/15 text-white/30"
                                }`}>
                                  {done && !active ? "✓" : s.step}
                                </div>
                                <span className={`text-[10px] whitespace-nowrap ${done ? "text-white/60" : "text-white/25"}`}>
                                  {s.label}
                                </span>
                              </div>
                              {i < STEPS.length - 1 && (
                                <div className={`flex-1 h-px mx-1 mb-4 ${meta.step > s.step ? "bg-blue-500/40" : "bg-white/10"}`} />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Articles */}
                  {Array.isArray(order.items) && order.items.length > 0 && (
                    <div className="border-t border-white/6 px-5 py-4">
                      <div className="text-xs text-white/40 mb-2">Articles</div>
                      <ul className="space-y-1">
                        {order.items.map((item, i) => (
                          <li key={i} className="flex justify-between text-sm">
                            <span className="text-white/65">{item.title ?? item.product_id} × {item.qty}</span>
                            <span className="text-white/65">{fmt(Number(item.price) * Number(item.qty))}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Message attente */}
                  {order.status === "pending_payment" && (
                    <div className="border-t border-white/6 px-5 py-3">
                      <p className="text-yellow-300/60 text-xs flex items-center gap-1.5">
                        <Clock size={11} /> Notre équipe examine votre commande et vous contactera pour confirmer.
                      </p>
                    </div>
                  )}

                  {/* Bon de retrait */}
                  {showReceipt && (
                    <div className="border-t border-white/6 px-5 py-4">
                      <Receipt order={order} />
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
