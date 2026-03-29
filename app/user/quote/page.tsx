"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Input from "@/components/ui/input";
import Button from "@/components/ui/Button";

const supabase = createClient();

type QuoteDraft = {
  title?: string;
  package_description: string;
  length_cm?: number | null;
  width_cm?: number | null;
  height_cm?: number | null;
  weight_kg?: number | null;
  pickup_city?: string;
  delivery_method?: "home" | "warehouse";
  contact_method?: "email" | "whatsapp";
  contact_value?: string | null;
};

export default function QuotePage() {
  const [step, setStep] = useState<"form" | "review" | "sent" | "list">("form");
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState<QuoteDraft>({
    package_description: "",
    length_cm: null,
    width_cm: null,
    height_cm: null,
    weight_kg: null,
    pickup_city: "",
    delivery_method: "home",
    contact_method: "email",
    contact_value: null,
  });

  type SavedQuote = {
    id: string;
    title?: string | null;
    package_description?: string | null;
    contact_method?: string | null;
    contact_value?: string | null;
    status?: string | null;
    admin_response?: string | null;
    created_at?: string | null;
  };

  const [userId, setUserId] = useState<string | null>(null);
  const [savedQuotes, setSavedQuotes] = useState<SavedQuote[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Préremplir contact depuis profile si connecté
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await supabase.auth.getUser();
        const user = data?.user ?? null;
        if (!user) return;
        setUserId(user.id);

        // suppose que tu as une table "profiles" avec email et phone
        const { data: profile } = await supabase
          .from("profiles")
          .select("email, phone")
          .eq("id", user.id)
          .maybeSingle();

        if (mounted && profile) {
          setDraft((d) => ({
            ...d,
            contact_method: profile.phone ? "whatsapp" : "email",
            contact_value: profile.phone ?? profile.email ?? null,
          }));
        }
      } catch (e) {
        console.warn("Prefill contact failed", e);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Validation simple
  const validate = () => {
    if (!draft.package_description || draft.package_description.trim().length < 5) {
      setError("Décris brièvement la nature du colis (au moins 5 caractères).");
      return false;
    }
    if (!draft.pickup_city || draft.pickup_city.trim().length < 2) {
      setError("Indique la ville de retrait.");
      return false;
    }
    if (!draft.contact_value || draft.contact_value.trim().length < 5) {
      setError("Fournis un moyen de contact (email ou WhatsApp).");
      return false;
    }
    setError(null);
    return true;
  };

  // Aller à l'étape review
  const onConfirm = () => {
    if (!validate()) return;
    setStep("review");
  };

  // Envoi final : sauvegarde en base
  const onSend = async () => {
    setLoading(true);
    try {
      const title = `Devis - ${draft.pickup_city ?? "sans ville"} - ${new Date().toLocaleDateString()}`;
      const payload: Record<string, unknown> = {
        user_id: userId,
        title,
        contact_method: draft.contact_method,
        contact_value: draft.contact_value,
        pickup_city: draft.pickup_city,
        delivery_method: draft.delivery_method,
        package_description: draft.package_description,
        length_cm: draft.length_cm ?? null,
        width_cm: draft.width_cm ?? null,
        height_cm: draft.height_cm ?? null,
        weight_kg: draft.weight_kg ?? null,
        status: "new",
      };

      const { error: insertErr } = await supabase.from("quotes").insert([payload]);
      if (insertErr) {
        console.error("Insert quote error", insertErr);
        setError("Impossible d'enregistrer la demande. Réessaie plus tard.");
        setLoading(false);
        return;
      }

      setStep("sent");
      // refresh list
      await loadUserQuotes();
    } catch (e) {
      console.error(e);
      setError("Erreur inattendue lors de l'envoi.");
    } finally {
      setLoading(false);
    }
  };

  // Charger les demandes de l'utilisateur
  const loadUserQuotes = async () => {
    if (!userId) return;
    try {
      const { data } = await supabase
        .from("quotes")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      setSavedQuotes(data ?? []);
    } catch (e) {
      console.warn("Load quotes failed", e);
    }
  };

  useEffect(() => {
    if (userId) loadUserQuotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // UI helpers
  const setField = <K extends keyof QuoteDraft>(k: K, v: QuoteDraft[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));

  // Format dimensions display
  const dims = useMemo(() => {
    const l = draft.length_cm ?? 0;
    const w = draft.width_cm ?? 0;
    const h = draft.height_cm ?? 0;
    return `${l || "-"} × ${w || "-"} × ${h || "-"} cm`;
  }, [draft.length_cm, draft.width_cm, draft.height_cm]);

  // Render
  return (
    <div className="p-6 bg-black min-h-screen text-white">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Demande de devis</h1>

        {step === "form" && (
          <section className="bg-white/5 p-6 rounded-lg space-y-4">
            <h2 className="text-lg font-semibold">Détails du colis</h2>

            <label className="block">
              <div className="text-sm text-white/80 mb-1">Nature du colis</div>
              <textarea
                className="w-full p-3 rounded bg-black/60 text-white"
                rows={4}
                placeholder="Décris la nature du colis, fragilité, contenu, instructions..."
                value={draft.package_description}
                onChange={(e) => setField("package_description", e.target.value)}
              />
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                placeholder="Longueur (cm)"
                value={draft.length_cm ?? ""}
                onChange={(e: { target: { value: string } }) => setField("length_cm", e.target.value ? Number(e.target.value) : null)}
                type="number"
                className="bg-white/5"
              />
              <Input
                placeholder="Largeur (cm)"
                value={draft.width_cm ?? ""}
                onChange={(e: { target: { value: string } }) => setField("width_cm", e.target.value ? Number(e.target.value) : null)}
                type="number"
                className="bg-white/5"
              />
              <Input
                placeholder="Hauteur (cm)"
                value={draft.height_cm ?? ""}
                onChange={(e: { target: { value: string } }) => setField("height_cm", e.target.value ? Number(e.target.value) : null)}
                type="number"
                className="bg-white/5"
              />
            </div>

            <Input
              placeholder="Poids (kg)"
              value={draft.weight_kg ?? ""}
              onChange={(e: { target: { value: string } }) => setField("weight_kg", e.target.value ? Number(e.target.value) : null)}
              type="number"
              className="bg-white/5"
            />

            <Input
              placeholder="Ville de retrait"
              value={draft.pickup_city ?? ""}
              onChange={(e: { target: { value: string } }) => setField("pickup_city", e.target.value)}
              className="bg-white/5"
            />

            <div className="flex gap-3 items-center">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="delivery"
                  checked={draft.delivery_method === "home"}
                  onChange={() => setField("delivery_method", "home")}
                />
                <span className="ml-1">Livraison à domicile</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="delivery"
                  checked={draft.delivery_method === "warehouse"}
                  onChange={() => setField("delivery_method", "warehouse")}
                />
                <span className="ml-1">Retrait à l&apos;entrepôt</span>
              </label>
            </div>

            <h3 className="text-sm font-medium mt-4">Contact</h3>
            <div className="flex gap-3 items-center">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="contact"
                  checked={draft.contact_method === "email"}
                  onChange={() => setField("contact_method", "email")}
                />
                <span className="ml-1">Courriel</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="contact"
                  checked={draft.contact_method === "whatsapp"}
                  onChange={() => setField("contact_method", "whatsapp")}
                />
                <span className="ml-1">WhatsApp</span>
              </label>
            </div>

            <Input
              placeholder={draft.contact_method === "whatsapp" ? "Numéro WhatsApp (+33...)" : "Email de contact"}
              value={draft.contact_value ?? ""}
              onChange={(e: { target: { value: string } }) => setField("contact_value", e.target.value)}
              className="bg-white/5"
            />

            {error && <div className="text-red-400 text-sm">{error}</div>}

            <div className="flex gap-3 mt-4">
              <Button onClick={onConfirm} className="bg-cyan-600 hover:bg-cyan-500">Confirmer</Button>
              <Button variant="outline" onClick={() => { setDraft({
                package_description: "",
                length_cm: null, width_cm: null, height_cm: null, weight_kg: null,
                pickup_city: "", delivery_method: "home", contact_method: "email", contact_value: null
              }); setError(null); }}>Réinitialiser</Button>
              <Button variant="ghost" onClick={() => setStep("list")}>Voir mes demandes</Button>
            </div>
          </section>
        )}

        {step === "review" && (
          <section className="bg-white/5 p-6 rounded-lg space-y-4">
            <h2 className="text-lg font-semibold">Vérification des informations</h2>

            <div className="space-y-2">
              <div><strong>Nature du colis</strong><div className="text-white/70">{draft.package_description}</div></div>
              <div><strong>Dimensions</strong><div className="text-white/70">{dims}</div></div>
              <div><strong>Poids</strong><div className="text-white/70">{draft.weight_kg ?? "-"} kg</div></div>
              <div><strong>Ville de retrait</strong><div className="text-white/70">{draft.pickup_city}</div></div>
              <div><strong>Mode de livraison</strong><div className="text-white/70">{draft.delivery_method === "home" ? "Livraison à domicile" : "Retrait à l&apos;entrepôt"}</div></div>
              <div><strong>Méthode de contact</strong><div className="text-white/70">{draft.contact_method} — {draft.contact_value}</div></div>
            </div>

            <div className="flex gap-3 mt-4">
              <Button onClick={() => setStep("form")} variant="outline">Modifier</Button>
              <Button onClick={onSend} className="bg-cyan-600 hover:bg-cyan-500" disabled={loading}>
                {loading ? "Envoi..." : "Envoyer la demande"}
              </Button>
            </div>

            {error && <div className="text-red-400 text-sm">{error}</div>}
          </section>
        )}

        {step === "sent" && (() => {
          // ID de la dernière demande envoyée (récupéré via savedQuotes après envoi)
          const lastQuote = savedQuotes[0];
          const quoteRef = lastQuote?.id ? `DEV-${String(lastQuote.id).substring(0, 8).toUpperCase()}` : "votre demande";
          const whatsappUrl = `https://wa.me/237600000000?text=${encodeURIComponent(
            `Bonjour MIPAN SARL, je souhaite des informations sur mon devis n° ${quoteRef}. Merci !`
          )}`;

          return (
            <section className="bg-white/5 p-6 rounded-lg space-y-4 text-center">
              <h2 className="text-lg font-semibold">Demande envoyée ✅</h2>
              <p className="text-white/70">
                Merci. Ta demande a bien été enregistrée. Nous te répondrons par le moyen de contact choisi.
              </p>

              {/* Bouton WhatsApp — visible uniquement après envoi */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full max-w-sm mx-auto py-3 rounded-lg bg-green-600 hover:bg-green-500 text-white font-semibold transition"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.117.549 4.107 1.51 5.843L.06 23.14a.75.75 0 00.922.92l5.332-1.455A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.75 9.75 0 01-4.964-1.357l-.355-.21-3.68 1.004 1.003-3.658-.23-.374A9.75 9.75 0 1112 21.75z"/>
                </svg>
                Suivre mon devis sur WhatsApp
              </a>

              <div className="flex justify-center gap-3 mt-4">
                <Button onClick={() => { setDraft({
                  package_description: "",
                  length_cm: null, width_cm: null, height_cm: null, weight_kg: null,
                  pickup_city: "", delivery_method: "home", contact_method: "email", contact_value: null
                }); setStep("form"); }}>Nouvelle demande</Button>
                <Button variant="outline" onClick={() => setStep("list")}>Voir mes demandes</Button>
              </div>
            </section>
          );
        })()}

        {step === "list" && (
          <section className="bg-white/5 p-6 rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Mes demandes</h2>
              <div className="flex gap-2">
                <Button onClick={() => setStep("form")}>Nouvelle demande</Button>
                <Button variant="outline" onClick={loadUserQuotes}>Rafraîchir</Button>
              </div>
            </div>

            {savedQuotes.length === 0 ? (
              <div className="text-white/60">Aucune demande trouvée.</div>
            ) : (
              <ul className="space-y-3">
                {savedQuotes.map((q) => (
                  <li key={q.id} className="p-3 bg-black/40 rounded flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <div className="font-semibold">{q.title}</div>
                      <div className="text-sm text-white/70">{q.created_at ? new Date(q.created_at).toLocaleString() : "—"}</div>
                      <div className="mt-2 text-white/80">{q.package_description}</div>
                      <div className="text-sm text-white/60 mt-1">Contact: {q.contact_method} — {q.contact_value}</div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm text-white/60">Statut</div>
                      <div className={`font-semibold ${q.status === "replied" ? "text-green-300" : q.status === "read" ? "text-yellow-300" : "text-white"}`}>
                        {q.status}
                      </div>

                      {q.admin_response ? (
                        <details className="mt-2 text-sm text-white/70">
                          <summary className="cursor-pointer text-cyan-300">Voir la réponse</summary>
                          <div className="mt-2">{q.admin_response}</div>
                        </details>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
