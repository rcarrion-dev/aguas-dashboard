// DATOS DE PRUEBA
// Reportes y Resumen ya usan el backend (V3). Usuarios y Bitácora siguen
// aquí hasta V4/V5.

import type { EntradaBitacora, Usuario } from "./types";

// Fechas relativas a la hora actual (redondeada a la hora para que servidor y navegador coincidan)
const AHORA = new Date(Math.floor(Date.now() / 3_600_000) * 3_600_000);

const horasAtras = (h: number) =>
  new Date(AHORA.getTime() - h * 3_600_000).toISOString();

export const usuarios: Usuario[] = [
  { id: 1, nombre: "Rafa Carrión", correo: "rafa@aguas.mx", rol: "administrador", activo: true, fechaRegistro: horasAtras(24 * 60), totalReportes: 0 },
  { id: 2, nombre: "Valeria Porcayo", correo: "vale@aguas.mx", rol: "administrador", activo: true, fechaRegistro: horasAtras(24 * 58), totalReportes: 0 },
  { id: 3, nombre: "Laura Ramírez", correo: "laura.ramirez@ssc.cdmx.gob.mx", rol: "SSC", activo: true, fechaRegistro: horasAtras(24 * 58), totalReportes: 0 },
  { id: 4, nombre: "María López", correo: "maria.lopez@gmail.com", rol: "usuario", activo: true, fechaRegistro: horasAtras(24 * 40), totalReportes: 6 },
  { id: 5, nombre: "Jorge Hernández", correo: "jorge.hdz@outlook.com", rol: "usuario", activo: true, fechaRegistro: horasAtras(24 * 35), totalReportes: 4 },
  { id: 6, nombre: "Ana Torres", correo: "ana.torres@yahoo.com", rol: "usuario", activo: true, fechaRegistro: horasAtras(24 * 30), totalReportes: 5 },
  { id: 7, nombre: "Luis Ramírez", correo: "luisr@gmail.com", rol: "usuario", activo: true, fechaRegistro: horasAtras(24 * 22), totalReportes: 3 },
  { id: 8, nombre: "Sofía Méndez", correo: "sofi.mendez@gmail.com", rol: "usuario", activo: true, fechaRegistro: horasAtras(24 * 18), totalReportes: 4 },
  { id: 9, nombre: "Carlos Ruiz", correo: "cruiz@hotmail.com", rol: "usuario", activo: false, fechaRegistro: horasAtras(24 * 15), totalReportes: 9 },
  { id: 10, nombre: "Daniela Vega", correo: "dani.vega@gmail.com", rol: "usuario", activo: true, fechaRegistro: horasAtras(24 * 9), totalReportes: 3 },
];

export const bitacora: EntradaBitacora[] = [
  { id: 1, fecha: horasAtras(1), actor: "Rafa Carrión", accion: "inicio_sesion", detalle: "Inicio de sesión en el panel" },
  { id: 2, fecha: horasAtras(3), actor: "Valeria Porcayo", accion: "reporte_aprobado", detalle: "Reporte #1013 · +52 55 1234 5678" },
  { id: 3, fecha: horasAtras(6), actor: "Valeria Porcayo", accion: "reporte_rechazado", detalle: "Reporte #1012 · Las evidencias no muestran el contacto reportado." },
  { id: 4, fecha: horasAtras(8), actor: "Rafa Carrión", accion: "usuario_suspendido", detalle: "Carlos Ruiz (cruiz@hotmail.com) · spam de reportes" },
  { id: 5, fecha: horasAtras(22), actor: "Valeria Porcayo", accion: "reporte_aprobado", detalle: "Reporte #1010 · https://sat-devoluciones.info" },
  { id: 6, fecha: horasAtras(26), actor: "Rafa Carrión", accion: "rol_cambiado", detalle: "Laura Ramírez: usuario → SSC" },
  { id: 7, fecha: horasAtras(30), actor: "Valeria Porcayo", accion: "reporte_aprobado", detalle: "Reporte #1009 · soporte@banco-mx-seguro.com" },
  { id: 8, fecha: horasAtras(45), actor: "Valeria Porcayo", accion: "reporte_rechazado", detalle: "Reporte #1008 · Reporte duplicado del mismo usuario." },
  { id: 9, fecha: horasAtras(50), actor: "Valeria Porcayo", accion: "inicio_sesion", detalle: "Inicio de sesión en el panel" },
  { id: 10, fecha: horasAtras(70), actor: "Rafa Carrión", accion: "usuario_reactivado", detalle: "Daniela Vega (dani.vega@gmail.com)" },
  { id: 11, fecha: horasAtras(96), actor: "Valeria Porcayo", accion: "reporte_aprobado", detalle: "Reporte #1006 · +52 33 9876 5432" },
  { id: 12, fecha: horasAtras(120), actor: "Valeria Porcayo", accion: "reporte_aprobado", detalle: "Reporte #1005 · https://bbva-mx-acceso.com" },
];

