"use client";

import { useActionState, useState } from "react";
import { EyeIcon, EyeOffIcon, Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { iniciarSesion, type EstadoLogin } from "@/app/actions/auth";

export function LoginForm({ siguiente }: { siguiente?: string }) {
  const [estado, accion, enviando] = useActionState<EstadoLogin, FormData>(
    iniciarSesion,
    undefined
  );
  const [verPassword, setVerPassword] = useState(false);

  return (
    <form action={accion} className="flex flex-col gap-4" noValidate>
      {siguiente && <input type="hidden" name="siguiente" value={siguiente} />}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="correo" className="text-sm font-medium">
          Correo
        </label>
        <Input
          id="correo"
          name="correo"
          type="email"
          autoComplete="username"
          placeholder="nombre@aguas.mx"
          defaultValue={estado?.correo}
          aria-invalid={Boolean(estado?.error)}
          required
          className="h-10 bg-card"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium">
          Contraseña
        </label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={verPassword ? "text" : "password"}
            autoComplete="current-password"
            aria-invalid={Boolean(estado?.error)}
            required
            className="h-10 bg-card pr-10"
          />
          <button
            type="button"
            onClick={() => setVerPassword((v) => !v)}
            aria-label={verPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            className="absolute top-1/2 right-2 flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            {verPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
          </button>
        </div>
      </div>

      {estado?.error && (
        <p role="alert" className="rounded-lg bg-aguas-rojo-50 px-3 py-2 text-sm text-aguas-rojo">
          {estado.error}
        </p>
      )}

      <Button type="submit" size="lg" disabled={enviando} className="mt-1 h-10">
        {enviando && <Loader2Icon className="animate-spin" aria-hidden="true" />}
        {enviando ? "Entrando…" : "Iniciar sesión"}
      </Button>
    </form>
  );
}
