import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nos services",
  description:
    "Découvrez tous les services MIPAN SARL : transport de colis, barils, véhicules, marchandises volumineuses, fret aérien et maritime depuis Douala.",
  keywords: [
    "services transport Cameroun",
    "expédition baril",
    "transport voiture Douala",
    "fret maritime Cameroun",
    "fret aérien Douala",
  ],
  openGraph: {
    title: "Services MIPAN SARL — Transport & Logistique",
    description:
      "Transport de colis, barils, véhicules. Fret aérien et maritime depuis Douala, Cameroun.",
  },
  alternates: { canonical: "/user/services" },
};

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
