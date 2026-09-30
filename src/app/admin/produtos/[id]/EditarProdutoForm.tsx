"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

type Image = { id: string; url: string; isPrimary: boolean };

export default function EditarProdutoForm({
  productId,
  initial,
  images: initialImages,
}: {
  productId: string;
  initial: { name: string; description: string; price: string; promoPrice: string; stock: number; status: string };
  images: Image[];
}) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [images, setImages] = useState(initialImages);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch(`/api/products/${productId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        description: form.description,
        price: Number(form.price),
        promoPrice: form.promoPrice ? Number(form.promoPrice) : null,
        stock: Number(form.stock),
        status: form.status,
      }),
    });
    setSaving(false);
    if (res.ok) { toast.success("Produto atualizado."); router.refresh(); }
    else toast.error("Erro ao salvar.");
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const uploadRes = await fetch("/api/upload", { method: "POST", body: fd });
    const uploadData = await uploadRes.json();
    if (uploadRes.ok) {
      const addRes = await fetch(`/api/products/${productId}/images`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: uploadData.url }),
      });
      const img = await addRes.json();
      setImages((prev) => [...prev, img]);
    } else toast.error("Falha ao enviar imagem.");
    setUploading(false);
  }

  async function handleRemoveImage(imageId: string) {
    await fetch(`/api/products/${productId}/images/${imageId}`, { method: "DELETE" });
    setImages((prev) => prev.filter((i) => i.id !== imageId));
  }

  async function handleDisable() {
    if (!confirm("Desativar este produto? Ele deixa de aparecer na loja, mas o histórico de pedidos é preservado.")) return;
    await fetch(`/api/products/${productId}`, { method: "DELETE" });
    router.push("/admin/produtos");
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <label className="text-sm font-semibold">📸 Imagens</label>
        <div className="flex gap-2 mt-2 flex-wrap">
          {images.map((img) => (
            <div key={img.id} className="relative">
              <img src={img.url} className="w-16 h-16 object-cover rounded-lg" />
              <button type="button" onClick={() => handleRemoveImage(img.id)} className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-5 h-5 text-xs">×</button>
            </div>
          ))}
        </div>
        <input type="file" accept="image/*" onChange={handleUpload} className="mt-2" />
        {uploading && <p className="text-xs text-brand-gray-700">Enviando...</p>}
      </div>

      <form onSubmit={handleSave} className="space-y-3">
        <input required placeholder="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border rounded-xl px-4 py-3" />
        <textarea required placeholder="Descrição" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} className="w-full border rounded-xl px-4 py-3" />
        <div className="grid grid-cols-2 gap-3">
          <input required type="number" step="0.01" placeholder="Preço" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="border rounded-xl px-4 py-3" />
          <input type="number" step="0.01" placeholder="Preço promocional" value={form.promoPrice} onChange={(e) => setForm({ ...form, promoPrice: e.target.value })} className="border rounded-xl px-4 py-3" />
          <input required type="number" placeholder="Estoque" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} className="border rounded-xl px-4 py-3" />
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="border rounded-xl px-4 py-3">
            <option value="ACTIVE">🟢 Ativo</option>
            <option value="DRAFT">⚪ Rascunho</option>
            <option value="DISABLED">🔴 Desativado</option>
          </select>
        </div>
        <button disabled={saving} className="btn-primary w-full">{saving ? "Salvando..." : "Salvar alterações"}</button>
      </form>

      <button onClick={handleDisable} className="text-sm text-red-600">🗑️ Desativar produto</button>
    </div>
  );
}
