import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, isAdminRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { images: true, variants: true, category: true },
  });
  if (!product) return NextResponse.json({ error: "Produto não encontrado." }, { status: 404 });
  return NextResponse.json(product);
}

// PATCH -> editar preço, estoque, imagens, status etc (somente admin)
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!isAdminRole((session?.user as any)?.role)) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const body = await req.json();
  const allowed = ["name", "description", "price", "promoPrice", "stock", "status", "categoryId"];
  const data: Record<string, unknown> = {};
  for (const key of allowed) if (key in body) data[key] = body[key];

  const product = await prisma.product.update({ where: { id: params.id }, data });
  return NextResponse.json(product);
}

// DELETE -> aqui "excluir" na verdade desativa o produto (soft delete), preservando histórico de pedidos
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!isAdminRole((session?.user as any)?.role)) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const product = await prisma.product.update({ where: { id: params.id }, data: { status: "DISABLED" } });
  return NextResponse.json(product);
}
