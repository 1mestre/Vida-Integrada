import type { Metadata } from 'next';
import { Manrope } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { cn } from '@/lib/utils';

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Vida Integrada',
  description: 'Organizador de Vida Digital Compartido',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={cn("dark font-sans", manrope.variable)} suppressHydrationWarning>
      <head>
        <script src='https://cdn.jsdelivr.net/npm/fullcalendar@6.1.17/index.global.min.js'></script>
      </head>
      <body className="antialiased">
        <div className="bg-background min-h-screen">
          {children}
          <Toaster />
        </div>
      </body>
    </html>
  );
}
