"use client";

import Link from "next/link";
import Button from "@/components/ui/Button";

type Service = {
  id: string;
  title?: string | null;
  name?: string | null;  // compatibilité ancienne donnée
  description?: string | null;
  price?: number | null;
  category?: string | null;
  available?: boolean | null;
};

export default function ServiceCard({ service }: { service: Service }) {
  const label = service.title ?? service.name ?? "Service";

  return (
    <article className="bg-white/4 border border-white/8 p-4 rounded-lg flex flex-col h-full hover:border-cyan-500/30 transition">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-semibold text-white leading-tight">{label}</h3>
        {service.available === false && (
          <span className="flex-shrink-0 px-2 py-0.5 rounded text-xs bg-red-600/20 text-red-300">Indisponible</span>
        )}
      </div>

      {service.category && (
        <div className="text-xs text-cyan-400/70 mb-2">{service.category}</div>
      )}

      <p className="text-white/60 text-sm flex-1 mb-4 line-clamp-3">
        {service.description ?? "Aucune description disponible."}
      </p>

      <div className="mt-auto flex items-center justify-between gap-2">
        <div className="text-lg font-bold text-cyan-400">
          {service.price != null ? `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(Number(service.price))} FCFA` : "Sur demande"}
        </div>

        <Link href={`/user/quote?service=${encodeURIComponent(label)}`}>
          <Button variant="outline" size="sm">
            Demander
          </Button>
        </Link>
      </div>
    </article>
  );
}
