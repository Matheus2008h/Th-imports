import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [featured, categories] = await Promise.all([
    prisma.product.findMany({ where: { status: "ACTIVE" }, include: { images: true }, orderBy: { createdAt: "desc" }, take: 8 }),
    prisma.category.findMany({ where: { active: true }, take: 8 }),
  ]);

  return (
    <div>
      {/* Banner principal */}
      <section className="bg-gradient-to-br from-brand-black via-brand-purpleDark to-brand-purple text-white">
        <div className="max-w-6xl mx-auto px-4 py-16 sm:py-24 text-center animate-slideUp">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">TH IMPORTS</h1>
          <p className="mt-3 text-white/80 text-lg">Produtos importados premium, com a confiança de uma loja de verdade.</p>
          <Link href="/produtos" className="inline-block mt-6 btn-primary">Ver produtos</Link>
        </div>
      </section>

      {/* Categorias */}
      {categories.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-8">
          <h2 className="text-lg font-bold mb-4">Categorias</h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {categories.map((c) => (
              <Link key={c.id} href={`/categoria/${c.slug}`} className="shrink-0 card px-5 py-3 text-sm font-semibold">
                {c.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Produtos em destaque */}
      <section className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-lg font-bold mb-4">Novidades</h2>
        {featured.length === 0 ? (
          <p className="text-brand-gray-700">
            Nenhum produto cadastrado ainda. Acesse o painel administrativo em <code>/admin</code> para adicionar o primeiro produto.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {featured.map((p) => (
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
      </section>

      {/* Benefícios */}
      <section className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          ["🚚", "Entrega rastreada", "Acompanhe seu pedido do pagamento à entrega."],
          ["🔒", "Pagamento seguro", "Checkout processado pelo Mercado Pago."],
          ["💬", "Suporte real", "Fale com a gente pelo WhatsApp."],
        ].map(([icon, title, desc]) => (
          <div key={title} className="card p-5 text-center">
            <div className="text-3xl">{icon}</div>
            <p className="font-bold mt-2">{title}</p>
            <p className="text-sm text-brand-gray-700">{desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
