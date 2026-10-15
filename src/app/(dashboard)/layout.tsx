import { cookies } from "next/headers";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import { requerirSesion } from "@/lib/sesion";
import { ErrorApi } from "@/lib/api";
import { obtenerReportes } from "@/lib/reportes";

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

  // Número de pendientes para la sidebar (solo admin). Es la misma petición
  // que usa la página, así que no se pide dos veces. Si el backend falla,
  // la sidebar sigue funcionando sin el número y la página muestra el error.
  let pendientes = 0;
  if (sesion.rol === "administrador") {
    try {
      const reportes = await obtenerReportes(sesion.rol);
      pendientes = reportes.filter((r) => r.estado === "pendiente").length;
    } catch (e) {
      if (!(e instanceof ErrorApi)) throw e;
    }
  }

  // A los componentes del navegador solo les pasamos nombre y rol, nunca el token.
  const usuario = { nombre: sesion.nombre, rol: sesion.rol };

  return (
    <TooltipProvider>
      <SidebarProvider defaultOpen={abierta}>
        <AppSidebar
          rol={sesion.rol}
          pendientes={pendientes}
        />
        <SidebarInset>
          <Topbar usuario={usuario} />
          <div className="flex-1 p-4 md:p-6">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
