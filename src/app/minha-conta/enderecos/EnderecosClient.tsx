"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

type Address = {
  id: string; label: string; fullName: string; whatsapp: string; email: string;
  zipCode: string; state: string; city: string; neighborhood: string; street: string;
  number: string; complement: string | null; reference: string | null; isDefault: boolean;
};

const empty = {
  label: "Casa", fullName: "", whatsapp: "", email: "", zipCode: "", state: "",
  city: "", neighborhood: "", street: "", number: "", complement: "", reference: "", isDefault: false,
};

export default function EnderecosClient() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [form, setForm] = useState(empty);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  async function load() {
    const res = await fetch("/api/addresses");
    setAddresses(await res.json());
  }
  useEffect(() => { load(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/addresses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setSaving(false);
    if (res.ok) {
      toast.success("Endereço salvo.");
      setForm(empty);
      setShowForm(false);
      load();
    } else toast.error("Erro ao salvar endereço.");
  }

  async function handleDelete(id: string) {
    await fetch(`/api/addresses/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <div className="space-y-3 mb-6">
        {addresses.map((a) => (
          <div key={a.id} className="card p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold">{a.label === "Casa" ? "🏠" : "📍"} {a.label} {a.isDefault && <span className="text-xs text-brand-purple">(padrão)</span>}</p>
                <p className="text-sm text-brand-gray-700">{a.street}, {a.number} — {a.neighborhood}</p>
                <p className="text-sm text-brand-gray-700">{a.city}/{a.state} — {a.zipCode}</p>
              </div>
              <button onClick={() => handleDelete(a.id)} className="text-xs text-red-600">🗑️ remover</button>
            </div>
          </div>
        ))}
        {addresses.length === 0 && <p className="text-brand-gray-700 text-sm">Nenhum endereço salvo ainda.</p>}
      </div>

      {!showForm ? (
        <button onClick={() => setShowForm(true)} className="btn-secondary">+ Adicionar endereço</button>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3 card p-4">
          <div className="grid grid-cols-2 gap-3">
            <select value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} className="border rounded-xl px-3 py-2">
              <option value="Casa">🏠 Casa</option>
              <option value="Trabalho">📍 Trabalho</option>
            </select>
            <input required placeholder="Nome completo" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="border rounded-xl px-3 py-2" />
            <input required placeholder="WhatsApp" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} className="border rounded-xl px-3 py-2" />
            <input required type="email" placeholder="E-mail" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="border rounded-xl px-3 py-2" />
            <input required placeholder="CEP" value={form.zipCode} onChange={(e) => setForm({ ...form, zipCode: e.target.value })} className="border rounded-xl px-3 py-2" />
            <input required placeholder="Estado" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="border rounded-xl px-3 py-2" />
            <input required placeholder="Cidade" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="border rounded-xl px-3 py-2" />
            <input required placeholder="Bairro" value={form.neighborhood} onChange={(e) => setForm({ ...form, neighborhood: e.target.value })} className="border rounded-xl px-3 py-2" />
            <input required placeholder="Rua" value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} className="border rounded-xl px-3 py-2" />
            <input required placeholder="Número" value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} className="border rounded-xl px-3 py-2" />
            <input placeholder="Complemento" value={form.complement} onChange={(e) => setForm({ ...form, complement: e.target.value })} className="border rounded-xl px-3 py-2" />
            <input placeholder="Ponto de referência" value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} className="border rounded-xl px-3 py-2" />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} />
            Definir como endereço padrão
          </label>
          <div className="flex gap-2">
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancelar</button>
            <button disabled={saving} className="btn-primary flex-1">{saving ? "Salvando..." : "Salvar endereço"}</button>
          </div>
        </form>
      )}
    </div>
  );
}
