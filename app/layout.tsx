import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { cookies } from "next/headers";
import "./globals.css";
import Navbar from "@/components/ui/Navbar";

const defaultUrl = process.env.NEXT_PUBLIC_SITE_URL
  ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: {
    default: "MIPAN SARL — Transport & Logistique Internationale",
    template: "%s | MIPAN SARL",
  },
  description:
    "MIPAN SARL — Spécialiste du transport et de la logistique internationale depuis Douala, Cameroun. Expédition de colis, barils, véhicules et marchandises. Devis en ligne, boutique et services sur mesure.",
  keywords: [
    "transport international Cameroun",
    "logistique Douala",
    "expédition colis Cameroun",
    "MIPAN SARL",
    "envoi baril",
    "transport véhicule",
    "devis transport",
    "fret aérien Cameroun",
    "fret maritime Douala",
  ],
  authors: [{ name: "MIPAN SARL", url: defaultUrl }],
  creator: "MIPAN SARL",
  publisher: "MIPAN SARL",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: defaultUrl,
    siteName: "MIPAN SARL",
    title: "MIPAN SARL — Transport & Logistique Internationale",
    description:
      "Expédition de colis, barils, véhicules et marchandises depuis le Cameroun. Devis en ligne rapide.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "MIPAN SARL" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "MIPAN SARL — Transport & Logistique",
    description: "Spécialiste du transport international depuis Douala, Cameroun.",
    images: ["/og-image.png"],
  },
  alternates: { canonical: defaultUrl },
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const role = cookieStore.get("mipan_role")?.value ?? null;
  const isAdmin = role === "admin";
  const hasUser = role !== null;

  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased text-white`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar isAdmin={isAdmin} hasUser={hasUser} />
          <main className="min-h-screen">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
