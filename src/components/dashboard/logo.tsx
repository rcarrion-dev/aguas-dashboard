// PLACEHOLDER del logo de Aguas!
// Cuando tengan el logo final, se cambia solo este archivo.
// Idealmente con dos versiones: completa (ícono + nombre) y solo ícono (sidebar colapsada).

import { cn } from "@/lib/utils";

export function LogoIcono({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      className={cn("size-8 shrink-0", className)}
    >
      <path
        d="M16 2.5 4.5 6.5v9c0 7.2 4.8 12.4 11.5 14 6.7-1.6 11.5-6.8 11.5-14v-9L16 2.5Z"
        fill="none"
        stroke="var(--aguas-amarillo)"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <text
        x="16"
        y="20.5"
        textAnchor="middle"
        fontSize="11"
        fontWeight="700"
        fill="currentColor"
        fontFamily="var(--font-poppins), sans-serif"
      >
        A!
      </text>
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <LogoIcono />
      <span className="text-lg font-semibold tracking-tight group-data-[collapsible=icon]:hidden">
        Aguas<span className="text-aguas-amarillo">!</span>
      </span>
    </div>
  );
}
