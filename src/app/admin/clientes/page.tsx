import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminClientesPage() {
  const customers = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    include: { orders: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-6">Clientes</h1>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-brand-gray-100 text-left">
            <tr><th className="p-3">Nome</th><th className="p-3">E-mail</th><th className="p-3">WhatsApp</th><th className="p-3">Pedidos</th><th className="p-3">Total gasto</th></tr>
          </thead>
          <tbody>
            {customers.map((c) => {
              const total = c.orders.filter(o => o.paymentStatus === "PAID").reduce((s, o) => s + Number(o.total), 0);
              return (
                <tr key={c.id} className="border-t">
                  <td className="p-3">{c.name}</td>
                  <td className="p-3">{c.email}</td>
                  <td className="p-3">{c.whatsapp ?? "—"}</td>
                  <td className="p-3">{c.orders.length}</td>
                  <td className="p-3">R$ {total.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {customers.length === 0 && <p className="p-6 text-brand-gray-700">Nenhum cliente cadastrado ainda.</p>}
      </div>
    </div>
  );
}
