"use client";

import { useEffect, useMemo, useState } from "react";
import Input from "@/components/ui/input";
import Button from "@/components/ui/Button";
import { Mail, Phone, MapPin, Clock, Send, Star, Trash2 } from "lucide-react";

type Review = {
  id: string;
  user_id?: string | null;
  name?: string | null;
  rating: number;
  comment?: string | null;
  created_at?: string | null;
};

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(0)}
          className="text-2xl focus:outline-none transition-transform hover:scale-110"
          aria-label={`${i} étoile${i > 1 ? "s" : ""}`}
        >
          <span className={i <= (hovered || value) ? "text-amber-400" : "text-white/20"}>★</span>
        </button>
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const initials = (review.name ?? "?")[0].toUpperCase();
  const date = review.created_at
    ? new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric" }).format(new Date(review.created_at))
    : "";
  return (
    <div className="bg-black/40 border border-white/6 rounded-xl p-4 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-cyan-600/20 border border-cyan-500/20 flex items-center justify-center text-xs font-bold text-cyan-300">
            {initials}
          </div>
          <span className="font-medium text-white text-sm">{review.name ?? "Anonyme"}</span>
        </div>
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <span key={i} className={`text-sm ${i <= review.rating ? "text-amber-400" : "text-white/15"}`}>★</span>
          ))}
        </div>
      </div>
      <p className="text-white/70 text-sm leading-relaxed">{review.comment}</p>
      <p className="text-white/35 text-xs">{date}</p>
    </div>
  );
}

