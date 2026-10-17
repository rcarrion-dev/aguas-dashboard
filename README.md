# Aguas! · Panel de administración

Dashboard en Next.js para moderar los reportes de Aguas!. Habla con el backend
([aguas-repo](https://github.com/IturielLSaenz/aguas-repo)) usando el mismo
login y los mismos roles que la app.

## Cómo correrlo

1. Prende el backend (`npm run start:dev` en aguas-repo, queda en el puerto 3000).
2. En esta carpeta crea `.env.local` con:
   ```
   API_URL=http://127.0.0.1:3000
   ```
3. Instala y arranca:
   ```
   npm install
   npm run dev
   ```
4. Abre http://localhost:3001

## Quién ve qué

| Rol | Puede |
| --- | --- |
| administrador | Resumen, aprobar/rechazar reportes, suspender cuentas y bitácora |
| SSC | Solo "Seguimiento": reportes ya verificados, sin moderar |
| usuario | No entra al panel (usa la app) |

## Qué ya usa datos reales

Todo:

- Login, sesión y permisos por rol
- Reportes: lista, detalle, evidencia, aprobar y rechazar
- Resumen: pendientes, números de los últimos 7 días, tiempo promedio de revisión y gráfica de 30 días
- Usuarios: lista de cuentas, suspender y reactivar (el rol no se cambia desde el panel)
- Bitácora: quién aprobó o rechazó cada reporte
