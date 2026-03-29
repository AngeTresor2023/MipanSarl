import AdminShell from "@/components/admin/AdminShell";
import AdminHeader from "@/components/admin/AdminHeader";
import UsersTable from "@/components/admin/UsersTable";

export default function UsersPage() {
  return (
    <AdminShell>
      <div className="p-6">
        <AdminHeader title="Gestion des utilisateurs" subtitle="Voir, rechercher et modifier les rôles" />
        <UsersTable />
      </div>
    </AdminShell>
  );
}
