"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import ServiceCard from "@/components/user/ServiceCard";
import Input from "@/components/ui/input";
import Button from "@/components/ui/Button";

export default function ServicesPage() {
  type Service = { id: string; title?: string | null; name?: string | null; description?: string | null; price?: number | null; category?: string | null; available?: boolean | null; };
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);

  // debounce pour la recherche
  const debounceRef = useRef<number | null>(null);

  // fetch avec gestion d'annulation
  const fetchServices = async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/services", { signal });
      const json = await res.json();

      if (!res.ok || json.error) {
        console.error("Services error:", json.error);
        setServices([]);
        setError("Impossible de charger les services.");
      } else {
        setServices(json.services ?? []);
      }
    } catch (e) {
      if ((e as { name?: string }).name === "AbortError") {
        // fetch annulé — ne rien faire
      } else {
        console.error("Fetch services failed:", e);
        setError("Erreur réseau. Réessayez.");
        setServices([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchServices(controller.signal);
    return () => controller.abort();
  }, []);

  // recherche côté client (rapide) + filtre disponibilité
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return services.filter((s) => {
      if (showOnlyAvailable && !s.available) return false;
      if (!term) return true;
      const hay = `${s.title ?? ""} ${s.description ?? ""} ${s.category ?? ""}`.toLowerCase();
      return hay.includes(term);
    });
  }, [services, q, showOnlyAvailable]);

  // handler recherche avec debounce
  const onSearchChange = (value: string) => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      setQ(value);
    }, 250);
  };

  // retry
  const handleRetry = () => {
    const controller = new AbortController();
    fetchServices(controller.signal);
  };

  return (
    <div className="p-6 min-h-screen text-white bg-[#080d18]">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold">Nos services</h1>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <Input
              placeholder="Rechercher un service..."
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value)}
              className="flex-1 bg-white/5 text-white placeholder-white/40 border border-white/6 focus:border-cyan-400 transition"
              aria-label="Rechercher un service"
            />

            <button
              onClick={() => setShowOnlyAvailable((s) => !s)}
              className={`px-3 py-2 rounded-md text-sm transition ${showOnlyAvailable ? "bg-cyan-600 text-black" : "bg-white/5 text-white"}`}
              aria-pressed={showOnlyAvailable}
              title="Filtrer les services disponibles"
            >
              {showOnlyAvailable ? "Disponibles" : "Tous"}
            </button>

            <Button onClick={handleRetry} variant="outline" className="hidden sm:inline-flex">
              Actualiser
            </Button>
          </div>
        </div>

        {/* état d'erreur */}
        {error ? (
          <div className="bg-red-900/30 border border-red-700/40 p-4 rounded-md mb-6">
            <div className="flex items-center justify-between gap-4">
              <div className="text-red-200">{error}</div>
              <div className="flex gap-2">
                <Button onClick={handleRetry} className="bg-red-600 hover:bg-red-500">Réessayer</Button>
                <Button variant="outline" onClick={() => { setError(null); handleRetry(); }}>Ignorer</Button>
              </div>
            </div>
          </div>
        ) : null}

        {/* loading skeleton */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-white/3 rounded-lg p-4">
                <div className="w-full h-40 bg-white/6 rounded-md mb-4" />
                <div className="h-4 bg-white/6 rounded w-3/4 mb-2" />
                <div className="h-3 bg-white/6 rounded w-1/2 mb-4" />
                <div className="flex items-center justify-between">
                  <div className="h-8 w-24 bg-white/6 rounded" />
                  <div className="h-8 w-20 bg-white/6 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white/5 border border-white/6 p-8 rounded-lg text-center text-white/70">
            <h2 className="text-lg font-semibold mb-2">Aucun service trouvé</h2>
            <p className="mb-4">Essayez une autre recherche ou désactivez le filtre.</p>
            <div className="flex justify-center gap-3">
              <Button onClick={() => { setQ(""); setShowOnlyAvailable(false); }} className="bg-cyan-600 hover:bg-cyan-500">Voir tous</Button>
              <Button variant="outline" onClick={() => handleRetry()}>Réessayer</Button>
            </div>
          </div>
        ) : (
          <div
            className="
              grid
              grid-cols-1
              sm:grid-cols-2
              md:grid-cols-3
              xl:grid-cols-4
              gap-6
            "
          >
            {filtered.map((s) => (
              <ServiceCard key={s.id} service={s} />
            ))}
          </div>
        )}

        {/* footer small info */}
        <div className="mt-8 text-sm text-white/60">
          <span className="font-medium">Astuce :</span> utilise la recherche pour filtrer rapidement, et active <span className="font-semibold">Disponibles</span> pour ne voir que les services prêts à la réservation.
        </div>
      </div>
    </div>
  );
}
