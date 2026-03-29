// app/api/admin/stats/route.ts
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const results = await Promise.allSettled([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("quotes").select("id", { count: "exact", head: true }).eq("status", "new"),
    supabase.from("services").select("id", { count: "exact", head: true }),
    supabase.from("exchanges").select("id", { count: "exact", head: true }).eq("status", "new"),
  ]);

  const get = (r: PromiseSettledResult<{ count: number | null }>) =>
    r.status === "fulfilled" ? (r.value.count ?? 0) : 0;

  return NextResponse.json({
    users:     get(results[0] as PromiseSettledResult<{ count: number | null }>),
    products:  get(results[1] as PromiseSettledResult<{ count: number | null }>),
    quotes:    get(results[2] as PromiseSettledResult<{ count: number | null }>),
    services:  get(results[3] as PromiseSettledResult<{ count: number | null }>),
    exchanges: get(results[4] as PromiseSettledResult<{ count: number | null }>),
  });
}
