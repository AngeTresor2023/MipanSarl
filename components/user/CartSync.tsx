// /components/CartSync.tsx
"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

function mergeLocalAndServer(localItems: any[], serverItems: any[]) {
  const map = new Map<string, any>();
  serverItems.forEach((i: any) => map.set(i.product_id, { ...i }));
  localItems.forEach((i: any) => {
    const key = i.id || i.product_id;
    if (!key) return;
    if (map.has(key)) map.set(key, { ...map.get(key), qty: (map.get(key).qty || 0) + (i.qty || 0) });
    else map.set(key, { product_id: key, title: i.title, price: i.price, qty: i.qty, image_url: i.image_url });
  });
  return Array.from(map.values());
}

export default function CartSync() {
  const syncing = useRef(false);
  useEffect(() => {
    let mounted = true;

    const mergeOnLogin = async () => {
      const { data } = await supabase.auth.getUser();
      const user = data?.user ?? null;
      if (!user) return;

      try {
        const res = await fetch(`/api/cart?user_id=${user.id}`);
        const json = await res.json();
        const serverItems = json.items ?? [];

        const localRaw = localStorage.getItem("user/cart") || localStorage.getItem("cart") || "[]";
        const localItems = JSON.parse(localRaw);

        const merged = mergeLocalAndServer(localItems, serverItems);

        // push merged to server
        await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: user.id,
            items: merged.map((i: any) => ({
              product_id: i.product_id,
              title: i.title,
              price: i.price,
              qty: i.qty,
              image_url: i.image_url,
            })),
          }),
        });

        // write merged to localStorage in format CartPage expects
        const localFormat = merged.map((i: any) => ({
          id: i.product_id,
          title: i.title,
          price: Number(i.price),
          qty: Number(i.qty),
          image_url: i.image_url ?? null,
        }));
        localStorage.setItem("user/cart", JSON.stringify(localFormat));
        localStorage.setItem("cart", JSON.stringify(localFormat));
        if (mounted) window.dispatchEvent(new CustomEvent("user-cart-updated", { detail: localFormat }));
      } catch (e) {
        console.error("CartSync merge error", e);
      }
    };

    mergeOnLogin();

    const onStorage = async (ev: StorageEvent) => {
      if (ev.key !== "user/cart" && ev.key !== "cart") return;
      if (syncing.current) return;
      try {
        const { data } = await supabase.auth.getUser();
        const user = data?.user ?? null;
        if (!user) return;
        const local = JSON.parse(localStorage.getItem("user/cart") || localStorage.getItem("cart") || "[]");
        syncing.current = true;
        await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: user.id,
            items: local.map((i: any) => ({
              product_id: i.id,
              title: i.title,
              price: i.price,
              qty: i.qty,
              image_url: i.image_url,
            })),
          }),
        });
      } catch (e) {
        console.error("CartSync storage handler error", e);
      } finally {
        syncing.current = false;
      }
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener("user-cart-updated", () => {
      // same-tab updates: trigger storage handler logic by calling onStorage-like flow
      onStorage({ key: "user/cart" } as StorageEvent);
    });

    return () => {
      mounted = false;
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("user-cart-updated", () => {});
    };
  }, []);

  return null;
}
