"use client"
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import HeaderA from "@/components/headerA";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";

export default function Login() {
  // Router
  const router = useRouter();

  // State variables for credentials and error message
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });

  const [errorMessage, setErrorMessage] = useState("");

  // Error message timer
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage("");
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  // Change handler for login fields
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  // Login handler
  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!credentials.username || !credentials.password) {
      setErrorMessage("Por favor, complete todos los campos");
      return;
    }

    setErrorMessage("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        setErrorMessage(errorData.message || "Error de inicio de sesión");
        return;
      }

      const data = await response.json();

      if (data.message.role === "administrador") {
        router.push("/administrador");
      } else if (data.message.role === "general") {
        router.push("/especialista");
      } else {
        router.push("/auxiliar");
      }
    } catch (error) {
      console.error("Error al enviar los datos:", error);
      setErrorMessage("Error de conexión. Intente nuevamente");
    }
  };

  return (
    <section className="flex flex-col justify-start pb-[5vh] min-h-screen">

      {/* Header */}
      <HeaderA />

      {/* Login section */}
      <main className="w-full mt-32">
        <div className="flex flex-col items-center">
          <span className="text-4xl text-gray-800 font-semibold mb-8">Mavarez & Román</span>
          <form onSubmit={handleLogin} className="w-full max-w-[350px]">

            <div className="mb-6">
              <label htmlFor="username" className="pl-2 pb-2 block">Usuario *</label>
              <Input type="text" name="username" id="username" className="block w-full border-gray-300" onChange={handleChange} value={credentials.username} placeholder="Usuario" autoComplete="username" />
            </div>

            <div className="mb-6">
              <label htmlFor="password" className="pl-2 pb-2 block">Contraseña *</label>
              <Input type="password" name="password" id="password" className="block w-full border-gray-300" onChange={handleChange} value={credentials.password} placeholder="Contraseña" autoComplete="current-password"/>
            </div>

            {errorMessage && <p className="text-red-600 text-sm my-4 text-center">{errorMessage}</p>}

            <Button type="submit" className="w-full bg-gray-100 border-3 border-gray-400 text-gray-800 font-semibold py-2 rounded-[5vw] shadow-sm hover:bg-gray-200 transition duration-200">Iniciar sesión</Button>
          </form>
          <a href="#" className="mt-6 text-sm" style={{ textDecoration: 'none', color: 'rgb(104, 104, 104)' }}>¿Olvidó su contraseña?</a>
        </div>
      </main>
    </section>
  );
}