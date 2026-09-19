"use client";

import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthSplitLayout } from "@/components/auth-split-layout";
import {
  authDict,
  translateAuthError,
  useAuthLang,
} from "@/lib/auth-i18n";

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
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
  const panel = authDict[lang].panel;

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

  const inputClass =
    "h-11 border-white/10 bg-white/[0.03] text-white placeholder:text-white/30 focus-visible:border-cyan-400/60 focus-visible:ring-cyan-400/20";

  return (
    <AuthSplitLayout
      headline={panel.signUp.headline}
      subtext={panel.signUp.subtext}
      badge={panel.badge}
      lang={lang}
      setLang={setLang}
    >
      <div className={className} {...props}>
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-white">
            {t.title}
          </h1>
          <p className="mt-2 text-sm text-white/60">{t.subtitle}</p>
        </div>

        <form onSubmit={handleSignUp} className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-white/80">
                {t.firstName}
              </Label>
              <Input
                id="firstName"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-white/80">
                {t.lastName}
              </Label>
              <Input
                id="lastName"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-white/80">
              {t.phone}
            </Label>
            <Input
              id="phone"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="text-white/80">
              {t.address}
            </Label>
            <Input
              id="address"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-white/80">
              {t.email}
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-white/80">
              {t.password}
            </Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="repeat-password" className="text-white/80">
              {t.confirmPassword}
            </Label>
            <Input
              id="repeat-password"
              type="password"
              required
              value={repeatPassword}
              onChange={(e) => setRepeatPassword(e.target.value)}
              className={inputClass}
            />
          </div>

          {error && (
            <p className="rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="h-11 w-full bg-gradient-to-r from-amber-400 to-amber-500 font-medium text-[#0a0f1c] transition hover:from-amber-300 hover:to-amber-400 disabled:opacity-60"
          >
            {isLoading ? t.submitting : t.submit}
          </Button>

          <p className="pt-2 text-left text-sm text-white/60">
            {t.haveAccount}{" "}
            <Link
              href="/auth/login"
              className="font-medium text-cyan-300 underline-offset-4 hover:text-cyan-200 hover:underline"
            >
              {t.login}
            </Link>
          </p>
        </form>
      </div>
    </AuthSplitLayout>
  );
}