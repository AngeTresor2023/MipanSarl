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
    .from("arrivals")
    .select("*, arrival_items(*)")
    .order("expected_date", { ascending: true })
    .limit(100);
  if (err) return NextResponse.json({ error: err.message }, { status: 500 });
  return NextResponse.json({ arrivals: data ?? [] });
}

export async function POST(req: Request) {
  const { supabase, error } = await requireAdmin();
  if (error) return error;
  const { label, expected_date, note, items } = await req.json();
  if (!label || !expected_date)
    return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });

  const { data: arrival, error: err } = await supabase!.from("arrivals").insert({
    label, expected_date, note: note || null, status: "pending",
  }).select().single();
  if (err) return NextResponse.json({ error: err.message }, { status: 500 });

  if (Array.isArray(items) && items.length > 0) {
    const rows = items.map((it: { product_id?: string; product_title: string; quantity: number }) => ({
      arrival_id: arrival.id,
      product_id: it.product_id || null,
      product_title: it.product_title,
      quantity: Number(it.quantity),
    }));
    await supabase!.from("arrival_items").insert(rows);
  }

  return NextResponse.json({ arrival });
}

export async function PATCH(req: Request) {
  const { supabase, error } = await requireAdmin();
  if (error) return error;
  const { id, status } = await req.json();
  if (!id || !status) return NextResponse.json({ error: "id et status requis" }, { status: 400 });

  // Si on marque comme reçu : mettre à jour les stocks
  if (status === "received") {
    const { data: arrival } = await supabase!
      .from("arrivals")
      .select("status, arrival_items(*)")
      .eq("id", id)
      .single();

    if (arrival?.status !== "received") {
      const items = (arrival?.arrival_items ?? []) as { product_id?: string; quantity: number }[];
      for (const item of items) {
        if (item.product_id) {
          const { data: prod } = await supabase!.from("products").select("quantity").eq("id", item.product_id).single();
          if (prod) {
            const newQty = Number(prod.quantity) + Number(item.quantity);
            await supabase!.from("products").update({ quantity: newQty, available: newQty > 0 }).eq("id", item.product_id);
          }
        }
      }
    }
  }

  const { error: err } = await supabase!.from("arrivals").update({ status }).eq("id", id);
  if (err) return NextResponse.json({ error: err.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const { supabase, error } = await requireAdmin();
  if (error) return error;
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id requis" }, { status: 400 });
  const { error: err } = await supabase!.from("arrivals").delete().eq("id", id);
  if (err) return NextResponse.json({ error: err.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
