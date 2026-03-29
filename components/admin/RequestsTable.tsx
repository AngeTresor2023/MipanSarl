"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import { Trash2 } from "lucide-react";

type Quote = {
  id: string;
  title?: string | null;
  contact_method?: string | null;
  contact_value?: string | null;
  pickup_city?: string | null;
  delivery_method?: string | null;
  package_description?: string | null;
  weight_kg?: number | null;
  length_cm?: number | null;
  width_cm?: number | null;
  height_cm?: number | null;
  status: string;
  admin_response?: string | null;
  created_at?: string | null;
};

const STATUS_META: Record<string, { label: string; color: string }> = {
  new:     { label: "Nouveau",  color: "bg-blue-600/20 text-blue-300" },
  read:    { label: "Lu",       color: "bg-yellow-600/20 text-yellow-300" },
  replied: { label: "Répondu", color: "bg-green-600/20 text-green-300" },
};

export default function RequestsTable({ compact }: { compact?: boolean }) {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [replying, setReplying] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/quotes?limit=${compact ? 10 : 100}`);
    const json = await res.json();
    if (json.error) setError(json.error);
    else setQuotes(json.quotes ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const patch = async (id: string, fields: Record<string, unknown>) => {
    await fetch("/api/admin/quotes", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...fields }),
    });
  };

  const markRead = async (id: string) => {
    await patch(id, { status: "read" });
    setQuotes((q) => q.map((x) => (x.id === id ? { ...x, status: "read" } : x)));
  };

  const sendReply = async (id: string) => {
    const text = replyText[id]?.trim();
    if (!text) return;
    setReplying(id);
    await patch(id, { admin_response: text, status: "replied" });
    setQuotes((q) => q.map((x) => (x.id === id ? { ...x, admin_response: text, status: "replied" } : x)));
    setReplyText((r) => ({ ...r, [id]: "" }));
    setExpandedId(null);
    setReplying(null);
  };

  const remove = async (id: string) => {
    if (!confirm("Supprimer cette demande de devis ?")) return;
    await fetch("/api/admin/quotes", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setQuotes((q) => q.filter((x) => x.id !== id));
  };

  if (loading) return <div className="text-white/60 text-sm py-4">Chargement des devis…</div>;
  if (error) return <div className="text-red-400 text-sm bg-red-900/20 border border-red-500/20 p-3 rounded-lg">{error}</div>;
  if (quotes.length === 0) return <div className="text-white/40 text-sm p-4 text-center">Aucune demande de devis.</div>;

  return (
    <div className="space-y-2">
      {quotes.map((q) => {
        const meta = STATUS_META[q.status] ?? { label: q.status, color: "bg-white/10 text-white/60" };
        const isExpanded = expandedId === q.id;

        return (
          <div key={q.id} className="bg-white/4 border border-white/8 rounded-xl overflow-hidden">
            {/* En-tête cliquable */}
            <div
              className="flex items-start justify-between p-4 cursor-pointer hover:bg-white/3 transition"
              onClick={() => {
                setExpandedId(isExpanded ? null : q.id);
                if (q.status === "new") markRead(q.id);
              }}
            >
              <div className="flex-1 min-w-0">
                <div className="font-medium text-white truncate">{q.title ?? "Demande sans titre"}</div>
                <div className="text-xs text-white/45 mt-0.5">
                  {q.pickup_city ?? "—"} · {q.contact_method}: {q.contact_value ?? "—"}
                </div>
                <div className="text-xs text-white/30 mt-0.5">
                  {q.created_at ? new Date(q.created_at).toLocaleString("fr-FR") : "—"}
                </div>
              </div>
              <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${meta.color}`}>{meta.label}</span>
                {!compact && (
                  <button
                    onClick={(e) => { e.stopPropagation(); remove(q.id); }}
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
              <div className="border-t border-white/6 p-4 space-y-3 bg-black/20">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-white/40 text-xs mb-1">Nature du colis</div>
                    <div className="text-white">{q.package_description ?? "—"}</div>
                  </div>
                  <div>
                    <div className="text-white/40 text-xs mb-1">Dimensions (L×l×H) / Poids</div>
                    <div className="text-white">{q.length_cm ?? "—"} × {q.width_cm ?? "—"} × {q.height_cm ?? "—"} cm · {q.weight_kg ?? "—"} kg</div>
                  </div>
                  <div>
                    <div className="text-white/40 text-xs mb-1">Livraison</div>
                    <div className="text-white">{q.delivery_method === "home" ? "À domicile" : "Retrait entrepôt"}</div>
                  </div>
                  <div>
                    <div className="text-white/40 text-xs mb-1">Contact</div>
                    <div className="text-white">{q.contact_method} — {q.contact_value}</div>
                  </div>
                </div>

                {q.admin_response && (
                  <div className="bg-green-900/20 border border-green-700/30 p-3 rounded-lg text-sm">
                    <div className="text-green-300 text-xs font-medium mb-1">Votre réponse</div>
                    <div className="text-white/80">{q.admin_response}</div>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="text-xs text-white/40 font-medium">Répondre au client</div>
                  <textarea
                    className="w-full p-3 rounded-lg bg-black/40 text-white border border-white/10 text-sm focus:outline-none focus:border-blue-500 resize-none"
                    rows={3}
                    placeholder="Votre réponse…"
                    value={replyText[q.id] ?? q.admin_response ?? ""}
                    onChange={(e) => setReplyText((r) => ({ ...r, [q.id]: e.target.value }))}
                  />
                  <Button onClick={() => sendReply(q.id)} isLoading={replying === q.id} className="bg-blue-600 hover:bg-blue-500">
                    Envoyer la réponse
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
