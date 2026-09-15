"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Paperclip, ChevronDown, ChevronUp, Reply, Forward, Download } from "lucide-react";
import type { ComposeInitial } from "./ReplyForm";

type SentEmail = {
  id: string;
  to_email: string;
  subject: string;
  message: string;
  attachment_filename: string | null;
  attachment_storage_path: string | null;
  attachment_content_type: string | null;
  status: "sent" | "failed";
  error: string | null;
  created_at: string;
};

export default function SentEmailsList({
  refreshKey,
  onCompose,
}: {
  refreshKey: number;
  onCompose: (initial: ComposeInitial) => void;
}) {
  const [emails, setEmails] = useState<SentEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch("/api/admin/reply")
      .then((res) => res.json())
      .then((json) => {
        if (mounted) setEmails(json.emails ?? []);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [refreshKey]);

  const fmt = (iso: string) =>
    new Date(iso).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" });

  const openAttachment = async (path: string) => {
    const res = await fetch(`/api/admin/reply/attachment-url?path=${encodeURIComponent(path)}`);
    const json = await res.json();
    if (json.url) window.open(json.url, "_blank");
  };

  const quote = (e: SentEmail) =>
    e.message
      .split("\n")
      .map((l) => `> ${l}`)
      .join("\n");

  const reply = (e: SentEmail) =>
    onCompose({
      to: e.to_email,
      subject: e.subject.startsWith("Re: ") ? e.subject : `Re: ${e.subject}`,
      message: `\n\n---\nLe ${fmt(e.created_at)}, à ${e.to_email} :\n${quote(e)}`,
    });

  const forward = (e: SentEmail) =>
    onCompose({
      to: "",
      subject: e.subject.startsWith("Fwd: ") ? e.subject : `Fwd: ${e.subject}`,
      message: `\n\n--- Message transféré ---\nÀ : ${e.to_email}\nLe ${fmt(e.created_at)} :\n${quote(e)}`,
      sourceAttachmentPath: e.attachment_storage_path ?? undefined,
      sourceAttachmentFilename: e.attachment_filename ?? undefined,
    });

  return (
    <div className="mt-10">
      <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wide mb-3">
        Emails envoyés
      </h2>

      {loading ? (
        <p className="text-sm text-white/40">Chargement...</p>
      ) : emails.length === 0 ? (
        <p className="text-sm text-white/40">Aucun email envoyé pour l&apos;instant.</p>
      ) : (
        <div className="border border-white/10 rounded-lg divide-y divide-white/10 overflow-hidden">
          {emails.map((e) => {
            const expanded = expandedId === e.id;
            return (
              <div key={e.id} className="px-4 py-3 text-sm">
                <button
                  type="button"
                  onClick={() => setExpandedId(expanded ? null : e.id)}
                  className="w-full flex items-start gap-3 text-left"
                >
                  {e.status === "sent" ? (
                    <CheckCircle2 size={16} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                  ) : (
                    <XCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-white/90 font-medium truncate">{e.subject}</span>
                      <span className="text-white/30 text-xs flex-shrink-0">{fmt(e.created_at)}</span>
                    </div>
                    <div className="text-white/50 text-xs mt-0.5 flex items-center gap-2">
                      <span>à {e.to_email}</span>
                      {e.attachment_filename && (
                        <span className="flex items-center gap-1">
                          <Paperclip size={11} /> {e.attachment_filename}
                        </span>
                      )}
                    </div>
                    {e.status === "failed" && e.error && (
                      <div className="text-red-400 text-xs mt-1 truncate">{e.error}</div>
                    )}
                  </div>
                  {expanded ? (
                    <ChevronUp size={16} className="text-white/30 flex-shrink-0" />
                  ) : (
                    <ChevronDown size={16} className="text-white/30 flex-shrink-0" />
                  )}
                </button>

                {expanded && (
                  <div className="mt-3 ml-7 space-y-3">
                    <p className="text-white/70 whitespace-pre-wrap text-sm bg-white/5 rounded-md p-3">
                      {e.message}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => reply(e)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-cyan-600/80 hover:bg-cyan-600 text-white text-xs transition"
                      >
                        <Reply size={12} /> Répondre
                      </button>
                      <button
                        type="button"
                        onClick={() => forward(e)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-white text-xs transition"
                      >
                        <Forward size={12} /> Transférer
                      </button>
                      {e.attachment_storage_path && (
                        <button
                          type="button"
                          onClick={() => openAttachment(e.attachment_storage_path!)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-white text-xs transition"
                        >
                          <Download size={12} /> Voir la pièce jointe
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
