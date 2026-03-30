"use client";

import { useEffect, useState } from "react";
import { ShoppingBag, Truck, AlertTriangle, History, Plus, Trash2, CheckCircle, Clock, XCircle } from "lucide-react";

type Product = { id: string; title: string; quantity: number; unit?: string | null };
type LocalSale = { id: string; product_title: string; quantity: number; unit_price: number; total: number; note?: string | null; sold_at: string };
type Loss = { id: string; product_title: string; quantity: number; reason?: string | null; lost_at: string };
type ArrivalItem = { id?: string; product_id?: string | null; product_title: string; quantity: number };
type Arrival = { id: string; label: string; expected_date: string; status: string; note?: string | null; arrival_items: ArrivalItem[] };

const fmt = (v: number) => new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(v) + " FCFA";
const fmtDate = (d: string) => new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });

const TABS = [
  { key: "sales",    label: "Ventes locales",  icon: ShoppingBag },
  { key: "arrivals", label: "Arrivages",        icon: Truck },
  { key: "losses",   label: "Pertes",           icon: AlertTriangle },
  { key: "history",  label: "Historique",       icon: History },
] as const;
type Tab = typeof TABS[number]["key"];

const ARRIVAL_STATUS = {
  pending:   { label: "En attente",  icon: Clock,        color: "text-yellow-300 bg-yellow-600/15 border-yellow-500/20" },
  received:  { label: "Reçu",        icon: CheckCircle,  color: "text-green-300 bg-green-600/15 border-green-500/20" },
  cancelled: { label: "Annulé",      icon: XCircle,      color: "text-red-300 bg-red-600/15 border-red-500/20" },
};

