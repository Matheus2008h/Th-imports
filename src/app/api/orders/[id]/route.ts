import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, isAdminRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const order = await prisma.order.findUnique({ where: { id: params.id }, include: { items: true, address: true, user: true } });
  if (!order) return NextResponse.json({ error: "Não encontrado." }, { status: 404 });

  const isOwner = (session?.user as any)?.id === order.userId;
  const isAdmin = isAdminRole((session?.user as any)?.role);
  if (!isOwner && !isAdmin) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  return NextResponse.json(order);
}

const schema = z.object({
  status: z.enum(["RECEIVED", "PREPARING", "SHIPPED", "DELIVERED", "CANCELED"]).optional(),
  trackingCode: z.string().optional(),
});

// Somente admin altera status logístico / código de rastreio.
// IMPORTANTE: o campo paymentStatus NUNCA é editável por aqui — ele só muda
// via webhook do Mercado Pago (ver /api/webhooks/mercadopago), para nunca
// permitir marcar um pedido como pago sem confirmação real.
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!isAdminRole((session?.user as any)?.role)) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  const data = schema.parse(await req.json());
  const order = await prisma.order.update({ where: { id: params.id }, data });
  return NextResponse.json(order);
}
