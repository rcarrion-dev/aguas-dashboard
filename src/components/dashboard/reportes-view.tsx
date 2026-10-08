"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FileTextIcon,
  ImageIcon,
  SearchIcon,
  XIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Antiguedad,
  ContactoIcono,
  EstadoBadge,
  OrdenToggle,
  ordenarPorFecha,
  type Orden,
} from "./reporte-ui";
import { fechaHora, ahora } from "@/lib/format";
import { cn } from "@/lib/utils";
import { usuarioActual } from "@/lib/mock-data";
import type { EstadoReporte, Reporte } from "@/lib/types";

type Pestana = EstadoReporte | "todos";

const pestanas: { valor: Pestana; texto: string }[] = [
  { valor: "pendiente", texto: "Pendientes" },
  { valor: "verificado", texto: "Verificados" },
  { valor: "rechazado", texto: "Rechazados" },
  { valor: "todos", texto: "Todos" },
];

const POR_PAGINA = 10;

export function ReportesView({ iniciales }: { iniciales: Reporte[] }) {
  const params = useSearchParams();
  const qInicial = params.get("q") ?? "";
  const idInicial = Number(params.get("id")) || null;

  // V1: los cambios viven en memoria. En V3 aprobar/rechazar llama al backend.
  const [reportes, setReportes] = useState(iniciales);
  // Si vienes de la búsqueda global, buscamos en todos los estados
  const [pestana, setPestana] = useState<Pestana>(qInicial ? "todos" : "pendiente");
  const [busqueda, setBusqueda] = useState(qInicial);
  const [orden, setOrden] = useState<Orden>("nuevos");
  const [pagina, setPagina] = useState(1);
  const [seleccionadoId, setSeleccionadoId] = useState<number | null>(idInicial);

  const conteos = useMemo(() => {
    const c: Record<Pestana, number> = { pendiente: 0, verificado: 0, rechazado: 0, todos: reportes.length };
    reportes.forEach((r) => c[r.estado]++);
    return c;
  }, [reportes]);

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase().replace(/\s+/g, "");
    const base = reportes.filter(
      (r) =>
        (pestana === "todos" || r.estado === pestana) &&
        (!q || r.contacto.toLowerCase().replace(/\s+/g, "").includes(q))
    );
    return ordenarPorFecha(base, orden);
  }, [reportes, pestana, busqueda, orden]);

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const paginaActual = Math.min(pagina, totalPaginas);
  const visibles = filtrados.slice((paginaActual - 1) * POR_PAGINA, paginaActual * POR_PAGINA);

  const seleccionado = reportes.find((r) => r.id === seleccionadoId) ?? null;

  function moderar(id: number, estado: "verificado" | "rechazado", motivo: string | null) {
    setReportes((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              estado,
              revision: { moderador: usuarioActual.nombre, fecha: ahora().toISOString(), motivo },
            }
          : r
      )
    );
    toast.success(estado === "verificado" ? `Reporte #${id} aprobado` : `Reporte #${id} rechazado`);

    // Para moderar rápido: pasamos solo al siguiente pendiente de la lista
    const siguiente = filtrados.find((r) => r.estado === "pendiente" && r.id !== id);
    setSeleccionadoId(pestana === "pendiente" && siguiente ? siguiente.id : null);
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4">
      {/* Pestañas por estado + búsqueda + orden */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div role="tablist" aria-label="Estado del reporte" className="flex gap-1 overflow-x-auto">
          {pestanas.map((p) => (
            <button
              key={p.valor}
              role="tab"
              aria-selected={pestana === p.valor}
              onClick={() => {
                setPestana(p.valor);
                setPagina(1);
              }}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors",
                pestana === p.valor
                  ? "bg-aguas-azul text-white"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {p.texto}
              <span
                className={cn(
                  "rounded-full px-1.5 text-xs tabular-nums",
                  pestana === p.valor
                    ? "bg-white/20"
                    : p.valor === "pendiente" && conteos.pendiente > 0
                      ? "bg-aguas-amarillo text-[#2a1a00]"
                      : "bg-muted"
                )}
              >
                {conteos[p.valor]}
              </span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <label className="relative block flex-1 lg:w-64 lg:flex-none">
            <span className="sr-only">Buscar por número, correo o URL</span>
            <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);
                setPagina(1);
              }}
              placeholder="Número, correo o URL"
              className="h-9 bg-card pl-8"
            />
          </label>
          <OrdenToggle orden={orden} onChange={setOrden} />
        </div>
      </div>

      <Card className="py-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-4">Contacto reportado</TableHead>
              <TableHead className="hidden md:table-cell">Descripción</TableHead>
              <TableHead className="hidden lg:table-cell">Reportado por</TableHead>
              <TableHead>Recibido</TableHead>
              <TableHead className="pr-4">Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibles.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                  {busqueda
                    ? "Ningún reporte coincide con tu búsqueda."
                    : pestana === "pendiente"
                      ? "No hay reportes pendientes. ¡Al día!"
                      : "No hay reportes en esta sección."}
                </TableCell>
              </TableRow>
            )}
            {visibles.map((r) => (
              <TableRow
                key={r.id}
                onClick={() => setSeleccionadoId(r.id)}
                className={cn("cursor-pointer", r.id === seleccionadoId && "bg-accent")}
              >
                <TableCell className="pl-4">
                  <div className="flex items-center gap-2.5">
                    <ContactoIcono tipo={r.tipoContacto} />
                    <div className="min-w-0">
                      <button
                        type="button"
                        className="max-w-56 truncate text-left font-medium hover:underline focus-visible:underline focus-visible:outline-none"
                      >
                        {r.contacto}
                      </button>
                      <p className="text-xs text-muted-foreground">#{r.id}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden max-w-80 md:table-cell">
                  <p className="truncate text-muted-foreground">
                    {r.descripcion ?? <span className="italic">Sin descripción</span>}
                  </p>
                </TableCell>
                <TableCell className="hidden text-muted-foreground lg:table-cell">
                  {r.nombreUsuario}
                </TableCell>
                <TableCell>
                  <Antiguedad fecha={r.fechaCreacion} pendiente={r.estado === "pendiente"} />
                </TableCell>
                <TableCell className="pr-4">
                  <EstadoBadge estado={r.estado} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filtrados.length > POR_PAGINA && (
          <div className="flex items-center justify-between border-t px-4 py-2.5 text-sm text-muted-foreground">
            <span>
              {(paginaActual - 1) * POR_PAGINA + 1}–{Math.min(paginaActual * POR_PAGINA, filtrados.length)} de{" "}
              {filtrados.length}
            </span>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="icon-sm"
                aria-label="Página anterior"
                disabled={paginaActual === 1}
                onClick={() => setPagina(paginaActual - 1)}
              >
                <ChevronLeftIcon />
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                aria-label="Página siguiente"
                disabled={paginaActual === totalPaginas}
                onClick={() => setPagina(paginaActual + 1)}
              >
                <ChevronRightIcon />
              </Button>
            </div>
          </div>
        )}
      </Card>

      <DetalleReporte
        reporte={seleccionado}
        todos={reportes}
        onCerrar={() => setSeleccionadoId(null)}
        onSeleccionar={setSeleccionadoId}
        onModerar={moderar}
      />
    </div>
  );
}

