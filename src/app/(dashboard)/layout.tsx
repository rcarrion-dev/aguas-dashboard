import { cookies } from "next/headers";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import { requerirSesion } from "@/lib/sesion";
import { kpis } from "@/lib/mock-data";

// Layout compartido por todas las páginas del panel (todo menos /login).
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sesion = await requerirSesion();

  // La sidebar guarda si está colapsada en una cookie; la leemos aquí
  // para que al recargar no "parpadee" de expandida a colapsada.
  const cookieStore = await cookies();
  const abierta = cookieStore.get("sidebar_state")?.value !== "false";

  // A los componentes del navegador solo les pasamos nombre y rol, nunca el token.
  const usuario = { nombre: sesion.nombre, rol: sesion.rol };

  return (
    <TooltipProvider>
      <SidebarProvider defaultOpen={abierta}>
        <AppSidebar
          rol={sesion.rol}
          pendientes={sesion.rol === "administrador" ? kpis.pendientes : 0}
        />
        <SidebarInset>
          <Topbar usuario={usuario} />
          <div className="flex-1 p-4 md:p-6">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
