"use client"
import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { handleLogout } from "@/app/services/logoutService";  
import "bootstrap/dist/css/bootstrap.min.css";
import 'bootstrap-icons/font/bootstrap-icons.css';

export default function UpdateUser() {
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

    // -----------------------------------------------------------------------------

    // State variables for user update form fields
    const [dentist, setDentist] = useState({
        firstname: "",
        lastname: "",
        id: "",
        phone: "",
        email: "",
        specialty: "",
        description: ""
    });

    const [updatedUser, setUpdatedUser] = useState({
        username: "",
        password: "",
        role: ""
    });
    
    // State variable for user ID
    const [id, setID] = useState();

    // User update handler
    const handleUserUpdate = async (event: React.FormEvent) => {
        event.preventDefault();

        const userData = {
            dentist: {
                ...dentist,
                id: Number(dentist.id),
                phone: dentist.phone
            },
            user: updatedUser,
            id: id
        };

        try {
            const response = await fetch("/api/users", {
                method: "PUT",
                headers: {
                "Content-Type": "application/json",
                },
                body: JSON.stringify(userData),
                credentials: "include",
            });

            if (response.ok) {
                setDentist({
                    firstname: "",
                    lastname: "",
                    id: "",
                    phone: "",
                    email: "",
                    description: "",
                    specialty: ""
                });
                setUpdatedUser({
                    username: "",
                    password: "",
                    role: ""
                });

                router.push("/usuarios");
            }
        } catch (error) {
            console.error("Error al registrar el usuario:", error);
        }
    }    
    
    // -----------------------------------------------------------------------------
    
    const { username } = useParams();

    // Load user data handler
    useEffect(() => {
        const handleDataLoad = async () => {
            
            if (!username) {
                console.error("Usuario no encontrado")
            }

            const response = await fetch(`/api/users/${username}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
            });
            
            if (response.ok) {
                const data = await response.json();
                setDentist(data[0].dentist);
                setUpdatedUser(data[0].user);
                setID(data[0].id);
            }
        }

        handleDataLoad();
    }, [username]);

    // -----------------------------------------------------------------------------
    
    // Verify user variable
    if (user.username === "" && user.role === "") return null;

    return (
        <div>
            {/* Header */}
            <header>
                <div className="header" >
                <div className="custom-font">
                    <a href="/usuarios">Mavarez & Román</a>
                </div>
                    {/* Navigator */}
                    <nav className="nav-links">
                        <a onClick={async () => { await handleLogout(); router.push("/login"); }}>Cerrar sesión</a>
                    </nav>
                </div>
            </header>

            {/* Main content */}
            <main className="body">
                <h2>Actualización de usuario</h2>
                <form className="user-registration" onSubmit={ handleUserUpdate }>
                    <div>
                        <h3>Información personal</h3>
                        <div className="input-container">
                            <div>
                                <label htmlFor="">Nombre *</label>
                                <input type="text" placeholder="Nombre" value={dentist.firstname || ""} onChange={e => setDentist({ ...dentist, firstname: e.target.value })} required />
                            </div>
                            <div>
                               <label htmlFor="">Apellido *</label>
                                <input type="text" placeholder="Apellido" value={dentist.lastname || ""} onChange={e => setDentist({ ...dentist, lastname: e.target.value })} required /> 
                            </div>
                        </div>
                        <div className="input-container">
                            <div>
                                <label htmlFor="">Cédula de Identidad *</label>
                                <input type="number" placeholder="Cédula (ej. 12345678)" value={dentist.id || ""} onChange={e => setDentist({ ...dentist, id: e.target.value })} required />
                            </div>
                            <div>
                                <label htmlFor="">Teléfono *</label>
                                <input type="tel" placeholder="Teléfono (ej. 04240001234)" value={dentist.phone || ""} onChange={e => setDentist({ ...dentist, phone: e.target.value })} required />
                            </div>
                        </div>
                        <div className="input-container">
                            <div>
                                <label htmlFor="">Correo electrónico *</label>
                                <input type="email" placeholder="Correo electrónico" value={dentist.email || ""} onChange={e => setDentist({ ...dentist, email: e.target.value })} required />  
                            </div>
                            <div>
                                <label htmlFor="">Especialidad *</label>
                                <input type="text" placeholder="Especialidad(es)" value={dentist.specialty || ""} onChange={e => setDentist({ ...dentist, specialty: e.target.value })} required />
                            </div>
                        </div>
                        <label htmlFor="">Descripción *</label>
                        <input type="text" placeholder="Descripción" value={dentist.description || ""} onChange={e => setDentist({ ...dentist, description: e.target.value })} required />
                    </div>
                    <div>
                        <h3>Datos de usuario</h3>
                        <div className="input-container">
                            <div>
                                <label htmlFor="">Usuario *</label>
                                <input type="text" placeholder="Usuario" value={updatedUser.username || ""} onChange={e => setUpdatedUser({ ...updatedUser, username: e.target.value })} required />
                            </div>
                            <div>
                                <label htmlFor="">Contraseña *</label>
                                <input type="password" placeholder="Contraseña" value={updatedUser.password || ""} onChange={e => setUpdatedUser({ ...updatedUser, password: e.target.value })} required />
                            </div>
                        </div>
                        <label htmlFor="">Rol *</label>
                        <select name="roles" id="roles" value={updatedUser.role || ""} onChange={e => setUpdatedUser({ ...updatedUser, role: e.target.value })}>
                            <option value="" disabled>Seleccione el rol</option>
                            <option value="administrador">Administrador</option>
                        <option value="general">General</option>
                        </select>
                        <button className="button">Actualizar</button>
                    </div>
                </form>
            </main>
        </div>
    );
}