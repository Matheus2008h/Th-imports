import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const categories = ["Roupas", "Calçados", "Acessórios", "Eletrônicos", "Beleza", "Casa", "Ofertas", "Novidades"];
  for (const name of categories) {
    const slug = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-");
    await prisma.category.upsert({ where: { slug }, update: {}, create: { name, slug } });
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_INITIAL_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.warn(
      "\n⚠️  ADMIN_EMAIL ou ADMIN_INITIAL_PASSWORD não definidos no .env — nenhum admin foi criado.\n" +
        "   Defina essas variáveis (com uma senha forte de sua escolha) antes de rodar o seed.\n"
    );
  } else {
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    await prisma.user.upsert({
      where: { email: adminEmail.toLowerCase() },
      update: { role: "ADMIN" },
      create: { name: "Administrador TH IMPORTS", email: adminEmail.toLowerCase(), passwordHash, role: "ADMIN" },
    });
    console.log(`✅ Admin criado/atualizado: ${adminEmail}`);
  }

  await prisma.storeSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton", storeName: "TH IMPORTS", primaryColor: "#7C3AED" },
  });

  console.log("✅ Categorias padrão criadas.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
