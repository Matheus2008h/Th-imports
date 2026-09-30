"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function CategoriaForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
    setSaving(false);
    if (res.ok) { toast.success("Categoria criada."); setName(""); router.refresh(); }
    else toast.error("Erro ao criar categoria.");
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
      <input required placeholder="Nome da nova categoria" value={name} onChange={(e) => setName(e.target.value)} className="border rounded-xl px-4 py-2 flex-1" />
      <button disabled={saving} className="btn-primary">{saving ? "Criando..." : "+ Nova categoria"}</button>
    </form>
  );
}
