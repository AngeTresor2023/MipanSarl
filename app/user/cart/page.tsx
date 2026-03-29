"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ShoppingCart, CheckCircle, Package, Clock, ArrowRight, X, Trash2, Plus, Minus } from "lucide-react";

type CartItem = {
  id: string;
  title?: string;
  price: number;
  qty: number;
  image_url?: string | null;
};

type PlacedOrder = {
  id: string;
  order_number: string;
};

const supabase = createClient();

/* ── Modal confirmation ────────────────────────────────────────────────── */
function OrderConfirmModal({ order, onClose }: { order: PlacedOrder; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Card */}
      <div className="relative w-full max-w-md bg-[#0d1424] border border-blue-500/20 rounded-2xl p-8 shadow-2xl shadow-blue-900/30 text-center space-y-5">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/40 hover:text-white transition"
        >
          <X size={18} />
        </button>

        {/* Icône succès */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
            <CheckCircle size={32} className="text-blue-400" />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-white">Commande reçue !</h2>
          <p className="text-white/50 text-sm mt-1">
            Numéro <span className="font-semibold text-blue-300">{order.order_number}</span>
          </p>
        </div>

        {/* Étapes */}
        <div className="bg-white/4 border border-white/8 rounded-xl p-4 text-left space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-600/30 border border-blue-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-blue-300 text-xs font-bold">1</span>
            </div>
            <div>
              <p className="text-white text-sm font-medium">Vérification en cours</p>
              <p className="text-white/45 text-xs mt-0.5">Notre équipe examine votre commande.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-white/8 border border-white/12 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white/40 text-xs font-bold">2</span>
            </div>
            <div>
              <p className="text-white/60 text-sm font-medium">Confirmation & paiement</p>
              <p className="text-white/35 text-xs mt-0.5">Vous recevrez un bon de retrait après confirmation.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-white/8 border border-white/12 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white/40 text-xs font-bold">3</span>
            </div>
            <div>
              <p className="text-white/60 text-sm font-medium">Retrait ou livraison</p>
              <p className="text-white/35 text-xs mt-0.5">Payez à l&apos;entrepôt ou à la livraison.</p>
            </div>
          </div>
        </div>

        <p className="text-white/45 text-xs">
          Suivez l&apos;état de votre commande dans <strong className="text-white/70">Mes commandes</strong>.
        </p>

        <div className="flex flex-col sm:flex-row gap-2">
          <Link href="/user/orders" className="flex-1">
            <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition">
              Mes commandes <ArrowRight size={14} />
            </button>
          </Link>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-white/12 text-white/60 hover:text-white hover:bg-white/6 text-sm transition"
          >
            Continuer mes achats
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Page principale ───────────────────────────────────────────────────── */
export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [placedOrder, setPlacedOrder] = useState<PlacedOrder | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const syncTimer = useRef<number | null>(null);
  const isSyncing = useRef(false);

  const total = useMemo(
    () => cart.reduce((s, i) => s + Number(i.price || 0) * Number(i.qty || 0), 0),
    [cart]
  );

  const fmt = (v: number) =>
    new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(v) + " FCFA";

  /* ── LocalStorage ───────────────────────────────────────────────────── */
  const readLocalCart = (): CartItem[] => {
    try {
      const raw = localStorage.getItem("user/cart") || localStorage.getItem("cart") || "[]";
      return JSON.parse(raw);
    } catch { return []; }
  };

  const writeLocalCart = (items: CartItem[]) => {
    try {
      const str = JSON.stringify(items);
      localStorage.setItem("cart", str);
      localStorage.setItem("user/cart", str);
      try { window.dispatchEvent(new CustomEvent("user-cart-updated", { detail: items })); } catch {}
    } catch {}
  };

  /* ── Merge carts ────────────────────────────────────────────────────── */
  const mergeCarts = (
    server: { product_id?: string; id?: string; title?: string; price: number; qty: number; image_url?: string | null }[],
    local: CartItem[]
  ) => {
    const map = new Map<string, CartItem>();
    server.forEach((s) => {
      const id = s.product_id ?? s.id;
      if (!id) return;
      map.set(id, { id, title: s.title, price: Number(s.price), qty: Number(s.qty), image_url: s.image_url ?? null });
    });
    local.forEach((l) => {
      if (!l.id) return;
      if (map.has(l.id)) {
        const ex = map.get(l.id)!;
        ex.qty = Number(ex.qty || 0) + Number(l.qty || 0);
        map.set(l.id, ex);
      } else {
        map.set(l.id, { ...l });
      }
    });
    return Array.from(map.values());
  };

  /* ── Sync serveur ───────────────────────────────────────────────────── */
  const fetchServerCart = async () => {
    try {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) return null;
      const res = await fetch(`/api/cart?user_id=${data.user.id}`);
      if (!res.ok) return null;
      const json = await res.json();
      return json.items ?? [];
    } catch { return null; }
  };

  const pushCartToServer = async (items: CartItem[]) => {
    if (isSyncing.current) return;
    isSyncing.current = true;
    try {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) return;
      await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: data.user.id,
          items: items.map((i) => ({ product_id: i.id, title: i.title, price: i.price, qty: i.qty, image_url: i.image_url ?? null })),
        }),
      });
    } catch {} finally { isSyncing.current = false; }
  };

  const scheduleSync = (items: CartItem[]) => {
    if (syncTimer.current) window.clearTimeout(syncTimer.current);
    syncTimer.current = window.setTimeout(() => { pushCartToServer(items); syncTimer.current = null; }, 1500);
  };

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      const local = readLocalCart();
      if (mounted) setCart(local);
      const serverItems = await fetchServerCart();
      if (serverItems && mounted) {
        const merged = mergeCarts(serverItems, local);
        setCart(merged);
        writeLocalCart(merged);
      }
    };
    init();
    const onStorage = (ev: StorageEvent) => {
      if (ev.key && ev.key !== "user/cart" && ev.key !== "cart") return;
      setCart(readLocalCart());
    };
    const onCustom = (ev: Event) => {
      const detail = (ev as CustomEvent).detail;
      if (Array.isArray(detail)) setCart(detail);
      else setCart(readLocalCart());
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("user-cart-updated", onCustom as EventListener);
    return () => {
      mounted = false;
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("user-cart-updated", onCustom as EventListener);
      if (syncTimer.current) window.clearTimeout(syncTimer.current);
    };
  }, []);

  useEffect(() => {
    writeLocalCart(cart);
    scheduleSync(cart);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart]);

  /* ── Modifications panier ───────────────────────────────────────────── */
  const updateQty = (idx: number, qty: number) => {
    const newQty = Math.max(1, Math.floor(Number(qty) || 1));
    setCart((prev) => { const copy = [...prev]; if (!copy[idx]) return prev; copy[idx] = { ...copy[idx], qty: newQty }; return copy; });
  };
  const increment = (idx: number) => updateQty(idx, (cart[idx]?.qty ?? 1) + 1);
  const decrement = (idx: number) => updateQty(idx, (cart[idx]?.qty ?? 1) - 1);
  const remove = (idx: number) => setCart((prev) => prev.filter((_, i) => i !== idx));

  const clearCartLocal = () => {
    setCart([]);
    try { localStorage.removeItem("user/cart"); localStorage.removeItem("cart"); } catch {}
    window.dispatchEvent(new CustomEvent("user-cart-updated", { detail: [] }));
  };

  const clearCart = () => {
    clearCartLocal();
    fetch("/api/cart/clear", { method: "POST" }).catch(() => {});
  };

  /* ── Checkout ───────────────────────────────────────────────────────── */
  const handleCheckout = async () => {
    setCheckoutError(null);
    setCheckingOut(true);
    try {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) {
        setCheckoutError("Connectez-vous pour passer une commande.");
        return;
      }

      let customerName = data.user.email || "Client";
      try {
        const profRes = await fetch("/api/profile");
        if (profRes.ok) {
          const { profile } = await profRes.json();
          const name = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ");
          if (name) customerName = name;
        }
      } catch {}

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((i) => ({ product_id: i.id, title: i.title, price: i.price, qty: i.qty, image_url: i.image_url ?? null })),
          total,
          customer_name: customerName,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        setCheckoutError(err.error ?? "Erreur lors de la commande.");
        return;
      }

      const { order } = await res.json();
      setPlacedOrder({ id: order.id, order_number: order.order_number });
      setShowModal(true);
      clearCartLocal();
    } catch (e) {
      setCheckoutError("Erreur inattendue. Réessayez.");
      console.error(e);
    } finally {
      setCheckingOut(false);
    }
  };

  /* ── Rendu ──────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen text-white px-4 py-8 bg-[#080d18]">
      {/* Modal confirmation */}
      {showModal && placedOrder && (
        <OrderConfirmModal order={placedOrder} onClose={() => setShowModal(false)} />
      )}

      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <ShoppingCart size={22} className="text-blue-400" />
              Mon panier
            </h1>
            <p className="text-white/45 text-sm mt-0.5">
              {cart.length === 0 ? "Panier vide" : `${cart.length} article${cart.length > 1 ? "s" : ""}`}
            </p>
          </div>
          <Link href="/user/products" className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition">
            <Package size={14} /> Continuer mes achats
          </Link>
        </header>

        {cart.length === 0 ? (
          <div className="bg-white/4 border border-white/8 p-12 rounded-2xl text-center space-y-4">
            <ShoppingCart size={40} className="mx-auto text-white/20" />
            <h2 className="text-lg font-semibold text-white/70">Votre panier est vide</h2>
            <p className="text-white/40 text-sm max-w-sm mx-auto">
              Ajoutez des produits depuis la boutique. Ils apparaîtront ici.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <Link href="/user/products">
                <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition">
                  Voir la boutique <ArrowRight size={14} />
                </button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ── Liste articles ─────────────────────────────────────── */}
            <section className="lg:col-span-2 space-y-3">
              {cart.map((item, idx) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 bg-white/4 border border-white/8 p-4 rounded-xl hover:border-blue-500/20 transition"
                >
                  {/* Image */}
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-white/6 flex-shrink-0">
                    {item.image_url ? (
                      <Image src={item.image_url} alt={item.title ?? "Produit"} fill className="object-contain p-2" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/25">
                        <Package size={24} />
                      </div>
                    )}
                  </div>

                  {/* Infos */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-white text-sm leading-snug line-clamp-2">{item.title}</h3>
                      <button
                        onClick={() => remove(idx)}
                        className="text-white/25 hover:text-red-400 transition flex-shrink-0 mt-0.5"
                        aria-label="Supprimer"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <div className="mt-2 flex items-center justify-between gap-2">
                      {/* Qty controls */}
                      <div className="flex items-center gap-1 bg-white/6 border border-white/10 rounded-lg p-1">
                        <button
                          onClick={() => decrement(idx)}
                          className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white/10 text-white/60 hover:text-white transition"
                        >
                          <Minus size={12} />
                        </button>
                        <input
                          type="number" min={1} value={item.qty}
                          onChange={(e) => updateQty(idx, Number(e.target.value))}
                          className="w-10 text-center bg-transparent text-white text-sm outline-none"
                        />
                        <button
                          onClick={() => increment(idx)}
                          className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white/10 text-white/60 hover:text-white transition"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      {/* Prix */}
                      <div className="text-right">
                        <div className="text-xs text-white/40">{fmt(item.price)} × {item.qty}</div>
                        <div className="text-white font-semibold text-sm">{fmt(item.price * item.qty)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </section>

            {/* ── Résumé commande ─────────────────────────────────────── */}
            <aside className="lg:col-span-1 h-fit sticky top-20">
              <div className="bg-white/4 border border-white/8 rounded-2xl p-5 space-y-4">
                <h2 className="font-semibold text-white text-sm border-b border-white/8 pb-3">Résumé</h2>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-white/55">
                    <span>Articles ({cart.length})</span>
                    <span>{fmt(total)}</span>
                  </div>
                  <div className="flex justify-between text-white/55">
                    <span>Livraison</span>
                    <span className="text-blue-300">À convenir</span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-white/8">
                  <span className="text-white font-medium">Total</span>
                  <span className="text-xl font-bold text-blue-400">{fmt(total)}</span>
                </div>

                {checkoutError && (
                  <div className="text-red-400 text-xs bg-red-900/20 border border-red-500/20 p-3 rounded-lg">
                    {checkoutError}
                  </div>
                )}

                <button
                  onClick={handleCheckout}
                  disabled={checkingOut}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-wait text-white font-semibold text-sm transition shadow-lg shadow-blue-600/20"
                >
                  {checkingOut ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Envoi en cours…</>
                  ) : (
                    <><CheckCircle size={15} /> Passer la commande</>
                  )}
                </button>

                <button
                  onClick={clearCart}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-white/8 text-white/40 hover:text-white/70 hover:border-white/15 text-sm transition"
                >
                  <Trash2 size={13} /> Vider le panier
                </button>

                <div className="bg-blue-900/20 border border-blue-500/15 rounded-xl p-3 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-blue-300 text-xs font-medium">
                    <Clock size={12} /> Comment ça marche ?
                  </div>
                  <p className="text-white/40 text-xs leading-relaxed">
                    Après votre commande, notre équipe vérifie et vous envoie un bon de retrait. Paiement à l&apos;entrepôt ou à la livraison.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
