// Llamadas al backend desde el servidor de Next (Server Components,
// Server Actions y Route Handlers). Le pone el token de la sesión a cada
// petición. No importar desde componentes "use client".

import { redirect } from "next/navigation";
import { obtenerSesion } from "./sesion";
import { urlApi } from "./token";

export class ErrorApi extends Error {
  constructor(
    public status: number,
    mensaje: string
  ) {
    super(mensaje);
    this.name = "ErrorApi";
  }
}

// Nest regresa los errores como { message: "texto" } o { message: ["a", "b"] }
async function mensajeDeError(res: Response): Promise<string> {
  try {
    const cuerpo = (await res.json()) as { message?: string | string[] };
    if (Array.isArray(cuerpo.message)) return cuerpo.message.join(". ");
    if (cuerpo.message) return cuerpo.message;
  } catch {
    // la respuesta no era JSON
  }
  return `El servidor respondió ${res.status}`;
}

export async function pedirApi<T>(ruta: string, init: RequestInit = {}): Promise<T> {
  const sesion = await obtenerSesion();
  if (!sesion) redirect("/login");

  let res: Response;
  try {
    res = await fetch(`${urlApi()}${ruta}`, {
      ...init,
      headers: {
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...init.headers,
        Authorization: `Bearer ${sesion.accessToken}`,
      },
      cache: "no-store",
    });
  } catch {
    throw new ErrorApi(0, "No se pudo conectar con el servidor. Revisa que el backend esté corriendo.");
  }

  // El backend no aceptó el token (por ejemplo, cambió JWT_SECRET).
  // ?expirada hace que el proxy borre las cookies en vez de regresarnos aquí.
  if (res.status === 401) redirect("/login?expirada=1");

  if (!res.ok) throw new ErrorApi(res.status, await mensajeDeError(res));
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
