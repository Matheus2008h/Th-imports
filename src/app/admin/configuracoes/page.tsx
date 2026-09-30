import ConfiguracoesClient from "./ConfiguracoesClient";

export default function AdminConfiguracoesPage() {
  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-6">Configurações da loja</h1>
      <ConfiguracoesClient />
    </div>
  );
}
