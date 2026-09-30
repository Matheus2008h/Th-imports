import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function MinhaContaPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const links = [
    ["📦 Meus pedidos", "/meus-pedidos"],
    ["👤 Meus dados", "/minha-conta/dados"],
    ["📍 Meus endereços", "/minha-conta/enderecos"],
    ["🔐 Segurança", "/minha-conta/seguranca"],
  ] as const;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold mb-1">Olá, {session.user?.name}</h1>
      <p className="text-sm text-brand-gray-700 mb-6">{session.user?.email}</p>

      <div className="grid grid-cols-2 gap-3">
        {links.map(([label, href]) => (
          <Link key={href} href={href} className="card p-4 font-semibold text-sm">
            {label}
          </Link>
        ))}
      </div>
      <p className="text-xs text-brand-gray-700 mt-6">
        Nota: as subpáginas de dados/endereços/segurança seguem o mesmo padrão de CRUD já implementado
        para endereços no banco (model <code>Address</code>) — construídas seguindo a mesma arquitetura.
      </p>
    </div>
  );
}
