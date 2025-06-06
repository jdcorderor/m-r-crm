"use client"
import React from "react";
import { useRouter } from "next/navigation";    
import "bootstrap/dist/css/bootstrap.min.css";
import 'bootstrap-icons/font/bootstrap-icons.css';

export default function Dashboard() {
    // Router
    const router = useRouter();

    // Verification handler
    const handleVerification = async () => {
        try {
            const response = await fetch("/api/auth/verify", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
            });

            if (response.ok) {
                const data = await response.json();
                console.log(data); // Here we can manage the user data as we want to.
            }
        } catch(error) {
            console.error("Error:", error);
        }
    }

    // Logout handler
    const handleLogout = async () => {
        try {
            const response = await fetch("/api/auth/logout", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
            });

            if (response.ok) {
                router.push("/login")
            }
        } catch(error) {
            console.error("Error:", error)
        }
    } 

    return (
        <div onClick={ handleVerification }>
            {/* Header */}
            <header>
                <div className="header" >
                <div className="custom-font">
                    <a href="/inicio">Mavarez & Román</a>
                </div>
                {/* Navigator */}
                <nav className="nav-links">
                    <a href="/pacientes">Pacientes</a>
                    <a href="/calendario">Calendario</a>
                    <a href="/administracion">Ingresos/Egresos</a>
                    <a href="/archivos">Archivos</a>
                    <a href="/reportes">Reportes</a>
                    <a href="/micuenta">Mi cuenta</a>
                    <a onClick={ handleLogout }>Cerrar sesión</a>
                </nav>
                </div>
            </header>

            {/* Main content */}
            <main>

            </main>
        </div>
    );
}