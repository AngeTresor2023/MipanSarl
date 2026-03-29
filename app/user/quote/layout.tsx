import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Demander un devis",
  description:
    "Obtenez un devis personnalisé pour votre expédition avec MIPAN SARL. Renseignez les dimensions et le poids de votre colis, nous vous répondons rapidement.",
  openGraph: {
    title: "Demander un devis — MIPAN SARL",
    description: "Devis gratuit et rapide pour votre transport international.",
  },
  alternates: { canonical: "/user/quote" },
};

export default function QuoteLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
