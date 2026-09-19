// app/api/orders/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** GET /api/orders — commandes de l'utilisateur connecté */
export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { data, error } = await supabase
    .from("orders")
    .select("id, order_number, customer_name, items, total, status, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ orders: data ?? [] });
}

/** POST /api/orders — créer une commande depuis le panier */
export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  let body: any;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
  }

  const { items: rawItems, customer_name } = body;
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    return NextResponse.json({ error: "Panier vide" }, { status: 400 });
  }

  // Sécurité : ne jamais faire confiance au prix/total envoyé par le client
  // (panier stocké en localStorage, donc modifiable) — on reconstruit
  // intégralement items/total depuis la table products.
  const productIds = [...new Set(rawItems.map((i: any) => i?.product_id).filter(Boolean))];
  const { data: products, error: prodErr } = await supabase
    .from("products")
    .select("id, title, price, available, image_url:product_images(public_url, is_primary)")
    .in("id", productIds);

  if (prodErr) return NextResponse.json({ error: prodErr.message }, { status: 500 });

  const items: { product_id: string; title: string; price: number; qty: number; image_url: string | null }[] = [];
  for (const it of rawItems) {
    const p = (products ?? []).find((p) => p.id === it?.product_id);
    if (!p || !p.available) {
      return NextResponse.json({ error: `Produit indisponible : ${it?.product_id ?? "?"}` }, { status: 400 });
    }
    const qty = Math.max(1, Math.floor(Number(it.qty) || 1));
    const images = (p as unknown as { image_url?: { public_url?: string; is_primary?: boolean }[] }).image_url ?? [];
    const primary = images.find((i) => i.is_primary) ?? images[0];
    items.push({ product_id: p.id, title: p.title, price: Number(p.price), qty, image_url: primary?.public_url ?? null });
  }

  const total = items.reduce((s, i) => s + i.price * i.qty, 0);

  // Numéro de commande lisible : CMD-YYYYMMDD-XXXX
  const now = new Date();
  const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  const orderNumber = `CMD-${datePart}-${rand}`;

  const { data: order, error: insertErr } = await supabase
    .from("orders")
    .insert([{
      user_id:       user.id,
      user_email:    user.email,
      customer_name: customer_name ?? user.email,
      items,
      total,
      order_number:  orderNumber,
      status:        "pending_payment",
    }])
    .select()
    .single();

  if (insertErr) {
    console.error("Create order error:", insertErr);
    return NextResponse.json({ error: insertErr.message }, { status: 500 });
  }

  // Vider le panier en base
  try {
    const { data: cart } = await supabase
      .from("carts")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (cart?.id) {
      await supabase.from("cart_items").delete().eq("cart_id", cart.id);
    }
  } catch (e) {
    console.warn("Cart clear after order failed:", e);
  }

  return NextResponse.json({ order });
}
