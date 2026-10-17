"use server";

// Suspender o reactivar una cuenta. El backend vuelve a revisar que quien
// lo pide sea administrador y que la cuenta no sea de administrador.

import { revalidatePath } from "next/cache";
import { ErrorApi, pedirApi } from "@/lib/api";
import { obtenerSesion } from "@/lib/sesion";

export type ResultadoEstado = { ok: true } | { ok: false; error: string };

export async function cambiarEstadoUsuario(
  idUsuario: number,
  activo: boolean
): Promise<ResultadoEstado> {
  const sesion = await obtenerSesion();
  if (sesion?.rol !== "administrador") {
    return { ok: false, error: "Solo un administrador puede suspender cuentas." };
  }
  try {
    await pedirApi(`/usuarios/${Number(idUsuario)}/estado`, {
      method: "PATCH",
      body: JSON.stringify({ activo: Boolean(activo) }),
    });
  } catch (e) {
    if (!(e instanceof ErrorApi)) throw e;
    // 404 en la ruta = el backend todavía no tiene el endpoint (falta el PR)
    if (e.status === 404 && e.message.includes("Cannot PATCH")) {
      return { ok: false, error: "El backend todavía no tiene la función de suspender. Falta aplicar su PR." };
    }
    return { ok: false, error: e.message };
  }
  revalidatePath("/usuarios");
  return { ok: true };
}
