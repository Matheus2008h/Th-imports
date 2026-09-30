"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function ConfiguracoesClient() {
  const [form, setForm] = useState({
    storeName: "", logoUrl: "", bannerUrl: "", primaryColor: "#7C3AED",
    contactEmail: "", whatsapp: "", address: "", policies: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/settings").then(r => r.json()).then(d => {
      setForm({
        storeName: d.storeName ?? "", logoUrl: d.logoUrl ?? "", bannerUrl: d.bannerUrl ?? "",
        primaryColor: d.primaryColor ?? "#7C3AED", contactEmail: d.contactEmail ?? "",
        whatsapp: d.whatsapp ?? "", address: d.address ?? "", policies: d.policies ?? "",
      });
      setLoading(false);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setSaving(false);
    if (res.ok) toast.success("Configurações salvas.");
    else toast.error("Erro ao salvar configurações.");
  }

  if (loading) return <p className="text-brand-gray-700">Carregando...</p>;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      <input placeholder="Nome da loja" value={form.storeName} onChange={(e) => setForm({ ...form, storeName: e.target.value })} className="w-full border rounded-xl px-4 py-3" />
      <input placeholder="URL do logo" value={form.logoUrl} onChange={(e) => setForm({ ...form, logoUrl: e.target.value })} className="w-full border rounded-xl px-4 py-3" />
      <input placeholder="URL do banner" value={form.bannerUrl} onChange={(e) => setForm({ ...form, bannerUrl: e.target.value })} className="w-full border rounded-xl px-4 py-3" />
      <div className="flex items-center gap-3">
        <label className="text-sm">Cor principal</label>
        <input type="color" value={form.primaryColor} onChange={(e) => setForm({ ...form, primaryColor: e.target.value })} className="w-12 h-10 border rounded" />
      </div>
      <input placeholder="E-mail de contato" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} className="w-full border rounded-xl px-4 py-3" />
      <input placeholder="WhatsApp" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} className="w-full border rounded-xl px-4 py-3" />
      <input placeholder="Endereço da loja" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full border rounded-xl px-4 py-3" />
      <textarea placeholder="Políticas (troca, devolução, privacidade...)" value={form.policies} onChange={(e) => setForm({ ...form, policies: e.target.value })} rows={5} className="w-full border rounded-xl px-4 py-3" />
      <button disabled={saving} className="btn-primary w-full">{saving ? "Salvando..." : "Salvar configurações"}</button>
    </form>
  );
}
