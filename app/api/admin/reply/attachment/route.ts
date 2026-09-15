import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// Sert le fichier via le serveur (avec la session admin déjà authentifiée)
// plutôt qu'une URL signée que le navigateur irait chercher directement sur
// le stockage — évite d'avoir à exposer le bucket sans apikey côté gateway.
export async function GET(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const path = new URL(req.url).searchParams.get("path");
  if (!path) return NextResponse.json({ error: "path requis" }, { status: 400 });

  const { data, error } = await supabase.storage.from("email-attachments").download(path);
  if (error || !data) return NextResponse.json({ error: error?.message ?? "Fichier introuvable" }, { status: 404 });

  const filename = path.split("/").pop() ?? "piece-jointe";
  return new NextResponse(data, {
    headers: {
      "Content-Type": data.type || "application/octet-stream",
      "Content-Disposition": `inline; filename="${filename}"`,
    },
  });
}
