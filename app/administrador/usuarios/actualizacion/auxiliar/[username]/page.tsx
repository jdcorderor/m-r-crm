"use client"
import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import HeaderC from "@/components/headerC";
import Loading from "@/components/loading";
import 'bootstrap-icons/font/bootstrap-icons.css';

export default function UpdateUserB() {
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
    const [employee, setEmployee] = useState({
        firstname: "",
        lastname: "",
        id: "",
        phone: "",
        email: ""
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
            employee: {
                ...employee,
                id: Number(employee.id),
                phone: employee.phone
            },
            user: updatedUser,
            id: id
        };

        try {
            const response = await fetch("/api/users/assistant", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(userData),
                credentials: "include",
            });

            if (response.ok) {
                setEmployee({
                    firstname: "",
                    lastname: "",
                    id: "",
                    phone: "",
                    email: "",
                });
                setUpdatedUser({
                    username: "",
                    password: "",
                    role: ""
                });

                router.push("/administrador/usuarios");
            }
        } catch (error) {
            console.error("Error al registrar el usuario:", error);
        }
    }
    
    // --------------------------------------------------------------------------
        
    // State variable for loading view
    const [isLoading, setIsLoading] = useState(true);
    
    // -----------------------------------------------------------------------------
    
    const { username } = useParams();

    // Load user data handler
    useEffect(() => {
        const handleDataLoad = async () => {
            
            if (!username) {
                console.error("Usuario no encontrado")
            }

            const response = await fetch(`/api/users/assistant/${username}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
            });
            
            if (response.ok) {
                const data = await response.json();
                setEmployee(data[0].employee);
                setUpdatedUser(data[0].user);
                setID(data[0].id);
                setIsLoading(false);
            }
        }

        handleDataLoad();
    }, [username]);

    // -----------------------------------------------------------------------------
    
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

                    {/* User update section */}
                    <main className="flex justify-center items-center min-h-[80vh]">
                        <div className="bg-white w-full max-w-5xl p-10">
                            <div>
                                <span className="block text-2xl text-gray-800 font-semibold mb-8 text-center">Actualización de Usuario</span>
                                <form className="space-y-8" onSubmit={ handleUserUpdate }>
                                    <div>
                                        <span className="block text-lg text-gray-800 font-medium mb-2">Información personal</span>
                                        <hr className="border-gray-200 mb-5"/>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-1 pl-2" htmlFor="firstname">Nombre *</label>
                                                <Input id="firstname" className="border-gray-300 text-sm" type="text" placeholder="Nombre" value={employee.firstname} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmployee({ ...employee, firstname: e.target.value })} required />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1 pl-2" htmlFor="lastname">Apellido *</label>
                                                <Input id="lastname" className="border-gray-300 text-sm" type="text" placeholder="Apellido" value={employee.lastname} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmployee({ ...employee, lastname: e.target.value })} required />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1 pl-2" htmlFor="id">Cédula de Identidad *</label>
                                                <Input id="id" className="border-gray-300 text-sm" type="number" placeholder="Cédula (ej. 12345678)" value={employee.id} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmployee({ ...employee, id: e.target.value })} required />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1 pl-2" htmlFor="phone">Teléfono *</label>
                                                <Input id="phone" className="border-gray-300 text-sm" type="tel" placeholder="Teléfono (ej. 04240001234)" value={employee.phone} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmployee({ ...employee, phone: e.target.value })} required />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1 pl-2" htmlFor="email">Correo electrónico *</label>
                                                <Input id="email" className="border-gray-300 text-sm" type="email" placeholder="Correo electrónico" value={employee.email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmployee({ ...employee, email: e.target.value })} required />
                                            </div>
                                        </div>
                                        <span className="block text-lg text-gray-800 font-medium mb-2">Datos de usuario</span>
                                        <hr className="border-gray-200 mb-5"/>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-1 pl-2" htmlFor="username">Usuario *</label>
                                                <Input id="username" className="border-gray-300 text-sm" type="text" placeholder="Usuario" value={updatedUser.username} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUpdatedUser({ ...updatedUser, username: e.target.value })} required />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1 pl-2" htmlFor="password">Contraseña *</label>
                                                <Input id="password" className="border-gray-300 text-sm" type="password" placeholder="Contraseña" value={updatedUser.password} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUpdatedUser({ ...updatedUser, password: e.target.value })} required />
                                            </div>
                                        </div>
                                        <hr className="border-gray-200 mt-4 mb-5"/>
                                        <div className="flex justify-center my-7">
                                            <Button type="submit" className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-8 rounded shadow-sm transition-colors border-3 border-gray-300 rounded-3xl">
                                                <i className="bi bi-person-plus"></i> Actualizar
                                            </Button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </main>
                </div>
            )}
        </section>
    );
}