import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, isAdminRole } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

/**
 * Upload de imagens de produto (somente admin).
 *
 * IMPORTANTE: esta implementação salva em disco local (/public/uploads), o que
 * funciona em desenvolvimento mas NÃO é durável em hospedagens serverless
 * (ex: Vercel), onde o sistema de arquivos é efêmero. Para produção, troque
 * o corpo desta função por um upload para um storage real (S3, Cloudflare R2,
 * Vercel Blob ou Cloudinary) e retorne a URL pública de lá. A interface
 * (POST multipart/form-data -> { url }) pode continuar igual para o frontend.
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!isAdminRole((session?.user as any)?.role)) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });

  const bytes = Buffer.from(await file.arrayBuffer());
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });

  const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "")}`;
  await writeFile(path.join(uploadDir, filename), bytes);

  return NextResponse.json({ url: `/uploads/${filename}` });
}
