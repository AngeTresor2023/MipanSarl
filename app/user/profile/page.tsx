import ProfileForm from "@/components/user/ProfileForm";

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-black text-white px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Mon profil</h1>
          <p className="text-white/50 text-sm mt-1">Gérez vos informations personnelles et votre sécurité</p>
        </div>
        <ProfileForm />
      </div>
    </div>
  );
}
