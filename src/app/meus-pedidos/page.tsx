import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

const statusLabel: Record<string, string> = {
  RECEIVED: "Pedido recebido",
  PREPARING: "Em preparação",
  SHIPPED: "Enviado",
  DELIVERED: "Entregue",
  CANCELED: "Cancelado",
};

const paymentLabel: Record<string, string> = {
  PENDING: "⏳ Aguardando pagamento",
  PROCESSING: "🔄 Processando",
  PAID: "✅ Pago",
  REJECTED: "❌ Rejeitado",
  REFUNDED: "↩️ Reembolsado",
  CANCELED: "⚠️ Cancelado",
};

export default async function MeusPedidosPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const orders = await prisma.order.findMany({
    where: { userId: (session.user as any).id },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold mb-6">Meus pedidos</h1>

      {orders.length === 0 ? (
        <p className="text-brand-gray-700">Você ainda não fez nenhum pedido.</p>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <Link key={o.id} href={`/pedido/${o.id}`} className="card p-4 block">
              <div className="flex justify-between text-sm">
                <span className="font-bold">#{o.number}</span>
                <span>{o.createdAt.toLocaleDateString("pt-BR")}</span>
              </div>
              <p className="text-sm text-brand-gray-700 mt-1">{o.items.length} item(ns) · {paymentLabel[o.paymentStatus]}</p>
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs bg-brand-gray-100 px-2 py-1 rounded-lg">{statusLabel[o.status]}</span>
                <span className="price">R$ {Number(o.total).toFixed(2)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
