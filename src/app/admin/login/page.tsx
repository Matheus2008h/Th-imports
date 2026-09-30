"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      toast.error("Credenciais inválidas.");
      return;
    }
    router.push("/admin/dashboard");
  }

  return (
    <div className="min-h-screen bg-brand-black flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 w-full max-w-sm space-y-4">
        <h1 className="text-xl font-bold text-center">TH IMPORTS <span className="text-brand-purple">Admin</span></h1>
        <input type="email" required placeholder="E-mail do administrador" value={email} onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded-xl px-4 py-3" />
        <input type="password" required placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded-xl px-4 py-3" />
        <button disabled={loading} className="btn-primary w-full">{loading ? "Entrando..." : "Entrar"}</button>
      </form>
    </div>
  );
}
