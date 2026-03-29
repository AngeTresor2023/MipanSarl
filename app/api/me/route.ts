// app/api/me/route.ts
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ role: null, isAdmin: false });

    const { data } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    const role = data?.role ?? null;
    return NextResponse.json({ role, isAdmin: role === "admin" });
  } catch {
    return NextResponse.json({ role: null, isAdmin: false });
  }
}
