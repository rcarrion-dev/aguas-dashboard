// Helpers de formato. Siempre en hora de CDMX para que el servidor y el
// navegador muestren exactamente lo mismo (si no, React marca error de hidratación).

import { AHORA } from "./mock-data";

const ZONA = "America/Mexico_City";

// En V2 esto pasa a ser `new Date()`; por ahora usamos la fecha fija de los datos de prueba.
export const ahora = () => AHORA;

export function fechaCorta(iso: string) {
  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "short",
    timeZone: ZONA,
  }).format(new Date(iso));
}

export function fechaHora(iso: string) {
  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: ZONA,
  }).format(new Date(iso));
}

export function horasDesde(iso: string) {
  return (ahora().getTime() - new Date(iso).getTime()) / 3_600_000;
}

export function hace(iso: string) {
  const h = horasDesde(iso);
  if (h < 1) return "hace un momento";
  if (h < 24) return `hace ${Math.floor(h)} h`;
  const d = Math.floor(h / 24);
  return d === 1 ? "hace 1 día" : `hace ${d} días`;
}

// Qué tan urgente es un pendiente: >24 h amarillo, >72 h rojo
export type Antiguedad = "normal" | "atencion" | "urgente";

export function antiguedad(iso: string): Antiguedad {
  const h = horasDesde(iso);
  if (h > 72) return "urgente";
  if (h > 24) return "atencion";
  return "normal";
}
