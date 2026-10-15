import { Suspense } from "react";
import { ReportesView } from "@/components/dashboard/reportes-view";
import { reportes } from "@/lib/mock-data";
import { requerirSesion } from "@/lib/sesion";

// Página: Reportes
//  - administrador: cola de moderación completa
//  - SSC: solo reportes verificados, sin aprobar/rechazar (seguimiento)
// Suspense es necesario porque la vista lee ?q= y ?id= de la URL.
export default async function ReportesPage() {
  const sesion = await requerirSesion("administrador", "SSC");
  const esAdmin = sesion.rol === "administrador";
  const visibles = esAdmin ? reportes : reportes.filter((r) => r.estado === "verificado");

  return (
    <Suspense>
      <ReportesView
        iniciales={visibles}
        puedeModerar={esAdmin}
        nombreModerador={sesion.nombre}
      />
    </Suspense>
  );
}
