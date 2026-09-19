"use client";

// Traductions FR/EN pour les pages /auth/* (login, sign-up, forgot-password).
// Ces pages utilisaient le composant Supabase UI Library brut, jamais traduit,
// alors que le reste du site est en français — cf. audit E2E du 2026-09-19.
// Reste du site = français uniquement (pas d'i18n global) ; ces 3 pages
// gagnent un petit sélecteur FR/EN local, mémorisé en localStorage.

import { useEffect, useState } from "react";

export type AuthLang = "fr" | "en";

const STORAGE_KEY = "mipan_auth_lang";

export function useAuthLang(): [AuthLang, (lang: AuthLang) => void] {
  const [lang, setLangState] = useState<AuthLang>("fr");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "fr" || saved === "en") setLangState(saved);
    } catch {
      /* localStorage indisponible (navigation privée, etc.) — reste en fr */
    }
  }, []);

  const setLang = (next: AuthLang) => {
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  };

  return [lang, setLang];
}

export function LangToggle({
  lang,
  setLang,
}: {
  lang: AuthLang;
  setLang: (lang: AuthLang) => void;
}) {
  return (
    <div className="flex justify-end gap-1.5 text-xs mb-1">
      <button
        type="button"
        onClick={() => setLang("fr")}
        aria-current={lang === "fr"}
        className={lang === "fr" ? "font-semibold underline" : "text-muted-foreground hover:underline"}
      >
        FR
      </button>
      <span className="text-muted-foreground">/</span>
      <button
        type="button"
        onClick={() => setLang("en")}
        aria-current={lang === "en"}
        className={lang === "en" ? "font-semibold underline" : "text-muted-foreground hover:underline"}
      >
        EN
      </button>
    </div>
  );
}

export const authDict = {
  fr: {
    login: {
      title: "Connexion",
      description: "Entrez votre email pour accéder à votre compte",
      email: "Email",
      password: "Mot de passe",
      forgot: "Mot de passe oublié ?",
      submit: "Se connecter",
      submitting: "Connexion en cours...",
      noAccount: "Pas encore de compte ?",
      signUp: "S'inscrire",
    },
    signUp: {
      title: "Créer votre compte",
      subtitle: "Inscrivez-vous en quelques étapes simples",
      firstName: "Prénom",
      lastName: "Nom",
      phone: "Téléphone",
      address: "Adresse",
      email: "Email",
      password: "Mot de passe",
      confirmPassword: "Confirmer le mot de passe",
      submit: "Créer le compte",
      submitting: "Création du compte...",
      haveAccount: "Vous avez déjà un compte ?",
      login: "Connexion",
      passwordMismatch: "Les mots de passe ne correspondent pas",
    },
    forgot: {
      title: "Réinitialiser votre mot de passe",
      description: "Entrez votre email, nous vous enverrons un lien de réinitialisation",
      email: "Email",
      submit: "Envoyer le lien",
      submitting: "Envoi en cours...",
      haveAccount: "Vous avez déjà un compte ?",
      login: "Connexion",
      successTitle: "Vérifiez votre e-mail",
      successSubtitle: "Instructions de réinitialisation envoyées",
      successBody:
        "Si vous êtes inscrit avec cet email et un mot de passe, vous recevrez un email de réinitialisation.",
    },
    genericError: "Une erreur est survenue",
  },
  en: {
    login: {
      title: "Login",
      description: "Enter your email below to login to your account",
      email: "Email",
      password: "Password",
      forgot: "Forgot your password?",
      submit: "Login",
      submitting: "Logging in...",
      noAccount: "Don't have an account?",
      signUp: "Sign up",
    },
    signUp: {
      title: "Create your account",
      subtitle: "Join us in a few simple steps",
      firstName: "First Name",
      lastName: "Last Name",
      phone: "Phone Number",
      address: "Address",
      email: "Email",
      password: "Password",
      confirmPassword: "Confirm Password",
      submit: "Create account",
      submitting: "Creating your account...",
      haveAccount: "Already have an account?",
      login: "Login",
      passwordMismatch: "Passwords do not match",
    },
    forgot: {
      title: "Reset Your Password",
      description: "Type in your email and we'll send you a link to reset your password",
      email: "Email",
      submit: "Send reset email",
      submitting: "Sending...",
      haveAccount: "Already have an account?",
      login: "Login",
      successTitle: "Check Your Email",
      successSubtitle: "Password reset instructions sent",
      successBody:
        "If you registered using your email and password, you will receive a password reset email.",
    },
    genericError: "An error occurred",
  },
} as const;

// Les erreurs Supabase/GoTrue arrivent toujours en anglais, quelle que soit la
// langue choisie ici — on traduit les plus courantes, on laisse le message
// original en repli plutôt que de risquer d'en masquer une non reconnue.
const KNOWN_ERRORS: Record<string, { fr: string; en: string }> = {
  "invalid login credentials": {
    fr: "Email ou mot de passe incorrect.",
    en: "Invalid login credentials.",
  },
  "email not confirmed": {
    fr: "Cet email n'a pas encore été confirmé — vérifiez votre boîte de réception.",
    en: "This email has not been confirmed yet — check your inbox.",
  },
  "user already registered": {
    fr: "Un compte existe déjà avec cet email.",
    en: "An account already exists with this email.",
  },
  "password should be at least": {
    fr: "Le mot de passe est trop court (6 caractères minimum).",
    en: "Password is too short (minimum 6 characters).",
  },
};

export function translateAuthError(message: string, lang: AuthLang): string {
  const lower = message.toLowerCase();
  for (const [key, translations] of Object.entries(KNOWN_ERRORS)) {
    if (lower.includes(key)) return translations[lang];
  }
  return message;
}
