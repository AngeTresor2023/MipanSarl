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

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lang, setLang] = useAuthLang();
  const t = authDict[lang].forgot;
  const panel = authDict[lang].panel;

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      // The url which will be included in the email. This URL needs to be configured in your redirect URLs in the Supabase dashboard at https://supabase.com/dashboard/project/_/auth/url-configuration
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });
      if (error) throw error;
      setSuccess(true);
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
      headline={panel.forgot.headline}
      subtext={panel.forgot.subtext}
      badge={panel.badge}
      lang={lang}
      setLang={setLang}
    >
      <div className={className} {...props}>
        {success ? (
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-white">
              {t.successTitle}
            </h1>
            <p className="mt-2 text-sm text-cyan-300/90">{t.successSubtitle}</p>
            <p className="mt-6 text-sm leading-relaxed text-white/70">
              {t.successBody}
            </p>
            <p className="mt-8 text-sm text-white/60">
              {t.haveAccount}{" "}
              <Link
                href="/auth/login"
                className="font-medium text-cyan-300 underline-offset-4 hover:text-cyan-200 hover:underline"
              >
                {t.login}
              </Link>
            </p>
          </div>
        ) : (
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-white">
              {t.title}
            </h1>
            <p className="mt-2 text-sm text-white/60">{t.description}</p>

            <form onSubmit={handleForgotPassword} className="mt-8 space-y-5">
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
        )}
      </div>
    </AuthSplitLayout>
  );
}