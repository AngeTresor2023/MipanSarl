import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  // 1. Vérifier que l'appelant est connecté
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  // 2. Vérifier que l'appelant est admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  // 3. Essai via la vue profiles_with_email (inclut l'email auth.users)
  const { data: withEmail, error: viewErr } = await supabase
    .from("profiles_with_email")
    .select("id, first_name, last_name, email, phone, role, created_at")
    .order("created_at", { ascending: false });

  if (!viewErr && withEmail) {
    return NextResponse.json({ users: withEmail });
  }

  // 4. Fallback : table profiles seule (sans email)
  const { data: profiles, error: profileErr } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, phone, role, created_at")
    .order("created_at", { ascending: false });

  if (profileErr) {
    return NextResponse.json({ error: profileErr.message }, { status: 500 });
  }

  return NextResponse.json({ users: profiles ?? [] });
}

export async function PATCH(req: Request) {
  const supabase = await createClient();

  // Vérifier admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const body = await req.json();
  const { id, role } = body;
  if (!id) return NextResponse.json({ error: "id requis" }, { status: 400 });

  const { error } = await supabase.from("profiles").update({ role }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
