"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2Icon,
  LogInIcon,
  ShieldIcon,
  UserCheckIcon,
  UserXIcon,
  XCircleIcon,
  type LucideIcon,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fechaHora } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AccionBitacora, EntradaBitacora } from "@/lib/types";

const acciones: Record<AccionBitacora, { texto: string; icono: LucideIcon; clase: string }> = {
  reporte_aprobado: { texto: "Aprobó reporte", icono: CheckCircle2Icon, clase: "text-aguas-verde" },
  reporte_rechazado: { texto: "Rechazó reporte", icono: XCircleIcon, clase: "text-aguas-rojo" },
  usuario_suspendido: { texto: "Suspendió usuario", icono: UserXIcon, clase: "text-aguas-rojo" },
  usuario_reactivado: { texto: "Reactivó usuario", icono: UserCheckIcon, clase: "text-aguas-verde" },
  rol_cambiado: { texto: "Cambió rol", icono: ShieldIcon, clase: "text-aguas-azul" },
  inicio_sesion: { texto: "Inició sesión", icono: LogInIcon, clase: "text-muted-foreground" },
};

const selectClase =
  "h-9 rounded-md border border-input bg-card px-2.5 text-sm text-foreground";

// Solo lectura: nadie puede editar ni borrar la bitácora.
export function BitacoraView({ entradas }: { entradas: EntradaBitacora[] }) {
  const [actor, setActor] = useState("todos");
  const [accion, setAccion] = useState<AccionBitacora | "todas">("todas");

  const actores = useMemo(() => [...new Set(entradas.map((e) => e.actor))].sort(), [entradas]);

  const filtradas = entradas.filter(
    (e) => (actor === "todos" || e.actor === actor) && (accion === "todas" || e.accion === accion)
  );

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        <select aria-label="Filtrar por persona" value={actor} onChange={(e) => setActor(e.target.value)} className={selectClase}>
          <option value="todos">Todas las personas</option>
          {actores.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
        <select
          aria-label="Filtrar por acción"
          value={accion}
          onChange={(e) => setAccion(e.target.value as AccionBitacora | "todas")}
          className={selectClase}
        >
          <option value="todas">Todas las acciones</option>
          {Object.entries(acciones).map(([valor, a]) => (
            <option key={valor} value={valor}>
              {a.texto}
            </option>
          ))}
        </select>
      </div>

      <Card className="py-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-4">Fecha</TableHead>
              <TableHead>Quién</TableHead>
              <TableHead>Acción</TableHead>
              <TableHead className="pr-4">Detalle</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtradas.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={4} className="py-12 text-center text-muted-foreground">
                  No hay movimientos con esos filtros.
                </TableCell>
              </TableRow>
            )}
            {filtradas.map((e) => {
              const a = acciones[e.accion];
              return (
                <TableRow key={e.id}>
                  <TableCell className="pl-4 whitespace-nowrap text-muted-foreground">
                    {fechaHora(e.fecha)}
                  </TableCell>
                  <TableCell className="font-medium whitespace-nowrap">{e.actor}</TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1.5 whitespace-nowrap">
                      <a.icono className={cn("size-4", a.clase)} aria-hidden="true" />
                      {a.texto}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-md truncate pr-4 text-muted-foreground">{e.detalle}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
