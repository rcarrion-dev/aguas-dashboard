import type { Metadata } from "next";
import { Geist_Mono, Poppins } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { ProveedorTema } from "@/components/tema";
import "./globals.css";

// Poppins es la tipografía que usa la identidad de Red por la Ciberseguridad.
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aguas! · Panel de administración",
  description: "Moderación y estadísticas de la plataforma Aguas!",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning: next-themes agrega la clase "dark" antes de que cargue React
    <html
      lang="es"
      suppressHydrationWarning
      className={`${poppins.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ProveedorTema>
          {children}
          <Toaster position="bottom-right" />
        </ProveedorTema>
      </body>
    </html>
  );
}
