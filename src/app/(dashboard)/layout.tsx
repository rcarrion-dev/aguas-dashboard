import { cookies } from "next/headers";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import { kpis, usuarioActual } from "@/lib/mock-data";

// Layout compartido por todas las páginas del panel (todo menos /login).
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // La sidebar guarda si está colapsada en una cookie; la leemos aquí
  // para que al recargar no "parpadee" de expandida a colapsada.
  const cookieStore = await cookies();
  const abierta = cookieStore.get("sidebar_state")?.value !== "false";

  return (
    <TooltipProvider>
      <SidebarProvider defaultOpen={abierta}>
        <AppSidebar rol={usuarioActual.rol} pendientes={kpis.pendientes} />
        <SidebarInset>
          <Topbar usuario={usuarioActual} />
          <div className="flex-1 p-4 md:p-6">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
