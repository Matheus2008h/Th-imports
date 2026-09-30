"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

type Variant = { id: string; size?: string | null; color?: string | null; stock: number };

export default function AddToCartForm({ productId, variants }: { productId: string; variants: Variant[] }) {
  const router = useRouter();
  const [variantId, setVariantId] = useState<string | null>(variants[0]?.id ?? null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);

  async function handleAdd() {
    setLoading(true);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, variantId, quantity: qty }),
      });
      if (res.status === 401) {
        toast.error("Faça login para adicionar ao carrinho.");
        router.push("/login");
        return;
      }
      if (!res.ok) throw new Error();
      toast.success("Adicionado ao carrinho!");
    } catch {
      toast.error("Não foi possível adicionar ao carrinho.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {variants.length > 0 && (
        <div>
          <p className="text-sm font-semibold mb-2">Variação</p>
          <div className="flex gap-2 flex-wrap">
            {variants.map((v) => (
              <button
                key={v.id}
                onClick={() => setVariantId(v.id)}
                disabled={v.stock === 0}
                className={`px-3 py-2 rounded-lg border text-sm ${
                  variantId === v.id ? "border-brand-purple bg-brand-purple/10" : "border-brand-gray-200"
                } ${v.stock === 0 ? "opacity-40 line-through" : ""}`}
              >
                {[v.size, v.color].filter(Boolean).join(" / ") || "Padrão"}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-9 h-9 rounded-lg border">-</button>
        <span className="w-6 text-center">{qty}</span>
        <button onClick={() => setQty((q) => q + 1)} className="w-9 h-9 rounded-lg border">+</button>
      </div>

      <button onClick={handleAdd} disabled={loading} className="btn-primary w-full sm:w-auto">
        {loading ? "Adicionando..." : "Adicionar ao carrinho"}
      </button>
    </div>
  );
}
