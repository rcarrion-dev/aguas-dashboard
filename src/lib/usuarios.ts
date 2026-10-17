// Cuentas desde el backend (GET /usuarios, solo administrador). Solo servidor.

import { pedirApi } from "./api";
import type { Rol, Usuario } from "./types";

interface UsuarioApi {
  idUsuario: number;
  nombre: string;
  apellido: string;
  correo: string;
  rol: string;
  fechaRegistro: string;
  activo?: boolean; // si el backend no lo manda (versión vieja), se asume activo
  totalReportes?: number;
  reportesRechazados?: number;
}

const ROLES: Rol[] = ["usuario", "SSC", "administrador"];

export async function obtenerUsuarios(): Promise<Usuario[]> {
  const datos = await pedirApi<UsuarioApi[]>("/usuarios");
  return datos.map((u) => ({
    id: u.idUsuario,
    nombre: `${u.nombre} ${u.apellido ?? ""}`.trim(),
    correo: u.correo,
    rol: ROLES.includes(u.rol as Rol) ? (u.rol as Rol) : "usuario",
    activo: u.activo ?? true,
    fechaRegistro: u.fechaRegistro,
    totalReportes: u.totalReportes ?? 0,
    reportesRechazados: u.reportesRechazados ?? 0,
  }));
}
