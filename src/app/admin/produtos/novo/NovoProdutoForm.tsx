"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

type Category = { id: string; name: string };

export default function NovoProdutoForm({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    promoPrice: "",
    stock: "",
    sku: "",
    categoryId: categories[0]?.id ?? "",
    type: "PHYSICAL",
    status: "ACTIVE",
    sizes: "", // "P,M,G,GG"
  });

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (res.ok) setImages((prev) => [...prev, data.url]);
    else toast.error("Falha ao enviar imagem.");
    setUploading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const variants = form.sizes
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((size) => ({ size, stock: Number(form.stock) || 0 }));

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          price: Number(form.price),
          promoPrice: form.promoPrice ? Number(form.promoPrice) : null,
          stock: Number(form.stock),
          sku: form.sku,
          categoryId: form.categoryId,
          type: form.type,
          status: form.status,
          images,
          variants,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error("Erro ao publicar produto.");
        console.error(data);
        return;
      }
      toast.success("Produto publicado!");
      router.push("/admin/produtos");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
      <div>
        <label className="text-sm font-semibold">📸 Imagem do produto</label>
        <input type="file" accept="image/*" onChange={handleUpload} className="block mt-1" />
        {uploading && <p className="text-xs text-brand-gray-700">Enviando...</p>}
        <div className="flex gap-2 mt-2">
          {images.map((url) => <img key={url} src={url} className="w-16 h-16 object-cover rounded-lg" />)}
        </div>
      </div>

      <input required placeholder="🏷️ Nome do produto" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
        className="w-full border rounded-xl px-4 py-3" />
      <textarea required placeholder="📝 Descrição" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
        className="w-full border rounded-xl px-4 py-3" rows={4} />

      <div className="grid grid-cols-2 gap-3">
        <input required type="number" step="0.01" placeholder="💰 Preço" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
          className="border rounded-xl px-4 py-3" />
        <input type="number" step="0.01" placeholder="💸 Preço promocional" value={form.promoPrice} onChange={(e) => setForm({ ...form, promoPrice: e.target.value })}
          className="border rounded-xl px-4 py-3" />
        <input required type="number" placeholder="📦 Estoque" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })}
          className="border rounded-xl px-4 py-3" />
        <input required placeholder="🔖 SKU" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })}
          className="border rounded-xl px-4 py-3" />
      </div>

      <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="w-full border rounded-xl px-4 py-3">
        {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>

      <input placeholder="📏 Tamanhos (ex: P,M,G,GG) — opcional" value={form.sizes} onChange={(e) => setForm({ ...form, sizes: e.target.value })}
        className="w-full border rounded-xl px-4 py-3" />

      <div className="grid grid-cols-2 gap-3">
        <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="border rounded-xl px-4 py-3">
          <option value="PHYSICAL">🚚 Produto físico</option>
          <option value="DIGITAL">💻 Produto digital</option>
        </select>
        <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="border rounded-xl px-4 py-3">
          <option value="ACTIVE">🟢 Ativo (visível na loja)</option>
          <option value="DRAFT">⚪ Rascunho</option>
        </select>
      </div>

      <button disabled={saving} className="btn-primary w-full">{saving ? "Publicando..." : "Publicar produto"}</button>
    </form>
  );
}
