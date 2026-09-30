import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import EnderecosClient from "./EnderecosClient";

export default async function EnderecosPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold mb-6">📍 Meus endereços</h1>
      <EnderecosClient />
    </div>
  );
}
