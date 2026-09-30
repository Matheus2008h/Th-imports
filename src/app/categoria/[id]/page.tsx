import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function CategoriaPage({ params }: { params: { id: string } }) {
  const category = await prisma.category.findUnique({ where: { slug: params.id } });
  if (!category) notFound();

  const products = await prisma.product.findMany({
    where: { categoryId: category.id, status: "ACTIVE" },
    include: { images: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold mb-6">{category.name}</h1>
      {products.length === 0 ? (
        <p className="text-brand-gray-700">Nenhum produto nesta categoria ainda.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((p) => (
            <ProductCard key={p.id} id={p.id} name={p.name} price={Number(p.price)} promoPrice={p.promoPrice ? Number(p.promoPrice) : null}
              imageUrl={p.images.find(i => i.isPrimary)?.url ?? p.images[0]?.url} />
          ))}
        </div>
      )}
    </div>
  );
}
