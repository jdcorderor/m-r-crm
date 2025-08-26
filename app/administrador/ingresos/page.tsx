"use client"
import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Input from "@/components/ui/input"
import Loading from "@/components/loading"
import HeaderC from "@/components/headerC"
import { PatientPayments } from "@/app/types/patient-payments"

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

    // State variable for patient details
    const [patients, setPatients] = useState<PatientPayments[]>([])

    // State variable for search bar
    const [searchTerm, setSearchTerm] = useState("");

    // ---------------------------------------------------------------------------

    // Get patients data from the DB using fetch
    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const response = await fetch("/api/administrator/income", {
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
                setPatients(data);
            } catch (error) {
                console.error("Error al obtener pacientes:", error);
            }
        };

        fetchPatients();
    }, []);

    // Filtered patients
    const filteredPatients = patients.filter((p) => {
        const nombre = p.paciente.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const cedula = p.cedula?.toString() || "";
        const id = p.codigo?.toString() || "";
        const termino = searchTerm.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") || "";
        return nombre.includes(termino) || cedula.includes(termino) || id.includes(termino);
    });

    // --------------------------------------------------------------------------

    // State variable for income statistics
    const [statistics, setStatistics] = useState<{ totalIncome: number, pendingToPay: number, debtPercentage: number }>()

    // Get income stats from the DB using fetch
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch("/api/administrator/income/stats", {
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
                console.error(error);
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
                    <main className="w-full px-[5vw] pt-8">
                        <span className="block text-gray-800 text-2xl font-semibold mb-6">Ingresos</span>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                            <div className="bg-white border border-gray-200 rounded-lg p-4">
                                <h3 className="text-sm font-medium text-gray-500 mb-1">Ingresos (últimos 30 días)</h3>
                                <p className="text-2xl font-semibold text-green-600">
                                    {new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'USD' }).format(statistics?.totalIncome ?? 0)}
                                </p>
                            </div>

                            <div className="bg-white border border-gray-200 rounded-lg p-4">
                                <h3 className="text-sm font-medium text-gray-500 mb-1">Pendiente por cobrar</h3>
                                <p className="text-2xl font-semibold text-red-600">
                                    {new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'USD' }).format(statistics?.pendingToPay ?? 0)}
                                </p>
                            </div>

                            <div className="bg-white border border-gray-200 rounded-lg p-4">
                                <h3 className="text-sm font-medium text-gray-500 mb-1">Pacientes con deuda pendiente</h3>
                                <p className="text-2xl font-semibold text-yellow-600">
                                    {`${(Number(statistics?.debtPercentage) ?? 0).toFixed(1)}%`}
                                </p>
                            </div>
                        </div>

                        <div className="bg-white py-1 space-y-2">
                            <Input className="border border-gray-300 text-sm font-medium shadow-none" placeholder="ej. Pedro Pérez | 12345678" type="text" value={searchTerm} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}></Input>
                            
                            <div className="overflow-x-auto duration-500 max-h-[60vh]">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="sticky top-0 bg-gray-100">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">N° Historia</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Cédula de Identidad</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Paciente</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Teléfono</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Correo electrónico</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Total cancelado</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Deuda</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredPatients.map((paciente, index) => (
                                            <tr key={index} className="hover:bg-gray-50 text-sm cursor-pointer" onClick={ () => { if( paciente.monto_pagado > 0 ) { router.push(`/administrador/ingresos/${paciente.codigo}`) } } }>
                                                <td className="px-4 py-2">{paciente.codigo || "-"}</td>
                                                <td className="px-4 py-2">{paciente.cedula || "-"}</td>
                                                <td className="px-4 py-2">{paciente.paciente || "-"}</td>
                                                <td className="px-4 py-2">{paciente.telefono || "-"}</td>
                                                <td className="px-4 py-2">{paciente.email || "-"}</td>
                                                <td className="px-4 py-2">{new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'USD' }).format(paciente.monto_pagado)}</td>
                                                <td className={`px-4 py-2 ${(paciente.monto_total > paciente.monto_pagado) ? "text-red-600" : ""} font-medium`}>{new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'USD' }).format(paciente.monto_total - paciente.monto_pagado)}</td>
                                            </tr>
                                        ))}

                                        {(patients.length > 0 && filteredPatients.length === 0) && (
                                            <tr>
                                                <td colSpan={7} className="bg-gray-50 border-b border-gray-200 text-center text-sm text-gray-600 py-5">
                                                    No se han encontrado resultados coincidentes
                                                </td>
                                            </tr>
                                        )}

                                        {(patients.length === 0 && filteredPatients.length === 0) && (
                                            <tr>
                                                <td colSpan={7} className="bg-gray-50 border-b border-gray-200 text-center text-sm text-gray-600 py-5">
                                                    No hay pacientes registrados
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </main>
                </div>
            )}
        </section>
    );
}