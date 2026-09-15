import { createClient } from "@/lib/supabase/server";
import { type EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/";

  if (token_hash && type) {
    const supabase = await createClient();

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });
    if (!error) {
      // Créer/compléter le profil maintenant que l'email est confirmé et
      // qu'une session authentifiée existe (impossible avant : RLS bloque
      // l'écriture sur profiles tant que auth.uid() est nul).
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const meta = user.user_metadata ?? {};
          const { data: existing } = await supabase
            .from("profiles")
            .select("first_name, last_name, phone, address, role")
            .eq("id", user.id)
            .maybeSingle();

          await supabase.from("profiles").upsert(
            {
              id: user.id,
              first_name: existing?.first_name || meta.first_name || null,
              last_name:  existing?.last_name  || meta.last_name  || null,
              phone:      existing?.phone      || meta.phone      || null,
              address:    existing?.address    || meta.address    || null,
              role:       existing?.role       || "user",
            },
            { onConflict: "id" }
          );
        }
      } catch (e) {
        console.warn("Profile upsert after email confirmation failed", e);
      }

      // redirect user to specified redirect URL or root of app
      redirect(next);
    } else {
      // redirect the user to an error page with some instructions
      redirect(`/auth/error?error=${error?.message}`);
    }
  }

  // redirect the user to an error page with some instructions
  redirect(`/auth/error?error=No token hash or type`);
}
