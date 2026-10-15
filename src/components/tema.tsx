"use client";

// Modo claro / oscuro. next-themes pone la clase "dark" en <html> y la
// recuerda en el navegador. La primera vez sigue lo que tenga la computadora.

import { ThemeProvider, useTheme } from "next-themes";
import { MoonIcon, SunIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ProveedorTema({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {children}
    </ThemeProvider>
  );
}

export function BotonTema({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      // El ícono se elige con CSS (dark:) para que no parpadee al cargar
      aria-label="Cambiar entre modo claro y oscuro"
      title="Modo claro / oscuro"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className={cn("text-muted-foreground hover:text-foreground", className)}
    >
      <MoonIcon className="dark:hidden" />
      <SunIcon className="hidden dark:block" />
    </Button>
  );
}
