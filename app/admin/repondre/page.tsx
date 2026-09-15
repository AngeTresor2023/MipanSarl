import AdminShell from "@/components/admin/AdminShell";
import AdminHeader from "@/components/admin/AdminHeader";
import ReplyForm from "@/components/admin/ReplyForm";

export default function AdminReplyPage() {
  return (
    <AdminShell>
      <div className="p-6">
        <AdminHeader
          title="Répondre à un client"
          subtitle="Envoyer un email depuis contact@mipansarl.com"
        />
        <ReplyForm />
      </div>
    </AdminShell>
  );
}
