import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  const addresses = await prisma.address.findMany({ where: { userId }, orderBy: { isDefault: "desc" } });
  return NextResponse.json(addresses);
}

const schema = z.object({
  label: z.string().min(1),
  fullName: z.string().min(2),
  cpf: z.string().optional(),
  whatsapp: z.string().min(8),
  email: z.string().email(),
  zipCode: z.string().min(8),
  state: z.string().min(2),
  city: z.string().min(1),
  neighborhood: z.string().min(1),
  street: z.string().min(1),
  number: z.string().min(1),
  complement: z.string().optional(),
  reference: z.string().optional(),
  isDefault: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  const data = schema.parse(await req.json());

  if (data.isDefault) {
    await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
  }

  const address = await prisma.address.create({ data: { ...data, userId } });
  return NextResponse.json(address, { status: 201 });
}
