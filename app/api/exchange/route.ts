// app/api/exchange/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

const MARGIN = 0.005; // 0.5% — même marge que l'ancien calcul côté client

/** POST /api/exchange — créer une demande de change devise */
export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  let body: any;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
  }

  // Sécurité : on ne lit QUE les champs non-financiers du client. Le taux et
  // le montant converti sont toujours recalculés ici, jamais fournis par le
  // client (avant ce correctif, le calcul se faisait côté navigateur puis
  // était inséré tel quel dans `exchanges` — un client pouvait fabriquer
  // n'importe quel converted_amount).
  const {
    amount,
    from_currency,
    to_currency,
    contact_method,
    contact_value,
    payment_method,
    rib,
  } = body;

  const numAmount = Number(amount);
  if (!numAmount || numAmount <= 0) {
    return NextResponse.json({ error: "Montant invalide." }, { status: 400 });
  }
  if (!contact_value || String(contact_value).trim().length < 3) {
    return NextResponse.json({ error: "Fournis un moyen de contact." }, { status: 400 });
  }
  if (payment_method === "rib" && (!rib || String(rib).trim().length < 8)) {
    return NextResponse.json({ error: "Fournis un RIB valide." }, { status: 400 });
  }
  if (from_currency !== "EUR" && from_currency !== "XOF") {
    return NextResponse.json({ error: "Devise de départ invalide." }, { status: 400 });
  }

  let ratePublic: number;
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/EUR");
    const json = await res.json();
    const r = Number(json?.rates?.XOF);
    if (!Number.isFinite(r) || r <= 0) throw new Error("taux invalide");
    ratePublic = r;
  } catch {
    return NextResponse.json(
      { error: "Service de taux de change indisponible, réessayez." },
      { status: 503 },
    );
  }

  const rateEffective = ratePublic * (1 - MARGIN);
  const convertedAmount = from_currency === "EUR"
    ? numAmount * rateEffective
    : numAmount / rateEffective;

  const serviceClient = createServiceClient();
  const { data: row, error: insertErr } = await serviceClient
    .from("exchanges")
    .insert([{
      user_id: user.id,
      amount: numAmount,
      from_currency,
      to_currency,
      rate_public: ratePublic,
      rate_effective: rateEffective,
      converted_amount: convertedAmount,
      contact_method,
      contact_value,
      payment_method,
      rib: payment_method === "rib" ? rib ?? null : null,
      status: "new",
    }])
    .select()
    .single();

  if (insertErr) {
    console.error("Create exchange error:", insertErr);
    return NextResponse.json({ error: "Impossible d'enregistrer la demande. Réessaie plus tard." }, { status: 500 });
  }

  return NextResponse.json({ exchange: row });
}
