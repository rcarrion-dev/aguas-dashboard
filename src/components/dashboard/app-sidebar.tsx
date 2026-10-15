"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FlagIcon,
  HistoryIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { Logo } from "./logo";
import { cerrarSesion } from "@/app/actions/auth";
import { inicioPara, rutaPermitida, type RolPanel } from "@/lib/permisos";

interface Seccion {
  titulo: string;
  href: string;
  icono: LucideIcon;
}

const secciones: Seccion[] = [
  { titulo: "Resumen", href: "/", icono: LayoutDashboardIcon },
  { titulo: "Reportes", href: "/reportes", icono: FlagIcon },
  { titulo: "Usuarios", href: "/usuarios", icono: UsersIcon },
  { titulo: "Bitácora", href: "/bitacora", icono: HistoryIcon },
];

export function AppSidebar({
  rol,
  pendientes,
}: {
  rol: RolPanel;
  pendientes: number;
}) {
  const pathname = usePathname();
  const { state, toggleSidebar } = useSidebar();
  const colapsada = state === "collapsed";

  // Cada rol solo ve las secciones que puede abrir (mismas reglas que el proxy)
  const visibles = secciones
    .filter((s) => rutaPermitida(rol, s.href))
    .map((s) => (rol === "SSC" && s.href === "/reportes" ? { ...s, titulo: "Seguimiento" } : s));

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-3 pt-4 pb-2 group-data-[collapsible=icon]:px-2">
        <Link href={inicioPara(rol)} aria-label="Ir al inicio">
          <Logo />
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {visibles.map((s) => {
                const activa =
                  s.href === "/" ? pathname === "/" : pathname.startsWith(s.href);
                const conBadge = s.href === "/reportes" && pendientes > 0;
                return (
                  <SidebarMenuItem key={s.href}>
                    <SidebarMenuButton
                      isActive={activa}
                      tooltip={s.titulo}
                      render={<Link href={s.href} />}
                      className="relative h-9 data-active:shadow-[inset_3px_0_0_var(--aguas-celeste)]"
                    >
                      <s.icono />
                      <span>{s.titulo}</span>
                      {/* Con la sidebar colapsada, el número se vuelve un puntito */}
                      {conBadge && colapsada && (
                        <span
                          aria-label={`${pendientes} pendientes`}
                          className="absolute top-1 right-1 size-2 rounded-full bg-aguas-ambar"
                        />
                      )}
                    </SidebarMenuButton>
                    {conBadge && (
                      <SidebarMenuBadge className="top-2! rounded-full bg-aguas-ambar px-1.5 text-[#3b2600]! peer-hover/menu-button:text-[#3b2600]!">
                        {pendientes}
                      </SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="pb-3">
        <SidebarMenu className="gap-1">
          <SidebarMenuItem>
            {/* Borra las cookies de sesión y manda al login */}
            <form action={cerrarSesion}>
              <SidebarMenuButton type="submit" tooltip="Salir" className="h-9">
                <LogOutIcon />
                <span>Salir</span>
              </SidebarMenuButton>
            </form>
          </SidebarMenuItem>
          <SidebarMenuItem className="border-t border-sidebar-border pt-1">
            <SidebarMenuButton
              tooltip={colapsada ? "Expandir" : "Colapsar"}
              onClick={toggleSidebar}
              className="h-9 text-sidebar-foreground/80"
            >
              {colapsada ? <PanelLeftOpenIcon /> : <PanelLeftCloseIcon />}
              <span>Colapsar</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
