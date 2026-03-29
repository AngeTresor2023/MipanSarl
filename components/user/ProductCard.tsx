"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { getPublicImageUrlClient } from "@/lib/supabase/getPublicImageUrlClient";
import { ShoppingCart } from "lucide-react";

type Product = {
  id: string;
  title: string;
  description?: string;
  price: number;
  category?: string;
  quantity?: number;
  available?: boolean;
  image_url?: string | null;
};

const imageUrlCache = new Map<string, string | null>();

function StockBadge({ available, quantity }: { available?: boolean; quantity?: number }) {
  if (!available || (quantity ?? 0) <= 0) {
    return (
      <span className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded text-xs font-medium bg-red-600/90 text-white">
        Rupture
      </span>
    );
  }
  if ((quantity ?? 0) <= 3) {
    return (
      <span className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded text-xs font-medium bg-amber-500/90 text-black">
        Dernières unités
      </span>
    );
  }
  return null;
}

export default function ProductCard({
  product,
  onAdd,
}: {
  product: Product;
  onAdd: (p: Product) => void | Promise<void>;
}) {
  const [imageUrl, setImageUrl] = useState<string | null>(product.image_url ?? null);
  const [loadingImage, setLoadingImage] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [adding, setAdding] = useState(false);

  const isUnavailable = !product.available || (product.quantity ?? 0) <= 0;

  useEffect(() => {
    let mounted = true;
    if (product.image_url) {
      imageUrlCache.set(product.id, product.image_url);
      setImageUrl(product.image_url);
      return;
    }
    if (imageUrlCache.has(product.id)) {
      setImageUrl(imageUrlCache.get(product.id) ?? null);
      return;
    }
    const load = async () => {
      setLoadingImage(true);
      try {
        const url = await getPublicImageUrlClient(product.id);
        if (!mounted) return;
        imageUrlCache.set(product.id, url);
        setImageUrl(url);
      } catch {
        if (mounted) setImgError(true);
      } finally {
        if (mounted) setLoadingImage(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [product.id, product.image_url]);

  const handleAdd = async () => {
    if (isUnavailable) return;
    try {
      setAdding(true);
      await Promise.resolve(onAdd({ ...product, image_url: imageUrl ?? null }));
      try {
        const raw = localStorage.getItem("cart") || localStorage.getItem("user/cart") || "[]";
        const cart = JSON.parse(raw);
        localStorage.setItem("cart", JSON.stringify(cart));
        localStorage.setItem("user/cart", JSON.stringify(cart));
        window.dispatchEvent(new CustomEvent("user-cart-updated", { detail: cart }));
      } catch { /* ignore */ }
    } catch (e) {
      console.error("Add to cart error:", e);
    } finally {
      setAdding(false);
    }
  };

  return (
    <article className={`
      group relative bg-white/5 border rounded-xl flex flex-col h-full transition-all duration-200
      ${isUnavailable
        ? "border-white/6 opacity-70"
        : "border-white/8 hover:border-cyan-500/30 hover:bg-white/6 cursor-pointer"
      }
    `}>

      {/* IMAGE */}
      <div className="relative w-full h-44 rounded-t-xl overflow-hidden bg-white/10 flex items-center justify-center flex-shrink-0">
        <StockBadge available={product.available} quantity={product.quantity} />

        {loadingImage ? (
          <div className="w-full h-full animate-pulse bg-white/5" />
        ) : imageUrl && !imgError ? (
          <Image
            src={imageUrl}
            alt={product.title}
            fill
            className="object-contain p-3"
            sizes="(max-width: 640px) 100vw, 33vw"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex flex-col items-center gap-1 text-white/20">
            <ShoppingCart size={28} />
            <span className="text-xs">Aucune image</span>
          </div>
        )}
      </div>

      {/* CONTENU */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        {/* Catégorie */}
        {product.category && (
          <span className="text-[11px] font-medium uppercase tracking-wider text-cyan-500/70">
            {product.category}
          </span>
        )}

        {/* Titre */}
        <h3 className="text-white font-semibold text-sm leading-snug line-clamp-2">
          {product.title}
        </h3>

        {/* Description */}
        <p className="text-[13px] text-white/55 leading-relaxed line-clamp-2 flex-1">
          {product.description ?? "Aucune description disponible."}
        </p>

        {/* Prix + Bouton */}
        <div className="flex items-center justify-between gap-2 pt-2 mt-auto border-t border-white/6">
          <span className="text-[18px] font-bold text-white leading-none">
            {new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(Number(product.price))}
            <span className="text-xs font-normal text-white/50 ml-1">FCFA</span>
          </span>

          <button
            onClick={handleAdd}
            disabled={isUnavailable || adding}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150
              ${isUnavailable
                ? "bg-white/5 text-white/30 cursor-not-allowed"
                : adding
                  ? "bg-blue-700/60 text-white/60 cursor-wait"
                  : "bg-blue-600 hover:bg-blue-500 active:scale-95 text-white shadow-sm shadow-blue-600/30"
              }
            `}
            aria-label={`Ajouter ${product.title} au panier`}
          >
            {adding ? (
              <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <ShoppingCart size={14} />
            )}
            <span>{isUnavailable ? "Indisponible" : "Ajouter"}</span>
          </button>
        </div>
      </div>
    </article>
  );
}
