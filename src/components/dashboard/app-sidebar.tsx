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
import type { Rol } from "@/lib/types";

interface Seccion {
  titulo: string;
  href: string;
  icono: LucideIcon;
  soloAdmin?: boolean;
}

const secciones: Seccion[] = [
  { titulo: "Resumen", href: "/", icono: LayoutDashboardIcon },
  { titulo: "Reportes", href: "/reportes", icono: FlagIcon },
  { titulo: "Usuarios", href: "/usuarios", icono: UsersIcon, soloAdmin: true },
  { titulo: "Bitácora", href: "/bitacora", icono: HistoryIcon },
];

export function AppSidebar({
  rol,
  pendientes,
}: {
  rol: Rol;
  pendientes: number;
}) {
  const pathname = usePathname();
  const { state, toggleSidebar } = useSidebar();
  const colapsada = state === "collapsed";

  const visibles = secciones.filter((s) => !s.soloAdmin || rol === "admin");

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-3 pt-4 pb-2 group-data-[collapsible=icon]:px-2">
        <Link href="/" aria-label="Ir al resumen">
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
                      className="relative h-9 data-active:shadow-[inset_3px_0_0_var(--aguas-amarillo)]"
                    >
                      <s.icono />
                      <span>{s.titulo}</span>
                      {/* Con la sidebar colapsada, el número se vuelve un puntito */}
                      {conBadge && colapsada && (
                        <span
                          aria-label={`${pendientes} pendientes`}
                          className="absolute top-1 right-1 size-2 rounded-full bg-aguas-amarillo"
                        />
                      )}
                    </SidebarMenuButton>
                    {conBadge && (
                      <SidebarMenuBadge className="top-2! rounded-full bg-aguas-amarillo px-1.5 text-[#2a1a00]! peer-hover/menu-button:text-[#2a1a00]!">
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
            {/* En V2 esto borra la cookie del JWT y manda a /login */}
            <SidebarMenuButton tooltip="Salir" className="h-9">
              <LogOutIcon />
              <span>Salir</span>
            </SidebarMenuButton>
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
