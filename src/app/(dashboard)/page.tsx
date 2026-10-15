import { CheckCircle2Icon, InboxIcon, SendIcon, XCircleIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraficaReportes } from "@/components/dashboard/grafica-reportes";
import { PendientesLista } from "@/components/dashboard/pendientes-lista";
import { haceMenosDe, obtenerBitacora, obtenerReportes, seriePorDia } from "@/lib/reportes";
import { cn } from "@/lib/utils";
import { requerirSesion } from "@/lib/sesion";

// Página: Resumen (home del panel, solo administrador)
export default async function ResumenPage() {
  const sesion = await requerirSesion("administrador");
  const [reportes, bitacora] = await Promise.all([
    obtenerReportes(sesion.rol),
    obtenerBitacora(),
  ]);

  const pendientes = reportes.filter((r) => r.estado === "pendiente");
  const serie = seriePorDia(reportes, 30);
  const totalMes = serie.reduce((s, p) => s + p.total, 0);

  // Aprobados/rechazados salen de la bitácora: cuenta cuándo se revisaron,
  // no cuándo se enviaron.
  const revisadas7d = bitacora.filter((b) => haceMenosDe(b.fechaHora, 7));
  const aprobados7d = revisadas7d.filter((b) => b.accion === "reporte_verificado").length;
  const rechazados7d = revisadas7d.filter((b) => b.accion === "reporte_rechazado").length;
  const recibidos7d = reportes.filter((r) => haceMenosDe(r.fechaCreacion, 7)).length;

  const tarjetas = [
    { titulo: "Pendientes", valor: pendientes.length, icono: InboxIcon, destacada: true },
    { titulo: "Recibidos · 7 días", valor: recibidos7d, icono: SendIcon },
    { titulo: "Aprobados · 7 días", valor: aprobados7d, icono: CheckCircle2Icon },
    { titulo: "Rechazados · 7 días", valor: rechazados7d, icono: XCircleIcon },
  ];

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tarjetas.map((t) => (
          <Card
            key={t.titulo}
            className={cn(
              "gap-1 px-4",
              t.destacada && "shadow-[inset_0_3px_0_var(--aguas-ambar)]"
            )}
          >
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">{t.titulo}</span>
              <t.icono className="size-4" aria-hidden="true" />
            </div>
            <span className="text-2xl font-semibold tabular-nums">{t.valor}</span>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Reportes recibidos por día</CardTitle>
            <CardDescription>
              Últimos 30 días · {totalMes} {totalMes === 1 ? "reporte" : "reportes"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <GraficaReportes datos={serie} />
          </CardContent>
        </Card>
        <Card className="px-4 lg:col-span-2">
          <PendientesLista reportes={pendientes} />
        </Card>
      </div>
    </div>
  );
}
