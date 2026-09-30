import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminEstoquePage() {
  const products = await prisma.product.findMany({ orderBy: { stock: "asc" } });
  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-6">Controle de estoque</h1>
      <div className="card divide-y">
        {products.map((p) => (
          <div key={p.id} className="p-4 flex justify-between items-center text-sm">
            <span>{p.name} <span className="text-brand-gray-700">({p.sku})</span></span>
            <span className={`font-bold ${p.stock <= 3 ? "text-red-600" : ""}`}>{p.stock} un.</span>
          </div>
        ))}
        {products.length === 0 && <p className="p-6 text-brand-gray-700">Nenhum produto cadastrado ainda.</p>}
      </div>
      <p className="text-xs text-brand-gray-700 mt-3">Para alterar o estoque, edite o produto em Produtos → Editar (PATCH /api/products/[id]).</p>
    </div>
  );
}
