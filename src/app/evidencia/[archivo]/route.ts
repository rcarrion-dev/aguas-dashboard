// GET /evidencia/<archivo> → trae el archivo de evidencia del backend
// (/uploads/<archivo>) y se lo pasa al navegador.
//
// ¿Por qué no apuntar directo al backend? Porque API_URL solo la conoce el
// servidor de Next, y así, cuando el backend proteja /uploads con token,
// aquí ya se lo estamos mandando y el dashboard no cambia.

import { obtenerSesion } from "@/lib/sesion";
import { urlApi } from "@/lib/token";

// Solo lo que el backend acepta como evidencia. Nada de HTML ni SVG.
const TIPOS_PERMITIDOS = ["image/png", "image/jpeg", "image/gif", "image/webp", "application/pdf"];

// Nombres como los genera multer: "1712345678-123456789.png"
const NOMBRE_VALIDO = /^[A-Za-z0-9_-][A-Za-z0-9._-]{0,200}$/;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ archivo: string }> }
) {
  const sesion = await obtenerSesion();
  if (!sesion) return new Response("No autorizado", { status: 401 });

  const { archivo } = await params;
  if (!NOMBRE_VALIDO.test(archivo) || archivo.includes("..")) {
    return new Response("Archivo no válido", { status: 400 });
  }

  let res: Response;
  try {
    res = await fetch(`${urlApi()}/uploads/${archivo}`, {
      headers: { Authorization: `Bearer ${sesion.accessToken}` },
      cache: "no-store",
    });
  } catch {
    return new Response("No se pudo conectar con el servidor", { status: 502 });
  }
  if (!res.ok || !res.body) {
    return new Response("No se encontró la evidencia", { status: res.status === 404 ? 404 : 502 });
  }

  const tipo = (res.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
  if (!TIPOS_PERMITIDOS.includes(tipo)) {
    return new Response("Tipo de archivo no permitido", { status: 415 });
  }

  return new Response(res.body, {
    headers: {
      "Content-Type": tipo,
      "Content-Disposition": `inline; filename="${archivo}"`,
      "Cache-Control": "private, max-age=3600",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
