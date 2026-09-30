import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

const paymentLabel: Record<string, string> = {
  PENDING: "⏳ Aguardando pagamento",
  PROCESSING: "🔄 Processando",
  PAID: "✅ Pago",
  REJECTED: "❌ Rejeitado",
  REFUNDED: "↩️ Reembolsado",
  CANCELED: "⚠️ Cancelado",
};

export default async function PedidoPage({ params }: { params: { id: string } }) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: true, address: true },
  });
  if (!order) notFound();

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold">✅ Pedido #{order.number}</h1>
      <p className="mt-1 font-semibold">{paymentLabel[order.paymentStatus]}</p>

      <div className="card p-4 mt-4 divide-y">
        {order.items.map((item) => (
          <div key={item.id} className="py-2 flex justify-between text-sm">
            <span>{item.productName} {item.variantLabel ? `(${item.variantLabel})` : ""} x{item.quantity}</span>
            <span>R$ {(Number(item.unitPrice) * item.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div className="card p-4 mt-4 text-sm space-y-1">
        <div className="flex justify-between"><span>Subtotal</span><span>R$ {Number(order.subtotal).toFixed(2)}</span></div>
        <div className="flex justify-between"><span>Frete</span><span>R$ {Number(order.shippingCost).toFixed(2)}</span></div>
        <div className="flex justify-between font-bold text-base"><span>Total</span><span className="price">R$ {Number(order.total).toFixed(2)}</span></div>
      </div>

      {order.trackingCode && (
        <div className="card p-4 mt-4">
          <p className="font-semibold">🚚 Rastreamento</p>
          <p className="text-sm mt-1">{order.trackingCode}</p>
        </div>
      )}
    </div>
  );
}
