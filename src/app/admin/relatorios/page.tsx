import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

function getRange(period: string): { gte: Date; lte: Date } {
  const now = new Date();
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  switch (period) {
    case "7d":
      start.setDate(start.getDate() - 6);
      break;
    case "30d":
      start.setDate(start.getDate() - 29);
      break;
    case "month":
      start.setDate(1);
      break;
    default: // "today"
      break;
  }
  return { gte: start, lte: end };
}

export default async function AdminRelatoriosPage({ searchParams }: { searchParams: { period?: string } }) {
  const period = searchParams.period ?? "30d";
  const range = getRange(period);

  const paidOrders = await prisma.order.findMany({
    where: { paymentStatus: "PAID", createdAt: { gte: range.gte, lte: range.lte } },
    include: { items: true },
  });
  const canceledCount = await prisma.order.count({
    where: { status: "CANCELED", createdAt: { gte: range.gte, lte: range.lte } },
  });

  const periods = [
    ["Hoje", "today"], ["7 dias", "7d"], ["30 dias", "30d"], ["Este mês", "month"],
  ] as const;

  const revenue = paidOrders.reduce((s, o) => s + Number(o.total), 0);
  const avgTicket = paidOrders.length ? revenue / paidOrders.length : 0;

  const productCount: Record<string, { name: string; qty: number }> = {};
  for (const order of paidOrders) {
    for (const item of order.items) {
      if (!productCount[item.productId]) productCount[item.productId] = { name: item.productName, qty: 0 };
      productCount[item.productId].qty += item.quantity;
    }
  }
  const topProducts = Object.values(productCount).sort((a, b) => b.qty - a.qty).slice(0, 5);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Relatórios</h1>
      <div className="flex gap-2 mb-6">
        {periods.map(([label, value]) => (
          <Link key={value} href={`/admin/relatorios?period=${value}`}
            className={`px-3 py-2 rounded-lg text-sm ${period === value ? "bg-brand-purple text-white" : "bg-white border"}`}>
            {label}
          </Link>
        ))}
      </div>

      {paidOrders.length === 0 ? (
        <p className="text-brand-gray-700">Sem dados suficientes para este período.</p>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="card p-4"><p className="text-sm text-brand-gray-700">Faturamento</p><p className="text-2xl font-bold">R$ {revenue.toFixed(2)}</p></div>
            <div className="card p-4"><p className="text-sm text-brand-gray-700">Pedidos pagos</p><p className="text-2xl font-bold">{paidOrders.length}</p></div>
            <div className="card p-4"><p className="text-sm text-brand-gray-700">Ticket médio</p><p className="text-2xl font-bold">R$ {avgTicket.toFixed(2)}</p></div>
            <div className="card p-4"><p className="text-sm text-brand-gray-700">Cancelados</p><p className="text-2xl font-bold">{canceledCount}</p></div>
          </div>

          <h2 className="font-bold mb-3">Produtos mais vendidos</h2>
          <div className="card divide-y">
            {topProducts.map((p) => (
              <div key={p.name} className="p-3 flex justify-between text-sm">
                <span>{p.name}</span><span className="font-semibold">{p.qty} un.</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
