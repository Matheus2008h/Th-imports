import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, isAdminRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const SETTINGS_ID = "singleton";

export async function GET() {
  const settings = await prisma.storeSettings.upsert({
    where: { id: SETTINGS_ID },
    update: {},
    create: { id: SETTINGS_ID },
  });
  return NextResponse.json(settings);
}

const schema = z.object({
  storeName: z.string().min(1).optional(),
  logoUrl: z.string().optional().nullable(),
  bannerUrl: z.string().optional().nullable(),
  primaryColor: z.string().optional(),
  contactEmail: z.string().email().optional().nullable(),
  whatsapp: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  policies: z.string().optional().nullable(),
  faq: z.array(z.object({ question: z.string(), answer: z.string() })).optional(),
  shippingInfo: z.record(z.any()).optional(),
});

// PATCH /api/settings -> somente admin altera configurações da loja (armazenadas no banco, nunca hardcoded)
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!isAdminRole((session?.user as any)?.role)) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  const data = schema.parse(await req.json());
  const settings = await prisma.storeSettings.upsert({
    where: { id: SETTINGS_ID },
    update: data as any,
    create: { id: SETTINGS_ID, ...(data as any) },
  });
  return NextResponse.json(settings);
}
