"use client"
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import "bootstrap/dist/css/bootstrap.min.css";
import 'bootstrap-icons/font/bootstrap-icons.css';

export default function Login() {
  // Router
  const route = useRouter();

  // Credentials state
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  })

  // Login form's changes handler
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  }

  // Login handler
  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
        credentials: "include",
      });

      if (response.ok) {
        route.push("/inicio");
      }
    } catch(error) {
      console.error("Error al enviar los datos:", error);
    }
  }

  return (
    <div>
      {/* Header */}
      <header>
        <div className="header" >
          <div className="custom-font">
            <a href="../">Mavarez & Román</a>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main>
        <div className="login">
            <h2>Mavarez & Román</h2>
            <form onSubmit={ handleLogin }>
                <label htmlFor="">Usuario *</label>
                <input type="text" name="username" onChange={ handleChange } placeholder="Usuario" />
                <label htmlFor="">Contraseña *</label>
                <input type="password" name="password" onChange={ handleChange } placeholder="Contraseña"/>
                <button>Iniciar sesión</button> {/* Add login validations */}
            </form>
            <a href="">¿Olvidó su contraseña?</a>
        </div>
      </main>
    </div>
  );
}
