// lib/supabase/getPublicImageUrlServer.ts
import { createClient } from "@/lib/supabase/server";

/**
 * Récupère l'URL publique de l'image principale d'un produit côté serveur.
 * Utiliser depuis server components ou API routes.
 */
export async function getPublicImageUrlServer(productId: string): Promise<string | null> {
  if (!productId) return null;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("product_images")
      .select("storage_path, public_url, is_primary")
      .eq("product_id", productId)
      .order("is_primary", { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error("getPublicImageUrlServer error:", error.message);
      return null;
    }

    if (data?.public_url) return data.public_url;

    if (data?.storage_path) {
      const { data: urlData } = await supabase.storage.from("produits").getPublicUrl(data.storage_path);
      return urlData?.publicUrl ?? null;
    }

    return null;
  } catch (e) {
    console.error("getPublicImageUrlServer exception:", e);
    return null;
  }
}
