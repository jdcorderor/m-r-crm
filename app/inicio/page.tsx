"use client"
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { handleLogout } from "../services/logoutService";
import "bootstrap/dist/css/bootstrap.min.css";
import 'bootstrap-icons/font/bootstrap-icons.css';
import Calendar from "@/components/calendar"
export default function Dashboard() {
    // Router
    const router = useRouter();
    
    // State variable for user role
    const [user, setUser] = useState({
        username: "",
        role: "",
    });

    // User verification handler
    useEffect(() => {
        const verifyAuth = async () => {
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
                    setUser(user => ({
                        ...user,
                        username: data.message.username,
                        role: data.message.role,
                    }));
                } else {
                    router.push("/login");
                }
            } catch (error) {
                console.error("Error:", error);
                router.push("/login");
            }
        };
        verifyAuth();
    }, [router]);    

    // ---------------------------------------------------------------------------

    // ---------------------------------------------------------------------------

    // Verify user variable
    if (user.username === "" && user.role === "") return null;
    
    return (
        <div>
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
                    <a onClick={async () => { await handleLogout(); router.push("/login"); }}>Cerrar sesión</a>
                </nav>
                </div>
            </header>

            {/* Main content */}
            <main className="body">
                <h2>Calendario</h2>
                <div className="container-4">
                    <Calendar />
                </div>
                
            </main>
        </div>
    );
}