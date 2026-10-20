import type { NextConfig } from "next";

const esDesarrollo = process.env.NODE_ENV !== "production";

// Política de seguridad de contenido (CSP): el navegador solo carga scripts,
// estilos, imágenes y fuentes desde el mismo panel. Todas las llamadas al
// backend se hacen desde el servidor de Next, así que el navegador no
// necesita conectarse a ningún otro origen.
// Next mete scripts en línea para hidratar la página, por eso va
// 'unsafe-inline'. En desarrollo también necesita 'unsafe-eval' y websockets
// para recargar en caliente.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${esDesarrollo ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  `connect-src 'self'${esDesarrollo ? " ws: wss:" : ""}`,
  "frame-src 'self'",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const cabecerasSeguridad = [
  // Que ninguna otra página pueda meter el panel en un iframe (clickjacking).
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // Que el navegador no "adivine" el tipo de un archivo.
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
];

const nextConfig: NextConfig = {
  // No anunciar "X-Powered-By: Next.js" en cada respuesta.
  poweredByHeader: false,

  async headers() {
    return [
      {
        source: "/:path*",
        headers: cabecerasSeguridad,
      },
      {
        // La CSP no se aplica a /evidencia: ahí se muestran los PDF dentro
        // del visor del navegador, que no funciona con una CSP restrictiva.
        source: "/((?!evidencia/).*)",
        headers: [{ key: "Content-Security-Policy", value: csp }],
      },
    ];
  },

  // Sin cacheComponents: todo el panel depende de la sesión (cookies) y de la
  // hora (vencimiento del token), así que cada página se arma en cada petición.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
