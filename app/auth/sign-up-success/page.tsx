import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import Link from "next/link";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle>Inscription réussie !</CardTitle>
            <CardDescription>Vérifiez votre adresse e-mail</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-white/70">
              Votre compte a bien été créé. Un email de confirmation vous a été envoyé — cliquez sur le lien pour activer votre compte.
            </p>
            <div className="mt-4">
              <Link href="/auth/login" className="text-cyan-400 hover:text-cyan-300 text-sm underline">
                Se connecter
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
