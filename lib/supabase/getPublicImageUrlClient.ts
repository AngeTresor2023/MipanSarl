// lib/supabase/getPublicImageUrlClient.ts
"use client";

import { createClient } from "@/lib/supabase/client";

/**
 * Récupère l'URL publique de l'image principale d'un produit.
 * @param productId id du produit (uuid ou string)
 * @returns string | null
 */
export async function getPublicImageUrlClient(productId: string): Promise<string | null> {
  if (!productId) return null;
  try {
    const supabase = createClient();
    // On récupère l'image marquée is_primary si elle existe, sinon la première
    const { data, error } = await supabase
      .from("product_images")
      .select("storage_path, public_url, is_primary")
      .eq("product_id", productId)
      .order("is_primary", { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error("getPublicImageUrlClient error:", error.message);
      return null;
    }

    // Si la table stocke déjà l'URL publique dans public_url, on la retourne
    if (data?.public_url) return data.public_url;

    // Sinon si storage_path est présent, construire l'URL publique via Supabase Storage
    if (data?.storage_path) {
      const { data: urlData } = supabase.storage.from("produits").getPublicUrl(data.storage_path);
      return urlData?.publicUrl ?? null;
    }

    return null;
  } catch (e) {
    console.error("getPublicImageUrlClient exception:", e);
    return null;
  }
}
