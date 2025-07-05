"use client"
import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import HeaderC from "@/components/headerC";
import Image from "next/image";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import Loading from "@/components/loading";
import 'bootstrap-icons/font/bootstrap-icons.css';

export default function UpdateUserA() {
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
        description: "",
        image_url: ""
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
            const response = await fetch("/api/users/specialist", {
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
                    specialty: "",
                    image_url: ""
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

            const response = await fetch(`/api/users/specialist/${username}`, {
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
                setIsLoading(false);
            }
        }

        handleDataLoad();
    }, [username]);

    // -----------------------------------------------------------------------------
        
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setDentist({ ...dentist, image_url: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

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
                                        <div className="flex items-center justify-center w-42 h-42 rounded-full bg-gray-100 my-12 mx-auto relative" >
                                            <label htmlFor="image" className="flex items-center justify-center w-full h-full cursor-pointer" >
                                                <input name="image" id="image" type="file" className="hidden" accept="image/*" onChange={ handleFileChange } />
                                                {dentist.image_url ? (
                                                    <Image src={dentist.image_url} width={1080} height={1080} alt="" className="absolute w-full h-full object-cover object-top rounded-full"  />
                                                ) : (
                                                    <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                        <circle cx="12" cy="7" r="4"></circle>
                                                        <path fill="none" strokeLinecap="round" strokeLinejoin="round" d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                                    </svg>
                                                )}
                                            </label>
                                        </div>

                                        <span className="block text-lg text-gray-800 font-medium mb-2">Información personal</span>
                                        <hr className="border-gray-200 mb-5"/>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-1 pl-2" htmlFor="firstname">Nombre *</label>
                                                <Input id="firstname" className="border-gray-300 text-sm" type="text" placeholder="Nombre" value={dentist.firstname} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDentist({ ...dentist, firstname: e.target.value })} required />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1 pl-2" htmlFor="lastname">Apellido *</label>
                                                <Input id="lastname" className="border-gray-300 text-sm" type="text" placeholder="Apellido" value={dentist.lastname} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDentist({ ...dentist, lastname: e.target.value })} required />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1 pl-2" htmlFor="id">Cédula de Identidad *</label>
                                                <Input id="id" className="border-gray-300 text-sm" type="number" placeholder="Cédula (ej. 12345678)" value={dentist.id} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDentist({ ...dentist, id: e.target.value })} required />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1 pl-2" htmlFor="phone">Teléfono *</label>
                                                <Input id="phone" className="border-gray-300 text-sm" type="tel" placeholder="Teléfono (ej. 04240001234)" value={dentist.phone} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDentist({ ...dentist, phone: e.target.value })} required />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1 pl-2" htmlFor="email">Correo electrónico *</label>
                                                <Input id="email" className="border-gray-300 text-sm" type="email" placeholder="Correo electrónico" value={dentist.email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDentist({ ...dentist, email: e.target.value })} required />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1 pl-2" htmlFor="specialty">Especialidad *</label>
                                                <Input id="specialty" className="border-gray-300 text-sm" type="text" placeholder="Especialidad" value={dentist.specialty} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDentist({ ...dentist, specialty: e.target.value })} required />
                                            </div>
                                        </div>
                                        <div className="mb-7">
                                            <label className="block text-sm font-medium mb-1 pl-2" htmlFor="description">Descripción *</label>
                                            <Input id="description" className="border-gray-300 text-sm" type="text" placeholder="Descripción" value={dentist.description} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDentist({ ...dentist, description: e.target.value })} required />
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