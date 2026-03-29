// app/api/cart/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ items: [] });

  const { data: cartRow } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!cartRow) return NextResponse.json({ items: [] });

  const { data: items, error } = await supabase
    .from("cart_items")
    .select("product_id, title, price, qty, image_url")
    .eq("cart_id", cartRow.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ items: items ?? [] });
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  let body: { items?: unknown[] };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Corps invalide" }, { status: 400 });
  }

  const { items } = body;
  if (!Array.isArray(items)) {
    return NextResponse.json({ error: "items doit être un tableau" }, { status: 400 });
  }

  // Trouver ou créer le panier
  let { data: cart } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!cart) {
    const { data: newCart, error: cartErr } = await supabase
      .from("carts")
      .insert({ user_id: user.id })
      .select("id")
      .single();
    if (cartErr) return NextResponse.json({ error: cartErr.message }, { status: 500 });
    cart = newCart;
  }

  if (!cart) return NextResponse.json({ error: "Erreur panier" }, { status: 500 });

  // Upsert chaque article
  for (const it of items as Record<string, unknown>[]) {
    const product_id = it.product_id as string;
    if (!product_id) continue;

    const { data: existing } = await supabase
      .from("cart_items")
      .select("id, qty")
      .eq("cart_id", cart.id)
      .eq("product_id", product_id)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("cart_items")
        .update({ qty: existing.qty + Number(it.qty ?? 1) })
        .eq("id", existing.id);
    } else {
      await supabase.from("cart_items").insert({
        cart_id: cart.id,
        product_id,
        title: it.title,
        price: it.price,
        qty: it.qty ?? 1,
        image_url: it.image_url ?? null,
      });
    }
  }

  const { data: itemsAfter } = await supabase
    .from("cart_items")
    .select("product_id, title, price, qty, image_url")
    .eq("cart_id", cart.id);

  return NextResponse.json({ items: itemsAfter ?? [] });
}
