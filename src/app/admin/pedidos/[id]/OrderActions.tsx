"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function OrderActions({ orderId, status, trackingCode }: { orderId: string; status: string; trackingCode: string | null }) {
  const router = useRouter();
  const [form, setForm] = useState({ status, trackingCode: trackingCode ?? "" });
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      toast.success("Pedido atualizado.");
      router.refresh();
    } else {
      toast.error("Erro ao atualizar pedido.");
    }
  }

  return (
    <div className="card p-4 space-y-3">
      <p className="font-semibold">Atualizar pedido</p>
      <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full border rounded-xl px-4 py-2">
        <option value="RECEIVED">Pedido recebido</option>
        <option value="PREPARING">Em preparação</option>
        <option value="SHIPPED">Enviado</option>
        <option value="DELIVERED">Entregue</option>
        <option value="CANCELED">Cancelado</option>
      </select>
      <input placeholder="Código de rastreamento" value={form.trackingCode} onChange={(e) => setForm({ ...form, trackingCode: e.target.value })}
        className="w-full border rounded-xl px-4 py-2" />
      <button onClick={handleSave} disabled={saving} className="btn-primary w-full">{saving ? "Salvando..." : "Salvar"}</button>
      <p className="text-xs text-brand-gray-700">O status de pagamento não é editável aqui — ele é atualizado automaticamente pelo webhook do Mercado Pago.</p>
    </div>
  );
}
