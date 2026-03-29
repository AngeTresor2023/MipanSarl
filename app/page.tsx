"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  Package, Truck, Globe, Shield, ChevronRight,
  ArrowRight, CheckCircle, Star, Users, Clock, MapPin,
} from "lucide-react";

/* ── Compteur animé ──────────────────────────────────────────────── */
function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      let start = 0;
      const step = target / 60;
      const timer = setInterval(() => {
        start = Math.min(start + step, target);
        setCount(Math.floor(start));
        if (start >= target) clearInterval(timer);
      }, 16);
    }, { threshold: 0.4 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target]);
  return <span ref={ref}>{count.toLocaleString("fr-FR")}{suffix}</span>;
}

/* ── Carte service ───────────────────────────────────────────────── */
const SERVICES = [
  { icon: <Shield size={22} />, label: "Customs Brokerage", desc: "Dédouanement complet import/export. Documents, classification tarifaire et conformité réglementaire.", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  { icon: <Package size={22} />, label: "Messagerie", desc: "Livraison porte-à-porte rapide et fiable. Suivi en temps réel pour colis et documents urgents.", color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
  { icon: <Truck size={22} />, label: "Fret LTL", desc: "Transport en groupage économique. Petits volumes consolidés livrés partout en Afrique.", color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20" },
  { icon: <Globe size={22} />, label: "Livraison Express", desc: "Livraison 24 h sur les commandes locales pour vos besoins les plus urgents.", color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  { icon: <Shield size={22} />, label: "Assurance Marchandise", desc: "Couverture complète pendant le transport. Votre cargo protégé de l'origine à la destination.", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  { icon: <Package size={22} />, label: "Installation sur site", desc: "Intervention et installation par technicien certifié directement chez vous.", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
];

const VALUES = [
  { icon: <CheckCircle size={16} />, label: "Fiabilité", desc: "Nos engagements sont tenus, toujours." },
  { icon: <Clock size={16} />, label: "Rapidité", desc: "Des délais respectés à chaque expédition." },
  { icon: <Shield size={16} />, label: "Sécurité", desc: "Vos marchandises entre les meilleures mains." },
  { icon: <Globe size={16} />, label: "Portée globale", desc: "Partenaires partout en Afrique et au-delà." },
];

export default function HomePage() {
  const [activeService, setActiveService] = useState(0);

  return (
    <div className="text-white">

      {/* ════════════════════════════════ HERO ═══════════════════════════════ */}
      <section className="relative min-h-screen flex items-center">
        <div className="absolute inset-0 -z-10">
          <Image src="/assets/hero.jpg" alt="Hero" priority fill className="object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-[#080d18]" />
        </div>

        <div className="container mx-auto px-6 py-24 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-600/20 border border-blue-500/30 text-blue-300 text-xs font-medium mb-6">
            <MapPin size={12} /> Douala, Cameroun — Logistique & Commerce
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold leading-tight max-w-4xl mx-auto">
            Votre partenaire
            <span className="block bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              logistique de confiance
            </span>
          </h1>

          <p className="mt-6 text-white/65 text-lg max-w-2xl mx-auto leading-relaxed">
            MIPAN SARL connecte les entreprises africaines au marché mondial — fret, dédouanement, messagerie et bien plus encore.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/user/products" className="flex items-center gap-2 px-7 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold text-white transition shadow-lg shadow-blue-600/20">
              Voir la boutique <ArrowRight size={16} />
            </Link>
            <Link href="/user/quote" className="flex items-center gap-2 px-7 py-3 rounded-xl border border-white/20 hover:bg-white/8 font-medium text-white/80 hover:text-white transition">
              Demander un devis
            </Link>
            <Link href="/about" className="flex items-center gap-2 px-7 py-3 rounded-xl border border-white/10 hover:bg-white/5 text-white/60 hover:text-white/80 transition text-sm">
              À propos de nous <ChevronRight size={14} />
            </Link>
          </div>
        </div>

        {/* scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/30 animate-bounce">
          <div className="w-px h-8 bg-gradient-to-b from-transparent to-white/30" />
        </div>
      </section>

      {/* ════════════════════════════════ STATS ══════════════════════════════ */}
      <section className="py-16 border-y border-white/6 bg-white/2">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { target: 500, suffix: "+", label: "Clients satisfaits" },
            { target: 12,  suffix: " ans", label: "D'expérience" },
            { target: 15,  suffix: "+", label: "Pays desservis" },
            { target: 98,  suffix: "%", label: "Taux de satisfaction" },
          ].map(({ target, suffix, label }) => (
            <div key={label}>
              <div className="text-3xl md:text-4xl font-extrabold text-white">
                <Counter target={target} suffix={suffix} />
              </div>
              <div className="text-white/45 text-sm mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════ SERVICES ═══════════════════════════ */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-blue-400 text-xs font-semibold uppercase tracking-widest mb-2">Ce que nous faisons</p>
            <h2 className="text-3xl md:text-4xl font-bold">Nos services</h2>
            <p className="text-white/50 mt-3 max-w-xl mx-auto text-sm">
              Des solutions logistiques complètes adaptées aux besoins des entreprises et particuliers en Afrique.
            </p>
          </div>

          {/* Grille interactive */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SERVICES.map((s, i) => (
              <div
                key={s.label}
                onMouseEnter={() => setActiveService(i)}
                className={`group relative p-5 rounded-2xl border cursor-pointer transition-all duration-200 ${
                  activeService === i
                    ? `${s.bg} ${s.border} shadow-lg`
                    : "bg-white/3 border-white/8 hover:bg-white/5"
                }`}
              >
                <div className={`w-10 h-10 rounded-xl ${s.bg} ${s.border} border flex items-center justify-center mb-4 ${s.color} transition-transform group-hover:scale-110`}>
                  {s.icon}
                </div>
                <h3 className="font-semibold text-white mb-1.5">{s.label}</h3>
                <p className="text-white/55 text-sm leading-relaxed">{s.desc}</p>
                <div className={`absolute bottom-4 right-4 transition-opacity ${activeService === i ? "opacity-100" : "opacity-0"}`}>
                  <Link href="/user/services" className={`${s.color} text-xs flex items-center gap-1 hover:underline`}>
                    En savoir plus <ChevronRight size={12} />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link href="/user/services" className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white border border-white/10 hover:border-white/20 px-5 py-2.5 rounded-xl transition">
              Voir tous nos services <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════ À PROPOS (bref) ════════════════════ */}
      <section className="py-20 px-6 border-t border-white/6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-blue-400 text-xs font-semibold uppercase tracking-widest mb-3">Qui sommes-nous</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-5 leading-tight">
              Plus de 12 ans au service <br />
              <span className="text-white/60">du commerce africain</span>
            </h2>
            <p className="text-white/60 leading-relaxed mb-4">
              MIPAN SARL est une société spécialisée dans la logistique, le fret international et les services aux entreprises basée à Douala, Cameroun.
            </p>
            <p className="text-white/60 leading-relaxed mb-6">
              Nous accompagnons les entreprises dans leurs opérations d'import/export, en offrant des solutions rapides, fiables et économiques adaptées au marché africain.
            </p>

            <div className="grid grid-cols-2 gap-3 mb-8">
              {VALUES.map(({ icon, label, desc }) => (
                <div key={label} className="flex items-start gap-2.5 p-3 rounded-xl bg-white/4 border border-white/8">
                  <span className="text-blue-400 mt-0.5">{icon}</span>
                  <div>
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-xs text-white/45 mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <Link href="/about" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/6 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white text-sm font-medium transition">
              En savoir plus sur nous <ArrowRight size={15} />
            </Link>
          </div>

          {/* Témoignages / étoiles */}
          <div className="space-y-4">
            <div className="bg-white/4 border border-white/8 rounded-2xl p-6">
              <div className="flex gap-1 mb-3">
                {[1,2,3,4,5].map(i => <Star key={i} size={14} className="text-amber-400 fill-amber-400" />)}
              </div>
              <p className="text-white/75 text-sm leading-relaxed italic">
                "MIPAN SARL a transformé notre chaîne d'approvisionnement. Dédouanement rapide, équipe réactive — exactement ce dont nous avions besoin pour notre activité import."
              </p>
              <div className="flex items-center gap-2 mt-4">
                <div className="w-8 h-8 rounded-full bg-blue-600/30 flex items-center justify-center text-xs font-bold text-blue-300">JM</div>
                <div>
                  <p className="text-sm font-medium">Jean-Marc Ateba</p>
                  <p className="text-xs text-white/40">Directeur, Ateba Trading Co.</p>
                </div>
              </div>
            </div>

            <div className="bg-white/4 border border-white/8 rounded-2xl p-6">
              <div className="flex gap-1 mb-3">
                {[1,2,3,4,5].map(i => <Star key={i} size={14} className="text-amber-400 fill-amber-400" />)}
              </div>
              <p className="text-white/75 text-sm leading-relaxed italic">
                "Service de messagerie impeccable. Nos colis arrivent toujours dans les délais, avec suivi en temps réel. Je recommande sans hésitation."
              </p>
              <div className="flex items-center gap-2 mt-4">
                <div className="w-8 h-8 rounded-full bg-cyan-600/30 flex items-center justify-center text-xs font-bold text-cyan-300">SA</div>
                <div>
                  <p className="text-sm font-medium">Sophie Ambassa</p>
                  <p className="text-xs text-white/40">Gérante, Boutique Elegance</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-600/10 border border-blue-500/20 rounded-xl p-4 text-center">
                <Users size={20} className="text-blue-400 mx-auto mb-2" />
                <div className="text-2xl font-bold">500+</div>
                <div className="text-xs text-white/45 mt-0.5">Entreprises clientes</div>
              </div>
              <div className="bg-cyan-600/10 border border-cyan-500/20 rounded-xl p-4 text-center">
                <Truck size={20} className="text-cyan-400 mx-auto mb-2" />
                <div className="text-2xl font-bold">10k+</div>
                <div className="text-xs text-white/45 mt-0.5">Expéditions réussies</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════ CTA FINAL ══════════════════════════ */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center bg-gradient-to-br from-blue-900/30 via-white/3 to-cyan-900/20 border border-white/10 rounded-3xl p-12">
          <h2 className="text-3xl font-bold mb-4">Prêt à optimiser votre logistique ?</h2>
          <p className="text-white/55 mb-8">Obtenez un devis personnalisé en moins de 24 heures. Notre équipe est disponible pour vous accompagner.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/user/quote" className="flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold transition shadow-lg shadow-blue-600/20">
              Demander un devis <ArrowRight size={16} />
            </Link>
            <Link href="/user/contact" className="flex items-center justify-center gap-2 px-7 py-3 rounded-xl border border-white/15 hover:bg-white/6 text-white/70 hover:text-white transition">
              Nous contacter
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
