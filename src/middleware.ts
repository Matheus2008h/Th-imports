import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

/**
 * Protege TODAS as rotas /admin/* e /api/products (POST/PATCH/DELETE) no servidor.
 * Um cliente comum digitando /admin na barra de endereço é redirecionado para
 * /admin/login — o conteúdo do painel nunca chega a ser renderizado para ele.
 */
export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token as any;
    if (req.nextUrl.pathname.startsWith("/admin") && req.nextUrl.pathname !== "/admin/login") {
      if (!token || token.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/admin/login", req.url));
      }
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: () => true, // a checagem real de role acontece acima
    },
    pages: { signIn: "/admin/login" },
  }
);

export const config = {
  matcher: ["/admin/:path*"],
};
