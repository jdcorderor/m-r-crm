import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], preload: true });

export const metadata: Metadata = {
  title: "Mavarez & Román",
  description: "Sistema CRM para la gestión interna de un consultorio odontológico",

};

export default function RootLayout({ children, }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
