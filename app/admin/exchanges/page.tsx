import AdminShell from "@/components/admin/AdminShell";
import AdminHeader from "@/components/admin/AdminHeader";
import ExchangesTable from "@/components/admin/ExchangesTable";

export default function AdminExchangesPage() {
  return (
    <AdminShell>
      <div className="p-6">
        <AdminHeader
          title="Demandes d'échange"
          subtitle="Gérez les demandes de change EUR ↔ XOF et mettez à jour les statuts"
        />
        <ExchangesTable />
      </div>
    </AdminShell>
  );
}
