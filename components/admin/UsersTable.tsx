"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import { ShieldCheck, User, Trash2 } from "lucide-react";

type Profile = {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  phone?: string | null;
  role?: string | null;
  created_at?: string | null;
};

export default function UsersTable() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/users");
      const json = await res.json();
      if (!res.ok) setError(json.error ?? "Erreur chargement.");
      else setUsers(json.users ?? []);
    } catch {
      setError("Erreur réseau.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  /* ── Changer rôle admin ↔ user ──────────────────────────────────── */
  const toggleRole = async (id: string, currentRole: string | null) => {
    // Valeurs correctes en base : "admin" ou "user"
    const newRole = currentRole === "admin" ? "user" : "admin";
    setToggling(id);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, role: newRole }),
      });
      if (res.ok) {
        setUsers((u) => u.map((x) => (x.id === id ? { ...x, role: newRole } : x)));
      }
    } finally {
      setToggling(null);
    }
  };

  if (loading) return <div className="text-white/60 text-sm py-4 text-center">Chargement des utilisateurs…</div>;

  if (error) {
    return (
      <div className="space-y-3">
        <div className="text-sm text-red-400 bg-red-900/20 border border-red-500/20 p-3 rounded-lg">{error}</div>
        <Button onClick={load} variant="outline">Réessayer</Button>
      </div>
    );
  }

  if (users.length === 0) {
    return <div className="text-white/40 text-sm p-4 text-center">Aucun utilisateur enregistré.</div>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-white/8">
      <table className="w-full text-sm min-w-[480px]">
        <thead>
          <tr className="text-left text-white/40 border-b border-white/8 bg-white/3">
            <th className="px-3 sm:px-4 py-3">Nom</th>
            <th className="px-3 sm:px-4 py-3 hidden sm:table-cell">Email</th>
            <th className="px-3 sm:px-4 py-3 hidden lg:table-cell">Téléphone</th>
            <th className="px-3 sm:px-4 py-3 hidden md:table-cell">Inscription</th>
            <th className="px-3 sm:px-4 py-3">Rôle</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => {
            const isAdmin = u.role === "admin";
            return (
              <tr key={u.id} className="border-t border-white/6 hover:bg-white/3 transition">
                <td className="px-3 sm:px-4 py-3 font-medium">
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${isAdmin ? "bg-blue-600/30 text-blue-300" : "bg-white/10 text-white/50"}`}>
                      {[u.first_name?.[0], u.last_name?.[0]].filter(Boolean).join("").toUpperCase() || "?"}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate">{[u.first_name, u.last_name].filter(Boolean).join(" ") || <span className="text-white/40">—</span>}</div>
                      <div className="text-[11px] text-white/40 truncate sm:hidden">{u.email ?? ""}</div>
                    </div>
                  </div>
                </td>
                <td className="px-3 sm:px-4 py-3 text-white/55 text-xs hidden sm:table-cell">{u.email ?? "—"}</td>
                <td className="px-3 sm:px-4 py-3 text-white/55 hidden lg:table-cell">{u.phone ?? "—"}</td>
                <td className="px-3 sm:px-4 py-3 text-white/35 text-xs hidden md:table-cell">
                  {u.created_at ? new Date(u.created_at).toLocaleDateString("fr-FR") : "—"}
                </td>
                <td className="px-3 sm:px-4 py-3">
                  <button
                    onClick={() => toggleRole(u.id, u.role ?? "user")}
                    disabled={toggling === u.id}
                    title={isAdmin ? "Rétrograder en utilisateur" : "Promouvoir en admin"}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition ${
                      isAdmin
                        ? "bg-blue-600/20 text-blue-300 hover:bg-blue-600/40"
                        : "bg-white/8 text-white/50 hover:bg-white/14 hover:text-white"
                    } ${toggling === u.id ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    {toggling === u.id ? (
                      <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                    ) : isAdmin ? (
                      <><ShieldCheck size={11} /> Admin</>
                    ) : (
                      <><User size={11} /> Utilisateur</>
                    )}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
