"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/input";
import { Pencil, Trash2, Plus, X, Check } from "lucide-react";

type Service = {
  id: string;
  title: string;
  description?: string | null;
  price?: number | null;
  available: boolean;
};

type Form = { title: string; description: string; price: string };
const EMPTY: Form = { title: "", description: "", price: "" };

const fmtPrice = (v: number) =>
  new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(v) + " FCFA";

export default function ServicesTable({ compact }: { compact?: boolean }) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  // Formulaire ajout
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState<Form>(EMPTY);
  const [adding, setAdding] = useState(false);

  // Formulaire édition
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Form>(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/services`);
    const json = await res.json();
    if (json.error) { setMsg(json.error); }
    else { setServices((json.services ?? []).slice(0, compact ? 8 : 200)); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  /* ── Ajouter ──────────────────────────────────────────────────────── */
  const handleAdd = async () => {
    if (!addForm.title.trim()) { setMsg("Le titre est requis."); return; }
    const price = addForm.price ? Number(addForm.price.replace(",", ".")) : null;
    if (addForm.price && isNaN(price as number)) { setMsg("Prix invalide."); return; }
    setAdding(true); setMsg(null);
    const res = await fetch("/api/admin/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: addForm.title.trim(), description: addForm.description.trim() || null, price }),
    });
    const json = await res.json();
    setAdding(false);
    if (json.error) { setMsg(json.error); return; }
    setAddForm(EMPTY); setShowAdd(false);
    await load();
  };

  /* ── Modifier ─────────────────────────────────────────────────────── */
  const startEdit = (s: Service) => {
    setEditId(s.id);
    setEditForm({ title: s.title, description: s.description ?? "", price: s.price != null ? String(s.price) : "" });
    setMsg(null);
  };

  const handleSave = async () => {
    if (!editForm.title.trim()) { setMsg("Le titre est requis."); return; }
    const price = editForm.price ? Number(editForm.price.replace(",", ".")) : null;
    if (editForm.price && isNaN(price as number)) { setMsg("Prix invalide."); return; }
    setSaving(true); setMsg(null);
    const res = await fetch("/api/admin/services", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editId, title: editForm.title.trim(), description: editForm.description.trim() || null, price }),
    });
    const json = await res.json();
    setSaving(false);
    if (json.error) { setMsg(json.error); return; }
    setEditId(null);
    setServices((s) => s.map((x) => x.id === editId ? { ...x, title: editForm.title.trim(), description: editForm.description.trim() || null, price: price ?? null } : x));
  };

  /* ── Toggle dispo ─────────────────────────────────────────────────── */
  const toggle = async (id: string, current: boolean) => {
    await fetch("/api/admin/services", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, available: !current }),
    });
    setServices((s) => s.map((x) => (x.id === id ? { ...x, available: !current } : x)));
  };

  /* ── Supprimer ────────────────────────────────────────────────────── */
  const remove = async (id: string) => {
    if (!confirm("Supprimer ce service définitivement ?")) return;
    const res = await fetch("/api/admin/services", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const json = await res.json();
    if (json.error) { setMsg(json.error); return; }
    setServices((s) => s.filter((x) => x.id !== id));
  };

  if (loading) return <div className="text-white/60 text-sm py-4">Chargement des services…</div>;

  return (
    <div className="space-y-4">
      {msg && <div className="text-red-400 text-sm bg-red-900/20 border border-red-500/20 px-3 py-2 rounded-lg">{msg}</div>}

      {/* Bouton ajouter (mode complet seulement) */}
      {!compact && (
        <div className="flex justify-end">
          <button
            onClick={() => { setShowAdd((v) => !v); setMsg(null); setAddForm(EMPTY); }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition"
          >
            {showAdd ? <><X size={14} /> Annuler</> : <><Plus size={14} /> Ajouter un service</>}
          </button>
        </div>
      )}

      {/* Formulaire ajout */}
      {showAdd && (
        <div className="bg-white/4 border border-blue-500/20 p-4 rounded-xl space-y-3">
          <h3 className="font-semibold text-white text-sm">Nouveau service</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input placeholder="Titre *" value={addForm.title} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAddForm({ ...addForm, title: e.target.value })} />
            <Input placeholder="Prix (FCFA) — optionnel" value={addForm.price} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAddForm({ ...addForm, price: e.target.value })} />
            <Input placeholder="Description" value={addForm.description} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAddForm({ ...addForm, description: e.target.value })} className="sm:col-span-2" />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAdd} isLoading={adding} className="bg-blue-600 hover:bg-blue-500">Créer</Button>
            <Button variant="outline" onClick={() => { setShowAdd(false); setAddForm(EMPTY); setMsg(null); }}>Annuler</Button>
          </div>
        </div>
      )}

      {services.length === 0 ? (
        <div className="text-white/40 text-sm p-4 text-center">Aucun service enregistré.</div>
      ) : compact ? (
        /* Mode compact (dashboard) */
        <ul className="space-y-2 text-sm">
          {services.map((s) => (
            <li key={s.id} className="p-3 bg-white/4 rounded-lg flex justify-between items-center gap-2">
              <div className="min-w-0">
                <div className="font-medium truncate">{s.title}</div>
                {s.price != null && <div className="text-xs text-blue-300">{fmtPrice(s.price)}</div>}
              </div>
              <span className={`px-2 py-0.5 rounded text-xs flex-shrink-0 ${s.available ? "bg-green-600/20 text-green-300" : "bg-red-600/20 text-red-300"}`}>
                {s.available ? "Actif" : "Inactif"}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        /* Mode complet (page /admin/services) */
        <div className="overflow-auto rounded-xl border border-white/8">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-white/40 border-b border-white/8 bg-white/3">
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">Prix</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.map((s) => (
                <>
                  <tr key={s.id} className="border-t border-white/6 hover:bg-white/3 transition">
                    <td className="px-4 py-3 font-medium">
                      <div>{s.title}</div>
                      {s.description && <div className="text-xs text-white/40 mt-0.5 line-clamp-1">{s.description}</div>}
                    </td>
                    <td className="px-4 py-3 text-blue-300 font-medium">
                      {s.price != null ? fmtPrice(s.price) : <span className="text-white/35">Sur demande</span>}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggle(s.id, s.available)}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium transition ${s.available ? "bg-green-600/20 text-green-300 hover:bg-red-600/20 hover:text-red-300" : "bg-red-600/20 text-red-300 hover:bg-green-600/20 hover:text-green-300"}`}
                      >
                        {s.available ? "Actif" : "Inactif"}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => editId === s.id ? setEditId(null) : startEdit(s)}
                          className="p-1.5 rounded-lg bg-white/6 hover:bg-blue-600/20 text-white/50 hover:text-blue-300 transition"
                          title="Modifier"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => remove(s.id)}
                          className="p-1.5 rounded-lg bg-white/6 hover:bg-red-600/20 text-white/50 hover:text-red-300 transition"
                          title="Supprimer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Ligne édition inline */}
                  {editId === s.id && (
                    <tr key={`edit-${s.id}`} className="border-t border-blue-500/20 bg-blue-900/10">
                      <td colSpan={4} className="px-4 py-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                          <Input placeholder="Titre *" value={editForm.title} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditForm({ ...editForm, title: e.target.value })} />
                          <Input placeholder="Prix (FCFA)" value={editForm.price} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditForm({ ...editForm, price: e.target.value })} />
                          <Input placeholder="Description" value={editForm.description} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditForm({ ...editForm, description: e.target.value })} className="sm:col-span-2" />
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={handleSave} isLoading={saving} className="bg-blue-600 hover:bg-blue-500 text-sm">
                            <Check size={13} className="mr-1" /> Enregistrer
                          </Button>
                          <Button variant="outline" className="text-sm" onClick={() => { setEditId(null); setMsg(null); }}>Annuler</Button>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
