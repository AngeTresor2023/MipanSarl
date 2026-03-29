import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { name, email, subject, message } = await req.json();
  if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim())
    return NextResponse.json({ error: "Tous les champs sont requis" }, { status: 400 });

  const { error } = await supabase
    .from("contacts")
    .insert([{ user_id: user.id, name, email, subject, message }]);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
