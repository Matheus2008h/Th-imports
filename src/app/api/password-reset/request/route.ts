import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { z } from "zod";

const schema = z.object({ email: z.string().email() });

/**
 * Gera um token de redefinição de senha real (aleatório, com validade de 1h).
 *
 * IMPORTANTE: esta rota ainda não envia e-mail — isso requer configurar um
 * provedor de e-mail transacional (ex: Resend, SendGrid, Amazon SES) com sua
 * própria API key em variável de ambiente. Quando configurar, troque o
 * `console.log` abaixo por um envio real de e-mail contendo o link:
 * `${NEXT_PUBLIC_SITE_URL}/redefinir-senha?token=TOKEN`
 *
 * Sempre retornamos sucesso genérico, mesmo se o e-mail não existir,
 * para não revelar quais e-mails estão cadastrados (proteção de privacidade).
 */
export async function POST(req: NextRequest) {
  const { email } = schema.parse(await req.json());
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

  if (user) {
    const token = crypto.randomBytes(32).toString("hex");
    await prisma.passwordResetToken.create({
      data: { userId: user.id, token, expiresAt: new Date(Date.now() + 60 * 60 * 1000) },
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/redefinir-senha?token=${token}`;
    // TODO: enviar por e-mail de verdade quando o provedor estiver configurado.
    console.log(`[TH IMPORTS] Link de redefinição de senha para ${email}: ${resetUrl}`);
  }

  return NextResponse.json({ message: "Se o e-mail existir, um link de redefinição foi enviado." });
}
