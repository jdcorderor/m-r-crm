import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import 'bootstrap-icons/font/bootstrap-icons.css';

export default function Home() {
  return (
    <div>
      {/* Header */}
      <header>
        <div className="header" >
          <div className="custom-font">
            Mavarez & Román
          </div>
          {/* Navigator */}
          <nav className="nav-links">
            <a href="">Documentación</a>
            <a href="">Soporte</a>
            <a href="/login">Iniciar sesión</a>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main>
        {/* Hero Section */}
        <div className="body">
          <div className="container-2">
            <h1>Mavarez & Román</h1>
            <br /><br />
            <a href="/login" className="big-button">Iniciar sesión</a>
          </div>
        </div>
      </main>
    </div>
  );
}