"use client"
import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getAllUsers } from "@/app/services/allUsersService"
import HeaderC from "@/components/headerC"
import Button from "@/components/ui/button"
import Loading from "@/components/loading"
import { X } from "lucide-react"
import 'bootstrap-icons/font/bootstrap-icons.css'

export default function Users() {
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

    // --------------------------------------------------------------------------

    // State variable for roles modal
    const [RoleSelectModal, setRoleSelectModal] = useState<boolean>(false);

    // --------------------------------------------------------------------------

    // State variable for loading view
    const [isLoading, setIsLoading] = useState(true);

    // ---------------------------------------------------------------------------
    
    // User type
    type User = {
        id?: number;
        email?: string;
        username: string;
        role: string;
        person_id?: number;
    };

    // State variable for users array
    const [users, setUsers] = useState<User[]>([]);
    
    // Get user data (for administrator)
    useEffect(() => {
        if (user.role === "administrador") {
            getAllUsers()
            .then(data => {
                setUsers(data || []);
                setIsLoading(false);
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
                method: 'PUT',
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
        <section>
            {isLoading && (
                <div className="flex justify-center items-center min-h-screen bg-white transition-opacity duration-500">
                    <Loading />
                </div>
            )}            
            
            {!isLoading && (
                <div>
                    {/* Header */}
                    <HeaderC />

                    {/* Users table */}
                    <main className="w-full px-[5vw] pt-8">
                        <span className="block text-gray-800 text-2xl font-semibold mb-12">Gestión de Usuarios</span>
                        <div className="bg-white py-1">
                            <div className="overflow-x-auto max-h-[60vh]">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Cédula de Identidad</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Correo Electrónico</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Usuario</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Rol</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {users.map((u) => (
                                            <tr key={u.username} className="hover:bg-gray-50 text-sm">
                                                <td className="px-4 py-2">{u.id || "-"}</td>
                                                <td className="px-4 py-2">{u.email || "-"}</td>
                                                <td className="px-4 py-2">{u.username}</td>
                                                <td className="px-4 py-2 capitalize">{u.role}</td>
                                                <td className="px-4 py-2 flex gap-2">
                                                    <button className="text-blue-600 hover:text-blue-800 p-1 rounded disabled:opacity-50 cursor-pointer" title="Editar" disabled={u.role === "administrador"} onClick={() => { if (u.role !== "administrador") { router.push(`/administrador/usuarios/actualizacion/${(u.role === "general") ? "especialista" : "auxiliar"}/${u.username}`); } }}> 
                                                        <i className="bi bi-pencil-square"></i>
                                                    </button>
                                                    <button className="text-red-600 hover:text-red-800 p-1 rounded disabled:opacity-50 cursor-pointer" title="Eliminar" disabled={u.role === "administrador"} onClick={async () => { if (u.role !== "administrador") { await handleUserDeletion(u.username);} }}>
                                                        <i className="bi bi-trash"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-8 flex justify-center">
                                <button
                                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-8 rounded shadow-sm transition-colors border-3 border-gray-300 rounded-3xl cursor-pointer"
                                    type="button"
                                    onClick={() => setRoleSelectModal(true)}
                                >
                                    Registrar usuario
                                </button>
                            </div>
                        </div>
                    </main>
                </div>
            )}
        
            {/* Role select modal */}
            {RoleSelectModal && (
                <div className="fixed inset-0 flex items-center justify-center z-[1000] bg-black/40 backdrop-blur-sm">
                    <button className="absolute left-5 top-5 text-white cursor-pointer" onClick={() => setRoleSelectModal(false)}><X /></button>
                    <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 max-w-sm w-full flex flex-col items-center">
                        <span className="text-lg font-semibold text-center mb-4">Por favor, seleccione una opción</span>
                        <Button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-3xl py-2 mt-2 transition border-3 border-gray-400" onClick={() => router.push("/administrador/usuarios/registro/especialista")}> Especialista </Button>
                        <Button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-3xl py-2 mt-2 transition border-3 border-gray-400" onClick={() => router.push("/administrador/usuarios/registro/auxiliar")}> Auxiliar </Button>
                    </div>
                </div>
            )}
        </section>
    );
}