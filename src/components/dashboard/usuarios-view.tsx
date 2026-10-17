"use client";

import { useMemo, useOptimistic, useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2Icon, SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cambiarEstadoUsuario } from "@/app/actions/usuarios";
import { fechaCorta } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Rol, Usuario } from "@/lib/types";

type FiltroRol = Rol | "todos" | "suspendidos";

const filtros: { valor: FiltroRol; texto: string }[] = [
  { valor: "todos", texto: "Todos" },
  { valor: "usuario", texto: "Usuarios" },
  { valor: "SSC", texto: "SSC" },
  { valor: "administrador", texto: "Administradores" },
  { valor: "suspendidos", texto: "Suspendidos" },
];

const estiloRol: Record<Rol, { texto: string; clase: string }> = {
  usuario: { texto: "Usuario", clase: "bg-muted text-muted-foreground" },
  SSC: { texto: "SSC", clase: "bg-aguas-celeste-50 text-aguas-azul" },
  administrador: { texto: "Administrador", clase: "bg-primary text-primary-foreground" },
};

// Solo administrador. El rol de una cuenta NO se cambia aquí (ni en el
// backend): se asigna al crearla. Lo único que se puede hacer es suspender
// o reactivar cuentas de usuario y de SSC.
export function UsuariosView({
  iniciales,
  idActual,
}: {
  iniciales: Usuario[];
  idActual: number;
}) {
  const [usuarios, aplicarCambio] = useOptimistic(
    iniciales,
    (actuales, cambio: { id: number; activo: boolean }) =>
      actuales.map((u) => (u.id === cambio.id ? { ...u, activo: cambio.activo } : u))
  );
  const [guardando, iniciar] = useTransition();
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState<FiltroRol>("todos");
  const [porSuspender, setPorSuspender] = useState<Usuario | null>(null);

  const conteos = useMemo(() => {
    const c: Record<FiltroRol, number> = {
      todos: usuarios.length,
      usuario: 0,
      SSC: 0,
      administrador: 0,
      suspendidos: 0,
    };
    usuarios.forEach((u) => {
      c[u.rol]++;
      if (!u.activo) c.suspendidos++;
    });
    return c;
  }, [usuarios]);

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return usuarios.filter(
      (u) =>
        (filtro === "todos" || (filtro === "suspendidos" ? !u.activo : u.rol === filtro)) &&
        (!q || u.nombre.toLowerCase().includes(q) || u.correo.toLowerCase().includes(q))
    );
  }, [usuarios, busqueda, filtro]);

  function cambiarEstado(u: Usuario, activo: boolean) {
    iniciar(async () => {
      aplicarCambio({ id: u.id, activo });
      const res = await cambiarEstadoUsuario(u.id, activo);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success(activo ? `${u.nombre} fue reactivado` : `${u.nombre} fue suspendido`);
      setPorSuspender(null);
    });
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div role="tablist" aria-label="Filtrar cuentas" className="flex gap-1 overflow-x-auto">
          {filtros.map((f) => (
            <button
              key={f.valor}
              role="tab"
              aria-selected={filtro === f.valor}
              onClick={() => setFiltro(f.valor)}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors",
                filtro === f.valor
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {f.texto}
              <span
                className={cn(
                  "rounded-full px-1.5 text-xs tabular-nums",
                  filtro === f.valor ? "bg-primary-foreground/20" : "bg-muted"
                )}
              >
                {conteos[f.valor]}
              </span>
            </button>
          ))}
        </div>
        <label className="relative block sm:w-72">
          <span className="sr-only">Buscar usuarios</span>
          <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Nombre o correo"
            className="h-9 bg-card pl-8"
          />
        </label>
      </div>

      <Card className="py-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-4">Cuenta</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead className="hidden text-right md:table-cell">Reportes</TableHead>
              <TableHead className="hidden lg:table-cell">Registro</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="pr-4 text-right">
                <span className="sr-only">Acciones</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtrados.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                  {busqueda ? "Ninguna cuenta coincide con tu búsqueda." : "No hay cuentas en esta sección."}
                </TableCell>
              </TableRow>
            )}
            {filtrados.map((u) => {
              const esYo = u.id === idActual;
              // Mismas reglas que el backend: ni la propia cuenta ni administradores
              const sePuedeSuspender = !esYo && u.rol !== "administrador";
              const rol = estiloRol[u.rol];
              return (
                <TableRow key={u.id} className={cn(!u.activo && "text-muted-foreground")}>
                  <TableCell className="pl-4">
                    <p className="font-medium text-foreground">
                      {u.nombre}
                      {esYo && <span className="ml-1.5 text-xs font-normal text-muted-foreground">(tú)</span>}
                    </p>
                    <p className="text-xs text-muted-foreground">{u.correo}</p>
                  </TableCell>
                  <TableCell>
                    <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", rol.clase)}>
                      {rol.texto}
                    </span>
                  </TableCell>
                  <TableCell className="hidden text-right tabular-nums md:table-cell">
                    {u.rol === "usuario" ? (
                      <>
                        {u.totalReportes}
                        {u.reportesRechazados > 0 && (
                          <span
                            className="ml-1.5 text-xs text-aguas-rojo"
                            title="Reportes que le rechazaron"
                          >
                            ({u.reportesRechazados} rechazados)
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">{fechaCorta(u.fechaRegistro)}</TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
                        u.activo
                          ? "bg-aguas-verde-50 text-aguas-verde ring-aguas-verde/30"
                          : "bg-aguas-rojo-50 text-aguas-rojo ring-aguas-rojo/30"
                      )}
                    >
                      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
                      {u.activo ? "Activo" : "Suspendido"}
                    </span>
                  </TableCell>
                  <TableCell className="pr-4 text-right">
                    {sePuedeSuspender &&
                      (u.activo ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={guardando}
                          className="text-aguas-rojo hover:bg-aguas-rojo-50 hover:text-aguas-rojo"
                          onClick={() => setPorSuspender(u)}
                        >
                          Suspender
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={guardando}
                          onClick={() => cambiarEstado(u, true)}
                        >
                          Reactivar
                        </Button>
                      ))}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      {/* Suspender pide confirmación; reactivar no (se puede deshacer sin riesgo) */}
      <Dialog open={porSuspender !== null} onOpenChange={(abierto) => !abierto && setPorSuspender(null)}>
        <DialogContent>
          {porSuspender && (
            <>
              <DialogHeader>
                <DialogTitle>¿Suspender a {porSuspender.nombre}?</DialogTitle>
                <DialogDescription>
                  No podrá iniciar sesión ni enviar reportes. Si ya tiene la app abierta, se le
                  cierra la sesión en máximo 15 minutos. Sus reportes anteriores se quedan como están.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setPorSuspender(null)}>
                  Cancelar
                </Button>
                <Button
                  disabled={guardando}
                  onClick={() => cambiarEstado(porSuspender, false)}
                  className="bg-aguas-rojo-fuerte text-white hover:bg-aguas-rojo-fuerte/90"
                >
                  {guardando && <Loader2Icon className="animate-spin" aria-hidden="true" />}
                  Suspender cuenta
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
