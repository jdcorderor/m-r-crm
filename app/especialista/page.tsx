"use client"
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Loading from "@/components/loading";
import HeaderB from "@/components/headerB";

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
    const [stats, setStats] = useState<{ firstName: string; lastName: string; totalIncomeLast30Days: number; outstandingDebt: number; confirmedAppointmentsToday: number; confirmedAppointmentsThisWeek: number; pendingAppointments: number; consultationsToday: number; consultationsThisWeek: number; totalRegisteredPatients: number; patientsWithConsultations: number } | null>(null);


    // Get stats from the DB using fetch
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch(`/api/specialist/stats/${user.username}`, {
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
        
        if (user.username) {
            fetchStats();
        }
    }, [user]);

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
                    <HeaderB />

                    <div className="w-full pt-8 px-[5vw]">
                        <span className="block text-gray-800 text-2xl font-semibold mb-12">Bienvenido(a), Od. {stats?.firstName.split(" ")[0]} {stats?.lastName.split(" ")[0]}</span>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-gray-50 p-6 border border-gray-200 rounded-lg flex flex-col justify-between">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-semibold text-sm uppercase tracking-wider text-gray-700">Pacientes</h3>
                                </div>
                                <p className="text-4xl font-bold text-blue-600 mt-2">{stats?.totalRegisteredPatients}</p>
                                <p className="text-sm text-gray-500 mt-2">registrados en el sistema de gestión</p>
                            </div>

                            <div className="bg-gray-50 p-6 border border-gray-200 rounded-lg flex flex-col justify-between">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-semibold text-sm uppercase tracking-wider text-gray-700">Pacientes</h3>
                                </div>
                                <p className="text-4xl font-bold text-blue-600 mt-2">{stats?.patientsWithConsultations}</p>
                                <p className="text-sm text-gray-500 mt-2">atendidos históricamente</p>
                            </div>

                            <div className="bg-gray-50 p-6 border border-gray-200 rounded-lg flex flex-col justify-between">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-semibold text-sm uppercase tracking-wider text-gray-700">Consultas odontológicas</h3>
                                </div>
                                <p className="text-4xl font-bold text-yellow-600 mt-2">{stats?.consultationsToday}</p>
                                <p className="text-sm text-gray-500 mt-2">realizadas hoy</p>
                            </div>

                            <div className="bg-gray-50 p-6 border border-gray-200 rounded-lg flex flex-col justify-between">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-semibold text-sm uppercase tracking-wider text-gray-700">Consultas odontológicas</h3>
                                </div>
                                <p className="text-4xl font-bold text-yellow-600 mt-2">{stats?.consultationsThisWeek}</p>
                                <p className="text-sm text-gray-500 mt-2">realizadas esta semana</p>
                            </div>

                            <div className="bg-gray-50 p-6 border border-gray-200 rounded-lg flex flex-col justify-between">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-semibold text-sm uppercase tracking-wider text-gray-700">Citas agendadas</h3>
                                </div>
                                <p className="text-4xl font-bold text-purple-700 mt-2">{stats?.confirmedAppointmentsToday}</p>
                                <p className="text-sm text-gray-500 mt-2">programadas para hoy</p>
                            </div>

                            <div className="bg-gray-50 p-6 border border-gray-200 rounded-lg flex flex-col justify-between">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-semibold text-sm uppercase tracking-wider text-gray-700">Citas agendadas</h3>
                                </div>
                                <p className="text-4xl font-bold text-purple-700 mt-2">{stats?.confirmedAppointmentsThisWeek}</p>
                                <p className="text-sm text-gray-500 mt-2">programadas para esta semana</p>
                            </div>

                            <div className="bg-gray-50 p-6 border border-gray-200 rounded-lg flex flex-col justify-between">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-semibold text-sm uppercase tracking-wider text-gray-700">Solicitudes de cita</h3>
                                </div>
                                <p className="text-4xl font-bold text-purple-700 mt-2">{stats?.pendingAppointments}</p>
                                <p className="text-sm text-gray-500 mt-2">pendientes por aprobación</p>
                            </div>

                            <div className="bg-gray-50 p-6 border border-gray-200 rounded-lg flex flex-col justify-between">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-semibold text-sm uppercase tracking-wider text-gray-700">Ingresos</h3>
                                </div>
                                <p className="text-3xl font-bold text-green-600 mt-2">{new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'USD' }).format(stats?.totalIncomeLast30Days ?? 0)}</p>
                                <p className="text-sm text-gray-500 mt-2">en los últimos 30 días</p>
                            </div>

                            <div className="bg-gray-50 p-6 border border-gray-200 rounded-lg flex flex-col justify-between">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-semibold text-sm uppercase tracking-wider text-gray-700">Pendiente por cobrar</h3>
                                </div>
                                <p className="text-3xl font-bold text-red-600 mt-2">{new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'USD' }).format(stats?.outstandingDebt ?? 0)}</p>
                                <p className="text-sm text-gray-500 mt-2">pendiente por cobrar</p>
                            </div>

                        </div>
                    </div>   
                </div>
            )}
        </section>
    );
}