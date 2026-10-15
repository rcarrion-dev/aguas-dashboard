"use client";

// Se muestra cuando una página del panel no pudo cargar datos del backend
// (apagado, sin conexión, error 500…). La sidebar y la barra de arriba siguen ahí.

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { CloudOffIcon, Loader2Icon, RotateCwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorPanel({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  const [reintentando, iniciar] = useTransition();

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-3 py-20 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-aguas-rojo-50 text-aguas-rojo">
        <CloudOffIcon className="size-6" aria-hidden="true" />
      </div>
      <h2 className="text-lg font-semibold">No se pudieron cargar los datos</h2>
      <p className="text-sm text-muted-foreground">
        Revisa que el backend esté corriendo y que API_URL en .env.local apunte a él.
      </p>
      {process.env.NODE_ENV === "development" && (
        <p className="rounded-md bg-muted px-3 py-1.5 font-mono text-xs text-muted-foreground">
          {error.message}
        </p>
      )}
      <Button
        className="mt-2"
        disabled={reintentando}
        onClick={() =>
          iniciar(() => {
            router.refresh();
            reset();
          })
        }
      >
        {reintentando ? <Loader2Icon className="animate-spin" /> : <RotateCwIcon />}
        Reintentar
      </Button>
    </div>
  );
}
