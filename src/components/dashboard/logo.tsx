"use client";

// Logo de Aguas! (paraguas con mango en J). Misma geometría que los SVG de public/marca/.
//  - variante "color": los tres azules del logo, sin divisiones
//  - variante "mono": una sola tinta (toma el color del texto, `currentColor`),
//    con las divisiones y la separación de la J transparentes

import { useId } from "react";
import { cn } from "@/lib/utils";

const DOMO =
  "M20 101 C19 52 55 28 100 28 C145 28 181 52 180 101 Q153.5 83 127 100 Q100 84 73 100 Q46.5 83 20 101 Z";
const COSTILLAS = "M100 28 Q70 52 73 100 M100 28 Q130 52 127 100";
const JOTA = "M100 84 V140 A12.5 12.5 0 0 1 75 140";
const PERILLA = "M91.5 27 A8.5 8.5 0 0 1 108.5 27 Z";
const ESCALA = "translate(100 101) scale(0.9) translate(-100 -101)";

export function LogoIcono({
  variante = "color",
  className,
  titulo,
}: {
  variante?: "color" | "mono";
  className?: string;
  /** Si se pasa, el logo se anuncia a lectores de pantalla; si no, es decorativo. */
  titulo?: string;
}) {
  // Los ids de las máscaras deben ser únicos aunque haya varios logos en la página.
  const id = useId().replace(/:/g, "");
  const a11y = titulo
    ? { role: "img" as const, "aria-label": titulo }
    : { "aria-hidden": true as const };

  if (variante === "color") {
    return (
      <svg viewBox="22 14 156 164" className={cn("shrink-0", className)} {...a11y}>
        <defs>
          <mask id={`${id}-silueta`} maskUnits="userSpaceOnUse" x="0" y="0" width="200" height="200">
            <path d={DOMO} fill="#fff" stroke="#fff" strokeWidth="5" strokeLinejoin="round" transform={ESCALA} />
          </mask>
        </defs>
        <path d={JOTA} fill="none" stroke="var(--aguas-marino)" strokeWidth="8.5" strokeLinecap="round" />
        <g mask={`url(#${id}-silueta)`}>
          <g transform={ESCALA}>
            <rect x="0" y="0" width="200" height="150" fill="var(--aguas-marino)" />
            <path d="M100 0 L100 28 Q70 52 73 100 L73 150 L200 150 L200 0 Z" fill="var(--aguas-vivo)" />
            <path d="M100 0 L100 28 Q130 52 127 100 L127 150 L200 150 L200 0 Z" fill="var(--aguas-celeste)" />
          </g>
        </g>
        <path d={PERILLA} fill="var(--aguas-vivo)" transform={ESCALA} />
      </svg>
    );
  }

  return (
    <svg viewBox="22 14 156 164" className={cn("shrink-0", className)} {...a11y}>
      <defs>
        <mask id={`${id}-cortes`} maskUnits="userSpaceOnUse" x="0" y="0" width="200" height="200">
          <rect width="200" height="200" fill="#fff" />
          <path d={COSTILLAS} fill="none" stroke="#000" strokeWidth="2.4" strokeLinecap="round" transform={ESCALA} />
        </mask>
        <mask id={`${id}-jota`} maskUnits="userSpaceOnUse" x="0" y="0" width="200" height="200">
          <rect width="200" height="200" fill="#fff" />
          <path d={DOMO} fill="#000" stroke="#000" strokeWidth="10" strokeLinejoin="round" transform={ESCALA} />
        </mask>
      </defs>
      <path d={JOTA} fill="none" stroke="currentColor" strokeWidth="8.5" strokeLinecap="round" mask={`url(#${id}-jota)`} />
      <g mask={`url(#${id}-cortes)`}>
        <path d={DOMO} fill="currentColor" stroke="currentColor" strokeWidth="5" strokeLinejoin="round" transform={ESCALA} />
      </g>
      <path d={PERILLA} fill="currentColor" transform={ESCALA} />
    </svg>
  );
}

// Para la sidebar: paraguas blanco + "AGUAS". Con la sidebar colapsada el texto se oculta.
export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <LogoIcono variante="mono" className="size-8" />
      <span className="text-lg font-bold tracking-[0.18em] group-data-[collapsible=icon]:hidden">
        AGUAS
      </span>
    </div>
  );
}

// Para el login: logo a color con el nombre abajo.
export function LogoCompleto({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col items-center gap-2 text-aguas-marino", className)}>
      <LogoIcono variante="color" className="size-20" titulo="Aguas" />
      <span className="text-2xl font-bold tracking-[0.22em]" aria-hidden="true">
        AGUAS
      </span>
    </div>
  );
}
