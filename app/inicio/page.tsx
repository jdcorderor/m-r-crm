"use client"
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";    
import "bootstrap/dist/css/bootstrap.min.css";
import 'bootstrap-icons/font/bootstrap-icons.css';

export default function Dashboard() {
    // State variable for user role
    const [user, setUser] = useState({
        username: "",
        role: "",
    });

    // Router
    const router = useRouter();

    // Verification handler
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

    // Verify user variable
    if (!user) return null;

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
                    {user.role != "administrador" && (
                        <section className="nav-links">
                            <a href="/pacientes">Pacientes</a>
                            <a href="/calendario">Calendario</a>
                            <a href="/administracion">Ingresos/Egresos</a>
                            <a href="/archivos">Archivos</a>
                            <a href="/reportes">Reportes</a>
                            <a href="/micuenta">Mi cuenta</a> 
                        </section>
                    )}

                    {user.role === "administrador" && (
                        <a className="nav-links" onClick={ handleLogout }>Cerrar sesión</a>
                    )}
                </nav>
                </div>
            </header>

            {/* Main content */}
            <main>
            </main>
        </div>
    );
}