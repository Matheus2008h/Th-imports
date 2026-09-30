import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, isAdminRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function GET() {
  const categories = await prisma.category.findMany({ where: { active: true }, orderBy: { name: "asc" } });
  return NextResponse.json(categories);
}

const schema = z.object({ name: z.string().min(2) });

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!isAdminRole((session?.user as any)?.role)) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  const { name } = schema.parse(await req.json());
  const slug = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-");
  const category = await prisma.category.create({ data: { name, slug } });
  return NextResponse.json(category, { status: 201 });
}
