"use client";
import { useState } from "react";

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/password-reset/request", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
    setLoading(false);
    setSent(true);
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-12">
      <h1 className="text-xl font-bold mb-6">Recuperar senha</h1>
      {sent ? (
        <p className="text-brand-gray-700">Se o e-mail existir na nossa base, enviamos um link de redefinição para ele.</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input required type="email" placeholder="Seu e-mail" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border rounded-xl px-4 py-3" />
          <button disabled={loading} className="btn-primary w-full">{loading ? "Enviando..." : "Enviar link de recuperação"}</button>
        </form>
      )}
    </div>
  );
}
