// DATOS DE PRUEBA (V1)
// Todo esto se reemplaza por llamadas al backend en V2–V5.
// Las fechas son relativas a AHORA para que los "hace X horas" siempre se vean bien.

import type {
  EntradaBitacora,
  EstadoReporte,
  PuntoSerie,
  Reporte,
  Usuario,
} from "./types";

// Fecha fija de referencia: así el servidor y el navegador calculan lo mismo.
export const AHORA = new Date("2026-10-08T12:00:00-06:00");

const horasAtras = (h: number) =>
  new Date(AHORA.getTime() - h * 3_600_000).toISOString();

export const usuarios: Usuario[] = [
  { id: 1, nombre: "Rafa Carrión", correo: "rafa@aguas.mx", rol: "admin", activo: true, fechaRegistro: horasAtras(24 * 60), totalReportes: 0 },
  { id: 2, nombre: "Valeria Porcayo", correo: "vale@aguas.mx", rol: "moderador", activo: true, fechaRegistro: horasAtras(24 * 58), totalReportes: 0 },
  { id: 3, nombre: "Ituriel Sáenz", correo: "ituriel@aguas.mx", rol: "moderador", activo: true, fechaRegistro: horasAtras(24 * 58), totalReportes: 0 },
  { id: 4, nombre: "María López", correo: "maria.lopez@gmail.com", rol: "usuario", activo: true, fechaRegistro: horasAtras(24 * 40), totalReportes: 6 },
  { id: 5, nombre: "Jorge Hernández", correo: "jorge.hdz@outlook.com", rol: "usuario", activo: true, fechaRegistro: horasAtras(24 * 35), totalReportes: 4 },
  { id: 6, nombre: "Ana Torres", correo: "ana.torres@yahoo.com", rol: "usuario", activo: true, fechaRegistro: horasAtras(24 * 30), totalReportes: 5 },
  { id: 7, nombre: "Luis Ramírez", correo: "luisr@gmail.com", rol: "usuario", activo: true, fechaRegistro: horasAtras(24 * 22), totalReportes: 3 },
  { id: 8, nombre: "Sofía Méndez", correo: "sofi.mendez@gmail.com", rol: "usuario", activo: true, fechaRegistro: horasAtras(24 * 18), totalReportes: 4 },
  { id: 9, nombre: "Carlos Ruiz", correo: "cruiz@hotmail.com", rol: "usuario", activo: false, fechaRegistro: horasAtras(24 * 15), totalReportes: 9 },
  { id: 10, nombre: "Daniela Vega", correo: "dani.vega@gmail.com", rol: "usuario", activo: true, fechaRegistro: horasAtras(24 * 9), totalReportes: 3 },
];

// [contacto, tipo, descripción]
const casos: [string, Reporte["tipoContacto"], string | null][] = [
  ["+52 55 1234 5678", "telefono", "Me llegó un SMS diciendo que mi paquete estaba retenido en aduana y que pagara $89 en un link."],
  ["soporte@banco-mx-seguro.com", "correo", "Correo que se hace pasar por mi banco pidiendo 'verificar' mi cuenta con un enlace."],
  ["+52 81 2345 6789", "telefono", "Me escribieron por WhatsApp diciendo que gané un premio y pedían mis datos de tarjeta."],
  ["https://sat-devoluciones.info", "url", "Página falsa del SAT que promete devolución de impuestos y pide la e.firma."],
  ["+52 55 1234 5678", "telefono", "Mismo número, ahora llamada: dicen ser de paquetería y que debo pagar envío."],
  ["notificaciones@cfe-pagos.net", "correo", null],
  ["+52 33 9876 5432", "telefono", "Se hicieron pasar por mi hijo con un número nuevo pidiendo un depósito urgente."],
  ["https://bbva-mx-acceso.com", "url", "Clon de la página del banco, me llegó el link por SMS."],
  ["+52 55 1234 5678", "telefono", "SMS de 'aduana' otra vez, con otro link acortado."],
  ["premios@telcel-promo.mx", "correo", "Correo de supuesta promoción de Telcel pidiendo pagar 'impuestos del premio'."],
  ["+52 81 2345 6789", "telefono", "Mensaje de WhatsApp con el mismo cuento del premio."],
  ["+52 55 4455 6677", "telefono", "Llamada de 'Mercado Libre' diciendo que hubo una compra no reconocida."],
  ["https://mercadolibre-reembolsos.store", "url", null],
  ["soporte@banco-mx-seguro.com", "correo", "Mismo remitente, ahora dice que mi cuenta será bloqueada en 24 h."],
  ["+52 222 333 4455", "telefono", "Ofrecían un préstamo inmediato a cambio de un 'pago de apertura'."],
  ["+52 33 9876 5432", "telefono", "El mismo número del 'hijo' le escribió también a mi mamá."],
  ["citas@imss-tramites.org", "correo", "Correo del 'IMSS' para agendar cita con un formulario que pide CURP y tarjeta."],
  ["+52 55 1234 5678", "telefono", "Paquete retenido, link nuevo."],
  ["https://sat-devoluciones.info", "url", "Me llegó por correo, misma página del SAT."],
  ["+52 664 111 2233", "telefono", "Se presentan como de Banco Azteca y piden el código que me llegó por SMS."],
  ["+52 81 2345 6789", "telefono", null],
  ["https://netflix-pago-pendiente.com", "url", "Dice que mi suscripción se canceló y pide actualizar la tarjeta."],
  ["+52 55 4455 6677", "telefono", "Otra vez 'Mercado Libre', ahora me mandaron un link para 'cancelar la compra'."],
  ["+52 999 888 7766", "telefono", "Oferta de trabajo desde casa que pide pagar un 'kit de inicio'."],
];

