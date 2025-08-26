'use client'
import { useRouter, useParams } from 'next/navigation';
import React, { useEffect, useState } from "react"
import Button from "@/components/ui/button"
import Loading from "@/components/loading"
import HeaderB from "@/components/headerB";
import { X } from 'lucide-react'
import { MedicalRecord } from '@/app/types/medical-record';
import { DentalConsultations } from '@/app/types/dental-consultations'
import { formatDate } from '@/hooks/homePageHooks'
import calculateAge from '@/app/services/calculateAge'

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

    // Get record data from the DB using fetch
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
            } catch (error) {
                console.error("Error al obtener pacientes:", error);
            }
        };
    
        fetchRecord();
    }, [id]);

    // State variable for dental consultations array
    const [consultations, setConsultations] = useState<DentalConsultations[]>([]);
    
    // Get consultations data from the DB using fetch
    useEffect(() => {
        const fetchRecord = async () => {
            try {
                const response = await fetch(`/api/specialist/dental-consultations/${id}`, {
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
    
                setConsultations(data);
                setIsLoading(false);
            } catch (error) {
                console.error("Error al obtener pacientes:", error);
            }
        };
    
        fetchRecord();
    }, [id]);

    // --------------------------------------------------------------------------

    // State variable for modal visibility
    const [detailsModalID, setDetailsModalID] = useState<number | null>(null);

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
                            <Button className="absolute top-3 left-2 shadow-none rounded-full transition"onClick={() => router.push("/especialista/pacientes")}>
                                <X className="text-gray-500 w-5 h-5" />
                            </Button>
                        </div>

                        <main className="flex flex-col w-full gap-12 py-12">
                            <h1 className="text-2xl font-bold text-gray-800 text-center">Historial de consultas</h1>
                            
                            <div className="flex flex-col mx-20">
                                <div className="border-b border-gray-200 pb-4">
                                    <div className="flex flex-row md:flex-row w-full justify-between gap-8">
                                        <div className="flex-1 flex flex-col gap-2">
                                            <p className="text-gray-600"><span><b>N° Historia:</b> <span>{id}</span></span></p>
                                            <p className="text-gray-600"><span><b>Paciente:</b> <span>{record?.nombre} {record?.apellido}</span></span></p>
                                            <p className="text-gray-600"><span><b>Edad:</b> <span>{ record?.fecha_nacimiento ? calculateAge(record?.fecha_nacimiento) : "" } años</span></span></p>
                                        </div>
                                        <div className="flex-1 flex flex-col gap-2 text-right">
                                            <p className="text-gray-600"><span><b>Total de consultas:</b> <span>{consultations.length > 0 ? consultations.length : "0"}</span></span></p>
                                            <p className="text-gray-600"><span><b>Última consulta:</b> <span>{consultations.length > 0 ? formatDate(consultations[0].fecha) : "N/A"}</span></span></p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    {consultations.length > 0 && (
                                        <div className="flex flex-col w-full justify-center gap-8 py-6">
                                            {consultations.map((c) => (
                                                <div key={c.id} className="flex flex-col bg-white rounded-xl p-6 w-full border border-gray-200 text-sm gap-1">
                                                    <div className="flex flex-row justify-between items-center mb-2">
                                                        <h3 className="text-lg font-semibold text-gray-800">{c.codigo}</h3> 
                                                        <h3 className="text-lg font-light text-gray-800">{formatDate(c.fecha)}</h3> 
                                                    </div>

                                                    <p className="text-gray-600"><span><b>Especialista:</b> Od. <span>{c.especialista}</span></span></p>
                                                    <p className="text-gray-600"><span><b>Monto total:</b> <span>{new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'USD' }).format(c.monto_total)}</span></span></p>
                                                    <p><span><b className="text-gray-600">Estado administrativo:</b> <span className={`text-gray-600 ${(c.monto_total === c.monto_pagado) ? "text-green-600" : "text-red-600"}`}>{(c.monto_total === c.monto_pagado) ? "Pagado" : "Impago"}</span></span></p>

                                                    <div className="flex justify-center gap-2 mt-2">
                                                        <button className="bg-blue-600 hover:bg-blue-700 rounded-full border border-gray-300 px-4 py-1 text-xs text-white"
                                                            onClick={() => {setDetailsModalID(c.id)}}>
                                                            Ver detalles
                                                        </button>
                                                    </div>

                                                    {(detailsModalID === c.id) && (
                                                        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 backdrop-blur-sm">
                                                            <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 max-w-xl w-full flex flex-col gap-6">
                                                                <header className="flex flex-col gap-5">
                                                                    <h2 className="text-center text-gray-700 text-lg font-bold">Detalles de la consulta</h2>
                                                                    <div className="border-y border-gray-200 py-2">
                                                                        <p className="text-gray-600"><span><b>Consulta:</b> <span>{c.codigo}</span></span></p>
                                                                        <p className="text-gray-600"><span><b>Especialista:</b> Od. <span>{c.especialista}</span></span></p>
                                                                        <p className="text-gray-600"><span><b>Fecha:</b> <span>{formatDate(c.fecha)}</span></span></p>
                                                                    </div>
                                                                </header>

                                                                <section className="w-full text-sm">
                                                                    <div className="border-b border-gray-200 pb-4 text-gray-600">
                                                                        <h4><b>Diagnóstico</b></h4>
                                                                        <ul>
                                                                            {c.diagnostico.map((d, index) => (
                                                                                <li key={index}>{d}</li>
                                                                            ))}
                                                                        </ul>
                                                                    </div>
                                                                    <div className="border-b border-gray-200 py-4 text-gray-600">
                                                                        <h4><b>Tratamiento</b></h4>
                                                                        <ul>
                                                                            {c.tratamiento.map((t, index) => (
                                                                                <li key={index}>{t}</li>
                                                                            ))}
                                                                        </ul>
                                                                    </div>
                                                                    <div className="py-4 text-gray-600">
                                                                        <h4><b>Observaciones</b></h4>
                                                                        <p>{c.observaciones}</p>
                                                                    </div>
                                                                </section>

                                                                <footer className="flex justify-center">
                                                                    <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-5 py-1 rounded-full transition-colors" onClick={() => setDetailsModalID(null)}>
                                                                        Cerrar
                                                                    </button>
                                                                </footer>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {consultations.length === 0 && (
                                        <div className="flex flex-col w-full justify-center gap-8 pt-8 text-center text-sm text-gray-600">
                                            <p>El paciente <b>{record?.nombre} {record?.apellido}</b> no tiene consultas registradas</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </main>
                    </div>
                </section>
            )}
        </section>
    );
};