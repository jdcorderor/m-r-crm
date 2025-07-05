"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { handleLogout } from "@/app/services/logoutService"

export default function HeaderB() {
  // Router
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false)

  const routes = [
    { href: "/especialista/pacientes", label: "Pacientes" },
    { href: "/especialista/calendario", label: "Calendario" },
    { href: "/especialista/archivos", label: "Archivos" },
    { href: "/especialista/reportes", label: "Reportes" },
    { href: "/especialista/micuenta", label: "Mi cuenta" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full px-[5vw] supports-[backdrop-filter]:bg-white/90 pt-[10px]">
      <div className="flex h-16 items-center justify-start">
        <div className="flex-1">
            <Link href="/especialista" className="text-sm text-black font-medium whitespace-nowrap" style={{ textDecoration: "none" }}>
                Mavarez & Román
            </Link>
        </div>
        <nav className="hidden md:flex gap-6 justify-end">
          {routes.map((route) => (
            <Link key={route.href} href={route.href} className="text-sm text-black transition-colors" style={{ textDecoration: "none" }}>
              {route.label}
            </Link>
          ))}
          <a onClick={ () => { handleLogout(); router.push("/login")} } className="text-sm text-black transition-colors cursor-pointer" style={{ textDecoration: "none" }}> Cerrar sesión </a>
        </nav>
        
        {/* Toggle menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <button className="justify-end">
              <Menu className="h-5 w-5" />
            </button>
          </SheetTrigger>
          <SheetContent>
            <nav className="flex flex-col gap-4 mt-8">
              {routes.map((route) => (
                <Link key={route.href} href={route.href} className="text-[2.7vh] text-white transition-colors" style={{ textDecoration: "none" }} onClick={() => setIsOpen(false)}>
                  {route.label}
                </Link>
              ))}
              <a onClick={ () => { handleLogout(); router.push("/login")} } className="text-[2.7vh] text-white transition-colors cursor-pointer" style={{ textDecoration: "none" }}> Cerrar sesión </a>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}