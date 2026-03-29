// lib/supabase/proxy.ts
// Logique centrale du middleware : session, rôle, redirections
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const COOKIE_NAME = "mipan_role";
const COOKIE_MAX_AGE = 60 * 60 * 8; // 8 heures

const COOKIE_OPTS = {
  path: "/",
  httpOnly: false,
  sameSite: "lax" as const,
  maxAge: COOKIE_MAX_AGE,
};

export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Laisser passer les routes auth sans vérification
  if (pathname.startsWith("/auth/")) {
    return NextResponse.next({ request });
  }

  const response = NextResponse.next({ request });

  // Client Supabase avec gestion des cookies de session
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Vérifier la session utilisateur
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ── Pas de session ────────────────────────────────────────────────────────
  if (!user) {
    // Effacer le cookie de rôle
    response.cookies.delete(COOKIE_NAME);

    // Protéger /admin/* et /user/*
    if (pathname.startsWith("/admin") || pathname.startsWith("/user")) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    return response;
  }

  // ── Session active — toujours lire le rôle depuis la base ──────────────────
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const role = (profile?.role as string) ?? "user";

  const isAdmin = role === "admin";

  // ── "/" → admin → /admin, user → reste sur "/"  ──────────────────────────
  if (pathname === "/") {
    if (isAdmin) {
      const r = NextResponse.redirect(new URL("/admin", request.url));
      r.cookies.set(COOKIE_NAME, role, COOKIE_OPTS);
      return r;
    }
    // user : laisser passer sans redirection (évite la boucle infinie)
    response.cookies.set(COOKIE_NAME, role, COOKIE_OPTS);
    return response;
  }

  // ── Admin sur pages user → /admin ─────────────────────────────────────────
  if (isAdmin && pathname.startsWith("/user")) {
    const r = NextResponse.redirect(new URL("/admin", request.url));
    r.cookies.set(COOKIE_NAME, role, COOKIE_OPTS);
    return r;
  }

  // ── User sur pages admin → /user/dashboard ────────────────────────────────
  if (!isAdmin && pathname.startsWith("/admin")) {
    const r = NextResponse.redirect(new URL("/user/dashboard", request.url));
    r.cookies.set(COOKIE_NAME, role, COOKIE_OPTS);
    return r;
  }

  // ── Accès autorisé — rafraîchir le cookie de rôle ────────────────────────
  response.cookies.set(COOKIE_NAME, role, COOKIE_OPTS);
  return response;
}
