"use client";
import { useState } from "react";
import toast from "react-hot-toast";

export default function SegurancaClient() {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "" });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/me/password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await res.json();
    setSaving(false);
    if (res.ok) { toast.success("Senha alterada."); setForm({ currentPassword: "", newPassword: "" }); }
    else toast.error(data.error || "Erro ao trocar senha.");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 max-w-sm">
      <input required type="password" placeholder="Senha atual" value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} className="w-full border rounded-xl px-4 py-3" />
      <input required type="password" placeholder="Nova senha (mín. 8 caracteres)" value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} className="w-full border rounded-xl px-4 py-3" />
      <button disabled={saving} className="btn-primary w-full">{saving ? "Salvando..." : "Alterar senha"}</button>
    </form>
  );
}
