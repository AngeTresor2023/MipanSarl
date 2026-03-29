"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import ProductCard from "@/components/user/ProductCard";
import { getPublicImageUrlClient } from "@/lib/supabase/getPublicImageUrlClient";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { Search, SlidersHorizontal, ShoppingCart, ChevronDown } from "lucide-react";

const PAGE_SIZE = 8;

type ProductImage = { storage_path?: string; public_url?: string; is_primary?: boolean };
type ProductRow = {
  id: string; title: string; description?: string; price: number;
  category?: string; quantity?: number; available?: boolean;
  product_images?: ProductImage[]; image_url?: string | null;
};
type CartItem = { id: string; title: string; price: number; qty: number; image_url: string | null };

const supabase = createClient();

export default function ProductsPage() {
  const [items, setItems] = useState<ProductRow[]>([]);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2800);
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select("*, product_images(storage_path, public_url, is_primary)")
        .order("created_at", { ascending: false });

      if (error || !mounted) { setLoading(false); return; }

      const mapped: ProductRow[] = await Promise.all(
        (data ?? []).map(async (p: ProductRow & { product_images?: ProductImage[] }) => {
          const images = p.product_images ?? [];
          const primary = images.find((i) => i.is_primary) ?? images[0];
          if (primary?.public_url) return { ...p, image_url: primary.public_url };
          if (primary?.storage_path) return { ...p, image_url: await getPublicImageUrlClient(p.id) };
          return { ...p, image_url: null };
        })
      );

      if (mounted) { setItems(mapped); setLoading(false); }
    })();
    return () => { mounted = false; };
  }, []);

  const categories = useMemo(
    () => Array.from(new Set(items.map((i) => i.category).filter(Boolean))) as string[],
    [items]
  );

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return items.filter((p) => {
      if (category !== "all" && p.category !== category) return false;
      if (term && !`${p.title} ${p.description ?? ""} ${p.category ?? ""}`.toLowerCase().includes(term)) return false;
      return true;
    });
  }, [items, q, category]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  // reset pagination on filter change
  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [q, category]);

  const addToCart = async (product: ProductRow) => {
    const raw = localStorage.getItem("user/cart") || localStorage.getItem("cart") || "[]";
    const cart = JSON.parse(raw) as CartItem[];
    const ex = cart.find((c) => c.id === product.id);
    if (ex) { ex.qty += 1; } else {
      cart.push({ id: product.id, title: product.title, price: product.price, qty: 1, image_url: product.image_url ?? null });
    }
    try {
      localStorage.setItem("cart", JSON.stringify(cart));
      localStorage.setItem("user/cart", JSON.stringify(cart));
      window.dispatchEvent(new CustomEvent("user-cart-updated", { detail: cart }));
    } catch { /* ignore */ }
    showToast(`${product.title} ajouté au panier`);
    try {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: data.user.id,
            items: cart.map((c) => ({ product_id: c.id, title: c.title, price: c.price, qty: c.qty, image_url: c.image_url ?? null })),
          }),
        });
      }
    } catch { /* ignore */ }
  };

  return (
    <main className="relative min-h-screen text-white px-4 py-8 bg-[#080d18] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-950/30 to-transparent pointer-events-none" />

      {/* Toast */}
      {toast && (
        <div className="fixed top-20 right-4 z-50 flex items-center gap-2 bg-white/5 border border-cyan-500/30 backdrop-blur-md text-white px-4 py-2.5 rounded-xl shadow-xl text-sm">
          <ShoppingCart size={14} className="text-cyan-400" />
          {toast}
        </div>
      )}

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Boutique</h1>
            <p className="text-white/40 text-sm mt-0.5">
              {loading ? "Chargement…" : `${filtered.length} produit${filtered.length > 1 ? "s" : ""}`}
            </p>
          </div>

          {/* Barre de recherche + filtre */}
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <div className="relative flex-1 min-w-0 sm:min-w-64">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Rechercher un produit…"
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-white/6 border border-white/12 text-white text-sm placeholder-white/35 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition"
              />
            </div>

            <div className="relative">
              <SlidersHorizontal size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="appearance-none pl-8 pr-8 py-2 rounded-lg bg-white/6 border border-white/12 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition cursor-pointer"
              >
                <option value="all">Toutes catégories</option>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* CONTENU */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white/5 border border-white/8 rounded-xl overflow-hidden animate-pulse">
                <div className="h-44 bg-white/5" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-white/5 rounded w-1/3" />
                  <div className="h-4 bg-white/5 rounded w-3/4" />
                  <div className="h-3 bg-white/5 rounded w-full" />
                  <div className="h-3 bg-white/5 rounded w-2/3" />
                  <div className="flex justify-between items-center pt-2">
                    <div className="h-6 bg-white/5 rounded w-16" />
                    <div className="h-8 bg-white/5 rounded w-20" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-24 text-center">
            <Search size={40} className="mx-auto mb-3 text-white/20" />
            <p className="text-white/50 text-sm">Aucun produit trouvé.</p>
            {(q || category !== "all") && (
              <button
                onClick={() => { setQ(""); setCategory("all"); }}
                className="mt-3 text-cyan-400 text-sm hover:underline"
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
              {visible.map((p) => (
                <ProductCard
                  key={p.id}
                  product={{ id: p.id, title: p.title, description: p.description, price: Number(p.price), category: p.category, quantity: p.quantity, available: p.available, image_url: p.image_url ?? null }}
                  onAdd={(prod) => addToCart(prod as ProductRow)}
                />
              ))}
            </div>

            {/* Pagination — Charger plus */}
            {hasMore && (
              <div className="mt-10 flex flex-col items-center gap-2">
                <button
                  onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-lg border border-white/12 bg-white/4 text-white/70 text-sm hover:bg-white/8 hover:text-white hover:border-white/20 transition"
                >
                  <ChevronDown size={16} />
                  Charger plus ({filtered.length - visibleCount} restants)
                </button>
                <p className="text-white/25 text-xs">{visibleCount} / {filtered.length}</p>
              </div>
            )}
          </>
        )}

        {/* APERÇU PANIER */}
        <div className="mt-14 border-t border-white/6 pt-8">
          <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <ShoppingCart size={16} className="text-white/50" /> Panier
          </h2>
          <CartPreview />
        </div>
      </div>
    </main>
  );
}

