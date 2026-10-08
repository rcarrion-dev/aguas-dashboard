// Tipos del dashboard. Siguen el esquema de la BD de Aguas!
// (usuario, rol, reporte, evidencia, revision_reporte, bitacora).
// Cuando conectemos el backend, solo hay que ajustar nombres de campos aquí.

// Mismos estados que usa la app de iOS (EstadoReporte en Reporte.swift)
export type EstadoReporte = "pendiente" | "verificado" | "rechazado";

export type Rol = "admin" | "moderador" | "usuario";

export type TipoContacto = "telefono" | "correo" | "url";

export interface Evidencia {
  id: number;
  nombreArchivo: string;
  tipo: "imagen" | "pdf";
  url: string;
  principal: boolean;
}

export interface Reporte {
  id: number;
  // Datos del estafador
  contacto: string;
  tipoContacto: TipoContacto;
  descripcion: string | null;
  estado: EstadoReporte;
  fechaCreacion: string; // ISO
  idUsuario: number;
  nombreUsuario: string;
  evidencias: Evidencia[];
  // Solo si ya fue revisado
  revision?: {
    moderador: string;
    fecha: string; // ISO
    motivo: string | null;
  };
}

export interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  rol: Rol;
  activo: boolean;
  fechaRegistro: string; // ISO
  totalReportes: number;
}

export type AccionBitacora =
  | "reporte_aprobado"
  | "reporte_rechazado"
  | "usuario_suspendido"
  | "usuario_reactivado"
  | "rol_cambiado"
  | "inicio_sesion";

export interface EntradaBitacora {
  id: number;
  fecha: string; // ISO
  actor: string;
  accion: AccionBitacora;
  detalle: string;
}

export interface PuntoSerie {
  fecha: string; // ISO (día)
  total: number;
}