export default function ContactPage() {
  // Contact form
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [contactLoading, setContactLoading] = useState(false);
  const [contactMsg, setContactMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Reviews
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewMsg, setReviewMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [hasMyReview, setHasMyReview] = useState(false);

  // Charger profil pour pré-remplir
  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then(({ profile: p }) => {
        if (!p) return;
        const fullName = [p.first_name, p.last_name].filter(Boolean).join(" ");
        if (fullName) setFormName(fullName);
        if (p.email) setFormEmail(p.email);
      })
      .catch(() => {});
  }, []);

  // Charger reviews + détecter si l'user a déjà un avis
  const loadReviews = () => {
    setReviewsLoading(true);
    Promise.all([
      fetch("/api/reviews").then((r) => r.json()),
      fetch("/api/profile").then((r) => r.json()),
    ])
      .then(([revData, profData]) => {
        const list: Review[] = revData.reviews ?? [];
        setReviews(list);

        // récupérer le user_id depuis le profil pour détecter son avis
        if (profData?.profile) {
          // On lit l'id depuis un appel auth séparé n'est pas possible ici,
          // on compare le name match simple — le vrai user_id vient du cookie côté serveur
          // On marque hasMyReview via le retour du POST
        }
      })
      .catch(() => {})
      .finally(() => setReviewsLoading(false));
  };

  useEffect(() => { loadReviews(); }, []);

  const averageRating = useMemo(() => {
    if (!reviews.length) return 0;
    return Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10;
  }, [reviews]);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactMsg(null);
    if (!formName.trim() || !formEmail.trim() || !subject.trim() || !message.trim()) {
      setContactMsg({ type: "error", text: "Veuillez remplir tous les champs." });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formEmail)) {
      setContactMsg({ type: "error", text: "Adresse e-mail invalide." });
      return;
    }
    if (message.trim().length < 10) {
      setContactMsg({ type: "error", text: "Votre message est trop court (10 caractères min.)." });
      return;
    }
    setContactLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formName, email: formEmail, subject, message }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Erreur serveur");
      setContactMsg({ type: "success", text: "Message envoyé ! Nous vous répondrons sous 48 h." });
      setSubject("");
      setMessage("");
    } catch (err: unknown) {
      setContactMsg({ type: "error", text: err instanceof Error ? err.message : "Impossible d'envoyer." });
    } finally {
      setContactLoading(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewMsg(null);
    if (!comment.trim() || comment.trim().length < 5) {
      setReviewMsg({ type: "error", text: "Votre avis est trop court." });
      return;
    }
    setReviewSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formName || "Anonyme", rating, comment }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Erreur");
      setReviewMsg({ type: "success", text: json.updated ? "Avis mis à jour !" : "Avis publié, merci !" });
      setHasMyReview(true);
      loadReviews();
    } catch (err: unknown) {
      setReviewMsg({ type: "error", text: err instanceof Error ? err.message : "Erreur." });
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!confirm("Supprimer votre avis ?")) return;
    setReviewSubmitting(true);
    try {
      await fetch("/api/reviews", { method: "DELETE" });
      setHasMyReview(false);
      setComment("");
      setRating(5);
      setReviewMsg({ type: "success", text: "Avis supprimé." });
      loadReviews();
    } catch {
      setReviewMsg({ type: "error", text: "Impossible de supprimer." });
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen bg-[#080d18] text-white px-4 py-8 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-950/30 to-transparent pointer-events-none" />
      <div className="max-w-4xl mx-auto space-y-8">

        {/* En-tête */}
        <div>
          <h1 className="text-3xl font-bold">Contactez-nous</h1>
          <p className="text-white/50 text-sm mt-1">Une question, une commande ou besoin d&apos;aide ? Écrivez-nous.</p>
        </div>

        {/* Formulaire de contact */}
        <div className="bg-white/4 border border-white/8 rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Send size={16} className="text-cyan-400" /> Envoyer un message
          </h2>

          {contactMsg && (
            <div className={`flex items-center gap-2 p-3 rounded-xl text-sm border ${
              contactMsg.type === "success"
                ? "bg-green-900/20 border-green-700/30 text-green-300"
                : "bg-red-900/20 border-red-700/30 text-red-300"
            }`}>
              {contactMsg.type === "success" ? "✓" : "✕"} {contactMsg.text}
            </div>
          )}

          <form onSubmit={handleContactSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex flex-col gap-1.5">
                <span className="text-sm text-white/70">Nom complet</span>
                <Input
                  value={formName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormName(e.target.value)}
                  placeholder="Votre nom"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm text-white/70">Adresse e-mail</span>
                <Input
                  type="email"
                  value={formEmail}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormEmail(e.target.value)}
                  placeholder="adresse@exemple.com"
                />
              </label>
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm text-white/70">Sujet</span>
              <Input
                value={subject}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSubject(e.target.value)}
                placeholder="Sujet de votre message"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm text-white/70">Message</span>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition resize-none"
                placeholder="Décrivez votre demande..."
              />
            </label>

            <div className="flex items-center justify-between gap-3 pt-1">
              <span className="text-xs text-white/40 flex items-center gap-1.5">
                <Clock size={12} /> Réponse sous 48 heures
              </span>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => { setSubject(""); setMessage(""); }}>
                  Effacer
                </Button>
                <Button type="submit" isLoading={contactLoading}>
                  Envoyer
                </Button>
              </div>
            </div>
          </form>
        </div>

        {/* Avis + liste avis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Laisser un avis */}
          <div className="bg-white/4 border border-white/8 rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-semibold flex items-center gap-2">
              <Star size={16} className="text-amber-400" /> Laisser un avis
            </h2>
            <p className="text-white/50 text-sm">Votre expérience aide les autres clients.</p>

            {reviewMsg && (
              <div className={`flex items-center gap-2 p-3 rounded-xl text-sm border ${
                reviewMsg.type === "success"
                  ? "bg-green-900/20 border-green-700/30 text-green-300"
                  : "bg-red-900/20 border-red-700/30 text-red-300"
              }`}>
                {reviewMsg.type === "success" ? "✓" : "✕"} {reviewMsg.text}
              </div>
            )}

            <form onSubmit={handleReviewSubmit} className="space-y-3">
              <div>
                <span className="text-sm text-white/70 block mb-2">Note</span>
                <StarRating value={rating} onChange={setRating} />
              </div>

              <label className="flex flex-col gap-1.5">
                <span className="text-sm text-white/70">Votre avis</span>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition resize-none"
                  placeholder="Racontez brièvement votre expérience..."
                />
              </label>

              <div className="flex gap-2 pt-1">
                <Button type="submit" isLoading={reviewSubmitting} className="flex-1">
                  {hasMyReview ? "Mettre à jour" : "Publier"}
                </Button>
                {hasMyReview && (
                  <button
                    type="button"
                    onClick={handleDeleteReview}
                    disabled={reviewSubmitting}
                    className="p-2.5 rounded-lg border border-red-700/30 text-red-400 hover:bg-red-900/20 transition"
                    title="Supprimer mon avis"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Avis récents */}
          <div className="bg-white/4 border border-white/8 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">Avis récents</h2>
              {reviews.length > 0 && (
                <div className="flex items-center gap-1 text-sm">
                  <span className="text-amber-400 font-bold">{averageRating}</span>
                  <span className="text-amber-400">★</span>
                  <span className="text-white/40">({reviews.length})</span>
                </div>
              )}
            </div>

            {reviewsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : reviews.length === 0 ? (
              <div className="py-8 text-center text-white/40 text-sm">
                <Star size={32} className="mx-auto mb-2 opacity-30" />
                Aucun avis pour le moment.<br />Soyez le premier !
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {reviews.map((r) => <ReviewCard key={r.id} review={r} />)}
              </div>
            )}
          </div>
        </div>

        {/* Informations de contact */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: <Mail size={18} className="text-cyan-400" />, title: "Email", lines: ["support@mipansarl.com"] },
            { icon: <Phone size={18} className="text-cyan-400" />, title: "Téléphone", lines: ["+237 600 000 000"] },
            { icon: <MapPin size={18} className="text-cyan-400" />, title: "Adresse", lines: ["Douala, Cameroun", "Lun–Ven 8h–18h"] },
          ].map(({ icon, title, lines }) => (
            <div key={title} className="bg-white/4 border border-white/8 rounded-2xl p-4 flex items-start gap-3">
              <div className="mt-0.5">{icon}</div>
              <div>
                <p className="font-medium text-sm text-white mb-1">{title}</p>
                {lines.map((l) => <p key={l} className="text-white/50 text-sm">{l}</p>)}
              </div>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}
