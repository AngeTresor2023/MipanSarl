import Link from "next/link";
import {
  Shield, Truck, Globe, Package, Users, Clock,
  CheckCircle, MapPin, Phone, Mail, ArrowRight,
  Target, Eye, Heart, Zap,
} from "lucide-react";

export const metadata = {
  title: "À propos de nous — MIPAN SARL",
  description: "Découvrez MIPAN SARL, votre partenaire logistique de confiance à Douala, Cameroun. Notre histoire, nos valeurs et notre équipe.",
};

const TIMELINE = [
  { year: "2018", title: "Fondation", desc: "MIPAN SARL est fondée avec une vision claire : connecter le Cameroun au monde. Première implantation à Douala pour le fret et la logistique." },
  { year: "2020", title: "Ouverture Bafoussam", desc: "Extension des opérations à Bafoussam (ancien Tchamassi Night Club). Développement du réseau dans l'Ouest du Cameroun." },
  { year: "2022", title: "Expansion internationale", desc: "Lancement des corridors Canada et Belgique (Bruxelles). Service 7j/7 24h/24 pour les clients de la diaspora." },
  { year: "2024", title: "Digitalisation", desc: "Mise en place d'une plateforme de suivi en temps réel, gestion des commandes en ligne et service d'échange de devises EUR ↔ XOF." },
  { year: "2026", title: "Aujourd'hui", desc: "Présents au Cameroun (Douala & Bafoussam), au Canada et en Belgique. Plus de 500 clients actifs desservis sur 3 pays." },
];

const TEAM = [
  { initials: "HP", name: "Herman Pradel", role: "Directeur Général & Directeur des Opérations Belgique", color: "bg-blue-600/30 text-blue-300", desc: "Directeur général de MIPAN SARL. Supervise les opérations en Belgique (Bruxelles) et coordonne la stratégie internationale." },
  { initials: "TP", name: "Tchuendem Philomène", role: "Directrice des Opérations Cameroun (Douala)", color: "bg-cyan-600/30 text-cyan-300", desc: "Responsable de toutes les opérations logistiques depuis Douala. Coordinatrice du réseau camerounais." },
  { initials: "DM", name: "Djeowou Michel", role: "Directeur des Opérations Bafoussam", color: "bg-purple-600/30 text-purple-300", desc: "Dirige le bureau de Bafoussam (ancien Tchamassi Night Club). Expert en logistique régionale Ouest-Cameroun." },
  { initials: "AK", name: "Anita Kelly", role: "Directrice Service Client", color: "bg-emerald-600/30 text-emerald-300", desc: "Garantit l'excellence de la relation client. Point de contact privilégié pour la diaspora canadienne et belge." },
  { initials: "AT", name: "Ange Trésor", role: "Directeur Technique", color: "bg-amber-600/30 text-amber-300", desc: "Responsable de l'infrastructure digitale, de la plateforme en ligne et des systèmes de suivi des envois." },
];

const SERVICES_DETAIL = [
  { icon: <Shield size={20} />, title: "Customs Brokerage", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20",
    points: ["Classification tarifaire précise", "Gestion complète des documents douaniers", "Conformité réglementaire garantie", "Interlocuteur dédié auprès des douanes"] },
  { icon: <Package size={20} />, title: "Messagerie Express", color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20",
    points: ["Collecte porte-à-porte", "Suivi GPS en temps réel", "Livraison sous 24 h (local)", "Preuve de livraison digitale"] },
  { icon: <Truck size={20} />, title: "Fret LTL", color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20",
    points: ["Consolidation des cargaisons", "Tarif au volume réel", "Réseau Cameroun · Canada · Belgique", "Assurance marchandise incluse"] },
  { icon: <Globe size={20} />, title: "Import / Export", color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20",
    points: ["Sourcing de produits internationaux", "Négociation avec fournisseurs", "Gestion de la chaîne d'approvisionnement", "Accompagnement administratif complet"] },
];

