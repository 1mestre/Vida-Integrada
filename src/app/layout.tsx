import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";
import { SoundProvider } from "@/context/SoundContext";
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation";

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
          {/* The animation component is placed here to act as a background. 
              It's fixed and behind other content using a negative z-index. 
              The containerClassName prop is used to apply these styles. */}
          <BackgroundGradientAnimation 
            containerClassName="!fixed top-0 left-0 w-full h-full -z-10" 
            gradientBackgroundStart="rgb(0, 0, 0)"
            gradientBackgroundEnd="rgb(10, 0, 25)"
            firstColor="0, 122, 255"      // iOS Blue
            secondColor="255, 149, 0"     // iOS Orange
            thirdColor="52, 199, 89"      // iOS Green
            fourthColor="255, 45, 85"     // iOS Red
            fifthColor="88, 86, 214"      // iOS Purple
            pointerColor="0, 122, 255"    // iOS Blue for the interactive pointer
          />
          <div className="relative z-0 min-h-screen">
            {children}
            <Toaster />
          </div>
        </SoundProvider>
      </body>
    </html>
  );
}
