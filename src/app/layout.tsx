import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";
import { SoundProvider } from "@/context/SoundContext";

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
    <html lang="es" className="dark" suppressHydrationWarning>
      <head>
        <script src='https://cdn.jsdelivr.net/npm/fullcalendar@6.1.17/index.global.min.js'></script>
      </head>
      <body className={cn("antialiased")}>
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
