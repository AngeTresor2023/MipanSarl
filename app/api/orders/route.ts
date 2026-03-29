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

  const { items, total, customer_name } = body;
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "Panier vide" }, { status: 400 });
  }

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
