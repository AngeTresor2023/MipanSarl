import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Boutique",
  description:
    "Parcourez notre boutique en ligne : produits disponibles à la commande avec livraison ou retrait en entrepôt. Commandez facilement en quelques clics.",
  openGraph: {
    title: "Boutique MIPAN SARL",
    description: "Commandez nos produits en ligne. Livraison ou retrait disponible.",
  },
  alternates: { canonical: "/user/products" },
};

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
