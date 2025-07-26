import type { Metadata } from "next";
import { Inter } from "next/font/google";
import HeaderB from "@/components/headerB";

const inter = Inter({ subsets: ["latin"], preload: true });

export const metadata: Metadata = {
  title: "Mavarez & Román",
  description: "Especialista",

};

export default function RootLayout({ children, }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <HeaderB />

        {children}
      </body>
    </html>
  );
}
