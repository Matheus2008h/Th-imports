import { prisma } from "@/lib/prisma";
import Image from "next/image";
import { notFound } from "next/navigation";
import AddToCartForm from "./AddToCartForm";

export const dynamic = "force-dynamic";

export default async function ProdutoPage({ params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { images: true, variants: true, category: true },
  });
  if (!product || product.status !== "ACTIVE") notFound();

  const hasPromo = product.promoPrice && Number(product.promoPrice) < Number(product.price);
  const primaryImage = product.images.find((i) => i.isPrimary) ?? product.images[0];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 grid sm:grid-cols-2 gap-8">
      <div>
        <div className="relative aspect-square bg-brand-gray-100 rounded-2xl overflow-hidden">
          {primaryImage ? (
            <Image src={primaryImage.url} alt={product.name} fill className="object-cover" />
          ) : (
            <div className="w-full h-full skeleton" />
          )}
        </div>
        {product.images.length > 1 && (
          <div className="flex gap-2 mt-3 overflow-x-auto">
            {product.images.map((img) => (
              <div key={img.id} className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-brand-gray-100">
                <Image src={img.url} alt="" fill className="object-cover" />
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <p className="text-xs text-brand-gray-700 uppercase tracking-wide">{product.category.name}</p>
        <h1 className="text-2xl font-bold mt-1">{product.name}</h1>

        <div className="mt-3 flex items-baseline gap-3">
          {hasPromo && <span className="text-brand-gray-700 line-through">R$ {Number(product.price).toFixed(2)}</span>}
          <span className="price text-3xl">
            R$ {(hasPromo ? Number(product.promoPrice) : Number(product.price)).toFixed(2)}
          </span>
        </div>

        <p className="text-sm mt-2 text-brand-gray-700">
          {product.stock > 0 ? `${product.stock} em estoque` : "Fora de estoque"}
        </p>

        <p className="mt-4 text-brand-gray-900 whitespace-pre-line">{product.description}</p>

        <div className="mt-6">
          <AddToCartForm
            productId={product.id}
            variants={product.variants.map((v) => ({ id: v.id, size: v.size, color: v.color, stock: v.stock }))}
          />
        </div>
      </div>
    </div>
  );
}
