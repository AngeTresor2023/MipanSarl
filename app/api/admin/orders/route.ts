// app/api/admin/orders/route.ts
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

export async function GET(req: Request) {
  const { supabase, error } = await requireAdmin();
  if (error) return error;

  const url = new URL(req.url);
  const limit = parseInt(url.searchParams.get("limit") ?? "100");

  const { data, error: err } = await supabase!
    .from("orders")
    .select("id, order_number, customer_name, user_email, items, total, status, created_at")
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

  const { error: err } = await supabase!.from("orders").update({ status }).eq("id", id);
  if (err) return NextResponse.json({ error: err.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
