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

export async function GET() {
  const { supabase, error } = await requireAdmin();
  if (error) return error;
  const { data, error: err } = await supabase!
    .from("losses")
    .select("*")
    .order("lost_at", { ascending: false })
    .limit(200);
  if (err) return NextResponse.json({ error: err.message }, { status: 500 });
  return NextResponse.json({ losses: data ?? [] });
}

export async function POST(req: Request) {
  const { supabase, error } = await requireAdmin();
  if (error) return error;
  const { product_id, product_title, quantity, reason, lost_at } = await req.json();
  if (!product_title || !quantity)
    return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });

  if (product_id) {
    const { data: prod } = await supabase!.from("products").select("quantity").eq("id", product_id).single();
    if (prod) {
      const newQty = Math.max(0, Number(prod.quantity) - Number(quantity));
      await supabase!.from("products").update({ quantity: newQty, available: newQty > 0 }).eq("id", product_id);
    }
  }

  const { data, error: err } = await supabase!.from("losses").insert({
    product_id: product_id || null,
    product_title,
    quantity: Number(quantity),
    reason: reason || null,
    lost_at: lost_at || new Date().toISOString(),
  }).select().single();
  if (err) return NextResponse.json({ error: err.message }, { status: 500 });
  return NextResponse.json({ loss: data });
}

export async function DELETE(req: Request) {
  const { supabase, error } = await requireAdmin();
  if (error) return error;
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id requis" }, { status: 400 });
  const { error: err } = await supabase!.from("losses").delete().eq("id", id);
  if (err) return NextResponse.json({ error: err.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
