import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import SegurancaClient from "./SegurancaClient";

export default async function SegurancaPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  return (
    <div className="max-w-sm mx-auto px-4 py-8">
      <h1 className="text-xl font-bold mb-6">🔐 Segurança</h1>
      <SegurancaClient />
    </div>
  );
}
