import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nos tarifs",
  description:
    "Consultez les tarifs MIPAN SARL pour l'expédition de barils, véhicules, sacs 23 kg, congélateurs et autres marchandises. Prix en FCFA mis à jour régulièrement.",
  keywords: [
    "tarifs transport Cameroun",
    "prix expédition baril",
    "tarif envoi colis Douala",
    "prix transport véhicule",
  ],
  openGraph: {
    title: "Tarifs MIPAN SARL",
    description:
      "Prix pour barils, véhicules, sacs, congélateurs et plus. Devis personnalisé disponible.",
  },
  alternates: { canonical: "/user/pricing" },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
