import AdminShell from "@/components/admin/AdminShell";
import AdminHeader from "@/components/admin/AdminHeader";
import ReplyPanel from "@/components/admin/ReplyPanel";

export default function AdminReplyPage() {
  return (
    <AdminShell>
      <div className="p-6">
        <AdminHeader
          title="Répondre à un client"
          subtitle="Envoyer un email depuis contact@mipansarl.com"
        />
        <ReplyPanel />
      </div>
    </AdminShell>
  );
}
