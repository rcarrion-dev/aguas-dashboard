"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRightIcon } from "lucide-react";
import {
  Antiguedad,
  ContactoIcono,
  OrdenToggle,
  ordenarPorFecha,
  type Orden,
} from "./reporte-ui";
import type { Reporte } from "@/lib/types";

// Lista corta de pendientes en el Resumen. Clic → abre el reporte en la página de Reportes.
export function PendientesLista({ reportes }: { reportes: Reporte[] }) {
  const [orden, setOrden] = useState<Orden>("nuevos");
  const lista = ordenarPorFecha(reportes, orden).slice(0, 6);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">Pendientes por revisar</h2>
        <OrdenToggle orden={orden} onChange={setOrden} />
      </div>
      {lista.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          No hay reportes pendientes.
        </p>
      ) : (
        <ul className="divide-y">
          {lista.map((r) => (
            <li key={r.id}>
              <Link
                href={`/reportes?id=${r.id}`}
                className="-mx-2 flex items-center gap-3 rounded-md px-2 py-2.5 transition-colors hover:bg-muted"
              >
                <ContactoIcono tipo={r.tipoContacto} />
                <span className="min-w-0 flex-1 truncate text-sm font-medium">
                  {r.contacto}
                </span>
                <Antiguedad fecha={r.fechaCreacion} pendiente />
                <ChevronRightIcon className="size-4 text-muted-foreground" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      )}
      <Link href="/reportes" className="text-sm font-medium text-aguas-azul hover:underline">
        Ver todos los pendientes
      </Link>
    </div>
  );
}
