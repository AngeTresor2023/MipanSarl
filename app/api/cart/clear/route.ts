// app/api/cart/clear/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { data: cartRow } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!cartRow) return NextResponse.json({ ok: true });

  await supabase.from("cart_items").delete().eq("cart_id", cartRow.id);
  return NextResponse.json({ ok: true });
}
