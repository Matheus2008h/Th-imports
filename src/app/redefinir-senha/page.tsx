"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

export default function RedefinirSenhaPage() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/password-reset/confirm", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, newPassword }) });
    const data = await res.json();
    setLoading(false);
    if (res.ok) { toast.success("Senha redefinida! Faça login."); router.push("/login"); }
    else toast.error(data.error || "Erro ao redefinir senha.");
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-12">
      <h1 className="text-xl font-bold mb-6">Redefinir senha</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input required type="password" placeholder="Nova senha (mín. 8 caracteres)" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full border rounded-xl px-4 py-3" />
        <button disabled={loading || !token} className="btn-primary w-full">{loading ? "Salvando..." : "Redefinir senha"}</button>
        {!token && <p className="text-sm text-red-600">Link inválido — falta o token na URL.</p>}
      </form>
    </div>
  );
}
