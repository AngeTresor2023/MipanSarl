"use client";

import AdminShell from "@/components/admin/AdminShell";
import AdminStats from "@/components/admin/AdminStats";
import UsersTable from "@/components/admin/UsersTable";
import ProductsTable from "@/components/admin/ProductsTable";
import OrdersTable from "@/components/admin/OrdersTable";
import RequestsTable from "@/components/admin/RequestsTable";
import ServicesTable from "@/components/admin/ServicesTable";
import ExchangesTable from "@/components/admin/ExchangesTable";
import Link from "next/link";

function SectionCard({ title, href, children }: { title: string; href: string; children: React.ReactNode }) {
  return (
    <div className="bg-white/3 border border-white/6 p-4 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-white">{title}</h2>
        <Link href={href} className="text-xs text-cyan-400 hover:text-cyan-300 transition">
          Voir tout →
        </Link>
      </div>
      {children}
    </div>
  );
}

export default function AdminPage() {
  return (
    <AdminShell>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Tableau de bord</h1>
          <p className="text-white/50 mt-1 text-sm">Vue d&apos;ensemble de mipan Sarl</p>
        </div>

        <AdminStats />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne principale */}
          <div className="col-span-1 lg:col-span-2 space-y-6">
            <SectionCard title="Utilisateurs récents" href="/admin/users">
              <UsersTable />
            </SectionCard>

            <SectionCard title="Devis récents" href="/admin/requests">
              <RequestsTable compact />
            </SectionCard>

            <SectionCard title="Échanges récents" href="/admin/exchanges">
              <ExchangesTable compact />
            </SectionCard>
          </div>

          {/* Colonne latérale */}
          <div className="space-y-6">
            <SectionCard title="Produits" href="/admin/products">
              <ProductsTable compact />
            </SectionCard>

            <SectionCard title="Commandes" href="/admin/orders">
              <OrdersTable compact />
            </SectionCard>

            <SectionCard title="Services" href="/admin/services">
              <ServicesTable compact />
            </SectionCard>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
