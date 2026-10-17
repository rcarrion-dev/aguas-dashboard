// Tipos del dashboard. Siguen el esquema de la BD de Aguas!
// (usuario, rol, reporte, evidencia, revision_reporte, bitacora).
// Lo que manda el backend se traduce a estos tipos en lib/reportes.ts.

// Mismos estados que usa la app de iOS (EstadoReporte en Reporte.swift)
export type EstadoReporte = "pendiente" | "verificado" | "rechazado";

// Nombres tal cual la tabla `rol` de la BD
export type Rol = "usuario" | "SSC" | "administrador";

// Un reporte trae teléfono, enlace o los dos
export type TipoContacto = "telefono" | "url";

export interface Evidencia {
  nombreArchivo: string;
  tipo: "imagen" | "pdf";
  url: string; // ruta del dashboard que la sirve (/evidencia/<archivo>)
}

export interface Reporte {
  id: number;
  // Datos del estafador. `contacto` es el que se muestra en la tabla:
  // el teléfono si hay, si no el enlace.
  contacto: string;
  tipoContacto: TipoContacto;
  telefono: string | null;
  enlace: string | null;
  empresa: string | null;
  descripcion: string | null;
  estado: EstadoReporte;
  fechaCreacion: string; // ISO
  idUsuario: number;
  nombreUsuario: string;
  evidencia: Evidencia | null; // una por reporte
}

// Quién revisó un reporte (sale de la bitácora)
export interface Revision {
  moderador: string;
  fecha: string; // ISO
  motivo: string | null;
}

export interface Usuario {
  id: number;
  nombre: string; // nombre y apellido
  correo: string;
  rol: Rol;
  activo: boolean; // false = suspendido
  fechaRegistro: string; // ISO
  totalReportes: number;
  reportesRechazados: number;
}

// La bitácora del backend registra las moderaciones de reportes
export type AccionBitacora = "aprobado" | "rechazado";

export interface EntradaBitacora {
  id: number;
  fecha: string; // ISO
  actor: string;
  accion: AccionBitacora;
  idReporte: number | null;
  contacto: string | null; // teléfono o enlace del reporte, si lo encontramos
  comentario: string | null;
}

export interface PuntoSerie {
  fecha: string; // ISO (día)
  total: number;
}
