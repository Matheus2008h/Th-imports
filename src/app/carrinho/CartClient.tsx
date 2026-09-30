"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";

type CartItem = {
  id: string;
  quantity: number;
  product: { id: string; name: string; price: string; promoPrice: string | null; images: { url: string; isPrimary: boolean }[] };
  variant: { size: string | null; color: string | null } | null;
};

export default function CartClient() {
  const [cart, setCart] = useState<{ items: CartItem[] } | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await fetch("/api/cart");
    setCart(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function updateQty(itemId: string, quantity: number) {
    await fetch("/api/cart", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId, quantity }),
    });
    load();
  }

  if (loading) return <p className="px-4 py-8 max-w-4xl mx-auto">Carregando carrinho...</p>;

  const items = cart?.items ?? [];
  const total = items.reduce((sum, i) => {
    const unit = Number(i.product.promoPrice ?? i.product.price);
    return sum + unit * i.quantity;
  }, 0);

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-lg font-semibold">Seu carrinho está vazio.</p>
        <Link href="/produtos" className="btn-primary inline-block mt-4">Continuar comprando</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold mb-6">Meu carrinho</h1>
      <div className="space-y-4">
        {items.map((item) => {
          const img = item.product.images.find((i) => i.isPrimary)?.url ?? item.product.images[0]?.url;
          const unit = Number(item.product.promoPrice ?? item.product.price);
          return (
            <div key={item.id} className="card p-3 flex gap-3">
              <div className="relative w-20 h-20 bg-brand-gray-100 rounded-lg overflow-hidden shrink-0">
                {img && <Image src={img} alt={item.product.name} fill className="object-cover" />}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">{item.product.name}</p>
                {item.variant && (
                  <p className="text-xs text-brand-gray-700">{[item.variant.size, item.variant.color].filter(Boolean).join(" / ")}</p>
                )}
                <p className="price mt-1">R$ {unit.toFixed(2)}</p>
                <div className="flex items-center gap-2 mt-2">
                  <button onClick={() => updateQty(item.id, item.quantity - 1)} className="w-7 h-7 rounded border text-sm">-</button>
                  <span className="text-sm w-5 text-center">{item.quantity}</span>
                  <button onClick={() => updateQty(item.id, item.quantity + 1)} className="w-7 h-7 rounded border text-sm">+</button>
                  <button onClick={() => updateQty(item.id, 0)} className="ml-3 text-xs text-red-600">🗑️ remover</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card p-4 mt-6 flex items-center justify-between">
        <span className="font-semibold">Subtotal</span>
        <span className="price text-xl">R$ {total.toFixed(2)}</span>
      </div>
      <p className="text-xs text-brand-gray-700 mt-1">Frete calculado na próxima etapa.</p>

      <div className="flex gap-3 mt-6">
        <Link href="/produtos" className="btn-secondary flex-1 text-center">Continuar comprando</Link>
        <Link href="/checkout" className="btn-primary flex-1 text-center">Finalizar compra</Link>
      </div>
    </div>
  );
}
