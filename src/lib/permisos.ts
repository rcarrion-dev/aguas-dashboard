// Qué rol puede entrar a qué parte del panel.
// Lo usan el proxy (para redirigir), la sidebar (para el menú) y las páginas.
// OJO: esto solo decide qué se MUESTRA. Quien realmente protege los datos es
// el backend, que revisa el rol del token en cada endpoint.

export type RolPanel = "administrador" | "SSC";

// Los nombres son los de la tabla `rol` de la BD. El rol "usuario" no entra al panel.
export const ROLES_PANEL: RolPanel[] = ["administrador", "SSC"];

export function esRolPanel(rol: unknown): rol is RolPanel {
  return ROLES_PANEL.includes(rol as RolPanel);
}

const RUTAS: Record<RolPanel, string[]> = {
  // Ve todo: resumen, moderación, cuentas y bitácora
  administrador: ["/", "/reportes", "/usuarios", "/bitacora", "/evidencia"],
  // Solo da seguimiento a reportes ya verificados (y ve su evidencia)
  SSC: ["/reportes", "/evidencia"],
};

export function rutaPermitida(rol: RolPanel, ruta: string): boolean {
  return RUTAS[rol].some((r) =>
    r === "/" ? ruta === "/" : ruta === r || ruta.startsWith(`${r}/`)
  );
}

// A dónde mandar a cada rol al entrar (o si intenta abrir algo que no le toca)
export function inicioPara(rol: RolPanel): string {
  return rol === "SSC" ? "/reportes" : "/";
}

export const NOMBRE_ROL: Record<RolPanel, string> = {
  administrador: "Administrador",
  SSC: "SSC",
};
