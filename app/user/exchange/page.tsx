"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Input from "@/components/ui/input";
import Button from "@/components/ui/Button";

const supabase = createClient();

export default function ExchangePage() {
  // taux public + marge (marge appliquée en interne)
  const [ratePublic, setRatePublic] = useState<number | null>(null);
  const [margin] = useState<number>(0.005); // 0.5% par défaut
  const [loadingRate, setLoadingRate] = useState(false);

  // mini-calculateur (header bar) et convertisseur principal
  const [amount, setAmount] = useState<number>(100);
  const [direction, setDirection] = useState<"EUR_TO_XOF" | "XOF_TO_EUR">("EUR_TO_XOF");

  // formulaire
  const [showForm, setShowForm] = useState(false);
  const [view, setView] = useState<"calculator" | "form" | "review" | "sent">("calculator");
  const [draft, setDraft] = useState<any>({
    amount: 100,
    from_currency: "EUR",
    to_currency: "XOF",
    rate: null,
    contact_method: "whatsapp",
    contact_value: "",
    payment_method: "main_propre",
    rib: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // demandes utilisateur
  const [requests, setRequests] = useState<any[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(true);

  // charger taux public
  useEffect(() => {
    let mounted = true;
    const loadRate = async () => {
      setLoadingRate(true);
      try {
        const res = await fetch("https://open.er-api.com/v6/latest/EUR");
        const json = await res.json();
        if (!mounted) return;
        const r = Number(json?.rates?.XOF ?? null);
        setRatePublic(Number.isFinite(r) ? r : null);
      } catch (e) {
        console.error("Failed to load rate", e);
        if (mounted) setRatePublic(null);
      } finally {
        if (mounted) setLoadingRate(false);
      }
    };
    loadRate();
    const id = setInterval(loadRate, 60_000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  // rate effectif (marge appliquée en interne)
  const effectiveRate = useMemo(() => {
    if (!ratePublic) return null;
    return ratePublic * (1 - margin);
  }, [ratePublic, margin]);

  // conversion pour mini-calculateur et convertisseur
  const convertedInline = useMemo(() => {
    const amt = Number(amount) || 0;
    if (!effectiveRate || amt <= 0) return 0;
    return direction === "EUR_TO_XOF" ? amt * effectiveRate : amt / effectiveRate;
  }, [amount, direction, effectiveRate]);

  // charger demandes utilisateur
  const loadRequests = async () => {
    setRequestsLoading(true);
    try {
      const { data } = await supabase.auth.getUser();
      const user = data?.user ?? null;
      if (!user) {
        setRequests([]);
        setRequestsLoading(false);
        return;
      }
      const { data: rows } = await supabase
        .from("exchanges")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setRequests(rows ?? []);
    } catch (e) {
      console.error("Failed to load requests", e);
      setRequests([]);
    } finally {
      setRequestsLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  // ouvrir formulaire (prérempli depuis mini-calculateur)
  const openForm = () => {
    setDraft((d: any) => ({
      ...d,
      amount,
      from_currency: direction === "EUR_TO_XOF" ? "EUR" : "XOF",
      to_currency: direction === "EUR_TO_XOF" ? "XOF" : "EUR",
      rate: ratePublic,
    }));
    setShowForm(true);
    setView("form");
    setError(null);
  };

  const updateDraft = (k: string, v: any) => setDraft((d: any) => ({ ...d, [k]: v }));

  const validateDraft = () => {
    if (!draft.amount || Number(draft.amount) <= 0) return "Montant invalide.";
    if (!draft.contact_value || String(draft.contact_value).trim().length < 3) return "Fournis un moyen de contact.";
    if (draft.payment_method === "rib" && (!draft.rib || draft.rib.trim().length < 8)) return "Fournis un RIB valide.";
    return null;
  };

  const onReview = () => {
    const v = validateDraft();
    if (v) {
      setError(v);
      return;
    }
    setError(null);
    setView("review");
  };

  const onSend = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const { data } = await supabase.auth.getUser();
      const user = data?.user ?? null;

      const converted = direction === "EUR_TO_XOF"
        ? Number(draft.amount) * (effectiveRate ?? 0)
        : Number(draft.amount) / (effectiveRate ?? 1);

      const payload: any = {
        user_id: user?.id ?? null,
        amount: Number(draft.amount),
        from_currency: draft.from_currency,
        to_currency: draft.to_currency,
        rate_public: ratePublic ?? null,
        rate_effective: effectiveRate ?? null,
        converted_amount: converted ?? null,
        contact_method: draft.contact_method,
        contact_value: draft.contact_value,
        payment_method: draft.payment_method,
        rib: draft.payment_method === "rib" ? draft.rib ?? null : null,
        status: "new",
      };

      const { error: insertErr } = await supabase.from("exchanges").insert([payload]);
      if (insertErr) {
        console.error("Insert exchange error", insertErr);
        setError("Impossible d'enregistrer la demande. Réessaie plus tard.");
        setSubmitting(false);
        return;
      }

      setView("sent");
      setShowForm(false);
      await loadRequests();
    } catch (e) {
      console.error(e);
      setError("Erreur inattendue lors de l'envoi.");
    } finally {
      setSubmitting(false);
    }
  };

  const fmtNumber = (v: number | null, digits = 2) =>
    v == null ? "—" : v.toLocaleString(undefined, { maximumFractionDigits: digits });

  // layout constants
  const HERO_GAP = 28; // px gap between hero text and bar

  return (
    <main className="min-h-screen w-screen text-white relative overflow-hidden" style={{ height: "100vh" }}>
      {/* fixed full-screen background */}
      <div
        className="fixed inset-0 bg-center bg-cover -z-20"
        style={{ backgroundImage: "url('/assets/hero.jpg')" }}
        aria-hidden
      />
      <div className="fixed inset-0 bg-black/30 -z-10" aria-hidden />

      {/* HERO: centered title + small descriptive text (above the bar and forms) */}
      <section className="relative z-10 w-full flex items-start justify-center" style={{ paddingTop: 36 }}>
        <div className="text-center max-w-3xl px-6">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white/80 leading-tight select-none">MIPAN SARL Exchange</h1>
          <p className="mt-3 text-base md:text-lg text-white/70">
            Échangez et envoyez des devises en toute confiance. Estimez instantanément, choisissez votre méthode
            (remise en main, Orange/MTN Money, RIB) et soumettez votre demande — nous la traitons rapidement.
          </p>
        </div>
      </section>

      {/* BARRE (sous le hero text, dans la même section que les forms) */}
      <section className="relative z-10 w-full flex items-center justify-center" style={{ marginTop: HERO_GAP }}>
        <div className="w-[min(1100px,94%)] p-3 rounded-lg border border-white/10 bg-[rgba(0,0,0,0.36)] backdrop-blur-md flex items-center justify-between gap-4">
          {/* left: nav (visible & accessible) */}
          <nav className="flex items-center gap-4">
            <Link href="#convertisseur" className="text-sm px-3 py-1 rounded hover:bg-white/5">Convertisseur</Link>
            <button
              onClick={() => { openForm(); }}
              className="text-sm px-3 py-1 rounded bg-amber-500 hover:bg-amber-400"
            >
              Demander un échange
            </button>
            <Link href="/user/quote" className="text-sm px-3 py-1 rounded hover:bg-white/5">Devis</Link>
          </nav>

          {/* center: mini-calculateur inline */}
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={amount}
              onChange={(e: any) => {
                const v = Number(e.target.value);
                setAmount(Number.isFinite(v) ? v : 0);
              }}
              className="w-28 bg-black/30 text-sm"
              placeholder="Montant"
            />

            <select
              value={direction}
              onChange={(e) => setDirection(e.target.value as any)}
              className="p-2 rounded bg-black/30 text-sm"
              aria-label="Direction conversion"
            >
              <option value="EUR_TO_XOF">EUR → XOF</option>
              <option value="XOF_TO_EUR">XOF → EUR</option>
            </select>

            <div className="px-3 py-1 rounded bg-white/5 text-sm">
              <span className="text-white/80">≈</span>{" "}
              <span className="font-semibold text-cyan-300">
                {ratePublic ? `${fmtNumber(convertedInline, 2)} ${direction === "EUR_TO_XOF" ? "XOF" : "EUR"}` : "—"}
              </span>
            </div>
          </div>

          {/* right: quick contact */}
          <div className="flex items-center gap-3 text-sm text-white/70">
            <div>WhatsApp: <span className="text-white">+221 77 123 45 67</span></div>
          </div>
        </div>
      </section>

      {/* Main content: panels (no page scroll; internal scroll if needed) */}
      <section
        className="relative z-10 max-w-6xl mx-auto px-6 py-6"
        style={{ marginTop: 18, height: `calc(100vh - ${36 + HERO_GAP + 120}px)`, boxSizing: "border-box", overflow: "hidden" }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
          {/* Convertisseur panel */}
          <div id="convertisseur" className="p-5 rounded-lg border border-white/10 bg-[rgba(255,255,255,0.03)] backdrop-blur-md shadow-lg overflow-auto" style={{ maxHeight: "100%" }}>
            <h2 className="text-2xl font-semibold mb-2">Convertisseur</h2>

            <div className="text-sm text-white/70 mb-3">
              <div>
                <strong className="text-white/80">Taux public :</strong>{" "}
                <span className="text-cyan-300 font-medium">{ratePublic ? `${fmtNumber(ratePublic, 4)} XOF / EUR` : loadingRate ? "Chargement..." : "—"}</span>
              </div>
              <div className="text-xs text-white/60 mt-1">
                Estimation instantanée. Le calcul final applique une légère marge opérationnelle (non affichée).
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
              <Input
                type="number"
                value={amount}
                onChange={(e: any) => {
                  const v = Number(e.target.value);
                  setAmount(Number.isFinite(v) ? v : 0);
                }}
                className="col-span-2 bg-transparent"
                placeholder="Montant"
              />
              <div className="flex items-center">
                <select
                  value={direction}
                  onChange={(e) => setDirection(e.target.value as any)}
                  className="w-full p-2 rounded bg-black/25 text-white border border-white/6"
                >
                  <option value="EUR_TO_XOF">EUR → XOF</option>
                  <option value="XOF_TO_EUR">XOF → EUR</option>
                </select>
              </div>
            </div>

            <div className="text-xl font-semibold mb-3">
              Résultat : <span className="text-cyan-300">{ratePublic ? `${fmtNumber(convertedInline, 2)} ${direction === "EUR_TO_XOF" ? "XOF" : "EUR"}` : "—"}</span>
            </div>

            <div className="flex gap-3">
              <Button onClick={openForm} className="bg-amber-500">Demander un échange</Button>
              <Button variant="outline" onClick={() => { setAmount(100); setDirection("EUR_TO_XOF"); }}>Réinitialiser</Button>
            </div>
          </div>

          {/* Contact & form panel */}
          <div className="p-5 rounded-lg border border-white/10 bg-[rgba(255,255,255,0.03)] backdrop-blur-md shadow-lg overflow-auto" style={{ maxHeight: "100%" }}>
            <h2 className="text-2xl font-semibold mb-2">Contact & Formulaire</h2>

            <div className="space-y-2 mb-3 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 rounded-full bg-cyan-300 mt-2" />
                <div>
                  <div className="font-medium">WhatsApp</div>
                  <div className="text-white/70">+221 77 123 45 67</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-3 h-3 rounded-full bg-cyan-300 mt-2" />
                <div>
                  <div className="font-medium">Email</div>
                  <div className="text-white/70">exchange@mipan-sarl.com</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-3 h-3 rounded-full bg-cyan-300 mt-2" />
                <div>
                  <div className="font-medium">Téléphone</div>
                  <div className="text-white/70">+221 33 123 45 67</div>
                </div>
              </div>
            </div>

            {/* Transparent form */}
            {showForm && (
              <div className="mt-3">
                <h3 className="font-semibold mb-2">Formulaire de demande</h3>

                <div className="space-y-2 text-sm">
                  <div>
                    <label className="text-white/80">Montant</label>
                    <Input type="number" value={draft.amount ?? amount} onChange={(e: any) => updateDraft("amount", Number(e.target.value))} className="bg-transparent" />
                  </div>

                  <div>
                    <label className="text-white/80">Méthode de contact</label>
                    <select value={draft.contact_method} onChange={(e) => updateDraft("contact_method", e.target.value)} className="w-full p-2 rounded bg-black/25 text-white border border-white/6">
                      <option value="whatsapp">WhatsApp</option>
                      <option value="phone">Téléphone</option>
                      <option value="email">Email</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-white/80">Coordonnée</label>
                    <Input value={draft.contact_value ?? ""} onChange={(e: any) => updateDraft("contact_value", e.target.value)} placeholder="+221 77 ... ou adresse@exemple.com" className="bg-transparent" />
                  </div>

                  <div>
                    <label className="text-white/80">Méthode de paiement</label>
                    <select value={draft.payment_method} onChange={(e) => updateDraft("payment_method", e.target.value)} className="w-full p-2 rounded bg-black/25 text-white border border-white/6">
                      <option value="main_propre">Main propre</option>
                      <option value="orange_money">Orange Money</option>
                      <option value="mtn_money">MTN Mobile Money</option>
                      <option value="rib">RIB (virement)</option>
                    </select>
                  </div>

                  {draft.payment_method === "rib" && (
                    <div>
                      <label className="text-white/80">RIB / IBAN</label>
                      <Input value={draft.rib ?? ""} onChange={(e: any) => updateDraft("rib", e.target.value)} placeholder="FR76..." className="bg-transparent" />
                    </div>
                  )}

                  {error && <div className="text-sm text-red-400">{error}</div>}

                  <div className="flex gap-2 mt-2">
                    <Button onClick={onReview} className="bg-cyan-600">Vérifier</Button>
                    <Button variant="outline" onClick={() => { setShowForm(false); setView("calculator"); }}>Annuler</Button>
                  </div>
                </div>
              </div>
            )}

            {view === "review" && (
              <div className="mt-3">
                <h3 className="font-semibold mb-2">Vérification</h3>
                <div className="bg-black/25 p-2 rounded text-sm">
                  <div><strong>Montant:</strong> {draft.amount} {draft.from_currency}</div>
                  <div><strong>Converti:</strong> {direction === "EUR_TO_XOF" ? `${fmtNumber(draft.amount * (effectiveRate ?? 0), 2)} XOF` : `${fmtNumber(draft.amount / (effectiveRate ?? 1), 2)} EUR`}</div>
                  <div><strong>Contact:</strong> {draft.contact_method} — {draft.contact_value}</div>
                  <div><strong>Méthode paiement:</strong> {draft.payment_method === "rib" ? `RIB: ${draft.rib}` : draft.payment_method}</div>
                </div>

                <div className="flex gap-2 mt-2">
                  <Button onClick={() => { setView("form"); }} variant="outline">Modifier</Button>
                  <Button onClick={onSend} className="bg-amber-500" disabled={submitting}>{submitting ? "Envoi..." : "Confirmer et envoyer"}</Button>
                </div>

                {error && <div className="text-sm text-red-400 mt-2">{error}</div>}
              </div>
            )}

            {view === "sent" && (
              <div className="mt-3">
                <h3 className="font-semibold">Demande envoyée</h3>
                <p className="text-white/70">Merci — votre demande est bien reçue. Nous vous contacterons rapidement.</p>
                <div className="mt-2">
                  <Button onClick={() => { setView("calculator"); setShowForm(false); }}>Nouvelle demande</Button>
                  <Button variant="outline" onClick={loadRequests}>Voir mes demandes</Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* demandes list */}
        <section className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Mes demandes d'échange</h3>
            <div className="text-sm text-white/60">Statuts : new · en_traitement · termine</div>
          </div>

          {requestsLoading ? (
            <div className="space-y-2">
              <div className="animate-pulse bg-white/3 h-12 rounded" />
              <div className="animate-pulse bg-white/3 h-12 rounded" />
            </div>
          ) : requests.length === 0 ? (
            <div className="text-white/70">Aucune demande enregistrée. Créez une demande depuis le convertisseur.</div>
          ) : (
            <ul className="space-y-2">
              {requests.map((r) => (
                <li key={r.id} className="bg-[rgba(255,255,255,0.03)] p-3 rounded flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 backdrop-blur-md border border-white/6">
                  <div>
                    <div className="font-semibold text-sm">{r.amount} {r.from_currency} → {r.converted_amount ? `${Number(r.converted_amount).toLocaleString()} ${r.to_currency}` : "—"}</div>
                    <div className="text-xs text-white/60">Méthode: {r.payment_method} · Contact: {r.contact_method} {r.contact_value}</div>
                    <div className="text-xs text-white/60 mt-1">Créée: {r.created_at ? new Date(r.created_at).toLocaleString() : "—"}</div>
                  </div>

                  <div className="text-right">
                    <div className={`font-semibold ${r.status === "termine" ? "text-green-300" : r.status === "en_traitement" ? "text-yellow-300" : "text-white"}`}>{r.status}</div>
                    {r.admin_response && (
                      <details className="mt-1 text-xs text-white/70">
                        <summary className="cursor-pointer text-cyan-300">Réponse de l'admin</summary>
                        <div className="mt-1">{r.admin_response}</div>
                      </details>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </section>
    </main>
  );
}