function CartPreview() {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const read = () => {
      try { setCart(JSON.parse(localStorage.getItem("user/cart") || "[]")); }
      catch { setCart([]); }
    };
    read();
    const onStorage = (ev: StorageEvent) => { if (!ev.key || ev.key === "user/cart" || ev.key === "cart") read(); };
    const onCustom = () => read();
    window.addEventListener("storage", onStorage);
    window.addEventListener("user-cart-updated", onCustom);
    return () => { window.removeEventListener("storage", onStorage); window.removeEventListener("user-cart-updated", onCustom); };
  }, []);

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

  if (cart.length === 0) {
    return <p className="text-white/35 text-sm">Votre panier est vide.</p>;
  }

  return (
    <div className="bg-white/5 border border-white/8 p-4 rounded-xl max-w-md">
      <ul className="space-y-3">
        {cart.map((c, idx) => (
          <li key={idx} className="flex items-center gap-3">
            {c.image_url ? (
              <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-white/8 flex-shrink-0">
                <Image src={c.image_url} alt={c.title} fill className="object-contain" />
              </div>
            ) : (
              <div className="w-10 h-10 bg-white/8 rounded-lg flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white font-medium truncate">{c.title}</p>
              <p className="text-xs text-white/40">{c.qty} × {new Intl.NumberFormat("fr-FR",{maximumFractionDigits:0}).format(Number(c.price))} FCFA</p>
            </div>
            <p className="text-sm font-semibold text-white">{new Intl.NumberFormat("fr-FR",{maximumFractionDigits:0}).format(c.qty * c.price)} FCFA</p>
          </li>
        ))}
      </ul>

      <div className="mt-4 pt-3 border-t border-white/8 flex items-center justify-between">
        <span className="text-sm text-white/60">Total</span>
        <span className="text-base font-bold text-white">{new Intl.NumberFormat("fr-FR",{maximumFractionDigits:0}).format(total)} FCFA</span>
      </div>

      <div className="mt-4 flex gap-2">
        <Link href="/user/cart" className="flex-1">
          <Button variant="default" className="w-full bg-cyan-600 hover:bg-cyan-500 text-sm">
            Voir le panier
          </Button>
        </Link>
        <Button
          variant="outline"
          className="text-sm border-white/12 text-white/60 hover:text-white"
          onClick={() => { localStorage.removeItem("user/cart"); localStorage.removeItem("cart"); setCart([]); }}
        >
          Vider
        </Button>
      </div>
    </div>
  );
}
