"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSession } from "next-auth/react";

export default function Header() {
  const router = useRouter();
  const { data: session } = useSession();
  const [query, setQuery] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/produtos?q=${encodeURIComponent(query)}`);
  }

  return (
    <header className="sticky top-0 z-40 bg-brand-black text-white" style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
        <Link href="/" className="text-xl font-extrabold tracking-tight shrink-0">
          TH <span className="text-brand-purpleLight">IMPORTS</span>
        </Link>

        <form onSubmit={handleSearch} className="hidden sm:flex flex-1 max-w-xl">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="🔎 O que você está procurando?"
            className="w-full rounded-l-xl px-4 py-2 text-brand-gray-900 outline-none"
          />
          <button type="submit" className="bg-brand-purple px-4 rounded-r-xl font-semibold">
            Buscar
          </button>
        </form>

        <nav className="flex items-center gap-4 ml-auto">
          <Link href="/minha-conta" className="text-sm hover:text-brand-purpleLight">
            👤 {session ? "Conta" : "Entrar"}
          </Link>
          <Link href="/carrinho" className="text-sm hover:text-brand-purpleLight">
            🛒 Carrinho
          </Link>
        </nav>
      </div>

      <form onSubmit={handleSearch} className="sm:hidden px-4 pb-3 flex">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="🔎 O que você está procurando?"
          className="w-full rounded-l-xl px-4 py-2 text-brand-gray-900 outline-none"
        />
        <button type="submit" className="bg-brand-purple px-4 rounded-r-xl font-semibold">
          Ir
        </button>
      </form>

      <div className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-2 flex gap-5 overflow-x-auto text-sm text-white/80">
          <Link href="/produtos" className="whitespace-nowrap hover:text-white">Todos os produtos</Link>
          <Link href="/categoria/roupas" className="whitespace-nowrap hover:text-white">Roupas</Link>
          <Link href="/categoria/calcados" className="whitespace-nowrap hover:text-white">Calçados</Link>
          <Link href="/categoria/acessorios" className="whitespace-nowrap hover:text-white">Acessórios</Link>
          <Link href="/categoria/eletronicos" className="whitespace-nowrap hover:text-white">Eletrônicos</Link>
          <Link href="/categoria/ofertas" className="whitespace-nowrap text-brand-purpleLight hover:text-white">Ofertas</Link>
        </div>
      </div>
    </header>
  );
}
