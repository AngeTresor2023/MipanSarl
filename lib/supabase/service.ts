import { createClient } from "@supabase/supabase-js";

/**
 * Client Supabase avec la clé service_role — contourne intégralement RLS.
 *
 * NE JAMAIS importer ce fichier depuis un composant "use client" ni depuis
 * quoi que ce soit qui finit dans le bundle navigateur : la clé service_role
 * donne un accès total à la base, sans aucune policy. Réservé aux routes
 * API serveur qui ont déjà vérifié elles-mêmes l'authentification/l'autorisation
 * avant d'appeler ce client (voir app/api/exchange/route.ts).
 */
export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
