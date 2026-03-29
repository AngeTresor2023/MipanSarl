// app/api/admin/products/route.ts
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

// GET — liste des produits avec image principale
export async function GET() {
  const { supabase, error } = await requireAdmin();
  if (error) return error;

  const { data, error: err } = await supabase!
    .from("products")
    .select("id, title, price, quantity, category, description, available, created_at, product_images(public_url, is_primary)")
    .order("created_at", { ascending: false })
    .limit(100);

  if (err) return NextResponse.json({ error: err.message }, { status: 500 });

  const products = (data ?? []).map((p: Record<string, unknown> & { product_images?: { public_url?: string; is_primary?: boolean }[] }) => {
    const images = p.product_images ?? [];
    const primary = images.find((i) => i.is_primary) ?? images[0];
    const { product_images: _, ...rest } = p;
    return { ...rest, image_url: primary?.public_url ?? null };
  });

  return NextResponse.json({ products });
}

// POST — créer un produit
export async function POST(req: Request) {
  const { supabase, error } = await requireAdmin();
  if (error) return error;

  const body = await req.json();
  const { title, price, quantity, category, description } = body;

  if (!title || price === undefined || quantity === undefined) {
    return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
  }

  const qty = Number(quantity);
  const { data, error: err } = await supabase!
    .from("products")
    .insert([{
      title: String(title).trim(),
      price: Number(price),
      quantity: qty,
      category: category || null,
      description: description || null,
      available: qty > 0,
    }])
    .select()
    .single();

  if (err) return NextResponse.json({ error: err.message }, { status: 500 });
  return NextResponse.json({ product: data });
}

// PATCH — modifier un produit
export async function PATCH(req: Request) {
  const { supabase, error } = await requireAdmin();
  if (error) return error;

  const body = await req.json();
  const { id, title, price, quantity, category, description } = body;

  if (!id) return NextResponse.json({ error: "id requis" }, { status: 400 });

  const qty = Number(quantity);
  const { error: err } = await supabase!
    .from("products")
    .update({
      title: String(title).trim(),
      price: Number(price),
      quantity: qty,
      category: category || null,
      description: description || null,
      available: qty > 0,
    })
    .eq("id", id);

  if (err) return NextResponse.json({ error: err.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// DELETE — supprimer un produit et son image du bucket
export async function DELETE(req: Request) {
  const { supabase, error } = await requireAdmin();
  if (error) return error;

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id requis" }, { status: 400 });

  // Supprimer les fichiers du bucket Supabase Storage
  const { data: images } = await supabase!
    .from("product_images")
    .select("storage_path")
    .eq("product_id", id);

  if (images && images.length > 0) {
    const paths = images.map((r: { storage_path: string }) => r.storage_path).filter(Boolean);
    if (paths.length > 0) {
      await supabase!.storage.from("Products").remove(paths);
    }
  }

  const { error: err } = await supabase!.from("products").delete().eq("id", id);
  if (err) return NextResponse.json({ error: err.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
