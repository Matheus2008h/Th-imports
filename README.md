# TH IMPORTS — Plataforma de E-commerce

Site (Next.js 14 + TypeScript) com painel administrativo, produtos, carrinho,
checkout e pagamento real via Mercado Pago. Este é o **site completo**, não um
app nativo — roda no navegador (desktop e celular).

## ⚠️ Estado real deste projeto — leia antes de tudo

Isto é um **scaffold funcional completo**, pronto para rodar após você
configurar banco de dados e credenciais reais. As seguintes áreas foram
implementadas de ponta a ponta e funcionam de verdade:

- Banco de dados completo (Prisma/PostgreSQL) com todas as tabelas pedidas.
- Autenticação real (NextAuth + bcrypt), separada para cliente e admin.
- Proteção de `/admin` no middleware do servidor (não é só esconder no frontend).
- Cadastro/edição de produto pelo painel, com upload e gestão de múltiplas imagens.
- Carrinho, checkout com seleção de endereço salvo, criação de pedido e
  integração real com a API do Mercado Pago (Checkout Pro).
- Webhook do Mercado Pago com **validação real de assinatura (`x-signature`)**
  e consulta ao pagamento real antes de marcar qualquer pedido como pago.
- Débito de estoque disparado apenas pela confirmação real do webhook.
- Minha conta completa: dados pessoais, endereços (CRUD), segurança (troca de
  senha) e recuperação de senha por token (link exibido no log do servidor —
  falta só plugar um provedor de e-mail transacional, ver abaixo).
- Configurações da loja editáveis pelo admin e salvas no banco (nome, logo,
  banner, cor, contato, políticas) — nada fica fixo no frontend.
- Relatórios com filtro real por período (hoje / 7 dias / 30 dias / mês).
- Cálculo de frete por faixa de CEP (placeholder funcional — ver nota abaixo
  sobre trocar por Correios/Melhor Envio quando quiser frete exato).

**O que ainda depende de uma integração externa que só você pode configurar
(chaves de terceiros):**
- E-mail transacional para o link de "esqueci minha senha" chegar por e-mail
  de verdade (hoje o link é gerado e fica no log do servidor). Configure um
  provedor (Resend, SendGrid, SES) e troque o `console.log` em
  `src/app/api/password-reset/request/route.ts` por um envio real.
- Frete exato via Correios/Melhor Envio (hoje é uma estimativa por CEP).
- Storage de imagens em produção (ver nota sobre `/api/upload` abaixo).

## Stack

Next.js 14 (App Router) · TypeScript · Prisma · PostgreSQL · NextAuth
(credenciais + bcrypt) · Tailwind CSS · SDK oficial `mercadopago` (Node) · Zod

## Instalação local

```bash
npm install
cp .env.example .env   # preencha com seus valores reais (veja abaixo)
npx prisma migrate dev --name init
npm run prisma:seed
npm run dev
```

## Variáveis de ambiente (`.env`)

| Variável | Onde conseguir |
|---|---|
| `DATABASE_URL` | Sua instância PostgreSQL (ex: Neon, Supabase, RDS) |
| `AUTH_SECRET` | Gere com `openssl rand -base64 32` |
| `MERCADOPAGO_ACCESS_TOKEN` | Painel do Mercado Pago → Suas integrações → Credenciais de **produção** |
| `MERCADOPAGO_WEBHOOK_SECRET` | Painel do Mercado Pago → Webhooks → Chave secreta |
| `NEXT_PUBLIC_SITE_URL` | URL pública do site (ex: `https://thimports.com.br`) |
| `ADMIN_EMAIL` / `ADMIN_INITIAL_PASSWORD` | Usados só pelo seed para criar o 1º admin — escolha uma senha forte, não a deixe no `.env` depois de rodar o seed em produção |

**Nunca** commite o `.env` real. O `.env.example` só tem placeholders vazios.

## Configurando o Mercado Pago

1. Crie uma aplicação em https://www.mercadopago.com.br/developers
2. Copie o *Access Token* de produção para `MERCADOPAGO_ACCESS_TOKEN` (backend apenas).
3. Configure a URL de notificação: `https://SEU_DOMINIO/api/webhooks/mercadopago`
4. Copie a chave secreta do webhook para `MERCADOPAGO_WEBHOOK_SECRET`.
5. Teste primeiro com credenciais de **teste** antes de ir para produção.

## Deploy

- Recomendado: Vercel (site) + Neon/Supabase (Postgres).
- **Atenção:** a rota de upload de imagem (`/api/upload`) grava em disco local,
  o que não persiste em ambientes serverless como a Vercel. Antes de ir para
  produção, troque essa rota por um provedor de storage real (Vercel Blob,
  Cloudflare R2, S3 ou Cloudinary) — a interface pode continuar igual.
- Rode `npx prisma migrate deploy` no ambiente de produção antes do primeiro acesso.

## Estrutura de rotas

Site: `/`, `/produtos`, `/produto/[id]`, `/categoria/[id]`, `/carrinho`,
`/checkout`, `/pedido/[id]`, `/minha-conta`, `/meus-pedidos`, `/login`,
`/cadastro`, `/faq`, `/contato`.

Admin (protegido por login + middleware): `/admin/login`, `/admin/dashboard`,
`/admin/produtos`, `/admin/produtos/novo`, `/admin/pedidos`,
`/admin/pedidos/[id]`, `/admin/clientes`, `/admin/categorias`,
`/admin/estoque`, `/admin/relatorios`, `/admin/configuracoes`.

## Segurança já implementada

- Senhas com hash bcrypt (nunca em texto puro).
- Credenciais do Mercado Pago só no backend (nunca em `NEXT_PUBLIC_*`).
- Validação de payload com Zod em todas as rotas de escrita.
- Preço do pedido sempre recalculado no servidor a partir do banco (nunca confia no valor enviado pelo cliente).
- Snapshot do preço no item do pedido (`OrderItem.unitPrice`), preservando o histórico mesmo se o preço do produto mudar depois.
- Assinatura do webhook do Mercado Pago validada via HMAC antes de processar qualquer notificação.
