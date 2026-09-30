import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, isAdminRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({ url: z.string().url(), isPrimary: z.boolean().optional() });

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!isAdminRole((session?.user as any)?.role)) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  const { url, isPrimary } = schema.parse(await req.json());

  if (isPrimary) {
    await prisma.productImage.updateMany({ where: { productId: params.id }, data: { isPrimary: false } });
  }

  const image = await prisma.productImage.create({ data: { productId: params.id, url, isPrimary: !!isPrimary } });
  return NextResponse.json(image, { status: 201 });
}
