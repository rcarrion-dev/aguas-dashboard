// Reportes y bitácora desde el backend, ya traducidos a los tipos del dashboard.
// Solo servidor.

import { cache } from "react";
import { pedirApi } from "./api";
import type { RolPanel } from "./permisos";
import type { EstadoReporte, Evidencia, PuntoSerie, Reporte, Revision } from "./types";

// Lo que regresa el backend (ReporteResponseDto)
interface ReporteApi {
  idReporte: number;
  descripcion: string | null;
  telefonoEstafador: string | null;
  enlaceSospechoso: string | null;
  fechaReporte: string;
  empresaSuplantada: string | null;
  estado: EstadoReporte;
  evidenciaPrincipal: string | null;
  usuario?: { idUsuario: number; nombre: string; apellido: string };
}

// BitacoraResponseDto
export interface BitacoraApi {
  idBitacora: number;
  fechaHora: string;
  accion: string;
  descripcion: string | null;
  usuario: { idUsuario: number; nombre: string; apellido: string } | null;
}

// El backend guarda "" cuando un campo opcional viene vacío
const texto = (v: string | null | undefined) => (v && v.trim() ? v.trim() : null);

const nombreCompleto = (u: { nombre: string; apellido: string } | null | undefined) =>
  u ? `${u.nombre} ${u.apellido ?? ""}`.trim() : "Usuario eliminado";

// "/uploads/1712-123.png" → la servimos por /evidencia/1712-123.png (ver app/evidencia)
function evidencia(ruta: string | null): Evidencia | null {
  const archivo = texto(ruta)?.split("/").pop();
  if (!archivo) return null;
  return {
    nombreArchivo: archivo,
    tipo: archivo.toLowerCase().endsWith(".pdf") ? "pdf" : "imagen",
    url: `/evidencia/${encodeURIComponent(archivo)}`,
  };
}

function aReporte(r: ReporteApi): Reporte {
  const telefono = texto(r.telefonoEstafador);
  const enlace = texto(r.enlaceSospechoso);
  return {
    id: r.idReporte,
    contacto: telefono ?? enlace ?? "Sin contacto",
    tipoContacto: telefono ? "telefono" : "url",
    telefono,
    enlace,
    empresa: texto(r.empresaSuplantada),
    descripcion: texto(r.descripcion),
    estado: r.estado,
    fechaCreacion: r.fechaReporte,
    idUsuario: r.usuario?.idUsuario ?? 0,
    nombreUsuario: nombreCompleto(r.usuario),
    evidencia: evidencia(r.evidenciaPrincipal),
  };
}

// Admin: todos los estados. SSC: solo verificados (el backend ya filtra).
// `cache` hace que el layout (badge de pendientes) y la página compartan
// una sola petición por render.
export const obtenerReportes = cache(async (rol: RolPanel): Promise<Reporte[]> => {
  const ruta = rol === "administrador" ? "/reportes/todos" : "/reportes";
  const datos = await pedirApi<ReporteApi[]>(ruta);
  return datos.map(aReporte);
});

// Solo administrador
export const obtenerBitacora = cache(() => pedirApi<BitacoraApi[]>("/bitacora"));

// Quién aprobó o rechazó un reporte. Solo administrador.
export async function obtenerRevision(idReporte: number): Promise<Revision | null> {
  const entradas = await pedirApi<BitacoraApi[]>(`/bitacora/reporte/${idReporte}`);
  const e = entradas.find(
    (x) => x.accion === "reporte_verificado" || x.accion === "reporte_rechazado"
  );
  if (!e) return null;
  return {
    moderador: nombreCompleto(e.usuario),
    fecha: e.fechaHora,
    motivo: texto(e.descripcion),
  };
}

// ---- Números del Resumen -------------------------------------------------

const ZONA = "America/Mexico_City";
const DIA_MS = 86_400_000;

// "2026-10-15" en hora de CDMX
const diaCdmx = (fecha: Date) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: ZONA }).format(fecha);

// Reportes recibidos por día en los últimos `dias` días (incluye hoy, aunque sea 0)
export function seriePorDia(reportes: Reporte[], dias = 30): PuntoSerie[] {
  const conteo = new Map<string, number>();
  for (const r of reportes) {
    const d = diaCdmx(new Date(r.fechaCreacion));
    conteo.set(d, (conteo.get(d) ?? 0) + 1);
  }
  const hoy = Date.now();
  return Array.from({ length: dias }, (_, i) => {
    const dia = diaCdmx(new Date(hoy - (dias - 1 - i) * DIA_MS));
    // CDMX ya no tiene horario de verano: siempre -06:00
    return { fecha: `${dia}T12:00:00-06:00`, total: conteo.get(dia) ?? 0 };
  });
}

export function haceMenosDe(iso: string, dias: number) {
  return Date.now() - new Date(iso).getTime() < dias * DIA_MS;
}
