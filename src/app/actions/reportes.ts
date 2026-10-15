"use server";

// Acciones de moderación. Corren en el servidor de Next con el token de la
// sesión; el backend vuelve a revisar que sea administrador.

import { revalidatePath } from "next/cache";
import { ErrorApi, pedirApi } from "@/lib/api";
import { obtenerRevision } from "@/lib/reportes";
import { obtenerSesion } from "@/lib/sesion";
import type { Revision } from "@/lib/types";

export type ResultadoModeracion = { ok: true } | { ok: false; error: string };

export async function moderarReporte(
  idReporte: number,
  resultado: "verificado" | "rechazado",
  motivo: string | null
): Promise<ResultadoModeracion> {
  const sesion = await obtenerSesion();
  if (sesion?.rol !== "administrador") {
    return { ok: false, error: "Solo un administrador puede moderar reportes." };
  }
  const comentario = motivo?.trim() || undefined;
  if (resultado === "rechazado" && !comentario) {
    return { ok: false, error: "Escribe un motivo para poder rechazar." };
  }

  try {
    await pedirApi(`/reportes/${Number(idReporte)}/moderar`, {
      method: "PATCH",
      body: JSON.stringify({ resultado, comentario }),
    });
  } catch (e) {
    // Otros errores (como el redirect al login) se dejan pasar
    if (!(e instanceof ErrorApi)) throw e;
    return { ok: false, error: e.message };
  }

  // Refresca la lista, el Resumen y el número de pendientes de la sidebar
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function cargarRevision(idReporte: number): Promise<Revision | null> {
  const sesion = await obtenerSesion();
  if (sesion?.rol !== "administrador") return null;
  try {
    return await obtenerRevision(Number(idReporte));
  } catch (e) {
    if (!(e instanceof ErrorApi)) throw e;
    return null;
  }
}
