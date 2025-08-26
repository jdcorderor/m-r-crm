"use client"
import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Input from "@/components/ui/input"
import Loading from "@/components/loading"
import HeaderB from "@/components/headerB"
import { Paciente } from "@/app/types/patient"
import { formatDate } from "@/hooks/homePageHooks"
import calculateAge from "@/app/services/calculateAge"

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

    // State variables for patient details
    const [patients, setPatients] = useState<Paciente[]>([])

    // State variables for search bar
    const [searchTerm, setSearchTerm] = useState("");

    // ---------------------------------------------------------------------------

    // Get patients data from the DB using fetch
    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const response = await fetch("/api/specialist/patients", {
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
                setIsLoading(false);
            } catch (error) {
                console.error("Error al obtener pacientes:", error);
            }
        };

        fetchPatients();
    }, []);

    // State variable for filtering option
    const [option, setOption] = useState<number>(0)

    // Filtered patients
    const filteredPatients = patients.filter((p) => {
        const nombre = p.nombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const apellido = p.apellido.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const fecha_nacimiento = formatDate(p.fecha_nacimiento).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const termino = searchTerm.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        return nombre.includes(termino) || apellido.includes(termino) || fecha_nacimiento.includes(termino);
    });

    // Birthday patients (today)
    const todayPatients = patients.filter((p) => {
        const birthDate = new Date(p.fecha_nacimiento);
        return birthDate.getDate() === new Date().getDate() && birthDate.getMonth() === new Date().getMonth();
    });

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
                    <HeaderB />
                    <main className="w-full px-[5vw] pt-8">
                        <span className="block text-gray-800 text-2xl font-semibold mb-6">Cumpleaños</span>
                        
                        <div className="w-fit border-2 border-gray-200 rounded-3xl shadow-sm mb-2">
                            <button className={`text-sm px-4 py-2 border-gray-300  ${(option === 0) ? "bg-gray-200 rounded-3xl" : ""}`} onClick={ () => { setOption(0) } }>Todos</button>
                            <button className={`text-sm px-4 py-2 border-gray-300  ${(option === 1) ? "bg-gray-200 rounded-3xl" : ""}`} onClick={ () => { setOption(1) } }>Hoy</button>
                        </div>

                        <div className="bg-white py-1 space-y-2">
                            <Input className="border border-gray-300 text-sm font-medium shadow-none" placeholder="ej. Pedro Pérez | 01/01/2025" type="text" value={searchTerm} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}></Input>
                            <div className="overflow-x-auto duration-500 max-h-[60vh]">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="sticky top-0 bg-gray-100">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Cédula de Identidad</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Paciente</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Fecha de nacimiento</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Edad</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Teléfono</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {(option === 0) && filteredPatients.map((paciente) => (
                                            <tr key={paciente.nombre} className="hover:bg-gray-50 text-sm">
                                                <td className="px-4 py-2">{paciente.cedula || "-"}</td>
                                                <td className="px-4 py-2">{paciente.nombre || "-"} {paciente.apellido || "-"}</td>
                                                <td className="px-4 py-2">{formatDate(paciente.fecha_nacimiento).split(",")[0] || "-"}</td>
                                                <td className="px-4 py-2">{calculateAge(paciente.fecha_nacimiento)}</td>
                                                <td className="px-4 py-2">{paciente.telefono || "-"}</td>
                                            </tr>
                                        ))}

                                        {option === 1 && (todayPatients.length > 0 ? (
                                            todayPatients.map((paciente) => (
                                                <tr key={paciente.nombre} className="hover:bg-gray-50 text-sm">
                                                    <td className="px-4 py-2">{paciente.cedula || "-"}</td>
                                                    <td className="px-4 py-2">{paciente.nombre || "-"} {paciente.apellido || "-"}</td>
                                                    <td className="px-4 py-2">{formatDate(paciente.fecha_nacimiento).split(",")[0] || "-"}</td>
                                                    <td className="px-4 py-2">{calculateAge(paciente.fecha_nacimiento)}</td>
                                                    <td className="px-4 py-2">{paciente.telefono || "-"}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={5} className="bg-gray-50 px-4 py-5 text-sm text-center text-gray-500">
                                                    No se han encontrado cumpleañeros del día
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-center gap-2">
                                <button
                                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-8 rounded shadow-sm transition-colors border-3 border-gray-300 rounded-3xl cursor-pointer"
                                    type="button"
                                    onClick={() => router.push("/especialista/reportes") }
                                >
                                    Volver
                                </button>
                        </div>
                    </main>
                </div>
            )}
        </section>
    );
}