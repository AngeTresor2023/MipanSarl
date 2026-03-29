import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  let next = searchParams.get('next') ?? '/'
  if (!next.startsWith('/')) next = '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Récupérer les données OAuth (Google, etc.) et pré-remplir le profil
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const meta = user.user_metadata ?? {}

          // Google fournit: given_name, family_name, full_name, name, email, phone
          const fullName: string = meta.full_name ?? meta.name ?? ""
          const nameParts = fullName.split(" ").filter(Boolean)

          const firstName: string =
            meta.given_name ?? meta.first_name ?? nameParts[0] ?? ""
          const lastName: string =
            meta.family_name ?? meta.last_name ?? nameParts.slice(1).join(" ") ?? ""

          // Upsert sans écraser les données déjà saisies manuellement
          const { data: existing } = await supabase
            .from("profiles")
            .select("first_name, last_name, phone, role")
            .eq("id", user.id)
            .maybeSingle()

          await supabase.from("profiles").upsert(
            {
              id: user.id,
              // Ne pas écraser si l'utilisateur a déjà renseigné ses infos
              first_name: existing?.first_name || firstName || null,
              last_name:  existing?.last_name  || lastName  || null,
              phone:      existing?.phone      || (meta.phone ?? null),
              role:       existing?.role       || "user",
            },
            { onConflict: "id" }
          )
        }
      } catch (e) {
        console.warn("Profile upsert after OAuth failed", e)
      }

      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