const VALUES = [
  { icon: <Target size={20} />, title: "Notre mission", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20",
    desc: "Connecter les entreprises africaines au marché mondial en offrant des solutions logistiques fiables, rapides et accessibles qui stimulent la croissance économique du continent." },
  { icon: <Eye size={20} />, title: "Notre vision", color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20",
    desc: "Devenir le leader incontournable de la logistique en Afrique centrale, reconnu pour notre excellence opérationnelle, notre intégrité et notre impact positif sur les échanges commerciaux." },
  { icon: <Heart size={20} />, title: "Nos valeurs", color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20",
    desc: "Fiabilité, transparence, rapidité et respect du client. Chaque engagement est tenu, chaque livraison est une promesse que nous honorons avec professionnalisme et passion." },
  { icon: <Zap size={20} />, title: "Notre approche", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20",
    desc: "Nous combinons expertise locale et standards internationaux pour créer des solutions sur mesure. Chaque client bénéficie d'un accompagnement personnalisé de bout en bout." },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen text-white">

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative py-24 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-950/30 to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />
        <div className="relative max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-600/15 border border-blue-500/25 text-blue-300 text-xs font-medium mb-6">
            <MapPin size={12} /> Douala · Bafoussam · Bruxelles — Fondée en 2018
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-5 leading-tight">
            À propos de
            <span className="block bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              MIPAN SARL
            </span>
          </h1>
          <p className="text-white/60 text-lg leading-relaxed">
            Depuis 2018, nous accompagnons les entreprises et particuliers dans leurs opérations logistiques au Cameroun, au Canada et en Belgique, avec rigueur, expertise et engagement.
          </p>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────────── */}
      <section className="py-10 border-y border-white/6 bg-white/2">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: "7+", label: "Années d'expérience" },
            { value: "500+", label: "Clients actifs" },
            { value: "3", label: "Pays desservis" },
            { value: "10 000+", label: "Expéditions réussies" },
          ].map(({ value, label }) => (
            <div key={label}>
              <div className="text-3xl font-extrabold text-white">{value}</div>
              <div className="text-white/45 text-sm mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Mission / Vision / Valeurs ───────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-blue-400 text-xs font-semibold uppercase tracking-widest mb-2">Ce qui nous guide</p>
            <h2 className="text-3xl font-bold">Mission, Vision & Valeurs</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {VALUES.map(({ icon, title, color, bg, border, desc }) => (
              <div key={title} className={`p-6 rounded-2xl border ${bg} ${border}`}>
                <div className={`flex items-center gap-3 mb-3 ${color}`}>
                  {icon}
                  <h3 className="font-bold text-white">{title}</h3>
                </div>
                <p className="text-white/60 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Notre histoire ───────────────────────────────────────── */}
      <section className="py-20 px-6 border-t border-white/6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-blue-400 text-xs font-semibold uppercase tracking-widest mb-2">Notre parcours</p>
            <h2 className="text-3xl font-bold">Notre histoire</h2>
          </div>
          <div className="relative">
            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-blue-500/40 via-white/10 to-transparent" />
            <div className="space-y-10">
              {TIMELINE.map(({ year, title, desc }, i) => (
                <div key={year} className={`relative flex gap-6 md:gap-0 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}>
                  {/* Dot */}
                  <div className="absolute left-6 md:left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-blue-500 border-2 border-blue-300 mt-1.5 z-10" />

                  {/* Contenu */}
                  <div className={`ml-14 md:ml-0 md:w-[45%] ${i % 2 === 0 ? "md:pr-12" : "md:pl-12"}`}>
                    <div className="bg-white/4 border border-white/8 rounded-2xl p-5 hover:border-blue-500/30 transition">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-600/20 text-blue-300 text-xs font-bold">{year}</span>
                        <h3 className="font-semibold">{title}</h3>
                      </div>
                      <p className="text-white/55 text-sm leading-relaxed">{desc}</p>
                    </div>
                  </div>
                  <div className="hidden md:block md:w-[10%]" />
                  <div className="hidden md:block md:w-[45%]" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Services détaillés ───────────────────────────────────── */}
      <section className="py-20 px-6 border-t border-white/6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-blue-400 text-xs font-semibold uppercase tracking-widest mb-2">Ce que nous offrons</p>
            <h2 className="text-3xl font-bold">Nos expertises</h2>
            <p className="text-white/50 mt-3 text-sm max-w-lg mx-auto">
              Chaque service est conçu pour répondre aux exigences du commerce africain moderne.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {SERVICES_DETAIL.map(({ icon, title, color, bg, border, points }) => (
              <div key={title} className={`p-6 rounded-2xl border ${bg} ${border}`}>
                <div className={`flex items-center gap-3 mb-4 ${color}`}>
                  {icon}
                  <h3 className="font-bold text-white text-lg">{title}</h3>
                </div>
                <ul className="space-y-2">
                  {points.map((p) => (
                    <li key={p} className="flex items-center gap-2.5 text-sm text-white/65">
                      <CheckCircle size={14} className={color} />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Équipe ───────────────────────────────────────────────── */}
      <section className="py-20 px-6 border-t border-white/6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-blue-400 text-xs font-semibold uppercase tracking-widest mb-2">Les personnes</p>
            <h2 className="text-3xl font-bold">Notre équipe</h2>
            <p className="text-white/50 mt-3 text-sm">Des professionnels passionnés au service de votre logistique.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {TEAM.map(({ initials, name, role, color, desc }) => (
              <div key={name} className="bg-white/4 border border-white/8 rounded-2xl p-5 text-center hover:border-blue-500/30 transition group">
                <div className={`w-14 h-14 rounded-full ${color} flex items-center justify-center text-xl font-bold mx-auto mb-3 group-hover:scale-105 transition-transform`}>
                  {initials}
                </div>
                <h3 className="font-semibold text-white">{name}</h3>
                <p className="text-blue-400 text-xs mt-0.5 mb-3">{role}</p>
                <p className="text-white/50 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Certifications & Partenaires ─────────────────────────── */}
      <section className="py-16 px-6 border-t border-white/6 bg-white/2">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold">Certifications & Engagements</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: <Shield size={20} className="text-blue-400" />, title: "Commissionnaire en douane agréé", desc: "Agrément officiel délivré par l'Administration des Douanes du Cameroun." },
              { icon: <CheckCircle size={20} className="text-emerald-400" />, title: "Membre de la GICAM", desc: "Groupement Interpatronal du Cameroun — réseau d'entreprises de confiance." },
              { icon: <Users size={20} className="text-purple-400" />, title: "Partenaire IATA", desc: "Association Internationale du Transport Aérien — standards de qualité internationaux." },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="bg-white/4 border border-white/8 rounded-xl p-5 flex gap-3">
                <div className="mt-0.5 flex-shrink-0">{icon}</div>
                <div>
                  <p className="font-medium text-sm">{title}</p>
                  <p className="text-white/45 text-xs mt-1 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact / CTA ────────────────────────────────────────── */}
      <section className="py-20 px-6 border-t border-white/6">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-4">Travaillons ensemble</h2>
            <p className="text-white/55 mb-6 leading-relaxed">
              Vous avez un projet logistique ? Contactez-nous pour un devis gratuit et personnalisé. Notre équipe répond sous 24 heures.
            </p>
            <div className="space-y-3">
              {[
                { icon: <MapPin size={15} />, text: "Douala, Cameroun (Ange Raphael)" },
                { icon: <MapPin size={15} />, text: "Bafoussam, Cameroun (ancien Tchamassi Night Club)" },
                { icon: <MapPin size={15} />, text: "Bruxelles, Belgique — 7j/7 · 24h/24" },
                { icon: <Phone size={15} />, text: "+237 600 000 000" },
                { icon: <Mail size={15} />, text: "contact@mipansarl.com" },
                { icon: <Clock size={15} />, text: "Cameroun : Lun – Sam · 8h – 18h" },
              ].map(({ icon, text }) => (
                <div key={text} className="flex items-center gap-3 text-sm text-white/60">
                  <span className="text-blue-400">{icon}</span> {text}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-900/30 to-cyan-900/20 border border-white/10 rounded-2xl p-8 text-center">
            <h3 className="text-xl font-bold mb-2">Prêt à commencer ?</h3>
            <p className="text-white/55 text-sm mb-6">Obtenez un devis gratuit en moins de 24 heures.</p>
            <div className="flex flex-col gap-3">
              <Link href="/user/quote" className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold transition">
                Demander un devis <ArrowRight size={15} />
              </Link>
              <Link href="/user/contact" className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-white/15 hover:bg-white/6 text-white/70 hover:text-white transition text-sm">
                Nous contacter
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
