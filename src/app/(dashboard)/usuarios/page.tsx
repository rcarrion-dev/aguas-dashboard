import { UsuariosView } from "@/components/dashboard/usuarios-view";
import { usuarioActual, usuarios } from "@/lib/mock-data";

// Página: Usuarios (solo admin)
export default function UsuariosPage() {
  return <UsuariosView iniciales={usuarios} idActual={usuarioActual.id} />;
}
