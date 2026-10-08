"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fechaCorta } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Rol, Usuario } from "@/lib/types";

const roles: { valor: Rol; texto: string }[] = [
  { valor: "usuario", texto: "Usuario" },
  { valor: "moderador", texto: "Moderador" },
  { valor: "admin", texto: "Admin" },
];

// Solo la ve el rol admin (la sidebar ya la esconde; en V2 también se protege la ruta).
export function UsuariosView({
  iniciales,
  idActual,
}: {
  iniciales: Usuario[];
  idActual: number;
}) {
  // V1: cambios en memoria. En V5 esto llama al backend (PATCH /usuarios/:id).
  const [usuarios, setUsuarios] = useState(iniciales);
  const [busqueda, setBusqueda] = useState("");

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return usuarios.filter(
      (u) => !q || u.nombre.toLowerCase().includes(q) || u.correo.toLowerCase().includes(q)
    );
  }, [usuarios, busqueda]);

  function actualizar(id: number, cambios: Partial<Usuario>, mensaje: string) {
    setUsuarios((prev) => prev.map((u) => (u.id === id ? { ...u, ...cambios } : u)));
    toast.success(mensaje);
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4">
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

      <Card className="py-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-4">Usuario</TableHead>
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
                  Ningún usuario coincide con tu búsqueda.
                </TableCell>
              </TableRow>
            )}
            {filtrados.map((u) => {
              const esYo = u.id === idActual;
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
                    <select
                      aria-label={`Rol de ${u.nombre}`}
                      value={u.rol}
                      disabled={esYo}
                      onChange={(e) => {
                        const rol = e.target.value as Rol;
                        actualizar(u.id, { rol }, `${u.nombre} ahora es ${rol}`);
                      }}
                      className="h-8 rounded-md border border-input bg-background px-2 text-sm disabled:opacity-60"
                    >
                      {roles.map((r) => (
                        <option key={r.valor} value={r.valor}>
                          {r.texto}
                        </option>
                      ))}
                    </select>
                  </TableCell>
                  <TableCell className="hidden text-right tabular-nums md:table-cell">
                    {u.totalReportes}
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
                    {!esYo && (
                      <Button
                        variant={u.activo ? "ghost" : "outline"}
                        size="sm"
                        className={cn(u.activo && "text-aguas-rojo hover:bg-aguas-rojo-50 hover:text-aguas-rojo")}
                        onClick={() =>
                          actualizar(
                            u.id,
                            { activo: !u.activo },
                            u.activo ? `${u.nombre} fue suspendido` : `${u.nombre} fue reactivado`
                          )
                        }
                      >
                        {u.activo ? "Suspender" : "Reactivar"}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
