"use client"
import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Loading from "@/components/loading"
import HeaderC from "@/components/headerC"
import Link from "next/link"
import { ClipboardList, TestTubes, Syringe, Quote } from "lucide-react"

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

    // State variable for loading view
    const [isLoading, setIsLoading] = useState(true);

    // ---------------------------------------------------------------------------

    // State variable for income statistics
    const [statistics, setStatistics] = useState<{ exams: number, medicines: number, services: number, comments: number }>()

    // Get income stats from the DB using fetch
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch("/api/administrator/basic-data/stats", {
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
                
                setStatistics(data);
                setIsLoading(false);
            } catch (error) {
                console.error("Error al obtener pacientes:", error);
            }
        };

        fetchStats();
    }, []);

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
                    <HeaderC />
                    <main className="w-full px-[5vw] pt-8">
                        <span className="block text-gray-800 text-2xl font-semibold mb-6">Gestión de Datos Básicos</span>

                        {/* Stats */}
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
                            <div className="flex flex-col bg-white border border-gray-200 rounded-lg p-4 gap-1">
                                <h3 className="text-sm font-medium text-gray-500 mb-1">Servicios</h3>
                                <p className="text-3xl font-semibold text-gray-700">
                                    {statistics?.services}
                                </p>
                                <p className="text-xs text-gray-500">Servicios registrados</p>
                            </div>
                            
                            <div className="flex flex-col bg-white border border-gray-200 rounded-lg p-4 gap-1">
                                <h3 className="text-sm font-medium text-gray-500 mb-1">Exámenes</h3>
                                <p className="text-3xl font-semibold text-gray-700">
                                    {statistics?.exams}
                                </p>
                                <p className="text-xs text-gray-500">Exámenes registrados</p>
                            </div>

                            <div className="flex flex-col bg-white border border-gray-200 rounded-lg p-4 gap-1">
                                <h3 className="text-sm font-medium text-gray-500 mb-1">Medicamentos</h3>
                                <p className="text-3xl font-semibold text-gray-700">
                                    {statistics?.medicines}
                                </p>
                                <p className="text-xs text-gray-500">Medicamentos registrados</p>
                            </div>

                            <div className="flex flex-col bg-white border border-gray-200 rounded-lg p-4 gap-1">
                                <h3 className="text-sm font-medium text-gray-500 mb-1">Comentarios</h3>
                                <p className="text-3xl font-semibold text-gray-700">
                                    {statistics?.comments}
                                </p>
                                <p className="text-xs text-gray-500">Comentarios pendientes por aprobación</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <Link href="/administrador/datos-basicos/servicios" className="block group">
                                <div className="bg-white p-6 border border-gray-200 rounded-lg hover:-translate-y-1 transition-all duration-300 h-full">
                                    <div className="flex items-center justify-center w-14 h-14 bg-blue-50 rounded-full mb-5">
                                        <ClipboardList className="w-6 h-6 text-blue-800" />
                                    </div>
                                    <h2 className="text-lg font-bold text-gray-700 mb-2">Gestión de Servicios</h2>
                                    <p className="text-sm text-gray-600">Gestionar los servicios/tratamientos ofrecidos en la clínica odontológica Mavarez & Román.</p>
                                </div>
                            </Link>
                            <Link href="/administrador/datos-basicos/examenes" className="block group">
                                <div className="bg-white p-6 border border-gray-200 rounded-lg hover:-translate-y-1 transition-all duration-300 h-full">
                                    <div className="flex items-center justify-center w-14 h-14 bg-blue-50 rounded-full mb-5">
                                        <TestTubes className="w-6 h-6 text-blue-800"/>
                                    </div>
                                    <h2 className="text-lg font-bold text-gray-700 mb-2">Gestión de Exámenes</h2>
                                    <p className="text-sm text-gray-600">Administrar los exámenes de laboratorio y estudios indicados a los pacientes.</p>
                                </div>
                            </Link>
                            <Link href="/administrador/datos-basicos/medicamentos" className="block group">
                                <div className="bg-white p-6 border border-gray-200 rounded-lg hover:-translate-y-1 transition-all duration-300 h-full">
                                    <div className="flex items-center justify-center w-14 h-14 bg-blue-50 rounded-full mb-5">
                                        <Syringe className="w-6 h-6 text-blue-800" />
                                    </div>
                                    <h2 className="text-lg font-bold text-gray-700 mb-2">Gestión de Medicamentos</h2>
                                    <p className="text-sm text-gray-600">Gestionar la información de los medicamentos recetados a los pacientes.</p>
                                </div>
                            </Link>
                            <Link href="/administrador/datos-basicos/comentarios" className="block group">
                                <div className="bg-white p-6 border border-gray-200 rounded-lg hover:-translate-y-1 transition-all duration-300 h-full">
                                    <div className="flex items-center justify-center w-14 h-14 bg-blue-50 rounded-full mb-5">
                                        <Quote className="w-6 h-6 text-blue-800" />
                                    </div>
                                    <h2 className="text-lg font-bold text-gray-700 mb-2">Gestión de Comentarios</h2>
                                    <p className="text-sm text-gray-600">Administrar los comentarios posteados por los usuarios en el sitio web.</p>
                                </div>
                            </Link>
                        </div>
                    </main>
                </div>
            )}
        </section>
    );
}