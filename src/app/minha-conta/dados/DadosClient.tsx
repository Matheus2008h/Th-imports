"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function DadosClient() {
  const [form, setForm] = useState({ name: "", whatsapp: "", email: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/me").then(r => r.json()).then(d => { setForm({ name: d.name ?? "", whatsapp: d.whatsapp ?? "", email: d.email ?? "" }); setLoading(false); });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/me", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: form.name, whatsapp: form.whatsapp }) });
    setSaving(false);
    if (res.ok) toast.success("Dados atualizados.");
    else toast.error("Erro ao salvar.");
  }

  if (loading) return <p className="text-brand-gray-700">Carregando...</p>;

  return (
    <form onSubmit={handleSubmit} className="space-y-3 max-w-sm">
      <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nome" className="w-full border rounded-xl px-4 py-3" />
      <input value={form.email} disabled placeholder="E-mail" className="w-full border rounded-xl px-4 py-3 bg-brand-gray-100 text-brand-gray-700" />
      <input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} placeholder="WhatsApp" className="w-full border rounded-xl px-4 py-3" />
      <button disabled={saving} className="btn-primary w-full">{saving ? "Salvando..." : "Salvar"}</button>
    </form>
  );
}
