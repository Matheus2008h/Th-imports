import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const dataSchema = z.object({ name: z.string().min(2), whatsapp: z.string().optional() });

// GET /api/me -> dados do próprio usuário logado
export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
  return NextResponse.json({ id: user.id, name: user.name, email: user.email, whatsapp: user.whatsapp });
}

// PATCH /api/me -> altera nome/whatsapp do próprio usuário logado
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  const data = dataSchema.parse(await req.json());
  const user = await prisma.user.update({ where: { id: userId }, data });
  return NextResponse.json({ id: user.id, name: user.name, whatsapp: user.whatsapp });
}
