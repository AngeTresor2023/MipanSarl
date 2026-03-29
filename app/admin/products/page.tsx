import AdminShell from "@/components/admin/AdminShell";
import AdminHeader from "@/components/admin/AdminHeader";
import ProductsTable from "@/components/admin/ProductsTable";

export default function ProductsPage() {
  return (
    <AdminShell>
      <div className="p-6">
        <AdminHeader title="Produits" subtitle="Gérer le catalogue et le stock" />
        <ProductsTable />
      </div>
    </AdminShell>
  );
}
