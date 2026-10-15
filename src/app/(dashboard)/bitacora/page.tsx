import { BitacoraView } from "@/components/dashboard/bitacora-view";
import { bitacora } from "@/lib/mock-data";
import { requerirSesion } from "@/lib/sesion";

// Página: Bitácora (solo lectura, solo administrador)
export default async function BitacoraPage() {
  await requerirSesion("administrador");
  return <BitacoraView entradas={bitacora} />;
}
