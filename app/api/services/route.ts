import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { data, error } = await supabase
    .from("services")
    .select("id, name, description, price, active, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Normaliser les champs pour correspondre aux composants (name→title, active→available)
  const services = (data ?? []).map((s) => ({
    ...s,
    title: s.name,
    available: s.active,
  }));

  return NextResponse.json({ services });
}
