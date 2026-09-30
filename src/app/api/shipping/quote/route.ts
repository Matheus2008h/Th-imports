import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({ zipCode: z.string().min(8) });

/**
 * Cálculo de frete.
 *
 * IMPORTANTE: esta é uma regra simples baseada em faixa de CEP, para o site
 * já funcionar de ponta a ponta. Para frete real (Correios/transportadora),
 * troque o corpo desta função por uma chamada à API do Melhor Envio,
 * Correios ou da transportadora escolhida — a interface (POST { zipCode } ->
 * { cost, estimatedDays }) pode continuar igual para o frontend.
 */
export async function POST(req: NextRequest) {
  const { zipCode } = schema.parse(await req.json());
  const digits = zipCode.replace(/\D/g, "");
  if (digits.length !== 8) return NextResponse.json({ error: "CEP inválido." }, { status: 400 });

  const region = Number(digits[0]);
  // Estimativa simples por região do CEP — só um placeholder até a integração real.
  const cost = region <= 2 ? 14.9 : region <= 5 ? 19.9 : 29.9;
  const estimatedDays = region <= 2 ? 3 : region <= 5 ? 5 : 8;

  return NextResponse.json({ cost, estimatedDays });
}
