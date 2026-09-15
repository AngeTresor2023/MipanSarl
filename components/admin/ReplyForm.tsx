"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/input";
import { Send, Paperclip, X } from "lucide-react";

export default function ReplyForm({ onSent }: { onSent?: () => void }) {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setFeedback(null);

    try {
      const formData = new FormData();
      formData.append("to", to);
      formData.append("subject", subject);
      formData.append("message", message);
      if (file) formData.append("attachment", file);

      const res = await fetch("/api/admin/reply", { method: "POST", body: formData });
      const json = await res.json();

      if (!res.ok) {
        setFeedback({ type: "error", text: json.error ?? "Échec de l'envoi" });
        onSent?.();
        return;
      }

      setFeedback({ type: "success", text: "Message envoyé." });
      setTo("");
      setSubject("");
      setMessage("");
      setFile(null);
      onSent?.();
    } catch {
      setFeedback({ type: "error", text: "Erreur réseau lors de l'envoi." });
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
      <div>
        <label className="block text-sm text-white/60 mb-1">Destinataire</label>
        <Input
          type="email"
          required
          value={to}
          onChange={(e) => setTo(e.target.value)}
          placeholder="client@example.com"
        />
      </div>

      <div>
        <label className="block text-sm text-white/60 mb-1">Sujet</label>
        <Input
          required
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Objet du message"
        />
      </div>

      <div>
        <label className="block text-sm text-white/60 mb-1">Message</label>
        <textarea
          required
          rows={8}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          placeholder="Votre réponse au client..."
        />
      </div>

      <div>
        <label className="block text-sm text-white/60 mb-1">Pièce jointe (optionnel, 8 Mo max)</label>
        {file ? (
          <div className="flex items-center gap-2 text-sm text-white/80 bg-white/5 border border-white/10 rounded-md px-3 py-2">
            <Paperclip size={14} />
            <span className="flex-1 truncate">{file.name}</span>
            <button type="button" onClick={() => setFile(null)} className="text-white/40 hover:text-white">
              <X size={14} />
            </button>
          </div>
        ) : (
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-white/60 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:bg-white/10 file:text-white file:text-sm hover:file:bg-white/20"
          />
        )}
      </div>

      {feedback && (
        <p className={feedback.type === "success" ? "text-sm text-emerald-400" : "text-sm text-red-500"}>
          {feedback.text}
        </p>
      )}

      <Button type="submit" disabled={sending} className="flex items-center gap-2">
        <Send size={14} />
        {sending ? "Envoi..." : "Envoyer"}
      </Button>
    </form>
  );
}
