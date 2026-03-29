import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Suspense } from "react";
import Link from "next/link";

async function ErrorContent({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  return (
    <p className="text-sm text-white/70">
      {params?.error ? `Code d'erreur : ${params.error}` : "Une erreur inconnue est survenue."}
    </p>
  );
}

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle>Une erreur est survenue</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<p className="text-sm text-white/50">Chargement...</p>}>
              <ErrorContent searchParams={searchParams} />
            </Suspense>
            <div className="mt-4">
              <Link href="/auth/login" className="text-cyan-400 hover:text-cyan-300 text-sm underline">
                Retour à la connexion
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
