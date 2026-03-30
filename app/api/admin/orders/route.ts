import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase: null, error: NextResponse.json({ error: "Non authentifié" }, { status: 401 }) };
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "admin") return { supabase: null, error: NextResponse.json({ error: "Accès refusé" }, { status: 403 }) };
  return { supabase, error: null };
}

// Statuts qui déclenchent la déduction de stock
const DEDUCT_STATUSES = ["confirmed", "delivered"];
// Statuts qui restituent le stock (annulation après déduction)
const RESTORE_STATUSES = ["cancelled"];

export async function GET(req: Request) {
  const { supabase, error } = await requireAdmin();
  if (error) return error;

  const url = new URL(req.url);
  const limit = parseInt(url.searchParams.get("limit") ?? "100");

  const { data, error: err } = await supabase!
    .from("orders")
    .select("id, order_number, customer_name, user_email, items, total, status, stock_deducted, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (err) return NextResponse.json({ error: err.message }, { status: 500 });
  return NextResponse.json({ orders: data ?? [] });
}

export async function PATCH(req: Request) {
  const { supabase, error } = await requireAdmin();
  if (error) return error;

  const { id, status } = await req.json();
  if (!id || !status) return NextResponse.json({ error: "id et status requis" }, { status: 400 });

  // Récupérer la commande actuelle
  const { data: order } = await supabase!
    .from("orders")
    .select("status, stock_deducted, items")
    .eq("id", id)
    .single();

  if (!order) return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });

  const items = (order.items ?? []) as { product_id?: string; qty?: number }[];

  // Déduire le stock si on passe à un statut "validé" et que ce n'est pas encore fait
  if (DEDUCT_STATUSES.includes(status) && !order.stock_deducted) {
    for (const item of items) {
      if (item.product_id && item.qty) {
        const { data: prod } = await supabase!.from("products").select("quantity").eq("id", item.product_id).single();
        if (prod) {
          const newQty = Math.max(0, Number(prod.quantity) - Number(item.qty));
          await supabase!.from("products").update({ quantity: newQty, available: newQty > 0 }).eq("id", item.product_id);
        }
      }
    }
    await supabase!.from("orders").update({ status, stock_deducted: true }).eq("id", id);
    return NextResponse.json({ ok: true });
  }

  // Restituer le stock si annulation après déduction
  if (RESTORE_STATUSES.includes(status) && order.stock_deducted) {
    for (const item of items) {
      if (item.product_id && item.qty) {
        const { data: prod } = await supabase!.from("products").select("quantity").eq("id", item.product_id).single();
        if (prod) {
          const newQty = Number(prod.quantity) + Number(item.qty);
          await supabase!.from("products").update({ quantity: newQty, available: newQty > 0 }).eq("id", item.product_id);
        }
      }
    }
    await supabase!.from("orders").update({ status, stock_deducted: false }).eq("id", id);
    return NextResponse.json({ ok: true });
  }

  // Sinon juste mettre à jour le statut
  const { error: err } = await supabase!.from("orders").update({ status }).eq("id", id);
  if (err) return NextResponse.json({ error: err.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
