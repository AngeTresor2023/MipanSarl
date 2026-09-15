"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Paperclip } from "lucide-react";

type SentEmail = {
  id: string;
  to_email: string;
  subject: string;
  attachment_filename: string | null;
  status: "sent" | "failed";
  error: string | null;
  created_at: string;
};

export default function SentEmailsList({ refreshKey }: { refreshKey: number }) {
  const [emails, setEmails] = useState<SentEmail[]>([]);
  const [loading, setLoading] = useState(true);

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
          {emails.map((e) => (
            <div key={e.id} className="flex items-start gap-3 px-4 py-3 text-sm">
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
