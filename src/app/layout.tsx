import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";

// PASO 1: Importa el SoundProvider que creaste
import { SoundProvider } from "@/context/SoundContext";

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Vida Integrada",
  description: "Tu dashboard personal para organizar tu vida.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <head>
        {/* Este script es para FullCalendar, como lo tenías antes */}
        <script src='https://cdn.jsdelivr.net/npm/fullcalendar@6.1.17/index.global.min.js'></script>
      </head>
      <body className={cn("antialiased", manrope.className)}>
        
        {/* PASO 2: SoundProvider envuelve todo el contenido de tu aplicación */}
        <SoundProvider>
          <div className="bg-background min-h-screen">
            {children}
            <Toaster />
          </div>
        </SoundProvider>

      </body>
    </html>
  );
}
