"use client";

import { useEffect, useMemo, useOptimistic, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ExternalLinkIcon,
  FileTextIcon,
  Loader2Icon,
  SearchIcon,
  TriangleAlertIcon,
  XIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
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
  mismoContacto,
  ordenarPorFecha,
  textoBuscable,
  type Orden,
} from "./reporte-ui";
import { cargarRevision, moderarReporte } from "@/app/actions/reportes";
import { fechaHora } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { EstadoReporte, Reporte, Revision } from "@/lib/types";

type Pestana = EstadoReporte | "todos";
type Resultado = "verificado" | "rechazado";

const pestanas: { valor: Pestana; texto: string }[] = [
  { valor: "pendiente", texto: "Pendientes" },
  { valor: "verificado", texto: "Verificados" },
  { valor: "rechazado", texto: "Rechazados" },
  { valor: "todos", texto: "Todos" },
];

const POR_PAGINA = 10;

export function ReportesView({
  iniciales,
  puedeModerar,
}: {
  iniciales: Reporte[];
  /** false para SSC: solo consulta, sin aprobar/rechazar */
  puedeModerar: boolean;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const qInicial = params.get("q") ?? "";
  const idInicial = Number(params.get("id")) || null;

  // La lista viene del servidor. Al aprobar/rechazar la cambiamos al instante
  // (optimista) y, cuando el backend responde, el servidor manda la lista nueva.
  // Si el backend falla, React regresa solo al estado anterior.
  const [reportes, aplicarModeracion] = useOptimistic(
    iniciales,
    (actuales, cambio: { id: number; estado: Resultado }) =>
      actuales.map((r) => (r.id === cambio.id ? { ...r, estado: cambio.estado } : r))
  );
  const [moderando, iniciarModeracion] = useTransition();

  // Si vienes de la búsqueda global, buscamos en todos los estados
  const [pestana, setPestana] = useState<Pestana>(
    !puedeModerar ? "verificado" : qInicial ? "todos" : "pendiente"
  );
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
    const q = busqueda.trim().toLowerCase();
    const base = reportes.filter(
      (r) => (pestana === "todos" || r.estado === pestana) && (!q || textoBuscable(r).includes(q))
    );
    return ordenarPorFecha(base, orden);
  }, [reportes, pestana, busqueda, orden]);

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const paginaActual = Math.min(pagina, totalPaginas);
  const visibles = filtrados.slice((paginaActual - 1) * POR_PAGINA, paginaActual * POR_PAGINA);

  const seleccionado = reportes.find((r) => r.id === seleccionadoId) ?? null;

  function moderar(id: number, estado: Resultado, motivo: string | null) {
    // Para moderar rápido: al terminar pasamos al siguiente pendiente de la lista
    const siguiente = filtrados.find((r) => r.estado === "pendiente" && r.id !== id);

    iniciarModeracion(async () => {
      aplicarModeracion({ id, estado });
      const res = await moderarReporte(id, estado, motivo);
      if (!res.ok) {
        toast.error(res.error);
        // Por si otro admin ya lo había revisado: traemos la lista actualizada
        router.refresh();
        return;
      }
      toast.success(estado === "verificado" ? `Reporte #${id} aprobado` : `Reporte #${id} rechazado`);
      setSeleccionadoId(pestana === "pendiente" && siguiente ? siguiente.id : null);
    });
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4">
      {/* Pestañas por estado + búsqueda + orden */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* SSC solo ve verificados, así que no necesita pestañas */}
        {!puedeModerar ? (
          <p className="text-sm text-muted-foreground">
            {conteos.verificado === 1
              ? "1 reporte verificado para dar seguimiento"
              : `${conteos.verificado} reportes verificados para dar seguimiento`}
          </p>
        ) : (
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
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {p.texto}
                <span
                  className={cn(
                    "rounded-full px-1.5 text-xs tabular-nums",
                    pestana === p.valor
                      ? "bg-primary-foreground/20"
                      : p.valor === "pendiente" && conteos.pendiente > 0
                        ? "bg-aguas-ambar text-[#3b2600]"
                        : "bg-muted"
                  )}
                >
                  {conteos[p.valor]}
                </span>
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2">
          <label className="relative block flex-1 lg:w-64 lg:flex-none">
            <span className="sr-only">Buscar por teléfono, enlace o empresa</span>
            <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);
                setPagina(1);
              }}
              placeholder="Teléfono, enlace o empresa"
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
                    : !puedeModerar
                      ? "Todavía no hay reportes verificados."
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
                        className="block max-w-56 truncate text-left font-medium hover:underline focus-visible:underline focus-visible:outline-none"
                      >
                        {r.contacto}
                      </button>
                      <p className="max-w-56 truncate text-xs text-muted-foreground">
                        #{r.id}
                        {r.empresa && ` · ${r.empresa}`}
                      </p>
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
        moderando={moderando}
        puedeModerar={puedeModerar}
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
  moderando,
  puedeModerar,
}: {
  reporte: Reporte | null;
  todos: Reporte[];
  onCerrar: () => void;
  onSeleccionar: (id: number) => void;
  onModerar: (id: number, estado: Resultado, motivo: string | null) => void;
  moderando: boolean;
  puedeModerar: boolean;
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

  // Quién lo revisó (solo admin; SSC no tiene acceso a la bitácora)
  const idSel = reporte?.id;
  const estadoSel = reporte?.estado;
  const [revision, setRevision] = useState<{ id: number; datos: Revision | null } | null>(null);
  useEffect(() => {
    if (!puedeModerar || idSel === undefined || estadoSel === "pendiente") return;
    let vigente = true;
    cargarRevision(idSel).then((datos) => {
      if (vigente) setRevision({ id: idSel, datos });
    });
    return () => {
      vigente = false;
    };
  }, [puedeModerar, idSel, estadoSel]);
  const revisionCargada = revision?.id === idSel;

  const otros = reporte
    ? ordenarPorFecha(
        todos.filter((r) => r.id !== reporte.id && mismoContacto(r, reporte)),
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
                <ContactoIcono tipo={reporte.tipoContacto} className="size-5 shrink-0" />
                {reporte.contacto}
              </SheetTitle>
              <SheetDescription>
                Enviado por {reporte.nombreUsuario} · {fechaHora(reporte.fechaCreacion)}
              </SheetDescription>
            </SheetHeader>

            <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-4">
              {otros.length > 0 && (
                <div className="rounded-lg bg-aguas-ambar-50 p-3 ring-1 ring-aguas-ambar/40 ring-inset">
                  <p className="text-sm font-semibold text-aguas-ambar-texto">
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
                          className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-1 text-left text-sm hover:bg-background/60"
                        >
                          <span className="text-aguas-ambar-texto">
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
                <Titulo>Datos del estafador</Titulo>
                <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
                  <dt className="text-muted-foreground">Teléfono</dt>
                  <dd className="font-medium">{reporte.telefono ?? <SinDato />}</dd>
                  <dt className="text-muted-foreground">Enlace</dt>
                  <dd className="break-all">
                    {reporte.enlace ? (
                      // A propósito NO es un link: puede ser una página de phishing
                      <span className="font-mono text-[13px]">{reporte.enlace}</span>
                    ) : (
                      <SinDato />
                    )}
                  </dd>
                  <dt className="text-muted-foreground">Empresa</dt>
                  <dd>{reporte.empresa ?? <SinDato texto="No indicó" />}</dd>
                </dl>
                {reporte.enlace && (
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <TriangleAlertIcon className="size-3.5 text-aguas-ambar" aria-hidden="true" />
                    El enlace no se puede abrir desde aquí para evitar entrar a sitios falsos.
                  </p>
                )}
              </section>

              <section>
                <Titulo>Descripción</Titulo>
                <p className="text-sm leading-relaxed whitespace-pre-line">
                  {reporte.descripcion ?? (
                    <span className="text-muted-foreground italic">El usuario no agregó descripción.</span>
                  )}
                </p>
              </section>

              <section>
                <Titulo>Evidencia</Titulo>
                <VistaEvidencia reporte={reporte} />
              </section>

              {puedeModerar && reporte.estado !== "pendiente" && (
                <section className="rounded-lg bg-muted p-3 text-sm">
                  {!revisionCargada ? (
                    <Skeleton className="h-4 w-3/4 bg-foreground/10" />
                  ) : revision?.datos ? (
                    <>
                      <p>
                        <span className="font-medium">
                          {reporte.estado === "verificado" ? "Aprobado" : "Rechazado"}
                        </span>{" "}
                        por {revision.datos.moderador} · {fechaHora(revision.datos.fecha)}
                      </p>
                      {revision.datos.motivo && (
                        <p className="mt-1 text-muted-foreground">Motivo: {revision.datos.motivo}</p>
                      )}
                    </>
                  ) : (
                    <p className="text-muted-foreground">
                      {reporte.estado === "verificado" ? "Aprobado" : "Rechazado"}. No se encontró el
                      registro de quién lo revisó.
                    </p>
                  )}
                </section>
              )}
            </div>

            {puedeModerar && reporte.estado === "pendiente" && (
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
                      placeholder="La evidencia no muestra el número reportado."
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
                      <Button
                        type="submit"
                        disabled={moderando}
                        className="bg-aguas-rojo-fuerte text-white hover:bg-aguas-rojo-fuerte/90"
                      >
                        {moderando && <Loader2Icon className="animate-spin" aria-hidden="true" />}
                        Confirmar rechazo
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="lg"
                      disabled={moderando}
                      onClick={() => setRechazando(true)}
                    >
                      <XIcon /> Rechazar
                    </Button>
                    <Button
                      size="lg"
                      disabled={moderando}
                      onClick={() => onModerar(reporte.id, "verificado", null)}
                    >
                      {moderando ? <Loader2Icon className="animate-spin" aria-hidden="true" /> : <CheckIcon />}
                      Aprobar
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

function Titulo({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
      {children}
    </h3>
  );
}

function SinDato({ texto = "—" }: { texto?: string }) {
  return <span className="text-muted-foreground">{texto}</span>;
}

// La imagen se ve completa; el PDF se muestra embebido. Los dos se pueden abrir en otra pestaña.
function VistaEvidencia({ reporte }: { reporte: Reporte }) {
  const ev = reporte.evidencia;
  if (!ev) {
    return <p className="text-sm text-muted-foreground italic">Este reporte no tiene evidencia.</p>;
  }
  return (
    <div className="flex flex-col gap-2">
      {ev.tipo === "imagen" ? (
        <a href={ev.url} target="_blank" rel="noopener noreferrer" className="block">
          {/* eslint-disable-next-line @next/next/no-img-element -- viene de nuestra propia ruta /evidencia */}
          <img
            src={ev.url}
            alt={`Evidencia del reporte #${reporte.id}`}
            className="max-h-[28rem] w-full rounded-lg bg-muted object-contain ring-1 ring-border"
          />
        </a>
      ) : (
        <iframe
          src={ev.url}
          title={`Evidencia del reporte #${reporte.id} (PDF)`}
          className="h-[28rem] w-full rounded-lg bg-muted ring-1 ring-border"
        />
      )}
      <a
        href={ev.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 self-start text-sm font-medium text-aguas-azul hover:underline"
      >
        {ev.tipo === "pdf" ? <FileTextIcon className="size-4" /> : <ExternalLinkIcon className="size-4" />}
        Abrir en otra pestaña
      </a>
    </div>
  );
}
