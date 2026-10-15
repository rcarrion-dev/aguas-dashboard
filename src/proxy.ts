// Proxy (en Next 16 así se llama lo que antes era "middleware").
// Corre antes de cada página y decide:
//  1. Si no hay sesión → al login (recordando a dónde quería ir).
//  2. Si el access token venció pero hay refresh token → pide uno nuevo al backend.
//  3. Si el rol no puede ver esa página → a su página de inicio.
//  4. Si ya hay sesión y abre /login → a su página de inicio.
//  5. /login?expirada=1 (el backend rechazó el token) → borra la sesión y deja entrar al login.

import { NextResponse, type NextRequest } from "next/server";
import { COOKIE, leerToken, opcionesCookie, segundosRestantes, urlApi } from "@/lib/token";
import { esRolPanel, inicioPara, rutaPermitida } from "@/lib/permisos";

async function renovarToken(refreshToken: string): Promise<string | null> {
  try {
    const res = await fetch(`${urlApi()}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const { accessToken } = (await res.json()) as { accessToken?: string };
    return accessToken ?? null;
  } catch {
    return null;
  }
}

function borrarSesion(res: NextResponse) {
  res.cookies.delete(COOKIE.acceso);
  res.cookies.delete(COOKIE.refresh);
  res.cookies.delete(COOKIE.nombre);
  return res;
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const esLogin = pathname === "/login";

  if (esLogin && request.nextUrl.searchParams.has("expirada")) {
    return borrarSesion(NextResponse.next());
  }

  let payload = leerToken(request.cookies.get(COOKIE.acceso)?.value);
  const refreshToken = request.cookies.get(COOKIE.refresh)?.value;
  let tokenNuevo: string | null = null;

  if (!payload && refreshToken) {
    tokenNuevo = await renovarToken(refreshToken);
    payload = leerToken(tokenNuevo ?? undefined, 0);
  }

  // Sin sesión válida (o con un rol que no entra al panel)
  if (!payload || !esRolPanel(payload.rol)) {
    if (esLogin) {
      const res = NextResponse.next();
      return refreshToken ? borrarSesion(res) : res;
    }
    const login = new URL("/login", request.url);
    if (pathname !== "/") login.searchParams.set("siguiente", pathname + search);
    return borrarSesion(NextResponse.redirect(login));
  }

  const rol = payload.rol;
  if (esLogin || !rutaPermitida(rol, pathname)) {
    return NextResponse.redirect(new URL(inicioPara(rol), request.url));
  }

  if (tokenNuevo) {
    // El token nuevo se pone en la petición actual (para que esta misma página
    // ya lo use) y en la respuesta (para que el navegador lo guarde).
    request.cookies.set(COOKIE.acceso, tokenNuevo);
    const res = NextResponse.next({ request: { headers: request.headers } });
    res.cookies.set(COOKIE.acceso, tokenNuevo, opcionesCookie(segundosRestantes(payload)));
    return res;
  }

  return NextResponse.next();
}

export const config = {
  // Todo menos archivos estáticos, el ícono y los logos
  matcher: ["/((?!_next/static|_next/image|icon.svg|marca/|favicon.ico|robots.txt).*)"],
};
