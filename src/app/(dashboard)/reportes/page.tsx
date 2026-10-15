import { Suspense } from "react";
import { ReportesView } from "@/components/dashboard/reportes-view";
import { obtenerReportes } from "@/lib/reportes";
import { requerirSesion } from "@/lib/sesion";

// Página: Reportes
//  - administrador: cola de moderación completa (GET /reportes/todos)
//  - SSC: solo reportes verificados, sin aprobar/rechazar (GET /reportes)
// Suspense es necesario porque la vista lee ?q= y ?id= de la URL.
export default async function ReportesPage() {
  const sesion = await requerirSesion("administrador", "SSC");
  const reportes = await obtenerReportes(sesion.rol);

  return (
    <Suspense>
      <ReportesView iniciales={reportes} puedeModerar={sesion.rol === "administrador"} />
    </Suspense>
  );
}
