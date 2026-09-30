import Link from "next/link";
import Providers from "../providers";
import "../globals.css";

const menu = [
  ["📊 Dashboard", "/admin/dashboard"],
  ["🛍️ Produtos", "/admin/produtos"],
  ["📦 Pedidos", "/admin/pedidos"],
  ["👥 Clientes", "/admin/clientes"],
  ["🏷️ Categorias", "/admin/categorias"],
  ["📦 Estoque", "/admin/estoque"],
  ["📈 Relatórios", "/admin/relatorios"],
  ["⚙️ Configurações", "/admin/configuracoes"],
] as const;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <Providers>
          <div className="min-h-screen flex flex-col sm:flex-row">
            <aside className="bg-brand-black text-white sm:w-56 shrink-0 sm:min-h-screen">
              <div className="p-4 font-extrabold">TH IMPORTS <span className="text-brand-purpleLight text-xs block font-normal">Painel admin</span></div>
              <nav className="flex sm:flex-col overflow-x-auto sm:overflow-visible">
                {menu.map(([label, href]) => (
                  <Link key={href} href={href} className="px-4 py-3 text-sm hover:bg-white/10 whitespace-nowrap">
                    {label}
                  </Link>
                ))}
              </nav>
            </aside>
            <main className="flex-1 bg-brand-gray-50 min-h-screen">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
