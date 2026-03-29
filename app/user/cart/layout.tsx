import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mon panier",
  description: "Finalisez votre commande MIPAN SARL. Vérifiez vos articles et passez commande.",
  robots: { index: false, follow: false },
};

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
