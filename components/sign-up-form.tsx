"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authDict, LangToggle, translateAuthError, useAuthLang } from "@/lib/auth-i18n";

export function SignUpForm({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [lang, setLang] = useAuthLang();
  const t = authDict[lang].signUp;

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    if (password !== repeatPassword) {
      setError(t.passwordMismatch);
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/protected`,
          data: {
            first_name: firstName,
            last_name: lastName,
            address,
            phone,
          },
        },
      });

      if (error) throw error;

      // Le profil (first_name/last_name/phone/address) est enregistré côté
      // serveur dans app/auth/confirm/route.ts une fois l'email confirmé —
      // avant confirmation, aucune session active n'existe pour écrire en base.

      router.push("/auth/sign-up-success");
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : authDict[lang].genericError;
      setError(translateAuthError(msg, lang));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <LangToggle lang={lang} setLang={setLang} />
          <CardTitle className="text-2xl font-semibold">{t.title}</CardTitle>
          <CardDescription>{t.subtitle}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSignUp} className="space-y-6">

            {/* Name Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">{t.firstName}</Label>
                <Input
                  id="firstName"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="lastName">{t.lastName}</Label>
                <Input
                  id="lastName"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>

            {/* Contact Section */}
            <div className="grid gap-4">
              <div>
                <Label htmlFor="phone">{t.phone}</Label>
                <Input
                  id="phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="address">{t.address}</Label>
                <Input
                  id="address"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </div>

            {/* Email */}
            <div className="grid gap-2">
              <Label htmlFor="email">{t.email}</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Passwords */}
            <div className="grid gap-2">
              <Label htmlFor="password">{t.password}</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="repeat-password">{t.confirmPassword}</Label>
              <Input
                id="repeat-password"
                type="password"
                required
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
              />
            </div>

            {error && <p className="text-sm text-red-500 font-medium">{error}</p>}

            <Button type="submit" className="w-full py-5 text-base" disabled={isLoading}>
              {isLoading ? t.submitting : t.submit}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              {t.haveAccount}{" "}
              <Link href="/auth/login" className="underline font-medium">
                {t.login}
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
