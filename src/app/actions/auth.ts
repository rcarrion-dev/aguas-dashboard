"use server";

// Iniciar y cerrar sesión. Corren en el servidor de Next: la contraseña y los
// tokens nunca pasan por JavaScript del navegador.

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  COOKIE,
  DURACION_REFRESH_SEG,
  leerToken,
  opcionesCookie,
  segundosRestantes,
  urlApi,
} from "@/lib/token";
import { esRolPanel, inicioPara, rutaPermitida } from "@/lib/permisos";

export type EstadoLogin = { error?: string; correo?: string } | undefined;

interface RespuestaLogin {
  accessToken: string;
  refreshToken: string;
  nombre: string;
  correo: string;
  rol: string;
}

export async function iniciarSesion(
  _estadoAnterior: EstadoLogin,
  formData: FormData
): Promise<EstadoLogin> {
  const correo = String(formData.get("correo") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const siguiente = String(formData.get("siguiente") ?? "");

  if (!correo || !password) {
    return { error: "Escribe tu correo y tu contraseña.", correo };
  }

  let respuesta: Response;
  try {
    respuesta = await fetch(`${urlApi()}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correo, password }),
      cache: "no-store",
    });
  } catch {
    return {
      error: "No se pudo conectar con el servidor. Revisa que el backend esté corriendo.",
      correo,
    };
  }

  if (!respuesta.ok) {
    if (respuesta.status === 401) {
      return { error: "Correo o contraseña incorrectos.", correo };
    }
    if (respuesta.status === 403) {
      return { error: "Tu cuenta está suspendida.", correo };
    }
    if (respuesta.status === 400) {
      return { error: "Escribe un correo válido.", correo };
    }
    return { error: "Algo falló en el servidor. Intenta de nuevo.", correo };
  }

  const datos = (await respuesta.json()) as RespuestaLogin;
  const payload = leerToken(datos.accessToken, 0);

  if (!payload || !esRolPanel(datos.rol)) {
    return {
      error: "Tu cuenta no tiene acceso al panel. Solo pueden entrar administradores y SSC.",
      correo,
    };
  }

  const almacen = await cookies();
  almacen.set(COOKIE.acceso, datos.accessToken, opcionesCookie(segundosRestantes(payload)));
  almacen.set(COOKIE.refresh, datos.refreshToken, opcionesCookie(DURACION_REFRESH_SEG));
  almacen.set(COOKIE.nombre, encodeURIComponent(datos.nombre), opcionesCookie(DURACION_REFRESH_SEG));

  // Solo se regresa a rutas internas que su rol puede ver (evita redirecciones a otros sitios)
  const destino =
    siguiente.startsWith("/") && !siguiente.startsWith("//") &&
    rutaPermitida(datos.rol, siguiente.split("?")[0])
      ? siguiente
      : inicioPara(datos.rol);

  redirect(destino);
}

export async function cerrarSesion() {
  const almacen = await cookies();
  almacen.delete(COOKIE.acceso);
  almacen.delete(COOKIE.refresh);
  almacen.delete(COOKIE.nombre);
  redirect("/login");
}
