import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import EditarProdutoForm from "./EditarProdutoForm";

export default async function EditarProdutoPage({ params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({ where: { id: params.id }, include: { images: true } });
  if (!product) notFound();

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-6">Editar produto</h1>
      <EditarProdutoForm
        productId={product.id}
        initial={{
          name: product.name,
          description: product.description,
          price: String(product.price),
          promoPrice: product.promoPrice ? String(product.promoPrice) : "",
          stock: product.stock,
          status: product.status,
        }}
        images={product.images.map((i) => ({ id: i.id, url: i.url, isPrimary: i.isPrimary }))}
      />
    </div>
  );
}
