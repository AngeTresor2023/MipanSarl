import AdminShell from "@/components/admin/AdminShell";
import AdminHeader from "@/components/admin/AdminHeader";
import StockManager from "@/components/admin/StockManager";

export default function StockPage() {
  return (
    <AdminShell>
      <div className="p-6">
        <AdminHeader title="Gestion des stocks" subtitle="Ventes locales, arrivages, pertes et historique" />
        <StockManager />
      </div>
    </AdminShell>
  );
}
