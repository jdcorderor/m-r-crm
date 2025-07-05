"use client"
import React from "react"
import HeaderA from "@/components/headerA"

export default function Home() {
  return (
    <section className="flex flex-col justify-start pb-[5vh] min-h-screen">
      {/* Header */}
      <HeaderA />

      {/* Hero section */}
      <main className="w-full px-[5vw] py-40">
        <span className="block text-gray-800 text-4xl md:text-7xl font-semibold mb-12">Mavarez & Román</span>
        <a href="/login" className="inline-block mx-auto px-10 py-3 text-xl md:px-10 md:py-4 md:text-2xl border border-gray-300 rounded-[50] font-semibold shadow-sm text-center" style={{ textDecoration: 'none', color: 'rgb(32, 31, 31)' }}>
            Iniciar sesión
        </a>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 w-full py-8 text-center text-[0.8rem] md:text-sm bg-gray-100 border-t border-gray-300">
        <p className="">
            Copyright 2025 <i className="bi bi-c-circle"></i>, Mavarez & Román. Todos los derechos reservados. <br />Barquisimeto, Edo. Lara, Venezuela.
        </p>
      </footer>
    </section>
  );
}