import { prisma } from "@/lib/prisma";
import NovoProdutoForm from "./NovoProdutoForm";

export const dynamic = "force-dynamic";
export default async function NovoProdutoPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-6">+ Adicionar produto</h1>
      <NovoProdutoForm categories={categories} />
    </div>
  );
}
