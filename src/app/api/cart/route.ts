import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

async function getOrCreateCart(userId: string) {
  return prisma.cart.upsert({
    where: { userId },
    update: {},
    create: { userId },
    include: { items: { include: { product: { include: { images: true } }, variant: true } } },
  });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ items: [] });

  const cart = await getOrCreateCart(userId);
  return NextResponse.json(cart);
}

const addSchema = z.object({
  productId: z.string(),
  variantId: z.string().nullable().optional(),
  quantity: z.number().int().positive().default(1),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: "Faça login para adicionar ao carrinho." }, { status: 401 });

  const body = addSchema.parse(await req.json());
  const cart = await getOrCreateCart(userId);

  const existing = cart.items.find((i) => i.productId === body.productId && i.variantId === (body.variantId ?? null));

  if (existing) {
    await prisma.cartItem.update({ where: { id: existing.id }, data: { quantity: existing.quantity + body.quantity } });
  } else {
    await prisma.cartItem.create({
      data: { cartId: cart.id, productId: body.productId, variantId: body.variantId ?? null, quantity: body.quantity },
    });
  }

  const updated = await getOrCreateCart(userId);
  return NextResponse.json(updated);
}

const updateSchema = z.object({ itemId: z.string(), quantity: z.number().int() });

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  const body = updateSchema.parse(await req.json());
  if (body.quantity <= 0) {
    await prisma.cartItem.delete({ where: { id: body.itemId } });
  } else {
    await prisma.cartItem.update({ where: { id: body.itemId }, data: { quantity: body.quantity } });
  }
  const updated = await getOrCreateCart(userId);
  return NextResponse.json(updated);
}
