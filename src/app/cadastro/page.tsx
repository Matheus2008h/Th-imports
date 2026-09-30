"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";

export default function CadastroPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", whatsapp: "" });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(typeof data.error === "string" ? data.error : "Não foi possível criar a conta.");
        return;
      }
      await signIn("credentials", { email: form.email, password: form.password, redirect: false });
      toast.success("Conta criada com sucesso!");
      router.push("/minha-conta");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-12">
      <h1 className="text-xl font-bold mb-6">Criar conta</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input required placeholder="Nome completo" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full border rounded-xl px-4 py-3" />
        <input required type="email" placeholder="E-mail" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full border rounded-xl px-4 py-3" />
        <input placeholder="WhatsApp" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
          className="w-full border rounded-xl px-4 py-3" />
        <input required type="password" placeholder="Senha (mín. 8 caracteres)" value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full border rounded-xl px-4 py-3" />
        <button disabled={loading} className="btn-primary w-full">{loading ? "Criando..." : "Criar conta"}</button>
      </form>
    </div>
  );
}
