"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/input";

type Product = {
  id: string;
  title: string;
  price: number;
  quantity: number;
  category?: string | null;
  description?: string | null;
  available: boolean;
  image_url?: string | null;
};

type ProductForm = {
  title: string;
  price: string;
  quantity: string;
  category: string;
  description: string;
};

const EMPTY: ProductForm = { title: "", price: "", quantity: "", category: "", description: "" };

const apiCall = (method: string, body: Record<string, unknown>) =>
  fetch("/api/admin/products", {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).then((r) => r.json());

const uploadImage = async (productId: string, file: File): Promise<void> => {
  const fd = new FormData();
  fd.append("product_id", productId);
  fd.append("file", file);
  const res = await fetch("/api/admin/products/image", { method: "POST", body: fd });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json.error ?? "Erreur upload image");
  }
};

function ImagePicker({
  file,
  currentUrl,
  onChange,
  label,
}: {
  file: File | null;
  currentUrl?: string | null;
  onChange: (f: File | null) => void;
  label: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const preview = file ? URL.createObjectURL(file) : currentUrl ?? null;

  return (
    <div className="flex items-center gap-3">
      <div
        onClick={() => inputRef.current?.click()}
        className="w-16 h-16 rounded-lg border border-white/15 bg-white/5 flex items-center justify-center cursor-pointer hover:border-cyan-500/50 transition overflow-hidden flex-shrink-0"
      >
        {preview ? (
          <Image src={preview} alt="aperçu" width={64} height={64} className="object-cover w-full h-full" unoptimized />
        ) : (
          <span className="text-white/30 text-xs text-center leading-tight px-1">Photo</span>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="px-3 py-1.5 rounded text-xs bg-white/8 border border-white/12 text-white/80 hover:bg-white/12 transition"
        >
          {label}
        </button>
        {(file || currentUrl) && (
          <button
            type="button"
            onClick={() => { onChange(null); if (inputRef.current) inputRef.current.value = ""; }}
            className="px-3 py-1.5 rounded text-xs bg-red-600/20 border border-red-500/20 text-red-300 hover:bg-red-600/30 transition"
          >
            Retirer
          </button>
        )}
        {file && <span className="text-white/40 text-xs truncate max-w-[140px]">{file.name}</span>}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />
    </div>
  );
}

export default function ProductsTable({ compact }: { compact?: boolean }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<ProductForm>(EMPTY);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<ProductForm>(EMPTY);
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editCurrentUrl, setEditCurrentUrl] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const json = await fetch("/api/admin/products").then((r) => r.json());
    setProducts((json.products ?? []) as Product[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const toggleAvailable = async (id: string, current: boolean) => {
    const p = products.find((x) => x.id === id);
    if (!p) return;
    await apiCall("PATCH", {
      id,
      title: p.title,
      price: p.price,
      quantity: current ? 0 : Math.max(p.quantity, 1),
      category: p.category,
      description: p.description,
    });
    setProducts((prev) => prev.map((x) => (x.id === id ? { ...x, available: !current } : x)));
  };

  const remove = async (id: string) => {
    if (!confirm("Supprimer ce produit définitivement ?")) return;
    await apiCall("DELETE", { id });
    setProducts((p) => p.filter((x) => x.id !== id));
  };

  const openEdit = (p: Product) => {
    setEditingId(p.id);
    setEditForm({ title: p.title, price: String(p.price), quantity: String(p.quantity), category: p.category ?? "", description: p.description ?? "" });
    setEditImageFile(null);
    setEditCurrentUrl(p.image_url ?? null);
    setMsg(null);
    setShowForm(false);
  };

  const validate = (f: ProductForm) => {
    if (!f.title.trim()) return "Le titre est requis.";
    const price = Number(f.price.replace(",", "."));
    if (!f.price || isNaN(price)) return "Prix invalide.";
    return null;
  };

  const handleAdd = async () => {
    const err = validate(form);
    if (err) { setMsg(err); return; }
    setSaving(true); setMsg(null);
    const json = await apiCall("POST", {
      title: form.title.trim(),
      price: Number(form.price.replace(",", ".")),
      quantity: parseInt(form.quantity || "0"),
      category: form.category.trim() || null,
      description: form.description.trim() || null,
    });
    if (json.error) { setSaving(false); setMsg("Erreur : " + json.error); return; }
    if (imageFile && json.product?.id) {
      try {
        await uploadImage(json.product.id, imageFile);
      } catch (e) {
        setMsg("Produit créé mais erreur image : " + (e as Error).message);
        setSaving(false);
        await load();
        return;
      }
    }
    setSaving(false);
    setForm(EMPTY); setImageFile(null); setShowForm(false);
    await load();
  };

  const handleEditSave = async () => {
    if (!editingId) return;
    const err = validate(editForm);
    if (err) { setMsg(err); return; }
    setSaving(true); setMsg(null);
    const json = await apiCall("PATCH", {
      id: editingId,
      title: editForm.title.trim(),
      price: Number(editForm.price.replace(",", ".")),
      quantity: parseInt(editForm.quantity || "0"),
      category: editForm.category.trim() || null,
      description: editForm.description.trim() || null,
    });
    if (json.error) { setSaving(false); setMsg("Erreur : " + json.error); return; }
    if (editImageFile) {
      try {
        await uploadImage(editingId, editImageFile);
      } catch (e) {
        setMsg("Produit modifié mais erreur image : " + (e as Error).message);
        setSaving(false);
        await load();
        return;
      }
    }
    setSaving(false);
    setEditingId(null); setEditForm(EMPTY); setEditImageFile(null); setEditCurrentUrl(null);
    await load();
  };

  const setF = (f: ProductForm, field: keyof ProductForm, val: string) => ({ ...f, [field]: val });

  if (loading) return <div className="text-white/60 text-sm">Chargement produits...</div>;

  return (
    <div className="space-y-4">
      {!compact && (
        <div className="flex justify-end">
          <Button onClick={() => { setShowForm((v) => !v); setMsg(null); }} className="bg-cyan-600 hover:bg-cyan-500">
            {showForm ? "Annuler" : "+ Ajouter un produit"}
          </Button>
        </div>
      )}

      {showForm && (
        <div className="bg-white/4 border border-white/10 p-4 rounded-lg space-y-3">
          <h3 className="font-semibold text-white">Nouveau produit</h3>
          {msg && <div className="text-red-400 text-sm">{msg}</div>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input placeholder="Titre *" value={form.title} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm(setF(form, "title", e.target.value))} />
            <Input placeholder="Prix (FCFA) *" value={form.price} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm(setF(form, "price", e.target.value))} />
            <Input placeholder="Quantité" value={form.quantity} type="number" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm(setF(form, "quantity", e.target.value))} />
            <Input placeholder="Catégorie" value={form.category} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm(setF(form, "category", e.target.value))} />
          </div>
          <Input placeholder="Description" value={form.description} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm(setF(form, "description", e.target.value))} />
          <ImagePicker file={imageFile} onChange={setImageFile} label="Choisir une image" />
          <div className="flex gap-2">
            <Button onClick={handleAdd} isLoading={saving} className="bg-cyan-600 hover:bg-cyan-500">Créer</Button>
            <Button variant="outline" onClick={() => { setShowForm(false); setForm(EMPTY); setImageFile(null); setMsg(null); }}>Annuler</Button>
          </div>
        </div>
      )}

      {editingId && (
        <div className="bg-amber-900/20 border border-amber-500/30 p-4 rounded-lg space-y-3">
          <h3 className="font-semibold text-amber-300">Modifier le produit</h3>
          {msg && <div className="text-red-400 text-sm">{msg}</div>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input placeholder="Titre *" value={editForm.title} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditForm(setF(editForm, "title", e.target.value))} />
            <Input placeholder="Prix (FCFA) *" value={editForm.price} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditForm(setF(editForm, "price", e.target.value))} />
            <Input placeholder="Quantité" value={editForm.quantity} type="number" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditForm(setF(editForm, "quantity", e.target.value))} />
            <Input placeholder="Catégorie" value={editForm.category} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditForm(setF(editForm, "category", e.target.value))} />
          </div>
          <Input placeholder="Description" value={editForm.description} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditForm(setF(editForm, "description", e.target.value))} />
          <ImagePicker file={editImageFile} currentUrl={editCurrentUrl} onChange={setEditImageFile} label={editCurrentUrl ? "Changer l'image" : "Ajouter une image"} />
          <div className="flex gap-2">
            <Button onClick={handleEditSave} isLoading={saving} className="bg-amber-600 hover:bg-amber-500">Enregistrer</Button>
            <Button variant="outline" onClick={() => { setEditingId(null); setEditForm(EMPTY); setEditImageFile(null); setEditCurrentUrl(null); setMsg(null); }}>Annuler</Button>
          </div>
        </div>
      )}

      <div className="overflow-auto bg-white/3 rounded">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-white/50 border-b border-white/6">
              <th className="p-3">Image</th>
              <th className="p-3">Produit</th>
              {!compact && <th className="p-3">Catégorie</th>}
              <th className="p-3">Prix</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Dispo</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr><td colSpan={7} className="p-4 text-center text-white/40">Aucun produit.</td></tr>
            ) : products.map((p) => (
              <tr key={p.id} className="border-t border-white/6 hover:bg-white/3 transition">
                <td className="p-3">
                  <div className="w-10 h-10 rounded overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                    {p.image_url ? (
                      <Image src={p.image_url} alt={p.title} width={40} height={40} className="object-cover w-full h-full" unoptimized />
                    ) : (
                      <span className="text-white/20 text-[10px]">—</span>
                    )}
                  </div>
                </td>
                <td className="p-3 font-medium">{p.title}</td>
                {!compact && <td className="p-3 text-white/60">{p.category ?? "—"}</td>}
                <td className="p-3 text-cyan-300">{new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(Number(p.price))} FCFA</td>
                <td className="p-3">{p.quantity}</td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded text-xs ${p.available ? "bg-green-600/30 text-green-300" : "bg-red-600/30 text-red-300"}`}>
                    {p.available ? "Oui" : "Non"}
                  </span>
                </td>
                <td className="p-3 flex gap-2 flex-wrap">
                  <button
                    onClick={() => toggleAvailable(p.id, p.available)}
                    className={`px-2 py-1 rounded text-xs text-white ${p.available ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}`}
                  >
                    {p.available ? "Désactiver" : "Activer"}
                  </button>
                  {!compact && (
                    <>
                      <button onClick={() => openEdit(p)} className="px-2 py-1 bg-amber-600/80 hover:bg-amber-500 rounded text-xs text-white">
                        Modifier
                      </button>
                      <button onClick={() => remove(p.id)} className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-xs text-white">
                        Suppr
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
