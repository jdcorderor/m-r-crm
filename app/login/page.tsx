"use client"
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import "bootstrap/dist/css/bootstrap.min.css";
import 'bootstrap-icons/font/bootstrap-icons.css';

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
        router.push("/usuarios");
      } else {
        router.push("/inicio");
      }
    } catch (error) {
      console.error("Error al enviar los datos:", error);
      setErrorMessage("Error de conexión. Intente nuevamente");
    }
  };

  return (
    <div>
      <header>
        <div className="header">
          <div className="custom-font">
            <a href="../">Mavarez & Román</a>
          </div>
        </div>
      </header>

      <main>
        <div className="login">
          <h2>Mavarez & Román</h2>
          <form onSubmit={ handleLogin }>
            <label htmlFor="username">Usuario *</label>
            <input type="text" name="username" id="username" onChange={ handleChange } placeholder="Usuario" />
            <label htmlFor="password">Contraseña *</label>
            <input type="password" name="password" id="password" onChange={ handleChange } placeholder="Contraseña" />
            {errorMessage && <p className="error-message">{ errorMessage }</p>}
            <button> Iniciar sesión</button>
          </form>
          <a href="">¿Olvidó su contraseña?</a>
        </div>
      </main>
    </div>
  );
}