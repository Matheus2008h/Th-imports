import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "TH IMPORTS",
  description: "TH IMPORTS — a sua loja de importados premium.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <Providers>
          <Header />
          <main className="min-h-screen">{children}</main>
          <footer className="bg-brand-black text-white/70 text-sm mt-16">
            <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-2 sm:grid-cols-4 gap-6">
              <div>
                <p className="text-white font-bold mb-2">TH IMPORTS</p>
                <p>Sua loja de importados premium.</p>
              </div>
              <div>
                <p className="text-white font-semibold mb-2">Ajuda</p>
                <p><a href="/faq">FAQ</a></p>
                <p><a href="/contato">Contato</a></p>
              </div>
              <div>
                <p className="text-white font-semibold mb-2">Minha conta</p>
                <p><a href="/minha-conta">Minha conta</a></p>
                <p><a href="/meus-pedidos">Meus pedidos</a></p>
              </div>
              <div>
                <p className="text-white font-semibold mb-2">Pagamento</p>
                <p>Mercado Pago</p>
              </div>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
