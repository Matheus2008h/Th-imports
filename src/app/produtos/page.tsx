import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export default async function ProdutosPage({ searchParams }: { searchParams: { q?: string } }) {
  const q = searchParams.q?.trim();

  const products = await prisma.product.findMany({
    where: {
      status: "ACTIVE",
      ...(q
        ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { description: { contains: q, mode: "insensitive" } }] }
        : {}),
    },
    include: { images: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold mb-1">{q ? `Resultados para "${q}"` : "Todos os produtos"}</h1>
      <p className="text-sm text-brand-gray-700 mb-6">{products.length} produto(s) encontrado(s)</p>

      {products.length === 0 ? (
        <p className="text-brand-gray-700">Nenhum produto encontrado.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              id={p.id}
              name={p.name}
              price={Number(p.price)}
              promoPrice={p.promoPrice ? Number(p.promoPrice) : null}
              imageUrl={p.images.find((i) => i.isPrimary)?.url ?? p.images[0]?.url}
            />
          ))}
        </div>
      )}
    </div>
  );
}