// Panel lateral con todo lo necesario para decidir
function DetalleReporte({
  reporte,
  todos,
  onCerrar,
  onSeleccionar,
  onModerar,
}: {
  reporte: Reporte | null;
  todos: Reporte[];
  onCerrar: () => void;
  onSeleccionar: (id: number) => void;
  onModerar: (id: number, estado: "verificado" | "rechazado", motivo: string | null) => void;
}) {
  const [rechazando, setRechazando] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [errorMotivo, setErrorMotivo] = useState(false);
  const [idAnterior, setIdAnterior] = useState(reporte?.id);

  // Al cambiar de reporte se limpia el formulario de rechazo
  if (reporte?.id !== idAnterior) {
    setIdAnterior(reporte?.id);
    setRechazando(false);
    setMotivo("");
    setErrorMotivo(false);
  }

  const otros = reporte
    ? ordenarPorFecha(
        todos.filter((r) => r.contacto === reporte.contacto && r.id !== reporte.id),
        "nuevos"
      )
    : [];

  return (
    <Sheet open={reporte !== null} onOpenChange={(abierto) => !abierto && onCerrar()}>
      <SheetContent className="gap-0 data-[side=right]:w-full data-[side=right]:sm:max-w-xl">
        {reporte && (
          <>
            <SheetHeader className="border-b pr-12">
              <div className="flex items-center gap-2">
                <EstadoBadge estado={reporte.estado} />
                <span className="text-xs text-muted-foreground">Reporte #{reporte.id}</span>
              </div>
              <SheetTitle className="flex items-center gap-2 text-lg break-all">
                <ContactoIcono tipo={reporte.tipoContacto} className="size-5" />
                {reporte.contacto}
              </SheetTitle>
              <SheetDescription>
                Enviado por {reporte.nombreUsuario} · {fechaHora(reporte.fechaCreacion)}
              </SheetDescription>
            </SheetHeader>

            <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-4">
              {otros.length > 0 && (
                <div className="rounded-lg bg-aguas-amarillo-50 p-3 ring-1 ring-aguas-amarillo/40 ring-inset">
                  <p className="text-sm font-semibold text-[#7a5200]">
                    {otros.length === 1
                      ? "Hay 1 reporte más de este contacto"
                      : `Hay ${otros.length} reportes más de este contacto`}
                  </p>
                  <ul className="mt-2 flex flex-col gap-1">
                    {otros.map((o) => (
                      <li key={o.id}>
                        <button
                          type="button"
                          onClick={() => onSeleccionar(o.id)}
                          className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-1 text-left text-sm hover:bg-white/70"
                        >
                          <span className="text-[#5c3d00]">
                            #{o.id} · {o.nombreUsuario}
                          </span>
                          <EstadoBadge estado={o.estado} />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <section>
                <h3 className="mb-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Descripción
                </h3>
                <p className="text-sm leading-relaxed">
                  {reporte.descripcion ?? (
                    <span className="text-muted-foreground italic">El usuario no agregó descripción.</span>
                  )}
                </p>
              </section>

              <section>
                <h3 className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Evidencias ({reporte.evidencias.length})
                </h3>
                {/* V1: placeholders. En V3 se muestran las imágenes reales y el PDF embebido */}
                <div className="grid grid-cols-3 gap-2">
                  {reporte.evidencias.map((e) => (
                    <div
                      key={e.id}
                      className="flex aspect-[3/4] flex-col items-center justify-center gap-2 rounded-lg bg-muted p-2 text-center ring-1 ring-border"
                    >
                      {e.tipo === "pdf" ? (
                        <FileTextIcon className="size-6 text-aguas-rojo" aria-hidden="true" />
                      ) : (
                        <ImageIcon className="size-6 text-muted-foreground" aria-hidden="true" />
                      )}
                      <span className="line-clamp-2 text-[11px] break-all text-muted-foreground">
                        {e.nombreArchivo}
                      </span>
                      {e.principal && (
                        <span className="rounded-full bg-aguas-azul px-1.5 text-[10px] font-medium text-white">
                          Principal
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              {reporte.revision && (
                <section className="rounded-lg bg-muted p-3 text-sm">
                  <p>
                    <span className="font-medium">
                      {reporte.estado === "verificado" ? "Aprobado" : "Rechazado"}
                    </span>{" "}
                    por {reporte.revision.moderador} · {fechaHora(reporte.revision.fecha)}
                  </p>
                  {reporte.revision.motivo && (
                    <p className="mt-1 text-muted-foreground">Motivo: {reporte.revision.motivo}</p>
                  )}
                </section>
              )}
            </div>

            {reporte.estado === "pendiente" && (
              <SheetFooter className="border-t bg-card">
                {rechazando ? (
                  <form
                    className="flex flex-col gap-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!motivo.trim()) {
                        setErrorMotivo(true);
                        return;
                      }
                      onModerar(reporte.id, "rechazado", motivo.trim());
                    }}
                  >
                    <label htmlFor="motivo" className="text-sm font-medium">
                      Motivo del rechazo
                      <span className="ml-1 font-normal text-muted-foreground">
                        (se le envía al usuario)
                      </span>
                    </label>
                    <textarea
                      id="motivo"
                      autoFocus
                      rows={3}
                      value={motivo}
                      onChange={(e) => {
                        setMotivo(e.target.value);
                        setErrorMotivo(false);
                      }}
                      placeholder="Las evidencias no muestran el número reportado."
                      aria-invalid={errorMotivo}
                      className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40 aria-invalid:border-destructive"
                    />
                    {errorMotivo && (
                      <p className="text-xs text-destructive">Escribe un motivo para poder rechazar.</p>
                    )}
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="ghost" onClick={() => setRechazando(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit" className="bg-aguas-rojo text-white hover:bg-aguas-rojo/90">
                        Confirmar rechazo
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="lg" onClick={() => setRechazando(true)}>
                      <XIcon /> Rechazar
                    </Button>
                    <Button size="lg" onClick={() => onModerar(reporte.id, "verificado", null)}>
                      <CheckIcon /> Aprobar
                    </Button>
                  </div>
                )}
              </SheetFooter>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
