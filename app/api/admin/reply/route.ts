import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { sendAdminEmail } from "@/lib/resend";

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: "Non authentifié" }, { status: 401 }) };
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "admin") return { error: NextResponse.json({ error: "Accès refusé" }, { status: 403 }) };
  return { error: null };
}

const MAX_ATTACHMENT_BYTES = 8 * 1024 * 1024; // 8 Mo

export async function POST(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const formData = await req.formData();
  const to = String(formData.get("to") ?? "").trim();
  const subject = String(formData.get("subject") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const file = formData.get("attachment") as File | null;

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(to) || !subject || !message) {
    return NextResponse.json({ error: "Destinataire, sujet et message sont requis" }, { status: 400 });
  }

  let attachment: { filename: string; contentBase64: string } | null = null;
  if (file && file.size > 0) {
    if (file.size > MAX_ATTACHMENT_BYTES) {
      return NextResponse.json({ error: "Pièce jointe trop volumineuse (max 8 Mo)" }, { status: 400 });
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    attachment = { filename: file.name, contentBase64: buffer.toString("base64") };
  }

  const result = await sendAdminEmail({ to, subject, text: message, attachment });
  if (!result.ok) {
    return NextResponse.json({ error: result.error ?? "Échec de l'envoi" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
