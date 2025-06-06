import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], preload: true });

export const metadata: Metadata = {
  title: "Mavarez & Román",
  description: "Sistema CRM para la gestión interna de un consultorio odontológico",

};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <div className="container-1">
          {children}
        </div>
        {/* Footer */}
        <footer className="footer">
          <p className="copyright">
            Copyright 2025 <i className="bi bi-c-circle"></i>, Mavarez & Román. Todos los derechos reservados.
            <br />Barquisimeto, Edo. Lara, Venezuela.
          </p>
        </footer>
      </body>
    </html>
  );
}
