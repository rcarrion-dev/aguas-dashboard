import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
