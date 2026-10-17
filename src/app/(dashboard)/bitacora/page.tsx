import { BitacoraView } from "@/components/dashboard/bitacora-view";
import { obtenerEntradasBitacora } from "@/lib/reportes";
import { requerirSesion } from "@/lib/sesion";

// Página: Bitácora (solo lectura, solo administrador). GET /bitacora
export default async function BitacoraPage() {
  await requerirSesion("administrador");
  const entradas = await obtenerEntradasBitacora();
  return <BitacoraView entradas={entradas} />;
}
