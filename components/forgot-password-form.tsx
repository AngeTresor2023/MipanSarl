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
import { useState } from "react";
import { authDict, LangToggle, translateAuthError, useAuthLang } from "@/lib/auth-i18n";

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

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {success ? (
        <Card>
          <CardHeader>
            <LangToggle lang={lang} setLang={setLang} />
            <CardTitle className="text-2xl">{t.successTitle}</CardTitle>
            <CardDescription>{t.successSubtitle}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{t.successBody}</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <LangToggle lang={lang} setLang={setLang} />
            <CardTitle className="text-2xl">{t.title}</CardTitle>
            <CardDescription>{t.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleForgotPassword}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">{t.email}</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? t.submitting : t.submit}
                </Button>
              </div>
              <div className="mt-4 text-center text-sm">
                {t.haveAccount}{" "}
                <Link
                  href="/auth/login"
                  className="underline underline-offset-4"
                >
                  {t.login}
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
