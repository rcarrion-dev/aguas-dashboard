// Utilidades para los tokens de sesión. Sin imports de Next, para poder
// usarlas tanto en el proxy como en los Server Components y Server Actions.

export const COOKIE = {
  acceso: "aguas_acceso",
  refresh: "aguas_refresh",
  nombre: "aguas_nombre",
} as const;

export const DURACION_REFRESH_SEG = 7 * 24 * 60 * 60; // igual que en el backend

export interface PayloadToken {
  sub: string;
  correo: string;
  rol: string;
  type: "access" | "refresh";
  exp: number;
}

// Lee el payload del access token SIN verificar la firma: el dashboard no
// tiene la llave del backend (ni debe tenerla). Sirve solo para decidir qué
// mostrar y a dónde redirigir. Si alguien falsifica la cookie, el backend
// rechaza su token en cuanto se le pida cualquier dato.
// Regresa null si no hay token, está mal formado o ya venció.
export function leerToken(token: string | undefined, margenSeg = 10): PayloadToken | null {
  if (!token) return null;
  const partes = token.split(".");
  if (partes.length !== 3) return null;
  try {
    const payload = JSON.parse(
      Buffer.from(partes[1], "base64url").toString("utf8")
    ) as PayloadToken;
    if (payload.type !== "access" || typeof payload.exp !== "number") return null;
    if (payload.exp * 1000 <= Date.now() + margenSeg * 1000) return null;
    return payload;
  } catch {
    return null;
  }
}

export function opcionesCookie(maxAgeSeg: number) {
  return {
    httpOnly: true, // JavaScript del navegador no puede leerla
    secure: process.env.NODE_ENV === "production", // en local no hay https
    sameSite: "lax" as const,
    path: "/",
    maxAge: Math.max(0, Math.floor(maxAgeSeg)),
  };
}

// Segundos que le quedan de vida a un token (para el maxAge de su cookie)
export function segundosRestantes(payload: PayloadToken): number {
  return payload.exp - Math.floor(Date.now() / 1000);
}

export function urlApi(): string {
  const url = process.env.API_URL;
  if (!url) {
    throw new Error("Falta API_URL en .env.local (por ejemplo http://localhost:3000)");
  }
  return url.replace(/\/$/, "");
}
