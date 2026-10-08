import { CheckCircle2Icon, ClockIcon, InboxIcon, XCircleIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraficaReportes } from "@/components/dashboard/grafica-reportes";
import { PendientesLista } from "@/components/dashboard/pendientes-lista";
import { kpis, reportes, serieReportesPorDia } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

// Página: Resumen (home del panel)
export default function ResumenPage() {
  const pendientes = reportes.filter((r) => r.estado === "pendiente");
  const totalMes = serieReportesPorDia.reduce((s, p) => s + p.total, 0);

  const tarjetas = [
    { titulo: "Pendientes", valor: kpis.pendientes, icono: InboxIcon, destacada: true },
    { titulo: "Aprobados · 7 días", valor: kpis.aprobados7d, icono: CheckCircle2Icon },
    { titulo: "Rechazados · 7 días", valor: kpis.rechazados7d, icono: XCircleIcon },
    {
      titulo: "Tiempo prom. de revisión",
      valor: `${kpis.horasPromedioRevision.toFixed(1)} h`,
      icono: ClockIcon,
    },
  ];

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tarjetas.map((t) => (
          <Card
            key={t.titulo}
            className={cn(
              "gap-1 px-4",
              t.destacada && "shadow-[inset_0_3px_0_var(--aguas-amarillo)]"
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
            <CardDescription>Últimos 30 días · {totalMes} en total</CardDescription>
          </CardHeader>
          <CardContent>
            <GraficaReportes datos={serieReportesPorDia} />
          </CardContent>
        </Card>
        <Card className="px-4 lg:col-span-2">
          <PendientesLista reportes={pendientes} />
        </Card>
      </div>
    </div>
  );
}
