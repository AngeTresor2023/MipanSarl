import AdminShell from "@/components/admin/AdminShell";
import AdminHeader from "@/components/admin/AdminHeader";
import ServicesTable from "@/components/admin/ServicesTable";

export default function AdminServicesPage() {
  return (
    <AdminShell>
      <div className="p-6">
        <AdminHeader
          title="Gestion des services"
          subtitle="Ajouter, activer/désactiver ou supprimer des services"
        />
        <ServicesTable />
      </div>
    </AdminShell>
  );
}
