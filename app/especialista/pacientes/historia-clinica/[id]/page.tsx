'use client'
import { useRouter, useParams } from 'next/navigation'
import React, { useEffect, useState } from "react"
import Button from "@/components/ui/button"
import Loading from "@/components/loading"
import HeaderB from "@/components/headerB";
import { X } from 'lucide-react';
import { MedicalRecord } from '@/app/types/medical-record'
import calculateAge from '@/app/services/calculateAge'
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
                                <Button className="absolute top-3 left-2 shadow-none rounded-full"onClick={() => router.push("/especialista/pacientes")}>
                                    <X className="text-gray-500 w-5 h-5" />
                                </Button>
                            </div>

                            <main className="flex flex-col w-full gap-4 py-12">
                                <h1 className="text-2xl font-bold text-gray-800 text-center">Historia clínica</h1>

                                <hr className="w-full max-w-2xl mx-auto border-gray-200"/>

                                <div className="flex flex-col items-center">
                                    <div className="flex flex-col w-full max-w-2xl p-8 gap-4">
                                        <div className="flex flex-row justify-between items-center gap-2 py-2">
                                            <h2 className="font-bold text-gray-700">{ record?.nombre } { record?.apellido }</h2>
                                            <p className="text-gray-700"><span><b>N° Historia: </b><span>{ record?.codigo }</span></span></p>
                                        </div>

                                        <div className="border-y border-gray-200 text-center py-2">
                                            <p className="text-gray-600 text-sm"><span><b>Fecha de modificación: </b><span>{ record?.fecha_modificacion ? formatDate(record?.fecha_modificacion) : "-" }</span></span></p>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 py-2 text-sm">
                                            <p className="text-gray-600"><span><b>Sexo:</b> <span>{ (record?.genero === "M") ? "Masculino" : "Femenino" }</span></span></p>
                                            <p className="text-gray-600"><span><b>Edad:</b> <span>{ record?.fecha_nacimiento ? calculateAge(record.fecha_nacimiento) : "-" } años</span></span></p>
                                            <p className="text-gray-600"><span><b>Cédula de Identidad:</b> <span>{ record?.cedula || "-" }</span></span></p>
                                            <p className="text-gray-600"><span><b>Correo electrónico:</b> <span>{ record?.email || "-" }</span></span></p>
                                            <p className="text-gray-600"><span><b>Teléfono:</b> <span>{ record?.telefono || "-" }</span></span></p>
                                            <p className="text-gray-600"><span><b>Domicilio:</b> <span>{ record?.direccion || "-" }</span></span></p>
                                        </div>

                                        <div className="border-t border-gray-200 text-center py-5">
                                            <h2 className="font-semibold text-xl text-gray-800 mb-4">Antecedentes médicos</h2>
                                            <p className="text-sm text-gray-500 text-justify">{record?.antecedentes || "No se han encontrado antecedentes médicos."}</p>
                                        </div>

                                        <div className="border-t border-gray-200 text-center py-5">
                                            <h2 className="font-semibold text-xl text-gray-800 mb-4">Observaciones</h2>
                                            <p className="text-sm text-gray-500 text-justify">{record?.observaciones || "No se han encontrado observaciones."}</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-center gap-2 text-sm">
                                        <Button
                                            className="px-8 py-1 bg-blue-500 text-white rounded-full shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 ease-in-out"
                                            onClick={() => router.push(`/especialista/pacientes/historia-clinica/actualizacion/${id}`)}
                                            >
                                            Editar
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