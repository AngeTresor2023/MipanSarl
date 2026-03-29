// app/api/profile/route.ts
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET — lire son propre profil
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { data, error } = await supabase
    .from("profiles")
    .select("first_name, last_name, phone, address, dob, role, created_at")
    .eq("id", user.id)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({
    profile: {
      ...(data ?? {}),
      email: user.email ?? null,
    },
  });
}

// PATCH — mettre à jour son propre profil
export async function PATCH(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const body = await req.json();
  const { first_name, last_name, phone, address, dob } = body;

  const { error } = await supabase
    .from("profiles")
    .update({ first_name, last_name, phone, address, dob })
    .eq("id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
