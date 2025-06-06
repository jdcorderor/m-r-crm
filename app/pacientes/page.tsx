import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import 'bootstrap-icons/font/bootstrap-icons.css';

export default function Patients() {
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
                </nav>
                </div>
            </header>

            {/* Main content */}
            <main>

            </main>
        </div>
    );
}