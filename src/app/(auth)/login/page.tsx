import type { Metadata } from "next";
import { LogoCompleto } from "@/components/dashboard/logo";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Iniciar sesión · Aguas!",
};

// Página pública. Si ya hay sesión, el proxy manda directo al panel.
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ siguiente?: string }>;
}) {
  const { siguiente } = await searchParams;

  return (
    <main className="flex min-h-svh items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <LogoCompleto className="mb-8" />
        <div className="rounded-2xl bg-card p-6 shadow-sm ring-1 ring-foreground/10 sm:p-8">
          <h1 className="text-lg font-semibold">Panel de administración</h1>
          <p className="mt-1 mb-6 text-sm text-muted-foreground">
            Entra con tu cuenta de administrador o SSC.
          </p>
          <LoginForm siguiente={siguiente} />
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          ¿Eres usuario de la app? Descarga Aguas! en tu celular.
        </p>
      </div>
    </main>
  );
}
