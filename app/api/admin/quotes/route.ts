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

export async function GET(req: Request) {
  const { supabase, error } = await requireAdmin();
  if (error) return error;
  const limit = parseInt(new URL(req.url).searchParams.get("limit") ?? "100");
  const { data, error: err } = await supabase!
    .from("quotes")
    .select("id, title, user_id, contact_method, contact_value, pickup_city, delivery_method, package_description, weight_kg, length_cm, width_cm, height_cm, status, admin_response, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (err) return NextResponse.json({ error: err.message }, { status: 500 });
  return NextResponse.json({ quotes: data ?? [] });
}

export async function PATCH(req: Request) {
  const { supabase, error } = await requireAdmin();
  if (error) return error;
  const { id, ...fields } = await req.json();
  if (!id) return NextResponse.json({ error: "id requis" }, { status: 400 });
  const { error: err } = await supabase!.from("quotes").update(fields).eq("id", id);
  if (err) return NextResponse.json({ error: err.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const { supabase, error } = await requireAdmin();
  if (error) return error;
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id requis" }, { status: 400 });
  const { error: err } = await supabase!.from("quotes").delete().eq("id", id);
  if (err) return NextResponse.json({ error: err.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
