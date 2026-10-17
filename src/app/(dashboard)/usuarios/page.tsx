import { UsuariosView } from "@/components/dashboard/usuarios-view";
import { obtenerUsuarios } from "@/lib/usuarios";
import { requerirSesion } from "@/lib/sesion";

// Página: Usuarios (solo administrador). GET /usuarios
export default async function UsuariosPage() {
  const sesion = await requerirSesion("administrador");
  const usuarios = await obtenerUsuarios();
  return <UsuariosView iniciales={usuarios} idActual={sesion.idUsuario} />;
}
