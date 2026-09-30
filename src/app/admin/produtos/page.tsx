import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminProdutosPage() {
  const products = await prisma.product.findMany({ include: { category: true }, orderBy: { createdAt: "desc" } });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Produtos</h1>
        <Link href="/admin/produtos/novo" className="btn-primary">+ Novo produto</Link>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-brand-gray-100 text-left">
            <tr>
              <th className="p-3">Produto</th>
              <th className="p-3">Categoria</th>
              <th className="p-3">Preço</th>
              <th className="p-3">Estoque</th>
              <th className="p-3">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="p-3 font-medium">{p.name}</td>
                <td className="p-3">{p.category.name}</td>
                <td className="p-3">R$ {Number(p.promoPrice ?? p.price).toFixed(2)}</td>
                <td className="p-3">{p.stock}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-lg text-xs ${p.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-brand-gray-100"}`}>
                    {p.status}
                  </span>
                </td>
                <td className="p-3">
                  <Link href={`/admin/produtos/${p.id}`} className="text-brand-purple font-semibold">✏️ Editar</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && <p className="p-6 text-brand-gray-700">Nenhum produto cadastrado ainda.</p>}
      </div>
    </div>
  );
}
