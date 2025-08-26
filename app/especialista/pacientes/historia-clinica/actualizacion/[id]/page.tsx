'use client'
import { useRouter, useParams } from 'next/navigation'
import React, { useEffect, useState } from "react"
import Input from '@/components/ui/input'
import Button from "@/components/ui/button"
import Loading from "@/components/loading"
import HeaderB from "@/components/headerB"
import { X } from 'lucide-react'
import { MedicalRecord } from '@/app/types/medical-record'
import { formatDate } from '@/hooks/homePageHooks'

export default function Page() {
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

    // Get patient ID from URL params
    const { id } = useParams();

    // --------------------------------------------------------------------------

    // State variable for loading view
    const [isLoading, setIsLoading] = useState(true);
    
    // --------------------------------------------------------------------------

    // State variable for medical record data
    const [record, setRecord] = useState<MedicalRecord>();

    // Get patients data from the DB using fetch
    useEffect(() => {
        const fetchRecord = async () => {
            try {
                const response = await fetch(`/api/specialist/medical-record/${id}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                });

                if (!response.ok) {
                    throw new Error(`Error ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();

                setRecord(data);
                setIsLoading(false);
            } catch (error) {
                console.error("Error al obtener pacientes:", error);
            }
        };

        fetchRecord();
    }, [id]);

    // --------------------------------------------------------------------------

    // Medical record update handler
    const handleUpdate = async () => {
        try {
            if (!record?.nombre || !record?.apellido || !record?.cedula || !record?.email || !record?.telefono || !record?.direccion || !record?.antecedentes || !record?.observaciones ) {
                alert("Debe llenar todos los campos");
                return;
            }

            const response = await fetch(`/api/specialist/medical-record/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(record),
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            router.push(`/especialista/pacientes/historia-clinica/${id}`);
        } catch (error) {
            console.error("Error al obtener pacientes:", error);
        }
    };

    // --------------------------------------------------------------------------

    // Verify user variable
    if (user.username === "" && user.role === "") return null;

    return (
        <section>
            {isLoading && (
                    <div className="min-h-screen flex items-center justify-center">
                        <Loading />
                    </div>
            )}

            {!isLoading && (
                    <section className="flex flex-col items-center justify-center">
                        <HeaderB />

                        <div className="w-full max-w-4xl bg-gray-50 border border-gray-200 rounded-lg my-10">

                            <div className="relative top-0">
                                <Button className="absolute top-3 left-2 shadow-none rounded-full"onClick={() => router.push(`/especialista/pacientes/historia-clinica/${id}`)}>
                                    <X className="text-gray-500 w-5 h-5" />
                                </Button>
                            </div>

                            <main className="flex flex-col w-full gap-4 py-12">
                                <h1 className="text-2xl font-bold text-gray-800 text-center">Historia clínica</h1>

                                <hr className="w-full max-w-2xl mx-auto border-gray-200"/>

                                <div className="flex flex-col items-center">
                                    <div className="flex flex-col w-full max-w-2xl p-8 gap-6">

                                        <div className="flex flex-col border-b border-gray-200 pb-4 gap-6 text-sm text-gray-800">
                                            <div className="flex flex-col md:flex-row border-b border-gray-200 py-2 gap-4">
                                                <div className="flex flex-col flex-1 gap-1 text-base">
                                                    <p className="font-semibold">N° Historia: <span className="font-normal">{record?.codigo}</span></p>
                                                </div>
                                            </div>
                                            
                                            <div className="flex flex-col md:flex-row gap-4">
                                                <div className="flex flex-col flex-1 gap-1">
                                                    <label htmlFor="nombre" className="font-semibold">Nombre *</label>
                                                    <Input id="nombre" required placeholder="Nombre" className="border-gray-300" value={record?.nombre || ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRecord(prev => ({ ...(prev ?? {}), nombre: e.target.value }))} />
                                                </div>
                                                <div className="flex flex-col flex-1 gap-1">
                                                    <label htmlFor="apellido" className="font-semibold">Apellido *</label>
                                                    <Input id="apellido" required placeholder="Apellido" className="border-gray-300" value={record?.apellido || ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRecord(prev => ({ ...(prev ?? {}), apellido: e.target.value }))} />
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-800">
                                            <div className="flex flex-col flex-1 gap-1">
                                                <label htmlFor="cedula" className="font-semibold">Cédula de Identidad</label>
                                                <Input id="cedula" required type="number" min="100000" max="99999999" placeholder="Cédula (ej. 12345678)" className="border-gray-300" value={record?.cedula ?? ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRecord(prev => ({ ...(prev ?? {}), cedula: e.target.value }))} />
                                            </div>

                                            <div className="flex flex-col flex-1 gap-1">
                                                <label htmlFor="fecha-nacimiento" className="font-semibold">Fecha de nacimiento *</label>
                                                <Input id="fecha-nacimiento" required placeholder="Fecha de nacimiento" className="border-gray-300" value={record?.fecha_nacimiento ? formatDate(record?.fecha_nacimiento).split(",")[0] : ""} disabled />
                                            </div>
                                            
                                            <div className="flex flex-col flex-1 gap-1">
                                                <label htmlFor="email" className="font-semibold">Correo electrónico *</label>
                                                <Input id="email" required placeholder="Correo electrónico" className="border-gray-300" value={record?.email || ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRecord(prev => ({ ...(prev ?? {}), email: e.target.value }))} />
                                            </div>
                                            
                                            <div className="flex flex-col flex-1 gap-1">
                                                <label htmlFor="telefono" className="font-semibold">Teléfono *</label>
                                                <Input id="telefono" required placeholder="Teléfono" className="border-gray-300" value={record?.telefono || ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRecord(prev => ({ ...(prev ?? {}), telefono: e.target.value }))} />
                                            </div>
                                            
                                            <div className="flex flex-col flex-1 gap-1">
                                                <label htmlFor="direccion" className="font-semibold">Dirección *</label>
                                                <Input id="direccion" required placeholder="Dirección" className="border-gray-300" value={record?.direccion || ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRecord(prev => ({ ...(prev ?? {}), direccion: e.target.value }))} />
                                            </div>
                                            
                                            <div className="flex flex-col flex-1 gap-1">
                                                <label htmlFor="genero" className="font-semibold">Género *</label>
                                                <Input id="genero" required placeholder="Género" className="border-gray-300" value={record?.genero === "M" ? "Masculino" : "Femenino"} disabled />
                                            </div>
                                        </div>

                                        <div className="border-t border-gray-200 text-center py-4 text-gray-800">
                                            <h2 className="font-semibold text-xl my-4">Antecedentes médicos</h2>
                                            <textarea id="antecedentes" className="w-full bg-white border border-gray-200 rounded-lg outline-none p-4 text-sm text-justify text-gray-600" rows={7} value={record?.antecedentes || ""} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRecord(prev => ({ ...(prev ?? {}), antecedentes: e.target.value }))} />
                                        </div>

                                        <div className="border-t border-gray-200 text-center py-4 text-gray-800">
                                            <h2 className="font-semibold text-xl my-4">Observaciones</h2>
                                            <textarea id="observaciones" className="w-full bg-white border border-gray-200 rounded-lg outline-none p-4 text-sm text-justify text-gray-600" rows={7} value={record?.observaciones} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRecord(prev => ({ ...(prev ?? {}), observaciones: e.target.value }))}></textarea>
                                        </div>

                                    </div>
                                    <div className="flex justify-center gap-2 text-sm">
                                        <Button
                                            className="px-8 py-1 bg-blue-500 text-white rounded-full shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 ease-in-out"
                                            onClick={ handleUpdate }
                                            >
                                            Actualizar
                                        </Button>
                                    </div>
                                </div>
                            </main>
                        </div>
                    </section>
            )}
        </section>
    );
};