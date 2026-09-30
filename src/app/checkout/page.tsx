"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";

type Address = { id: string; label: string; street: string; number: string; neighborhood: string; city: string; state: string; zipCode: string; isDefault: boolean };

/**
 * Checkout: o cliente escolhe um endereço já salvo (ou cadastra um novo em
 * Minha conta → Meus endereços) e confirma. Ao clicar em pagar, chamamos
 * POST /api/checkout, que cria o pedido no banco e a preferência REAL no
 * Mercado Pago, e redirecionamos para o checkout oficial do Mercado Pago
 * (init_point). O pedido só é confirmado como pago quando o webhook
 * /api/webhooks/mercadopago receber a notificação real.
 */
export default function CheckoutPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressId, setAddressId] = useState<string | null>(null);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    fetch("/api/addresses")
      .then((r) => r.json())
      .then((data: Address[]) => {
        setAddresses(data);
        setAddressId(data.find((a) => a.isDefault)?.id ?? data[0]?.id ?? null);
        setLoadingAddresses(false);
      });
  }, []);

  async function handlePay() {
    setPaying(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addressId }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Não foi possível iniciar o pagamento.");
        return;
      }
      window.location.href = data.checkoutUrl; // redireciona para o Mercado Pago real
    } catch {
      toast.error("Erro ao iniciar checkout.");
    } finally {
      setPaying(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold mb-6">Finalizar compra</h1>

      <div className="card p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <p className="font-semibold">📍 Endereço de entrega</p>
          <Link href="/minha-conta/enderecos" className="text-sm text-brand-purple">+ novo endereço</Link>
        </div>

        {loadingAddresses ? (
          <p className="text-sm text-brand-gray-700">Carregando endereços...</p>
        ) : addresses.length === 0 ? (
          <p className="text-sm text-brand-gray-700">
            Você ainda não tem um endereço salvo. <Link href="/minha-conta/enderecos" className="text-brand-purple underline">Cadastre um</Link> antes de continuar.
          </p>
        ) : (
          <div className="space-y-2">
            {addresses.map((a) => (
              <label key={a.id} className={`flex items-start gap-2 border rounded-xl p-3 text-sm cursor-pointer ${addressId === a.id ? "border-brand-purple bg-brand-purple/5" : ""}`}>
                <input type="radio" name="address" checked={addressId === a.id} onChange={() => setAddressId(a.id)} className="mt-1" />
                <div>
                  <p className="font-semibold">{a.label === "Casa" ? "🏠" : "📍"} {a.label}</p>
                  <p className="text-brand-gray-700">{a.street}, {a.number} — {a.neighborhood}, {a.city}/{a.state} — {a.zipCode}</p>
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="card p-4 mb-6">
        <p className="font-semibold mb-2">💳 Pagamento</p>
        <p className="text-sm text-brand-gray-700">Você será redirecionado ao ambiente seguro do Mercado Pago para concluir o pagamento.</p>
      </div>

      <button onClick={handlePay} disabled={paying || (addresses.length > 0 && !addressId)} className="btn-primary w-full">
        {paying ? "Processando..." : "Pagar com Mercado Pago"}
      </button>
    </div>
  );
}
