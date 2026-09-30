const faqs = [
  ["Como acompanho meu pedido?", "Acesse Minha conta → Meus pedidos para ver o status e o código de rastreamento."],
  ["Quais formas de pagamento vocês aceitam?", "Processamos pagamentos através do Mercado Pago (cartão, pix e boleto, conforme disponibilidade)."],
  ["Como funciona a troca ou devolução?", "Entre em contato pelo WhatsApp informando o número do pedido."],
];

export default function FaqPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold mb-6">Perguntas frequentes</h1>
      <div className="space-y-4">
        {faqs.map(([q, a]) => (
          <div key={q} className="card p-4">
            <p className="font-semibold">{q}</p>
            <p className="text-sm text-brand-gray-700 mt-1">{a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
