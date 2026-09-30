import { prisma } from "@/lib/prisma";
import CategoriaForm from "./CategoriaForm";

export const dynamic = "force-dynamic";

export default async function AdminCategoriasPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-6">Categorias</h1>
      <CategoriaForm />
      <div className="card divide-y">
        {categories.map((c) => (
          <div key={c.id} className="p-4 flex justify-between text-sm">
            <span>{c.name}</span>
            <span className={c.active ? "text-green-700" : "text-brand-gray-700"}>{c.active ? "Ativa" : "Desativada"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
