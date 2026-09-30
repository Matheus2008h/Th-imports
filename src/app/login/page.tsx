"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

export default function LoginPage() {
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
      toast.error("E-mail ou senha inválidos.");
      return;
    }
    router.push("/minha-conta");
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-12">
      <h1 className="text-xl font-bold mb-6">Entrar</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="email" required placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded-xl px-4 py-3" />
        <input type="password" required placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded-xl px-4 py-3" />
        <button disabled={loading} className="btn-primary w-full">{loading ? "Entrando..." : "Entrar"}</button>
      </form>
      <p className="text-sm text-right mt-2">
        <Link href="/esqueci-senha" className="text-brand-purple">Esqueci minha senha</Link>
      </p>
      <p className="text-sm text-brand-gray-700 mt-4">
        Não tem conta? <Link href="/cadastro" className="text-brand-purple font-semibold">Criar conta</Link>
      </p>
    </div>
  );
}
