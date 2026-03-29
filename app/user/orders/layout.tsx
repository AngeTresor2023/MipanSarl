import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mes commandes",
  description: "Suivez l'état de vos commandes MIPAN SARL en temps réel.",
  robots: { index: false, follow: false },
};

export default function OrdersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
