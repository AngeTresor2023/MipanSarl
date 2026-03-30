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
    .from("expenses")
    .select("*")
    .order("spent_at", { ascending: false })
    .limit(200);
  if (err) return NextResponse.json({ error: err.message }, { status: 500 });
  return NextResponse.json({ expenses: data ?? [] });
}

export async function POST(req: Request) {
  const { supabase, error } = await requireAdmin();
  if (error) return error;
  const { label, amount, category, note, spent_at } = await req.json();
  if (!label || amount === undefined) return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
  const { data, error: err } = await supabase!.from("expenses").insert({
    label, amount: Number(amount), category: category || null, note: note || null,
    spent_at: spent_at || new Date().toISOString(),
  }).select().single();
  if (err) return NextResponse.json({ error: err.message }, { status: 500 });
  return NextResponse.json({ expense: data });
}

export async function DELETE(req: Request) {
  const { supabase, error } = await requireAdmin();
  if (error) return error;
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id requis" }, { status: 400 });
  const { error: err } = await supabase!.from("expenses").delete().eq("id", id);
  if (err) return NextResponse.json({ error: err.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
