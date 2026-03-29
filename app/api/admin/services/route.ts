import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase: null, error: NextResponse.json({ error: "Non authentifié" }, { status: 401 }) };
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "admin") return { supabase: null, error: NextResponse.json({ error: "Accès refusé" }, { status: 403 }) };
  return { supabase, error: null };
}

// Normalise les champs DB (name/active) vers les champs attendus par le front (title/available)
function normalize(s: Record<string, unknown>) {
  return { ...s, title: s.name, available: s.active };
}

export async function GET() {
  const { supabase, error } = await requireAdmin();
  if (error) return error;
  const { data, error: err } = await supabase!
    .from("services")
    .select("id, name, description, price, active, created_at")
    .order("created_at", { ascending: false });
  if (err) return NextResponse.json({ error: err.message }, { status: 500 });
  return NextResponse.json({ services: (data ?? []).map(normalize) });
}

export async function POST(req: Request) {
  const { supabase, error } = await requireAdmin();
  if (error) return error;
  const body = await req.json();
  const { title, description, price } = body;
  if (!title?.trim()) return NextResponse.json({ error: "Titre requis" }, { status: 400 });
  const { data, error: err } = await supabase!
    .from("services")
    .insert([{
      name: title.trim(),
      description: description?.trim() || null,
      price: price ?? null,
      active: true,
    }])
    .select()
    .single();
  if (err) return NextResponse.json({ error: err.message }, { status: 500 });
  return NextResponse.json({ service: normalize(data) });
}

export async function PATCH(req: Request) {
  const { supabase, error } = await requireAdmin();
  if (error) return error;
  const body = await req.json();
  const { id, title, available, ...rest } = body;
  if (!id) return NextResponse.json({ error: "id requis" }, { status: 400 });
  // Traduire title→name et available→active avant d'écrire en BD
  const fields: Record<string, unknown> = { ...rest };
  if (title !== undefined) fields.name = title;
  if (available !== undefined) fields.active = available;
  const { error: err } = await supabase!.from("services").update(fields).eq("id", id);
  if (err) return NextResponse.json({ error: err.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const { supabase, error } = await requireAdmin();
  if (error) return error;
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id requis" }, { status: 400 });
  const { error: err } = await supabase!.from("services").delete().eq("id", id);
  if (err) return NextResponse.json({ error: err.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
