import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase: null, error: NextResponse.json({ error: "Non authentifié" }, { status: 401 }) };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    return { supabase: null, error: NextResponse.json({ error: "Accès refusé" }, { status: 403 }) };
  }
  return { supabase, error: null };
}

// POST — uploader une image pour un produit
export async function POST(req: Request) {
  const { supabase, error } = await requireAdmin();
  if (error) return error;

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const productId = formData.get("product_id") as string | null;

  if (!file || !productId) {
    return NextResponse.json({ error: "file et product_id requis" }, { status: 400 });
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: "Format invalide. Utilisez JPG, PNG, WEBP ou GIF." }, { status: 400 });
  }

  // Supprimer l'ancienne image du bucket si elle existe
  const { data: existing } = await supabase!
    .from("product_images")
    .select("storage_path")
    .eq("product_id", productId);

  if (existing && existing.length > 0) {
    const paths = existing.map((r: { storage_path: string }) => r.storage_path).filter(Boolean);
    if (paths.length > 0) {
      await supabase!.storage.from("Products").remove(paths);
    }
    await supabase!.from("product_images").delete().eq("product_id", productId);
  }

  // Upload de la nouvelle image
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const storagePath = `products/${productId}/main.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabase!.storage
    .from("Products")
    .upload(storagePath, buffer, { contentType: file.type, upsert: true });

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

  const { data: urlData } = supabase!.storage.from("Products").getPublicUrl(storagePath);
  const publicUrl = urlData.publicUrl;

  const { error: insertErr } = await supabase!.from("product_images").insert({
    product_id: productId,
    storage_path: storagePath,
    public_url: publicUrl,
    is_primary: true,
  });

  if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 500 });

  return NextResponse.json({ public_url: publicUrl });
}
