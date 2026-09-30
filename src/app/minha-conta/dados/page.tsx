import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import DadosClient from "./DadosClient";

export default async function DadosPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  return (
    <div className="max-w-sm mx-auto px-4 py-8">
      <h1 className="text-xl font-bold mb-6">👤 Meus dados</h1>
      <DadosClient />
    </div>
  );
}
