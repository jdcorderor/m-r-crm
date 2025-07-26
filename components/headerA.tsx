"use client"
import { useState } from "react"
import Link from "next/link"
import { Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export default function HeaderA() {
  const [isOpen, setIsOpen] = useState(false)

  const routes = [
    { href: "/documentacion", label: "Documentación" },
    { href: "/soporte", label: "Soporte" },
    { href: "/login", label: "Iniciar sesión" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full px-[5vw] supports-[backdrop-filter]:bg-white/90 pt-[10px]">
      <div className="flex h-16 items-center justify-start">
        <div className="flex-1">
            <Link href="/" className="text-sm text-black font-medium whitespace-nowrap" style={{ textDecoration: "none" }}>
                Mavarez & Román
            </Link>
        </div>
        <nav className="hidden md:flex gap-6 justify-end">
          {routes.map((route) => (
            <Link key={route.href} href={route.href} className="text-sm text-black transition-colors" style={{ textDecoration: "none" }}>
              {route.label}
            </Link>
          ))}
        </nav>
        
        {/* Toggle menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <button className="justify-end">
              <Menu className="h-5 w-5" />
            </button>
          </SheetTrigger>
          <SheetContent>
            <nav className="flex flex-col gap-4 mt-8 duration-500">
              {routes.map((route) => (
                <Link key={route.href} href={route.href} className="text-[2.7vh] text-white transition-colors" style={{ textDecoration: "none" }} onClick={() => setIsOpen(false)}>
                  {route.label}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}