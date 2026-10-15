// Sesión del lado del servidor (Server Components y Server Actions).
// No importar desde componentes "use client".

import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE, leerToken } from "./token";
import { esRolPanel, inicioPara, type RolPanel } from "./permisos";

export interface Sesion {
  idUsuario: number;
  correo: string;
  nombre: string;
  rol: RolPanel;
  accessToken: string;
}

// Lee la sesión de las cookies. `cache` evita leerla varias veces en el mismo render.
// El proxy ya renovó el token si había vencido, así que aquí solo se lee.
export const obtenerSesion = cache(async (): Promise<Sesion | null> => {
  const almacen = await cookies();
  const accessToken = almacen.get(COOKIE.acceso)?.value;
  const payload = leerToken(accessToken, 0);
  if (!accessToken || !payload || !esRolPanel(payload.rol)) return null;

  const nombreCookie = almacen.get(COOKIE.nombre)?.value;
  let nombre = payload.correo;
  if (nombreCookie) {
    try {
      nombre = decodeURIComponent(nombreCookie);
    } catch {
      nombre = nombreCookie;
    }
  }

  return {
    idUsuario: Number(payload.sub),
    correo: payload.correo,
    nombre,
    rol: payload.rol,
    accessToken,
  };
});

// Para páginas: si no hay sesión manda al login; si el rol no alcanza, a su inicio.
export async function requerirSesion(...roles: RolPanel[]): Promise<Sesion> {
  const sesion = await obtenerSesion();
  if (!sesion) redirect("/login");
  if (roles.length > 0 && !roles.includes(sesion.rol)) redirect(inicioPara(sesion.rol));
  return sesion;
}
