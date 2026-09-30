import { MercadoPagoConfig, Preference, Payment } from "mercadopago";

/**
 * Integração real com o Mercado Pago (Checkout Pro).
 * O access token FICA SOMENTE NO BACKEND (lido de variável de ambiente).
 * Nunca exponha MERCADOPAGO_ACCESS_TOKEN no frontend.
 */
function getClient() {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error(
      "MERCADOPAGO_ACCESS_TOKEN não configurado. Defina essa variável de ambiente no backend (.env) antes de processar pagamentos."
    );
  }
  return new MercadoPagoConfig({ accessToken });
}

export async function createPreference(order: {
  id: string;
  number: string;
  items: { title: string; quantity: number; unitPrice: number }[];
  shippingCost: number;
  payerEmail: string;
}) {
  const client = getClient();
  const preference = new Preference(client);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const items = order.items.map((item) => ({
    title: item.title,
    quantity: item.quantity,
    unit_price: item.unitPrice,
    currency_id: "BRL",
  }));

  if (order.shippingCost > 0) {
    items.push({
      title: "Frete",
      quantity: 1,
      unit_price: order.shippingCost,
      currency_id: "BRL",
    });
  }

  const result = await preference.create({
    body: {
      items,
      payer: { email: order.payerEmail },
      external_reference: order.id,
      back_urls: {
        success: `${siteUrl}/pedido/${order.id}?status=success`,
        pending: `${siteUrl}/pedido/${order.id}?status=pending`,
        failure: `${siteUrl}/pedido/${order.id}?status=failure`,
      },
      auto_return: "approved",
      notification_url: `${siteUrl}/api/webhooks/mercadopago`,
      statement_descriptor: "THIMPORTS",
    },
  });

  return result; // contém id (preference id) e init_point (URL de checkout)
}

/** Consulta o pagamento real na API do Mercado Pago pelo ID recebido no webhook. */
export async function getPayment(paymentId: string) {
  const client = getClient();
  const payment = new Payment(client);
  return payment.get({ id: paymentId });
}

/** Mapeia o status retornado pelo Mercado Pago para o enum interno do pedido. */
export function mapMpStatusToInternal(mpStatus: string): "PENDING" | "PROCESSING" | "PAID" | "REJECTED" | "REFUNDED" | "CANCELED" {
  switch (mpStatus) {
    case "approved":
      return "PAID";
    case "pending":
    case "in_process":
      return "PROCESSING";
    case "rejected":
      return "REJECTED";
    case "refunded":
    case "charged_back":
      return "REFUNDED";
    case "cancelled":
      return "CANCELED";
    default:
      return "PENDING";
  }
}
