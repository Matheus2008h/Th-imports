import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { getPayment, mapMpStatusToInternal } from "@/lib/mercadopago";

/**
 * Endpoint oficial de Webhook do Mercado Pago: /api/webhooks/mercadopago
 *
 * Fluxo (conforme documentação oficial do Mercado Pago):
 * 1. Recebe a notificação (contém o ID do pagamento, não o status em si).
 * 2. Valida a assinatura enviada no header "x-signature" usando o
 *    MERCADOPAGO_WEBHOOK_SECRET configurado no painel do Mercado Pago,
 *    para garantir que a notificação realmente veio do Mercado Pago.
 * 3. Consulta o pagamento DE VERDADE na API do Mercado Pago (nunca confia
 *    apenas no conteúdo do webhook).
 * 4. Atualiza o pedido no banco com o status real.
 * 5. Se aprovado, debita o estoque.
 *
 * Nunca marcamos um pedido como PAID sem essa confirmação vinda da API do Mercado Pago.
 */

function isSignatureValid(req: NextRequest, dataId: string): boolean {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  const signatureHeader = req.headers.get("x-signature");
  const requestId = req.headers.get("x-request-id");

  if (!secret) {
    console.error("MERCADOPAGO_WEBHOOK_SECRET não configurado — recusando webhook.");
    return false;
  }
  if (!signatureHeader) return false;

  // O header x-signature vem no formato: "ts=1704908010,v1=618c85345248dd820d5fd456117c2ab2ef8eda45a0282ff693eac24131a0f21"
  const parts = Object.fromEntries(
    signatureHeader.split(",").map((p) => {
      const [k, v] = p.split("=");
      return [k?.trim(), v?.trim()];
    })
  );
  const ts = parts["ts"];
  const v1 = parts["v1"];
  if (!ts || !v1) return false;

  // Template oficial do manifest exigido pelo Mercado Pago para validar a assinatura
  const manifest = `id:${dataId};request-id:${requestId ?? ""};ts:${ts};`;
  const expected = crypto.createHmac("sha256", secret).update(manifest).digest("hex");

  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(v1));
}

export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  const dataId = url.searchParams.get("data.id") || url.searchParams.get("id");
  const topic = url.searchParams.get("type") || url.searchParams.get("topic");

  if (!dataId) {
    return NextResponse.json({ error: "data.id ausente" }, { status: 400 });
  }

  // Só processamos notificações de pagamento
  if (topic && topic !== "payment") {
    return NextResponse.json({ received: true });
  }

  if (!isSignatureValid(req, dataId)) {
    return NextResponse.json({ error: "Assinatura inválida." }, { status: 401 });
  }

  // Consulta o pagamento real na API do Mercado Pago — nunca confiamos cegamente no payload recebido
  const mpPayment = await getPayment(dataId);
  const orderId = mpPayment.external_reference;
  if (!orderId) {
    return NextResponse.json({ error: "external_reference ausente no pagamento." }, { status: 400 });
  }

  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
  if (!order) {
    return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
  }

  const internalStatus = mapMpStatusToInternal(mpPayment.status ?? "pending");

  await prisma.$transaction(async (tx) => {
    // Registra evento bruto para auditoria (nunca perdemos o payload original)
    const payment = await tx.payment.create({
      data: {
        orderId: order.id,
        mpPaymentId: String(mpPayment.id),
        status: internalStatus,
        rawStatus: mpPayment.status ?? "unknown",
        amount: Number(mpPayment.transaction_amount ?? order.total),
      },
    });
    await tx.paymentEvent.create({
      data: {
        paymentId: payment.id,
        eventType: topic ?? "payment",
        payload: mpPayment as any,
      },
    });

    const wasAlreadyPaid = order.paymentStatus === "PAID";

    await tx.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: internalStatus,
        mpPaymentId: String(mpPayment.id),
        ...(internalStatus === "PAID" ? { status: "PREPARING" } : {}),
      },
    });

    // Debita estoque somente na primeira confirmação real de pagamento aprovado (evita débito duplicado)
    if (internalStatus === "PAID" && !wasAlreadyPaid) {
      for (const item of order.items) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { decrement: item.quantity } },
          });
        } else {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });
        }
      }
    }
  });

  return NextResponse.json({ received: true });
}
