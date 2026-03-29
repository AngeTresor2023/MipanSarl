import AdminShell from "@/components/admin/AdminShell";
import AdminHeader from "@/components/admin/AdminHeader";
import RequestsTable from "@/components/admin/RequestsTable";

export default function AdminRequestsPage() {
  return (
    <AdminShell>
      <div className="p-6">
        <AdminHeader
          title="Demandes de devis"
          subtitle="Consultez et répondez aux demandes de devis des clients"
        />
        <RequestsTable />
      </div>
    </AdminShell>
  );
}