export default function StockManager() {
  const [tab, setTab] = useState<Tab>("sales");
  const [products, setProducts] = useState<Product[]>([]);

  // Sales state
  const [sales, setSales] = useState<LocalSale[]>([]);
  const [saleForm, setSaleForm] = useState({ product_id: "", product_title: "", quantity: "", unit_price: "", note: "" });
  const [saleLoading, setSaleLoading] = useState(false);
  const [saleMsg, setSaleMsg] = useState<string | null>(null);

  // Arrivals state
  const [arrivals, setArrivals] = useState<Arrival[]>([]);
  const [arrForm, setArrForm] = useState({ label: "", expected_date: "", note: "" });
  const [arrItems, setArrItems] = useState<ArrivalItem[]>([{ product_title: "", quantity: 1 }]);
  const [arrLoading, setArrLoading] = useState(false);
  const [arrMsg, setArrMsg] = useState<string | null>(null);

  // Losses state
  const [losses, setLosses] = useState<Loss[]>([]);
  const [lossForm, setLossForm] = useState({ product_id: "", product_title: "", quantity: "", reason: "" });
  const [lossLoading, setLossLoading] = useState(false);
  const [lossMsg, setLossMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/products").then(r => r.json()).then(j => setProducts(j.products ?? []));
    loadSales(); loadArrivals(); loadLosses();
  }, []);

  const loadSales    = () => fetch("/api/admin/local-sales").then(r => r.json()).then(j => setSales(j.sales ?? []));
  const loadArrivals = () => fetch("/api/admin/arrivals").then(r => r.json()).then(j => setArrivals(j.arrivals ?? []));
  const loadLosses   = () => fetch("/api/admin/losses").then(r => r.json()).then(j => setLosses(j.losses ?? []));

  // ── Vente locale ─────────────────────────────────────────────────────────
  const handleSaleProduct = (pid: string) => {
    const p = products.find(x => x.id === pid);
    setSaleForm(f => ({ ...f, product_id: pid, product_title: p?.title ?? "" }));
  };

  const submitSale = async () => {
    if (!saleForm.product_title || !saleForm.quantity || !saleForm.unit_price) { setSaleMsg("Champs requis manquants."); return; }
    setSaleLoading(true); setSaleMsg(null);
    const res = await fetch("/api/admin/local-sales", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...saleForm, quantity: Number(saleForm.quantity), unit_price: Number(saleForm.unit_price) }),
    });
    const json = await res.json();
    setSaleLoading(false);
    if (json.error) { setSaleMsg("Erreur : " + json.error); return; }
    setSaleForm({ product_id: "", product_title: "", quantity: "", unit_price: "", note: "" });
    await loadSales();
    fetch("/api/admin/products").then(r => r.json()).then(j => setProducts(j.products ?? []));
  };

  const deleteSale = async (id: string) => {
    if (!confirm("Supprimer cette vente ?")) return;
    await fetch("/api/admin/local-sales", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setSales(s => s.filter(x => x.id !== id));
  };

  // ── Arrivage ─────────────────────────────────────────────────────────────
  const addArrItem = () => setArrItems(i => [...i, { product_title: "", quantity: 1 }]);
  const removeArrItem = (idx: number) => setArrItems(i => i.filter((_, j) => j !== idx));
  const updateArrItem = (idx: number, field: keyof ArrivalItem, val: string | number) =>
    setArrItems(i => i.map((it, j) => j === idx ? { ...it, [field]: val } : it));
  const selectArrProduct = (idx: number, pid: string) => {
    const p = products.find(x => x.id === pid);
    setArrItems(i => i.map((it, j) => j === idx ? { ...it, product_id: pid, product_title: p?.title ?? "" } : it));
  };

  const submitArrival = async () => {
    if (!arrForm.label || !arrForm.expected_date) { setArrMsg("Label et date requis."); return; }
    if (arrItems.some(i => !i.product_title || !i.quantity)) { setArrMsg("Remplissez tous les articles."); return; }
    setArrLoading(true); setArrMsg(null);
    const res = await fetch("/api/admin/arrivals", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...arrForm, items: arrItems }),
    });
    const json = await res.json();
    setArrLoading(false);
    if (json.error) { setArrMsg("Erreur : " + json.error); return; }
    setArrForm({ label: "", expected_date: "", note: "" });
    setArrItems([{ product_title: "", quantity: 1 }]);
    await loadArrivals();
  };

  const updateArrivalStatus = async (id: string, status: string) => {
    if (status === "received" && !confirm("Marquer comme reçu ? Le stock sera mis à jour automatiquement.")) return;
    await fetch("/api/admin/arrivals", {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }),
    });
    await loadArrivals();
    fetch("/api/admin/products").then(r => r.json()).then(j => setProducts(j.products ?? []));
  };

  const deleteArrival = async (id: string) => {
    if (!confirm("Supprimer cet arrivage ?")) return;
    await fetch("/api/admin/arrivals", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setArrivals(a => a.filter(x => x.id !== id));
  };

  // ── Perte ────────────────────────────────────────────────────────────────
  const handleLossProduct = (pid: string) => {
    const p = products.find(x => x.id === pid);
    setLossForm(f => ({ ...f, product_id: pid, product_title: p?.title ?? "" }));
  };

  const submitLoss = async () => {
    if (!lossForm.product_title || !lossForm.quantity) { setLossMsg("Champs requis manquants."); return; }
    setLossLoading(true); setLossMsg(null);
    const res = await fetch("/api/admin/losses", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...lossForm, quantity: Number(lossForm.quantity) }),
    });
    const json = await res.json();
    setLossLoading(false);
    if (json.error) { setLossMsg("Erreur : " + json.error); return; }
    setLossForm({ product_id: "", product_title: "", quantity: "", reason: "" });
    await loadLosses();
    fetch("/api/admin/products").then(r => r.json()).then(j => setProducts(j.products ?? []));
  };

  const deleteLoss = async (id: string) => {
    if (!confirm("Supprimer cette perte ?")) return;
    await fetch("/api/admin/losses", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setLosses(l => l.filter(x => x.id !== id));
  };

  // ── Render ────────────────────────────────────────────────────────────────
  const inputCls = "w-full px-3 py-2 rounded-lg bg-white/6 border border-white/12 text-white text-sm placeholder-white/30 focus:outline-none focus:border-cyan-500/50 transition";
  const selectCls = inputCls;

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
              tab === key ? "bg-cyan-600 text-white" : "bg-white/6 text-white/60 hover:bg-white/10 hover:text-white"
            }`}>
            <Icon size={13} />{label}
          </button>
        ))}
      </div>

      {/* ── VENTES LOCALES ── */}
      {tab === "sales" && (
        <div className="space-y-4">
          <div className="bg-white/4 border border-white/10 rounded-xl p-4 space-y-3">
            <h3 className="font-semibold text-white flex items-center gap-2"><ShoppingBag size={16} className="text-cyan-400" /> Enregistrer une vente locale</h3>
            {saleMsg && <p className="text-red-400 text-sm">{saleMsg}</p>}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-white/50 mb-1 block">Produit</label>
                <select className={selectCls} value={saleForm.product_id} onChange={e => handleSaleProduct(e.target.value)}>
                  <option value="">-- Choisir un produit --</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.title} (stock: {p.quantity})</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1 block">Nom produit *</label>
                <input className={inputCls} placeholder="Nom du produit" value={saleForm.product_title}
                  onChange={e => setSaleForm(f => ({ ...f, product_title: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1 block">Quantité *</label>
                <input className={inputCls} type="number" min="1" placeholder="Qté" value={saleForm.quantity}
                  onChange={e => setSaleForm(f => ({ ...f, quantity: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1 block">Prix unitaire (FCFA) *</label>
                <input className={inputCls} type="number" placeholder="Prix" value={saleForm.unit_price}
                  onChange={e => setSaleForm(f => ({ ...f, unit_price: e.target.value }))} />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-white/50 mb-1 block">Note (optionnel)</label>
                <input className={inputCls} placeholder="Note..." value={saleForm.note}
                  onChange={e => setSaleForm(f => ({ ...f, note: e.target.value }))} />
              </div>
            </div>
            <button onClick={submitSale} disabled={saleLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium transition disabled:opacity-50">
              <Plus size={14} />{saleLoading ? "Enregistrement..." : "Enregistrer la vente"}
            </button>
          </div>

          {/* Liste ventes */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-white/60">Ventes locales ({sales.length})</h4>
            {sales.length === 0 ? <p className="text-white/30 text-sm text-center py-6">Aucune vente locale enregistrée.</p> : sales.map(s => (
              <div key={s.id} className="flex items-center gap-3 bg-white/3 border border-white/6 rounded-lg px-3 py-2.5">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">{s.product_title}</div>
                  <div className="text-xs text-white/40">{fmtDate(s.sold_at)} · Qté {s.quantity} · {fmt(s.unit_price)}/u</div>
                  {s.note && <div className="text-xs text-white/30 italic">{s.note}</div>}
                </div>
                <div className="text-cyan-300 font-semibold text-sm whitespace-nowrap">{fmt(s.total)}</div>
                <button onClick={() => deleteSale(s.id)} className="p-1.5 rounded hover:bg-red-600/20 text-red-400 transition"><Trash2 size={13} /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── ARRIVAGES ── */}
      {tab === "arrivals" && (
        <div className="space-y-4">
          <div className="bg-white/4 border border-white/10 rounded-xl p-4 space-y-3">
            <h3 className="font-semibold text-white flex items-center gap-2"><Truck size={16} className="text-cyan-400" /> Planifier un arrivage</h3>
            {arrMsg && <p className="text-red-400 text-sm">{arrMsg}</p>}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-white/50 mb-1 block">Label *</label>
                <input className={inputCls} placeholder="Ex: Conteneur Mars 2026" value={arrForm.label}
                  onChange={e => setArrForm(f => ({ ...f, label: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1 block">Date prévue *</label>
                <input className={inputCls} type="date" value={arrForm.expected_date}
                  onChange={e => setArrForm(f => ({ ...f, expected_date: e.target.value }))} />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-white/50 mb-1 block">Note</label>
                <input className={inputCls} placeholder="Note optionnelle..." value={arrForm.note}
                  onChange={e => setArrForm(f => ({ ...f, note: e.target.value }))} />
              </div>
            </div>

            {/* Articles */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-white/50">Articles de l'arrivage</label>
                <button onClick={addArrItem} className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
                  <Plus size={12} /> Ajouter un article
                </button>
              </div>
              <div className="space-y-2">
                {arrItems.map((it, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <select className={selectCls + " flex-1"} value={it.product_id ?? ""}
                      onChange={e => selectArrProduct(idx, e.target.value)}>
                      <option value="">-- Produit --</option>
                      {products.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                    </select>
                    <input className={inputCls + " w-36"} placeholder="Nom si nouveau" value={it.product_title}
                      onChange={e => updateArrItem(idx, "product_title", e.target.value)} />
                    <input className={inputCls + " w-20"} type="number" min="1" placeholder="Qté" value={it.quantity}
                      onChange={e => updateArrItem(idx, "quantity", Number(e.target.value))} />
                    {arrItems.length > 1 && (
                      <button onClick={() => removeArrItem(idx)} className="p-1.5 text-red-400 hover:bg-red-600/20 rounded transition"><Trash2 size={13} /></button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <button onClick={submitArrival} disabled={arrLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium transition disabled:opacity-50">
              <Plus size={14} />{arrLoading ? "Enregistrement..." : "Planifier l'arrivage"}
            </button>
          </div>

          {/* Liste arrivages */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-white/60">Arrivages ({arrivals.length})</h4>
            {arrivals.length === 0 ? <p className="text-white/30 text-sm text-center py-6">Aucun arrivage planifié.</p> : arrivals.map(a => {
              const st = ARRIVAL_STATUS[a.status as keyof typeof ARRIVAL_STATUS] ?? ARRIVAL_STATUS.pending;
              const Icon = st.icon;
              return (
                <div key={a.id} className="bg-white/3 border border-white/6 rounded-xl overflow-hidden">
                  <div className="flex items-center gap-3 p-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-white">{a.label}</div>
                      <div className="text-xs text-white/40">Prévu le {fmtDate(a.expected_date)}</div>
                      {a.note && <div className="text-xs text-white/30 italic">{a.note}</div>}
                    </div>
                    <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${st.color}`}>
                      <Icon size={11} />{st.label}
                    </span>
                    <button onClick={() => deleteArrival(a.id)} className="p-1.5 rounded hover:bg-red-600/20 text-red-400 transition"><Trash2 size={13} /></button>
                  </div>
                  {a.arrival_items?.length > 0 && (
                    <div className="border-t border-white/6 px-3 pb-2">
                      <div className="text-xs text-white/30 mt-2 mb-1">Articles</div>
                      <ul className="space-y-0.5">
                        {a.arrival_items.map((it, i) => (
                          <li key={i} className="text-xs text-white/60 flex justify-between">
                            <span>{it.product_title}</span><span className="text-white/40">Qté {it.quantity}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {a.status === "pending" && (
                    <div className="border-t border-white/6 p-3 flex gap-2">
                      <button onClick={() => updateArrivalStatus(a.id, "received")}
                        className="flex-1 py-1.5 rounded-lg bg-green-600/20 hover:bg-green-600/40 text-green-300 text-xs font-medium transition flex items-center justify-center gap-1">
                        <CheckCircle size={12} /> Marquer reçu (stock mis à jour)
                      </button>
                      <button onClick={() => updateArrivalStatus(a.id, "cancelled")}
                        className="flex-1 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/40 text-red-300 text-xs font-medium transition flex items-center justify-center gap-1">
                        <XCircle size={12} /> Annuler
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── PERTES ── */}
      {tab === "losses" && (
        <div className="space-y-4">
          <div className="bg-white/4 border border-white/10 rounded-xl p-4 space-y-3">
            <h3 className="font-semibold text-white flex items-center gap-2"><AlertTriangle size={16} className="text-red-400" /> Enregistrer une perte</h3>
            {lossMsg && <p className="text-red-400 text-sm">{lossMsg}</p>}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-white/50 mb-1 block">Produit</label>
                <select className={selectCls} value={lossForm.product_id} onChange={e => handleLossProduct(e.target.value)}>
                  <option value="">-- Choisir un produit --</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.title} (stock: {p.quantity})</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1 block">Nom produit *</label>
                <input className={inputCls} placeholder="Nom du produit" value={lossForm.product_title}
                  onChange={e => setLossForm(f => ({ ...f, product_title: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1 block">Quantité perdue *</label>
                <input className={inputCls} type="number" min="1" placeholder="Qté" value={lossForm.quantity}
                  onChange={e => setLossForm(f => ({ ...f, quantity: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1 block">Raison</label>
                <input className={inputCls} placeholder="Ex: Produit avarié, vol..." value={lossForm.reason}
                  onChange={e => setLossForm(f => ({ ...f, reason: e.target.value }))} />
              </div>
            </div>
            <button onClick={submitLoss} disabled={lossLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-medium transition disabled:opacity-50">
              <Plus size={14} />{lossLoading ? "Enregistrement..." : "Enregistrer la perte"}
            </button>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium text-white/60">Pertes enregistrées ({losses.length})</h4>
            {losses.length === 0 ? <p className="text-white/30 text-sm text-center py-6">Aucune perte enregistrée.</p> : losses.map(l => (
              <div key={l.id} className="flex items-center gap-3 bg-white/3 border border-white/6 rounded-lg px-3 py-2.5">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">{l.product_title}</div>
                  <div className="text-xs text-white/40">{fmtDate(l.lost_at)} · Qté perdue : {l.quantity}</div>
                  {l.reason && <div className="text-xs text-red-400/70">{l.reason}</div>}
                </div>
                <span className="text-red-400 font-semibold text-sm">-{l.quantity}</span>
                <button onClick={() => deleteLoss(l.id)} className="p-1.5 rounded hover:bg-red-600/20 text-red-400 transition"><Trash2 size={13} /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── HISTORIQUE ── */}
      {tab === "history" && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-white/60">Historique complet des sorties de stock</h4>
          {[
            ...sales.map(s => ({ type: "sale" as const, date: s.sold_at, title: s.product_title, qty: s.quantity, extra: fmt(s.total) })),
            ...losses.map(l => ({ type: "loss" as const, date: l.lost_at, title: l.product_title, qty: l.quantity, extra: l.reason ?? "" })),
          ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((entry, i) => (
            <div key={i} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border ${
              entry.type === "sale" ? "bg-cyan-900/10 border-cyan-500/15" : "bg-red-900/10 border-red-500/15"
            }`}>
              {entry.type === "sale"
                ? <ShoppingBag size={14} className="text-cyan-400 flex-shrink-0" />
                : <AlertTriangle size={14} className="text-red-400 flex-shrink-0" />}
              <div className="flex-1 min-w-0">
                <div className="text-sm text-white truncate">{entry.title}</div>
                <div className="text-xs text-white/40">{fmtDate(entry.date)} · {entry.type === "sale" ? "Vente locale" : "Perte"}</div>
              </div>
              <div className="text-right">
                <div className={`text-sm font-semibold ${entry.type === "sale" ? "text-cyan-300" : "text-red-300"}`}>
                  {entry.type === "sale" ? "-" : "-"}{entry.qty} unité{entry.qty > 1 ? "s" : ""}
                </div>
                {entry.extra && <div className="text-xs text-white/40">{entry.extra}</div>}
              </div>
            </div>
          ))}
          {sales.length === 0 && losses.length === 0 && (
            <p className="text-white/30 text-sm text-center py-6">Aucun mouvement de stock enregistré.</p>
          )}
        </div>
      )}
    </div>
  );
}
