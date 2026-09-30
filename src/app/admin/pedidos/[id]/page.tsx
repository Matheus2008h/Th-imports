import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import OrderActions from "./OrderActions";

export default async function AdminOrderDetail({ params }: { params: { id: string } }) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: true, address: true, user: true },
  });
  if (!order) notFound();

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-xl font-bold mb-1">Pedido #{order.number}</h1>
      <p className="text-sm text-brand-gray-700 mb-6">{order.createdAt.toLocaleString("pt-BR")}</p>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="card p-4">
          <p className="font-semibold mb-2">Cliente</p>
          <p className="text-sm">{order.user.name}</p>
          <p className="text-sm text-brand-gray-700">{order.user.email}</p>
          <p className="text-sm text-brand-gray-700">{order.user.whatsapp}</p>
        </div>

        {order.address && (
          <div className="card p-4">
            <p className="font-semibold mb-2">📍 Endereço</p>
            <p className="text-sm">{order.address.street}, {order.address.number} — {order.address.neighborhood}</p>
            <p className="text-sm">{order.address.city}/{order.address.state} — {order.address.zipCode}</p>
          </div>
        )}

        <div className="card p-4 sm:col-span-2">
          <p className="font-semibold mb-2">Itens</p>
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm py-1 border-b last:border-0">
              <span>{item.productName} {item.variantLabel ? `(${item.variantLabel})` : ""} x{item.quantity}</span>
              <span>R$ {(Number(item.unitPrice) * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="flex justify-between font-bold pt-2">
            <span>Total</span><span className="price">R$ {Number(order.total).toFixed(2)}</span>
          </div>
        </div>

        <div className="card p-4">
          <p className="font-semibold mb-2">Pagamento</p>
          <p className="text-sm">Status: {order.paymentStatus}</p>
          <p className="text-sm text-brand-gray-700">ID Mercado Pago: {order.mpPaymentId ?? "—"}</p>
        </div>

        <OrderActions orderId={order.id} status={order.status} trackingCode={order.trackingCode} />
      </div>
    </div>
  );
}
