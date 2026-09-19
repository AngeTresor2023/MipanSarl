"use client";

import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useState } from "react";
import { AuthSplitLayout } from "@/components/auth-split-layout";
import {
  authDict,
  translateAuthError,
  useAuthLang,
} from "@/lib/auth-i18n";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lang, setLang] = useAuthLang();
  const t = authDict[lang].login;
  const panel = authDict[lang].panel;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      // Navigation complète pour que le middleware pose le cookie mipan_role avant le rendu du layout
      window.location.href = "/";
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : authDict[lang].genericError;
      setError(translateAuthError(msg, lang));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthSplitLayout
      headline={panel.login.headline}
      subtext={panel.login.subtext}
      badge={panel.badge}
      lang={lang}
      setLang={setLang}
    >
      <div className={className} {...props}>
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-white">
            {t.title}
          </h1>
          <p className="mt-2 text-sm text-white/60">{t.description}</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white/80">
              {t.email}
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 border-white/10 bg-white/[0.03] text-white placeholder:text-white/30 focus-visible:border-cyan-400/60 focus-visible:ring-cyan-400/20"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-white/80">
                {t.password}
              </Label>
              <Link
                href="/auth/forgot-password"
                className="text-xs text-cyan-300/90 underline-offset-4 hover:text-cyan-200 hover:underline"
              >
                {t.forgot}
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 border-white/10 bg-white/[0.03] text-white placeholder:text-white/30 focus-visible:border-cyan-400/60 focus-visible:ring-cyan-400/20"
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
            {t.noAccount}{" "}
            <Link
              href="/auth/sign-up"
              className="font-medium text-cyan-300 underline-offset-4 hover:text-cyan-200 hover:underline"
            >
              {t.signUp}
            </Link>
          </p>
        </form>
      </div>
    </AuthSplitLayout>
  );
}