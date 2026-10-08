"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { fechaCorta } from "@/lib/format";
import type { PuntoSerie } from "@/lib/types";

// Una sola serie → un solo color (azul de Aguas!), sin leyenda: el título ya dice qué es.
export function GraficaReportes({ datos }: { datos: PuntoSerie[] }) {
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={datos} margin={{ top: 8, right: 4, bottom: 0, left: -20 }} barCategoryGap={3}>
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis
            dataKey="fecha"
            tickFormatter={fechaCorta}
            tickLine={false}
            axisLine={false}
            interval={6}
            tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
          />
          <YAxis
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
          />
          <Tooltip
            cursor={{ fill: "var(--muted)" }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const p = payload[0].payload as PuntoSerie;
              return (
                <div className="rounded-lg bg-popover px-3 py-2 text-xs shadow-md ring-1 ring-foreground/10">
                  <p className="text-muted-foreground">{fechaCorta(p.fecha)}</p>
                  <p className="font-semibold text-foreground">
                    {p.total} {p.total === 1 ? "reporte" : "reportes"}
                  </p>
                </div>
              );
            }}
          />
          <Bar dataKey="total" fill="var(--aguas-azul)" radius={[4, 4, 0, 0]} maxBarSize={18} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
