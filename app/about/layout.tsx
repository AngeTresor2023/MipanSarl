import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "À propos",
  description:
    "Découvrez MIPAN SARL, spécialiste du transport et de la logistique internationale basé à Douala, Cameroun. Notre mission, notre équipe et nos valeurs.",
  openGraph: {
    title: "À propos de MIPAN SARL",
    description:
      "Qui sommes-nous ? MIPAN SARL, votre partenaire de confiance pour l'expédition et la logistique depuis le Cameroun.",
  },
  alternates: { canonical: "/about" },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
