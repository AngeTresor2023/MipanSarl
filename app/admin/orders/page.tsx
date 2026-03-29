import AdminShell from "@/components/admin/AdminShell";
import AdminHeader from "@/components/admin/AdminHeader";
import OrdersTable from "@/components/admin/OrdersTable";

export default function OrdersPage() {
  return (
    <AdminShell>
      <div className="p-6">
        <AdminHeader title="Commandes" subtitle="Accepter ou refuser les commandes" />
        <OrdersTable />
      </div>
    </AdminShell>
  );
}
