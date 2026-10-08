import { Suspense } from "react";
import { ReportesView } from "@/components/dashboard/reportes-view";
import { reportes } from "@/lib/mock-data";

// Página: Reportes (cola de moderación)
// Suspense es necesario porque la vista lee ?q= y ?id= de la URL.
export default function ReportesPage() {
  return (
    <Suspense>
      <ReportesView iniciales={reportes} />
    </Suspense>
  );
}
