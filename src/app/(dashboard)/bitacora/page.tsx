import { BitacoraView } from "@/components/dashboard/bitacora-view";
import { bitacora } from "@/lib/mock-data";

// Página: Bitácora (solo lectura)
export default function BitacoraPage() {
  return <BitacoraView entradas={bitacora} />;
}
