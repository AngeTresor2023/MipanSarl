"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import { Trash2 } from "lucide-react";

type Exchange = {
  id: string;
  amount?: number | null;
  from_currency?: string | null;
  to_currency?: string | null;
  rate_public?: number | null;
  converted_amount?: number | null;
  contact_method?: string | null;
  contact_value?: string | null;
  payment_method?: string | null;
  rib?: string | null;
  status: string;
  admin_response?: string | null;
  created_at?: string | null;
};

const STATUS_META: Record<string, { label: string; color: string }> = {
  new:           { label: "Nouveau",       color: "bg-blue-600/20 text-blue-300" },
  en_traitement: { label: "En traitement", color: "bg-yellow-600/20 text-yellow-300" },
  termine:       { label: "Terminé",       color: "bg-green-600/20 text-green-300" },
  annule:        { label: "Annulé",        color: "bg-red-600/20 text-red-300" },
};

const PAYMENT_LABELS: Record<string, string> = {
  main_propre:  "Main propre",
  orange_money: "Orange Money",
  mtn_money:    "MTN Money",
  rib:          "RIB / Virement",
};

const STATUS_ACTIONS = [
  { value: "new",           label: "Nouveau",       cls: "bg-blue-600 hover:bg-blue-700" },
  { value: "en_traitement", label: "En traitement", cls: "bg-yellow-600 hover:bg-yellow-700" },
  { value: "termine",       label: "Terminer",      cls: "bg-green-600 hover:bg-green-700" },
  { value: "annule",        label: "Annuler",       cls: "bg-red-600 hover:bg-red-700" },
];

export default function ExchangesTable({ compact }: { compact?: boolean }) {
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/exchanges?limit=${compact ? 10 : 100}`);
    const json = await res.json();
    if (json.error) setError(json.error);
    else setExchanges(json.exchanges ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const patch = async (id: string, fields: Record<string, unknown>) => {
    setUpdating(id);
    await fetch("/api/admin/exchanges", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...fields }),
    });
    setUpdating(null);
  };

  const setStatus = async (id: string, status: string) => {
    await patch(id, { status });
    setExchanges((e) => e.map((x) => (x.id === id ? { ...x, status } : x)));
  };

  const sendReply = async (id: string) => {
    const text = replyText[id]?.trim();
    if (!text) return;
    await patch(id, { admin_response: text, status: "en_traitement" });
    setExchanges((e) => e.map((x) => (x.id === id ? { ...x, admin_response: text, status: "en_traitement" } : x)));
    setReplyText((r) => ({ ...r, [id]: "" }));
    setExpandedId(null);
  };

  const remove = async (id: string) => {
    if (!confirm("Supprimer cette demande d'échange ?")) return;
    await fetch("/api/admin/exchanges", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setExchanges((e) => e.filter((x) => x.id !== id));
  };

  if (loading) return <div className="text-white/60 text-sm py-4">Chargement des échanges…</div>;
  if (error) return <div className="text-red-400 text-sm bg-red-900/20 border border-red-500/20 p-3 rounded-lg">{error}</div>;
  if (exchanges.length === 0) return <div className="text-white/40 text-sm p-4 text-center">Aucune demande d&apos;échange.</div>;

  return (
    <div className="space-y-2">
      {exchanges.map((ex) => {
        const meta = STATUS_META[ex.status] ?? { label: ex.status, color: "bg-white/10 text-white/60" };
        const isExpanded = expandedId === ex.id;

        return (
          <div key={ex.id} className="bg-white/4 border border-white/8 rounded-xl overflow-hidden">
            {/* En-tête */}
            <div
              className="flex items-start justify-between p-4 cursor-pointer hover:bg-white/3 transition"
              onClick={() => setExpandedId(isExpanded ? null : ex.id)}
            >
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-white text-sm">
                  {ex.amount} {ex.from_currency} → {ex.converted_amount != null ? `${Number(ex.converted_amount).toLocaleString("fr-FR")} ${ex.to_currency}` : "—"}
                </div>
                <div className="text-xs text-white/45 mt-0.5">
                  {PAYMENT_LABELS[ex.payment_method ?? ""] ?? ex.payment_method} · {ex.contact_method}: {ex.contact_value}
                </div>
                <div className="text-xs text-white/30 mt-0.5">
                  {ex.created_at ? new Date(ex.created_at).toLocaleString("fr-FR") : "—"}
                </div>
              </div>
              <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${meta.color}`}>{meta.label}</span>
                {!compact && (
                  <button
                    onClick={(e) => { e.stopPropagation(); remove(ex.id); }}
                    className="p-1 rounded text-white/25 hover:text-red-400 transition"
                    title="Supprimer"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
                <span className="text-white/30 text-xs">{isExpanded ? "▲" : "▼"}</span>
              </div>
            </div>

            {/* Détails */}
            {isExpanded && (
              <div className="border-t border-white/6 p-4 space-y-4 bg-black/20">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-white/40 text-xs mb-1">Conversion</div>
                    <div className="text-white">{ex.amount} {ex.from_currency} → {ex.converted_amount != null ? `${Number(ex.converted_amount).toLocaleString("fr-FR")} ${ex.to_currency}` : "—"}</div>
                    <div className="text-xs text-white/35 mt-0.5">Taux : {ex.rate_public ?? "—"}</div>
                  </div>
                  <div>
                    <div className="text-white/40 text-xs mb-1">Mode de paiement</div>
                    <div className="text-white">{PAYMENT_LABELS[ex.payment_method ?? ""] ?? ex.payment_method}</div>
                    {ex.rib && <div className="text-xs text-white/55 mt-1">RIB : {ex.rib}</div>}
                  </div>
                  <div>
                    <div className="text-white/40 text-xs mb-1">Contact</div>
                    <div className="text-white">{ex.contact_method} — {ex.contact_value}</div>
                  </div>
                </div>

                {/* Changer statut */}
                <div className="flex gap-2 flex-wrap">
                  {STATUS_ACTIONS.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => setStatus(ex.id, s.value)}
                      disabled={ex.status === s.value || updating === ex.id}
                      className={`px-3 py-1 rounded-lg text-xs text-white font-medium transition ${
                        ex.status === s.value ? "opacity-40 cursor-not-allowed bg-white/10" : s.cls
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>

                {ex.admin_response && (
                  <div className="bg-green-900/20 border border-green-700/30 p-3 rounded-lg text-sm">
                    <div className="text-green-300 text-xs font-medium mb-1">Votre réponse précédente</div>
                    <div className="text-white/80">{ex.admin_response}</div>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="text-xs text-white/40 font-medium">Message au client</div>
                  <textarea
                    className="w-full p-3 rounded-lg bg-black/40 text-white border border-white/10 text-sm focus:outline-none focus:border-blue-500 resize-none"
                    rows={3}
                    placeholder="Message pour le client…"
                    value={replyText[ex.id] ?? ex.admin_response ?? ""}
                    onChange={(e) => setReplyText((r) => ({ ...r, [ex.id]: e.target.value }))}
                  />
                  <Button onClick={() => sendReply(ex.id)} isLoading={updating === ex.id} className="bg-blue-600 hover:bg-blue-500">
                    Envoyer & passer en traitement
                  </Button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
