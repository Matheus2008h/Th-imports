import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, isAdminRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// GET /api/products?q=camiseta&category=roupas -> busca pública de produtos
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const categorySlug = searchParams.get("category")?.trim();

  const products = await prisma.product.findMany({
    where: {
      status: "ACTIVE",
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
              { sku: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(categorySlug ? { category: { slug: categorySlug } } : {}),
    },
    include: { images: true, category: true, variants: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(products);
}

const productSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(1),
  price: z.number().positive(),
  promoPrice: z.number().positive().nullable().optional(),
  stock: z.number().int().nonnegative(),
  sku: z.string().min(1),
  categoryId: z.string().min(1),
  type: z.enum(["PHYSICAL", "DIGITAL"]).default("PHYSICAL"),
  status: z.enum(["ACTIVE", "DRAFT", "DISABLED"]).default("DRAFT"),
  images: z.array(z.string().url()).default([]),
  variants: z
    .array(z.object({ size: z.string().optional(), color: z.string().optional(), stock: z.number().int().nonnegative() }))
    .default([]),
});

// POST /api/products -> cria produto (somente admin autenticado)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!isAdminRole((session?.user as any)?.role)) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const body = await req.json();
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  const slug = data.name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const product = await prisma.product.create({
    data: {
      name: data.name,
      slug: `${slug}-${Date.now().toString().slice(-5)}`,
      description: data.description,
      price: data.price,
      promoPrice: data.promoPrice ?? null,
      stock: data.stock,
      sku: data.sku,
      categoryId: data.categoryId,
      type: data.type,
      status: data.status,
      images: { create: data.images.map((url, i) => ({ url, isPrimary: i === 0, order: i })) },
      variants: { create: data.variants },
    },
    include: { images: true, variants: true },
  });

  return NextResponse.json(product, { status: 201 });
}
