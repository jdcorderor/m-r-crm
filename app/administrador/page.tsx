"use client"
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Loading from "@/components/loading";
import HeaderC from "@/components/headerC";

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

    // ---------------------------------------------------------------------------

    // State variable for loading view
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // ---------------------------------------------------------------------------

    // State variable for stats
    const [stats, setStats] = useState<{ totalUsers: number, totalCredentials: number, totalServices: number, totalDentists: number, totalPatients: number, weeklyAppointments: number, weeklyConsultations: number, paymentsLast30Days: number, totalDebt: number } | null>(null);

    // Get stats from the DB using fetch
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch("/api/administrator/stats", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                });

            if (response.ok) {
                const data = await response.json();
                setStats(data);
                setIsLoading(false);
            } else {
                console.error("Failed to fetch stats:", response.status);
            }
            } catch (error) {
                console.error("Error fetching stats:", error);
            }
        };

        fetchStats();
    }, []);

    // ---------------------------------------------------------------------------

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

                    <div className="w-full pt-8 px-[5vw]">
                        <span className="block text-gray-800 text-2xl font-semibold mb-12">Bienvenido, Administrador</span>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-gray-50 p-6 border border-gray-200 rounded-lg flex flex-col justify-between">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-semibold text-sm uppercase tracking-wider text-gray-700">Usuarios</h3>
                                </div>
                                <p className="text-4xl font-bold text-blue-600 mt-2">{stats?.totalUsers}</p>
                                <p className="text-sm text-gray-500 mt-2">registrados en el sistema de gestión</p>
                            </div>

                            <div className="bg-gray-50 p-6 border border-gray-200 rounded-lg flex flex-col justify-between">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-semibold text-sm uppercase tracking-wider text-gray-700">Odontólogos</h3>
                                </div>
                                <p className="text-4xl font-bold text-blue-600 mt-2">{stats?.totalDentists}</p>
                                <p className="text-sm text-gray-500 mt-2">registrados en el sistema de gestión</p>
                            </div>

                            <div className="bg-gray-50 p-6 border border-gray-200 rounded-lg flex flex-col justify-between">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-semibold text-sm uppercase tracking-wider text-gray-700">Pacientes</h3>
                                </div>
                                <p className="text-4xl font-bold text-blue-600 mt-2">{stats?.totalPatients}</p>
                                <p className="text-sm text-gray-500 mt-2">registrados en el sistema de gestión</p>
                            </div>

                            <div className="bg-gray-50 p-6 border border-gray-200 rounded-lg flex flex-col justify-between">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-semibold text-sm uppercase tracking-wider text-gray-700">Ingresos</h3>
                                </div>
                                <p className="text-3xl font-bold text-green-600 mt-2">{new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'USD' }).format(stats?.paymentsLast30Days ?? 0)}</p>
                                <p className="text-sm text-gray-500 mt-2">en los últimos 30 días</p>
                            </div>

                            <div className="bg-gray-50 p-6 border border-gray-200 rounded-lg flex flex-col justify-between">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-semibold text-sm uppercase tracking-wider text-gray-700">Pendiente por cobrar</h3>
                                </div>
                                <p className="text-3xl font-bold text-red-600 mt-2">{new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'USD' }).format(stats?.totalDebt ?? 0)}</p>
                                <p className="text-sm text-gray-500 mt-2">pendiente por cobrar</p>
                            </div>

                            <div className="bg-gray-50 p-6 border border-gray-200 rounded-lg flex flex-col justify-between">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-semibold text-sm uppercase tracking-wider text-gray-700">Consultas odontológicas</h3>
                                </div>
                                <p className="text-4xl font-bold text-yellow-600 mt-2">{stats?.weeklyConsultations}</p>
                                <p className="text-sm text-gray-500 mt-2">realizadas esta semana</p>
                            </div>

                            <div className="bg-gray-50 p-6 border border-gray-200 rounded-lg flex flex-col justify-between">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-semibold text-sm uppercase tracking-wider text-gray-700">Citas agendadas</h3>
                                </div>
                                <p className="text-4xl font-bold text-yellow-600 mt-2">{stats?.weeklyAppointments}</p>
                                <p className="text-sm text-gray-500 mt-2">programadas esta semana</p>
                            </div>

                            <div className="bg-gray-50 p-6 border border-gray-200 rounded-lg flex flex-col justify-between">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-semibold text-sm uppercase tracking-wider text-gray-700">Servicios/tratamientos</h3>
                                </div>
                                <p className="text-4xl font-bold text-blue-600 mt-2">{stats?.totalServices}</p>
                                <p className="text-sm text-gray-500 mt-2">registrados en el sistema de gestión</p>
                            </div>

                            <div className="bg-gray-50 p-6 border border-gray-200 rounded-lg flex flex-col justify-between">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-semibold text-sm uppercase tracking-wider text-gray-700">Usuarios de la plataforma en línea</h3>
                                </div>
                                <p className="text-4xl font-bold text-blue-600 mt-2">{stats?.totalCredentials}</p>
                                <p className="text-sm text-gray-500 mt-2">registrados en la plataforma web</p>
                            </div>

                        </div>
                    </div>   
                </div>
            )}
        </section>
    );
}