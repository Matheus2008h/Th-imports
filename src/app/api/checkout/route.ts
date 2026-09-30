import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createPreference } from "@/lib/mercadopago";
import { z } from "zod";

const checkoutSchema = z.object({
  addressId: z.string().nullable(), // null permitido apenas se todos os itens forem digitais
});

/**
 * POST /api/checkout
 * 1. Lê o carrinho REAL do usuário logado no banco (nunca confia em preço vindo do cliente).
 * 2. Recalcula subtotal/total a partir dos preços atuais no banco.
 * 3. Cria o Order com status PENDING.
 * 4. Cria a preferência no Mercado Pago e devolve a URL de pagamento (init_point).
 * O pedido só vira "PAID" quando o webhook confirmar (ver /api/webhooks/mercadopago).
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: "Faça login para finalizar a compra." }, { status: 401 });

  const body = await req.json();
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: { include: { product: true, variant: true } } },
  });
  if (!cart || cart.items.length === 0) {
    return NextResponse.json({ error: "Carrinho vazio." }, { status: 400 });
  }

  const requiresAddress = cart.items.some((i) => i.product.type === "PHYSICAL");
  if (requiresAddress && !parsed.data.addressId) {
    return NextResponse.json({ error: "Endereço obrigatório para produtos físicos." }, { status: 400 });
  }

  let shippingCost = 0;
  if (requiresAddress && parsed.data.addressId) {
    const address = await prisma.address.findUnique({ where: { id: parsed.data.addressId } });
    if (!address || address.userId !== userId) {
      return NextResponse.json({ error: "Endereço inválido." }, { status: 400 });
    }
    const digits = address.zipCode.replace(/\D/g, "");
    const region = Number(digits[0]) || 5;
    shippingCost = region <= 2 ? 14.9 : region <= 5 ? 19.9 : 29.9; // TODO: usar /api/shipping/quote / integração real
  }

  // Recalcula tudo a partir do banco (nunca confiar em valores enviados pelo cliente)
  let subtotal = 0;
  for (const item of cart.items) {
    const unit = Number(item.product.promoPrice ?? item.product.price);
    subtotal += unit * item.quantity;
  }
  const total = subtotal + shippingCost;

  const count = await prisma.order.count();
  const number = `TH-${(count + 1).toString().padStart(6, "0")}`;

  const order = await prisma.order.create({
    data: {
      number,
      userId,
      addressId: parsed.data.addressId,
      subtotal,
      shippingCost,
      discount: 0,
      total,
      paymentStatus: "PENDING",
      status: "RECEIVED",
      items: {
        create: cart.items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          productName: item.product.name,
          variantLabel: item.variant ? [item.variant.size, item.variant.color].filter(Boolean).join(" / ") : null,
          unitPrice: Number(item.product.promoPrice ?? item.product.price),
          quantity: item.quantity,
        })),
      },
    },
    include: { items: true, user: true },
  });

  const preference = await createPreference({
    id: order.id,
    number: order.number,
    items: order.items.map((i) => ({ title: i.productName, quantity: i.quantity, unitPrice: Number(i.unitPrice) })),
    shippingCost,
    payerEmail: order.user.email,
  });

  await prisma.order.update({ where: { id: order.id }, data: { mpPreferenceId: preference.id } });

  // Esvazia o carrinho após criar o pedido (estoque só é debitado quando o pagamento for confirmado pelo webhook)
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

  return NextResponse.json({
    orderId: order.id,
    orderNumber: order.number,
    checkoutUrl: preference.init_point,
  });
}
