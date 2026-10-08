"use client";

import { usePathname, useRouter } from "next/navigation";
import { SearchIcon } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import type { Usuario } from "@/lib/types";

const titulos: Record<string, string> = {
  "/": "Resumen",
  "/reportes": "Reportes",
  "/usuarios": "Usuarios",
  "/bitacora": "Bitácora",
};

export function Topbar({ usuario }: { usuario: Usuario }) {
  const pathname = usePathname();
  const router = useRouter();
  const titulo =
    titulos[pathname] ??
    Object.entries(titulos).find(([k]) => k !== "/" && pathname.startsWith(k))?.[1] ??
    "";

  const iniciales = usuario.nombre
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");

  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-3 border-b bg-background/90 px-4 backdrop-blur md:px-6">
      {/* En celular la sidebar se esconde; este botón la abre */}
      <SidebarTrigger className="md:hidden" />
      <h1 className="text-base font-semibold">{titulo}</h1>

      {/* Búsqueda global: manda a Reportes filtrando por número o correo */}
      <form
        className="ml-auto hidden w-full max-w-xs sm:block"
        onSubmit={(e) => {
          e.preventDefault();
          const q = new FormData(e.currentTarget).get("q")?.toString().trim();
          router.push(q ? `/reportes?q=${encodeURIComponent(q)}` : "/reportes");
        }}
      >
        <label className="relative block">
          <span className="sr-only">Buscar reportes</span>
          <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="q"
            placeholder="+52 55 1234 5678 o correo"
            className="h-9 bg-card pl-8"
          />
        </label>
      </form>

      <div className="ml-auto flex items-center gap-2.5 sm:ml-2">
        <div className="hidden text-right leading-tight lg:block">
          <p className="text-sm font-medium">{usuario.nombre}</p>
          <p className="text-xs text-muted-foreground capitalize">{usuario.rol}</p>
        </div>
        <div className="flex size-8 items-center justify-center rounded-full bg-aguas-azul text-xs font-semibold text-white">
          {iniciales}
        </div>
      </div>
    </header>
  );
}