// Horas atrás de cada reporte y su estado
const tiempos: [number, EstadoReporte][] = [
  [2, "pendiente"], [5, "pendiente"], [9, "pendiente"], [14, "pendiente"],
  [20, "pendiente"], [27, "pendiente"], [33, "pendiente"], [49, "pendiente"],
  [61, "pendiente"], [80, "pendiente"], [96, "verificado"], [100, "verificado"],
  [110, "rechazado"], [118, "verificado"], [130, "verificado"], [142, "verificado"],
  [150, "rechazado"], [160, "verificado"], [170, "verificado"], [182, "verificado"],
  [190, "rechazado"], [200, "verificado"], [215, "verificado"], [230, "verificado"],
];

const reportantes = usuarios.filter((u) => u.rol === "usuario");
const moderadores = ["Valeria Porcayo", "Ituriel Sáenz", "Rafa Carrión"];
const motivosRechazo = [
  "Las evidencias no muestran el contacto reportado.",
  "Reporte duplicado del mismo usuario.",
  "No hay indicios de fraude en la evidencia.",
];

export const reportes: Reporte[] = casos.map(([contacto, tipoContacto, descripcion], i) => {
  const [horas, estado] = tiempos[i];
  const autor = reportantes[i % reportantes.length];
  const nEvidencias = (i % 3) + 1;
  const evidencias = Array.from({ length: nEvidencias }, (_, j) => ({
    id: i * 10 + j,
    nombreArchivo: j === 2 ? `evidencia-${i + 1}-${j + 1}.pdf` : `captura-${i + 1}-${j + 1}.jpg`,
    tipo: (j === 2 ? "pdf" : "imagen") as "pdf" | "imagen",
    url: "",
    principal: j === 0,
  }));
  return {
    id: 1000 + casos.length - i,
    contacto,
    tipoContacto,
    descripcion,
    estado,
    fechaCreacion: horasAtras(horas),
    idUsuario: autor.id,
    nombreUsuario: autor.nombre,
    evidencias,
    revision:
      estado === "pendiente"
        ? undefined
        : {
            moderador: moderadores[i % moderadores.length],
            fecha: horasAtras(horas - 4 - (i % 5)),
            motivo: estado === "rechazado" ? motivosRechazo[i % motivosRechazo.length] : null,
          },
  };
});

// Reportes recibidos por día, últimos 30 días (para la gráfica del Resumen)
const conteos = [6, 9, 7, 11, 8, 5, 4, 10, 12, 9, 14, 11, 7, 6, 13, 15, 12, 10, 16, 14, 9, 8, 17, 19, 15, 13, 18, 21, 16, 10];
export const serieReportesPorDia: PuntoSerie[] = conteos.map((total, i) => ({
  fecha: horasAtras(24 * (conteos.length - 1 - i)),
  total,
}));

export const kpis = {
  pendientes: reportes.filter((r) => r.estado === "pendiente").length,
  aprobados7d: 48,
  rechazados7d: 9,
  horasPromedioRevision: 5.2,
};

export const bitacora: EntradaBitacora[] = [
  { id: 1, fecha: horasAtras(1), actor: "Rafa Carrión", accion: "inicio_sesion", detalle: "Inicio de sesión en el panel" },
  { id: 2, fecha: horasAtras(3), actor: "Valeria Porcayo", accion: "reporte_aprobado", detalle: "Reporte #1013 · +52 55 1234 5678" },
  { id: 3, fecha: horasAtras(6), actor: "Ituriel Sáenz", accion: "reporte_rechazado", detalle: "Reporte #1012 · Las evidencias no muestran el contacto reportado." },
  { id: 4, fecha: horasAtras(8), actor: "Rafa Carrión", accion: "usuario_suspendido", detalle: "Carlos Ruiz (cruiz@hotmail.com) · spam de reportes" },
  { id: 5, fecha: horasAtras(22), actor: "Valeria Porcayo", accion: "reporte_aprobado", detalle: "Reporte #1010 · https://sat-devoluciones.info" },
  { id: 6, fecha: horasAtras(26), actor: "Rafa Carrión", accion: "rol_cambiado", detalle: "Ituriel Sáenz: usuario → moderador" },
  { id: 7, fecha: horasAtras(30), actor: "Ituriel Sáenz", accion: "reporte_aprobado", detalle: "Reporte #1009 · soporte@banco-mx-seguro.com" },
  { id: 8, fecha: horasAtras(45), actor: "Valeria Porcayo", accion: "reporte_rechazado", detalle: "Reporte #1008 · Reporte duplicado del mismo usuario." },
  { id: 9, fecha: horasAtras(50), actor: "Ituriel Sáenz", accion: "inicio_sesion", detalle: "Inicio de sesión en el panel" },
  { id: 10, fecha: horasAtras(70), actor: "Rafa Carrión", accion: "usuario_reactivado", detalle: "Daniela Vega (dani.vega@gmail.com)" },
  { id: 11, fecha: horasAtras(96), actor: "Valeria Porcayo", accion: "reporte_aprobado", detalle: "Reporte #1006 · +52 33 9876 5432" },
  { id: 12, fecha: horasAtras(120), actor: "Ituriel Sáenz", accion: "reporte_aprobado", detalle: "Reporte #1005 · https://bbva-mx-acceso.com" },
];

// Por ahora el usuario "con sesión" es fijo. En V2 viene del JWT.
export const usuarioActual = usuarios[0];
