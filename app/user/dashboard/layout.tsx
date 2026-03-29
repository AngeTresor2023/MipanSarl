import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mon espace",
  description: "Votre espace personnel MIPAN SARL. Gérez vos commandes, devis et profil.",
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
