import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nous contacter",
  description:
    "Contactez MIPAN SARL pour toute question sur vos expéditions, un devis ou un suivi de commande. Disponible par WhatsApp, email ou formulaire en ligne.",
  openGraph: {
    title: "Contact — MIPAN SARL",
    description: "Écrivez-nous pour vos questions d'expédition, devis ou suivi de commande.",
  },
  alternates: { canonical: "/user/contact" },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
