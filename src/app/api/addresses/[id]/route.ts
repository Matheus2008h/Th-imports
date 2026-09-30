import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function assertOwner(addressId: string, userId: string) {
  const address = await prisma.address.findUnique({ where: { id: addressId } });
  if (!address || address.userId !== userId) return null;
  return address;
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  const existing = await assertOwner(params.id, userId);
  if (!existing) return NextResponse.json({ error: "Endereço não encontrado." }, { status: 404 });

  const body = await req.json();
  if (body.isDefault) {
    await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
  }
  const address = await prisma.address.update({ where: { id: params.id }, data: body });
  return NextResponse.json(address);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  const existing = await assertOwner(params.id, userId);
  if (!existing) return NextResponse.json({ error: "Endereço não encontrado." }, { status: 404 });

  await prisma.address.delete({ where: { id: params.id } });
  return NextResponse.json({ deleted: true });
}
