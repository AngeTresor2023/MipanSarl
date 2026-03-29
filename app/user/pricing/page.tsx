"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/input";

type PriceRow = {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  unit?: string | null; // ex: "pièce", "kg", "m3"
  visible?: boolean | null;
  updated_at?: string | null;
};

const supabase = createClient();

export default function PricingPage() {
  const [items, setItems] = useState<PriceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from("pricing")
          .select("*")
          .order("name", { ascending: true });

        if (error) {
          console.error("Supabase pricing error:", error);
          if (mounted) setError("Impossible de charger les tarifs.");
          return;
        }

        if (mounted) setItems((data ?? []) as PriceRow[]);
      } catch (e) {
        console.error(e);
        if (mounted) setError("Erreur réseau lors du chargement des tarifs.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    const checkAdmin = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        const user = data?.user ?? null;
        if (!user) return;
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();
        if (profile?.role === "admin") setIsAdmin(true);
      } catch {
        // ignore
      }
    };

    load();
    checkAdmin();

    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return items.filter((i) => i.visible !== false);
    return items.filter(
      (i) =>
        (i.visible !== false) &&
        (`${i.name} ${i.description ?? ""} ${i.unit ?? ""}`).toLowerCase().includes(term)
    );
  }, [items, q]);

  const fmt = (v: number) =>
    new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(v) + " FCFA";

  // Admin actions (simple prompt-based UI to avoid extra components)
  const handleAdd = async () => {
    const name = window.prompt("Nom du produit (ex: Baril 20L, Voiture) :");
    if (!name) return;
    const priceStr = window.prompt("Prix en EUR (ex: 12.50) :");
    if (!priceStr) return;
    const price = Number(priceStr.replace(",", "."));
    if (Number.isNaN(price)) return alert("Prix invalide.");
    const unit = window.prompt("Unité (ex: pièce, kg, m3) :", "pièce") ?? "pièce";
    const description = window.prompt("Description (optionnelle) :") ?? null;

    setSaving(true);
    try {
      const { error } = await supabase.from("pricing").insert([
        { name, price, unit, description, visible: true },
      ]);
      if (error) throw error;
      const { data } = await supabase.from("pricing").select("*").order("name", { ascending: true });
      setItems((data ?? []) as PriceRow[]);
    } catch (e: any) {
      console.error("Add pricing error", e);
      alert("Erreur lors de l'ajout : " + (e?.message ?? e));
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (row: PriceRow) => {
    const name = window.prompt("Nom", row.name);
    if (!name) return;
    const priceStr = window.prompt("Prix en EUR", String(row.price));
    if (!priceStr) return;
    const price = Number(priceStr.replace(",", "."));
    if (Number.isNaN(price)) return alert("Prix invalide.");
    const unit = window.prompt("Unité", row.unit ?? "pièce") ?? "pièce";
    const description = window.prompt("Description", row.description ?? "") ?? null;
    const visible = window.confirm("Afficher cet article publiquement ? (OK = oui)");

    setSaving(true);
    try {
      const { error } = await supabase
        .from("pricing")
        .update({ name, price, unit, description, visible })
        .eq("id", row.id);
      if (error) throw error;
      const { data } = await supabase.from("pricing").select("*").order("name", { ascending: true });
      setItems((data ?? []) as PriceRow[]);
    } catch (e: any) {
      console.error("Update pricing error", e);
      alert("Erreur lors de la mise à jour : " + (e?.message ?? e));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row: PriceRow) => {
    if (!confirm(`Supprimer "${row.name}" ? Cette action est irréversible.`)) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("pricing").delete().eq("id", row.id);
      if (error) throw error;
      setItems((prev) => prev.filter((p) => p.id !== row.id));
    } catch (e: any) {
      console.error("Delete pricing error", e);
      alert("Erreur lors de la suppression : " + (e?.message ?? e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="p-6 bg-black min-h-screen text-white">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-cyan-400">Nos tarifs</h1>
            <p className="text-white/70 mt-1 max-w-xl">
              Retrouvez nos prix pour les différents types d'objets : barils, véhicules, sacs 23 kg, congélateurs, mini‑frigos, etc.
              Les tarifs sont mis à jour par l'administrateur. Besoin d'une cotation personnalisée ?{" "}
              <Link href="/user/quote" className="text-cyan-300 underline">Demander un devis</Link>.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <Input
              placeholder="Rechercher (ex: baril, congélateur)"
              value={q}
              onChange={(e: any) => setQ(e.target.value)}
              className="bg-white/5 text-white placeholder-white/50"
            />
            <Link href="/user/quote" className="ml-2">
              <Button className="bg-cyan-600 hover:bg-cyan-500">Demander une cotation</Button>
            </Link>

            {isAdmin && (
              <div className="ml-2">
                <Button onClick={handleAdd} className="bg-amber-600 hover:bg-amber-500" disabled={saving}>
                  {saving ? "Traitement..." : "Ajouter un tarif"}
                </Button>
              </div>
            )}
          </div>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-white/3 rounded-lg p-4 h-40" />
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-900/30 p-4 rounded">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="bg-white/5 p-6 rounded text-white/70">Aucun tarif trouvé.</div>
        ) : (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((it) => (
              <article key={it.id} className="bg-white/5 border border-white/6 rounded-lg p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-lg font-semibold text-white">{it.name}</h3>
                    <div className="text-cyan-300 font-bold">
                      {fmt(Number(it.price))}{" "}
                      <span className="text-sm text-white/60">/{it.unit ?? "pièce"}</span>
                    </div>
                  </div>

                  {it.description ? <p className="text-white/70 mt-2 text-sm">{it.description}</p> : null}

                  <div className="mt-3 text-xs text-white/60">
                    Mis à jour: {it.updated_at ? new Date(it.updated_at).toLocaleDateString() : "—"}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-2">
                  <Link href="/user/quote" className="text-sm text-white/90 underline">
                    Demander un devis pour cet article
                  </Link>

                  {isAdmin && (
                    <div className="flex gap-2">
                      <Button onClick={() => handleEdit(it)} variant="outline" className="text-sm">Modifier</Button>
                      <Button onClick={() => handleDelete(it)} className="bg-red-600 hover:bg-red-500 text-sm">Supprimer</Button>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </section>
        )}

        <footer className="mt-8 text-sm text-white/60">
          <p>
            Besoin d'une cotation sur mesure ou d'un transport particulier (véhicule, colis volumineux) ?{" "}
            <Link href="/user/quote" className="text-cyan-300 underline">Demandez un devis</Link> — nous vous répondrons rapidement par WhatsApp ou email.
          </p>
        </footer>
      </div>
    </main>
  );
}
