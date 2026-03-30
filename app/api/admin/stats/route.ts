// app/api/admin/stats/route.ts
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const [counts, localSalesData, ordersData, expensesData] = await Promise.all([
    Promise.allSettled([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("products").select("id", { count: "exact", head: true }),
      supabase.from("quotes").select("id", { count: "exact", head: true }).eq("status", "new"),
      supabase.from("services").select("id", { count: "exact", head: true }),
      supabase.from("exchanges").select("id", { count: "exact", head: true }).eq("status", "new"),
    ]),
    supabase.from("local_sales").select("total"),
    supabase.from("orders").select("total, status").in("status", ["confirmed", "paid", "processing", "shipped", "delivered"]),
    supabase.from("expenses").select("amount"),
  ]);

  const get = (r: PromiseSettledResult<{ count: number | null }>) =>
    r.status === "fulfilled" ? (r.value.count ?? 0) : 0;

  const totalLocalSales = (localSalesData.data ?? []).reduce((s, x) => s + Number(x.total ?? 0), 0);
  const totalOnlineSales = (ordersData.data ?? []).reduce((s, x) => s + Number(x.total ?? 0), 0);
  const totalSales = totalLocalSales + totalOnlineSales;
  const totalExpenses = (expensesData.data ?? []).reduce((s, x) => s + Number(x.amount ?? 0), 0);
  const cashInHand = totalLocalSales - totalExpenses;
  const netValue = totalSales - totalExpenses;

  return NextResponse.json({
    users:           get(counts[0] as PromiseSettledResult<{ count: number | null }>),
    products:        get(counts[1] as PromiseSettledResult<{ count: number | null }>),
    quotes:          get(counts[2] as PromiseSettledResult<{ count: number | null }>),
    services:        get(counts[3] as PromiseSettledResult<{ count: number | null }>),
    exchanges:       get(counts[4] as PromiseSettledResult<{ count: number | null }>),
    totalSales,
    totalLocalSales,
    totalOnlineSales,
    totalExpenses,
    cashInHand,
    netValue,
  });
}
