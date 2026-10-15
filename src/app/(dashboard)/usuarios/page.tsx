import { UsuariosView } from "@/components/dashboard/usuarios-view";
import { usuarios } from "@/lib/mock-data";
import { requerirSesion } from "@/lib/sesion";

// Página: Usuarios (solo administrador)
export default async function UsuariosPage() {
  const sesion = await requerirSesion("administrador");
  return <UsuariosView iniciales={usuarios} idActual={sesion.idUsuario} />;
}
