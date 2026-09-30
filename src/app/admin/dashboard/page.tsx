import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [salesToday, ordersCount, pendingPayments, toShip, productsCount, customersCount] = await Promise.all([
    prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: "PAID", createdAt: { gte: startOfDay } } }),
    prisma.order.count(),
    prisma.order.count({ where: { paymentStatus: "PENDING" } }),
    prisma.order.count({ where: { status: "PREPARING" } }),
    prisma.product.count(),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
  ]);

  const cards = [
    ["💰 Vendas hoje", `R$ ${(Number(salesToday._sum.total) || 0).toFixed(2)}`],
    ["📦 Pedidos", ordersCount],
    ["⏳ Pagamentos pendentes", pendingPayments],
    ["📦 Pedidos para enviar", toShip],
    ["🛍️ Produtos", productsCount],
    ["👥 Clientes", customersCount],
  ] as const;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {cards.map(([label, value]) => (
          <div key={label} className="card p-4">
            <p className="text-sm text-brand-gray-700">{label}</p>
            <p className="text-2xl font-extrabold mt-1">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
