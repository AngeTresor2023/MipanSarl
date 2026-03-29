import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Exchange de devises",
  description:
    "Échangez vos devises en toute sécurité avec MIPAN SARL. Service d'échange FCFA, EUR, USD avec taux compétitifs et paiement par Orange Money, MTN Money ou virement.",
  keywords: [
    "exchange FCFA EUR",
    "change devises Cameroun",
    "Orange Money Cameroun",
    "MTN Money Douala",
    "transfert argent Cameroun",
  ],
  openGraph: {
    title: "Exchange de devises — MIPAN SARL",
    description: "Échange de devises sécurisé avec taux compétitifs depuis Douala.",
  },
  alternates: { canonical: "/user/exchange" },
};

export default function ExchangeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
