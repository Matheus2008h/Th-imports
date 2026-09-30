import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

const paymentLabel: Record<string, string> = {
  PENDING: "⏳ Aguardando", PROCESSING: "🔄 Processando", PAID: "✅ Pago",
  REJECTED: "❌ Rejeitado", REFUNDED: "↩️ Reembolsado", CANCELED: "⚠️ Cancelado",
};

export default async function AdminPedidosPage({ searchParams }: { searchParams: { status?: string } }) {
  const status = searchParams.status;
  const orders = await prisma.order.findMany({
    where: status ? { status: status as any } : {},
    include: { user: true, items: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const filters = [
    ["Todos", ""], ["Recebidos", "RECEIVED"], ["Em preparação", "PREPARING"],
    ["Enviados", "SHIPPED"], ["Entregues", "DELIVERED"], ["Cancelados", "CANCELED"],
  ] as const;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Pedidos</h1>
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {filters.map(([label, value]) => (
          <Link key={label} href={`/admin/pedidos${value ? `?status=${value}` : ""}`}
            className={`px-3 py-2 rounded-lg text-sm whitespace-nowrap ${status === value || (!status && !value) ? "bg-brand-purple text-white" : "bg-white border"}`}>
            {label}
          </Link>
        ))}
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-brand-gray-100 text-left">
            <tr><th className="p-3">Pedido</th><th className="p-3">Cliente</th><th className="p-3">Valor</th><th className="p-3">Pagamento</th><th className="p-3">Status</th><th className="p-3">Data</th><th className="p-3"></th></tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-t">
                <td className="p-3 font-medium">#{o.number}</td>
                <td className="p-3">{o.user.name}</td>
                <td className="p-3">R$ {Number(o.total).toFixed(2)}</td>
                <td className="p-3">{paymentLabel[o.paymentStatus]}</td>
                <td className="p-3">{o.status}</td>
                <td className="p-3">{o.createdAt.toLocaleDateString("pt-BR")}</td>
                <td className="p-3"><Link href={`/admin/pedidos/${o.id}`} className="text-brand-purple font-semibold">Ver detalhes</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && <p className="p-6 text-brand-gray-700">Nenhum pedido encontrado.</p>}
      </div>
    </div>
  );
}
