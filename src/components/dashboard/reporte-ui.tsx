// Piezas chicas que se repiten en Resumen y Reportes.

import { GlobeIcon, PhoneIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { antiguedad, hace } from "@/lib/format";
import type { EstadoReporte, Reporte, TipoContacto } from "@/lib/types";

const estilosEstado: Record<EstadoReporte, { texto: string; clase: string }> = {
  pendiente: {
    texto: "Pendiente",
    clase: "bg-aguas-ambar-50 text-aguas-ambar-texto ring-aguas-ambar/40",
  },
  verificado: {
    texto: "Verificado",
    clase: "bg-aguas-verde-50 text-aguas-verde ring-aguas-verde/30",
  },
  rechazado: {
    texto: "Rechazado",
    clase: "bg-aguas-rojo-50 text-aguas-rojo ring-aguas-rojo/30",
  },
};

export function EstadoBadge({ estado }: { estado: EstadoReporte }) {
  const e = estilosEstado[estado];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
        e.clase
      )}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {e.texto}
    </span>
  );
}

const iconos = { telefono: PhoneIcon, url: GlobeIcon };

export function ContactoIcono({
  tipo,
  className,
}: {
  tipo: TipoContacto;
  className?: string;
}) {
  const Icono = iconos[tipo];
  return <Icono aria-hidden="true" className={cn("size-4 text-muted-foreground", className)} />;
}

// "hace 2 días" que se pinta amarillo (>24 h) o rojo (>72 h) si sigue pendiente
export function Antiguedad({
  fecha,
  pendiente,
}: {
  fecha: string;
  pendiente: boolean;
}) {
  const nivel = pendiente ? antiguedad(fecha) : "normal";
  return (
    // suppressHydrationWarning: el servidor y el navegador calculan "hace X"
    // con milisegundos de diferencia; si justo cambia de hora no es un error.
    <span
      suppressHydrationWarning
      className={cn(
        "text-sm whitespace-nowrap",
        nivel === "normal" && "text-muted-foreground",
        nivel === "atencion" && "font-medium text-aguas-ambar-texto",
        nivel === "urgente" && "font-medium text-aguas-rojo"
      )}
      title={
        nivel === "urgente"
          ? "Lleva más de 72 h sin revisar"
          : nivel === "atencion"
            ? "Lleva más de 24 h sin revisar"
            : undefined
      }
    >
      {hace(fecha)}
    </span>
  );
}

export type Orden = "nuevos" | "viejos";

// Selector "Más nuevos / Más viejos" (default: nuevos)
export function OrdenToggle({
  orden,
  onChange,
}: {
  orden: Orden;
  onChange: (o: Orden) => void;
}) {
  const opciones: { valor: Orden; texto: string }[] = [
    { valor: "nuevos", texto: "Más nuevos" },
    { valor: "viejos", texto: "Más viejos" },
  ];
  return (
    <div
      role="radiogroup"
      aria-label="Ordenar por fecha"
      className="inline-flex rounded-lg bg-muted p-0.5"
    >
      {opciones.map((o) => (
        <button
          key={o.valor}
          type="button"
          role="radio"
          aria-checked={orden === o.valor}
          onClick={() => onChange(o.valor)}
          className={cn(
            "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
            orden === o.valor
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {o.texto}
        </button>
      ))}
    </div>
  );
}

export function ordenarPorFecha<T extends { fechaCreacion: string }>(
  lista: T[],
  orden: Orden
) {
  return [...lista].sort((a, b) => {
    const diff = new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime();
    return orden === "nuevos" ? diff : -diff;
  });
}

// Para comparar números sin importar espacios, guiones o el +52
const soloDigitos = (t: string) => t.replace(/\D/g, "").slice(-10);
const enlaceNormal = (t: string) =>
  t.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/+$/, "");

// ¿Dos reportes son del mismo estafador? (mismo teléfono o mismo enlace)
export function mismoContacto(a: Reporte, b: Reporte) {
  if (a.telefono && b.telefono) {
    const da = soloDigitos(a.telefono);
    if (da.length >= 7 && da === soloDigitos(b.telefono)) return true;
  }
  if (a.enlace && b.enlace && enlaceNormal(a.enlace) === enlaceNormal(b.enlace)) return true;
  return false;
}

// Texto donde busca el buscador de Reportes
export function textoBuscable(r: Reporte) {
  return [`#${r.id}`, r.telefono, r.telefono && soloDigitos(r.telefono), r.enlace, r.empresa, r.nombreUsuario]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}
