import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, isAdminRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(_req: NextRequest, { params }: { params: { id: string; imageId: string } }) {
  const session = await getServerSession(authOptions);
  if (!isAdminRole((session?.user as any)?.role)) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  await prisma.productImage.delete({ where: { id: params.imageId } });
  return NextResponse.json({ deleted: true });
}
