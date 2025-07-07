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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&family=Montserrat:wght@400;700&family=Poppins:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className={cn("antialiased")}>
        <SoundProvider>
          <div className="min-h-screen">
            {children}
            <Toaster />
          </div>
        </SoundProvider>
      </body>
    </html>
  );
}
