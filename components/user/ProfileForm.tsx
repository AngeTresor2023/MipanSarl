"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Input from "@/components/ui/input";
import Button from "@/components/ui/Button";
import { User, Mail, Phone, MapPin, Calendar, Lock, ShieldCheck } from "lucide-react";

type Profile = {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  dob?: string;
  role?: string;
  created_at?: string;
};

function getInitials(first?: string, last?: string, email?: string) {
  if (first || last) return `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase();
  return (email?.[0] ?? "?").toUpperCase();
}

function formatMemberSince(dateStr?: string) {
  if (!dateStr) return null;
  return new Intl.DateTimeFormat("fr-FR", { year: "numeric", month: "long" }).format(new Date(dateStr));
}

export default function ProfileForm() {
  const supabase = createClient();
  const [profile, setProfile] = useState<Profile>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPwd, setChangingPwd] = useState(false);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then(({ profile: p }) => setProfile(p ?? {}))
      .finally(() => setLoading(false));
  }, []);

  const set = (field: keyof Profile) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setProfile((p) => ({ ...p, [field]: e.target.value }));

  const save = async () => {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: profile.first_name,
          last_name: profile.last_name,
          phone: profile.phone,
          address: profile.address,
          dob: profile.dob,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Erreur");
      setMsg({ type: "success", text: "Profil mis à jour avec succès." });
    } catch (e: unknown) {
      setMsg({ type: "error", text: e instanceof Error ? e.message : "Erreur inconnue" });
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      setMsg({ type: "error", text: "Le mot de passe doit contenir au moins 6 caractères." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMsg({ type: "error", text: "Les mots de passe ne correspondent pas." });
      return;
    }
    setChangingPwd(true);
    setMsg(null);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setMsg({ type: "success", text: "Mot de passe mis à jour avec succès." });
      setNewPassword("");
      setConfirmPassword("");
    } catch (e: unknown) {
      setMsg({ type: "error", text: e instanceof Error ? e.message : "Erreur inconnue" });
    } finally {
      setChangingPwd(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4 animate-pulse">
        <div className="h-32 bg-white/5 rounded-2xl" />
        <div className="h-64 bg-white/5 rounded-2xl" />
        <div className="h-40 bg-white/5 rounded-2xl" />
      </div>
    );
  }

  const initials = getInitials(profile.first_name, profile.last_name, profile.email);
  const memberSince = formatMemberSince(profile.created_at);

  return (
    <div className="max-w-2xl mx-auto space-y-5">

      {/* Message feedback */}
      {msg && (
        <div className={`flex items-center gap-3 p-4 rounded-xl text-sm border ${
          msg.type === "success"
            ? "bg-green-900/20 border-green-700/30 text-green-300"
            : "bg-red-900/20 border-red-700/30 text-red-300"
        }`}>
          <span>{msg.type === "success" ? "✓" : "✕"}</span>
          {msg.text}
        </div>
      )}

      {/* Carte identité */}
      <div className="bg-white/4 border border-white/8 rounded-2xl p-5 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-xl font-bold text-cyan-300 flex-shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white text-lg leading-tight">
            {profile.first_name || profile.last_name
              ? `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim()
              : "Nom non renseigné"}
          </p>
          <p className="text-white/50 text-sm truncate">{profile.email ?? ""}</p>
          {memberSince && (
            <p className="text-white/40 text-xs mt-1">Membre depuis {memberSince}</p>
          )}
        </div>
        {profile.role === "admin" && (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-cyan-600/20 text-cyan-300 border border-cyan-500/20 flex-shrink-0">
            <ShieldCheck size={12} /> Admin
          </span>
        )}
      </div>

      {/* Informations personnelles */}
      <div className="bg-white/4 border border-white/8 rounded-2xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider flex items-center gap-2">
          <User size={14} /> Informations personnelles
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm text-white/70">Prénom</span>
            <Input
              placeholder="Votre prénom"
              value={profile.first_name ?? ""}
              onChange={set("first_name")}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm text-white/70">Nom</span>
            <Input
              placeholder="Votre nom"
              value={profile.last_name ?? ""}
              onChange={set("last_name")}
            />
          </label>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm text-white/70 flex items-center gap-1.5">
            <Mail size={13} className="opacity-60" /> Adresse e-mail
          </span>
          <Input
            type="email"
            value={profile.email ?? ""}
            disabled
            className="opacity-50 cursor-not-allowed"
            title="L'email ne peut pas être modifié ici"
          />
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm text-white/70 flex items-center gap-1.5">
              <Phone size={13} className="opacity-60" /> Téléphone
            </span>
            <Input
              placeholder="+1 (000) 000-0000"
              value={profile.phone ?? ""}
              onChange={set("phone")}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm text-white/70 flex items-center gap-1.5">
              <Calendar size={13} className="opacity-60" /> Date de naissance
            </span>
            <Input
              type="date"
              value={profile.dob ? profile.dob.slice(0, 10) : ""}
              onChange={set("dob")}
            />
          </label>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm text-white/70 flex items-center gap-1.5">
            <MapPin size={13} className="opacity-60" /> Adresse
          </span>
          <Input
            placeholder="Rue, ville, code postal"
            value={profile.address ?? ""}
            onChange={set("address")}
          />
        </label>

        <div className="pt-1">
          <Button onClick={save} isLoading={saving} className="w-full sm:w-auto px-8">
            Enregistrer le profil
          </Button>
        </div>
      </div>

      {/* Changer le mot de passe */}
      <div className="bg-white/4 border border-white/8 rounded-2xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider flex items-center gap-2">
          <Lock size={14} /> Sécurité
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm text-white/70">Nouveau mot de passe</span>
            <Input
              type="password"
              placeholder="Minimum 6 caractères"
              value={newPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm text-white/70">Confirmer le mot de passe</span>
            <Input
              type="password"
              placeholder="Répéter le mot de passe"
              value={confirmPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
            />
          </label>
        </div>

        <Button onClick={changePassword} isLoading={changingPwd} variant="outline" className="w-full sm:w-auto px-8">
          Changer le mot de passe
        </Button>
      </div>

    </div>
  );
}
