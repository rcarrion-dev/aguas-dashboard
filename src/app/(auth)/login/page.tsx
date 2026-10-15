import type { Metadata } from "next";
import { LogoCompleto } from "@/components/dashboard/logo";
import { BotonTema } from "@/components/tema";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Iniciar sesión · Aguas!",
};

// Página pública. Si ya hay sesión, el proxy manda directo al panel.
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ siguiente?: string; expirada?: string }>;
}) {
  const { siguiente, expirada } = await searchParams;

  return (
    <main className="relative flex min-h-svh items-center justify-center bg-background p-4">
      <BotonTema className="absolute top-4 right-4" />
      <div className="w-full max-w-sm">
        <LogoCompleto className="mb-8" />
        <div className="rounded-2xl bg-card p-6 shadow-sm ring-1 ring-foreground/10 sm:p-8">
          <h1 className="text-lg font-semibold">Panel de administración</h1>
          <p className="mt-1 mb-6 text-sm text-muted-foreground">
            Entra con tu cuenta de administrador o SSC.
          </p>
          {expirada !== undefined && (
            <p className="mb-4 rounded-lg bg-aguas-ambar-50 px-3 py-2 text-sm text-aguas-ambar-texto">
              Tu sesión ya no es válida. Vuelve a entrar.
            </p>
          )}
          <LoginForm siguiente={siguiente} />
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          ¿Eres usuario de la app? Descarga Aguas! en tu celular.
        </p>
      </div>
    </main>
  );
}
