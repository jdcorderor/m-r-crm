"use client"
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { handleLogout } from "../services/logoutService";
import { getAllUsers } from "../services/allUsersService";    
import "bootstrap/dist/css/bootstrap.min.css";
import 'bootstrap-icons/font/bootstrap-icons.css';

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
    
    // User type
    type User = {
        id?: number;
        email?: string;
        username: string;
        role: string;
        dentist_id?: number;
    };

    // State variable for users array
    const [users, setUsers] = useState<User[]>([]);
    
    // Get user data (for administrator)
    useEffect(() => {
        if (user.role === "administrador") {
            getAllUsers()
            .then(data => {
                setUsers(data || []);
            });
        } else if (user.role !== "") {
            setUsers([]);
        }
    }, [user.role]);

    // --------------------------------------------------------------------------

    // User deletion handler
    async function handleUserDeletion(key: string) {
      try {
        const response = await fetch("/api/users", {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ key: key }),
          credentials: "include",
        });

        if (response.ok) {
            if (user.role === "administrador") {
                getAllUsers()
                .then(data => {
                    setUsers(data || []);
                });
            } else if (user.role !== "") {
                setUsers([]);
            }
        }
      } catch (error) {
        console.error('Error durante la solicitud:', error);
      }
    }

    // --------------------------------------------------------------------------

    // Verify user variable
    if (user.username === "" && user.role === "") return null;

    return (
        <div>
            {/* Header */}
            <header>
                <div className="header" >
                <div className="custom-font">
                    <a>Mavarez & Román</a>
                </div>
                    {/* Navigator */}
                    <nav className="nav-links">
                        <a onClick={async () => { await handleLogout(); router.push("/login"); }}>Cerrar sesión</a>
                    </nav>
                </div>
            </header>

            {/* Main content */}
            <main className="body">
                <h2>Gestión de Usuarios</h2>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Cédula de Identidad</th>
                                <th>Correo Electrónico</th>
                                <th>Usuario</th>
                                <th>Rol</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u) => (
                                <tr key={u.username}>
                                    <td>{u.id || "-"}</td>
                                    <td>{u.email || "-"}</td>
                                    <td>{u.username}</td>
                                    <td>{u.role}</td>
                                    <td>
                                        <button className="edit-button" title="Editar"><i onClick={ () => { if (u.role != "administrador") { router.push(`/usuarios/actualizacion/${u.username}`) } }} className="bi bi-pencil-square"></i></button>
                                        <button className="delete-button" title="Eliminar" onClick={ async () => { if (u.role != "administrador") { await handleUserDeletion(u.username) } }}><i className="bi bi-trash"></i></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <button className="button" type="button" onClick={ () => router.push("/usuarios/registro") }>Registrar usuario</button> 
                </div>
            </main>
        </div>
    );
}