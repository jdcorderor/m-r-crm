"use client"
import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Button from "@/components/ui/button"
import Input from "@/components/ui/input"
import Loading from "@/components/loading"
import HeaderB from "@/components/headerB"
import { Eye, House } from "lucide-react"
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
    const [seePatient, setSeePatient] = useState<boolean>(false);
    const [PatientDetails, setPatientDetails] = useState<Paciente | null>(null);

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

    // Filtered patients
    const filteredPatients = patients.filter((p) => {
        const nombre = p.nombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const apellido = p.apellido.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const cedula = p.cedula?.toString() || "";
        const id = p.codigo?.toString() || "";
        const termino = searchTerm.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        return nombre.includes(termino) || apellido.includes(termino) || cedula.includes(termino) || id.includes(termino);
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
                        <span className="block text-gray-800 text-2xl font-semibold mb-6">Pacientes</span>
                        <div className="bg-white py-1 space-y-2">
                            <Input className="border border-gray-300 text-sm font-medium shadow-none" placeholder="ej. Pedro Pérez | 12345678" type="text" value={searchTerm} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}></Input>
                            <div className={`overflow-x-auto duration-500 ${seePatient ? "max-h-[20vh]" : "max-h-[60vh]"}`}>
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="sticky top-0 bg-gray-100">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">N° Historia</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Cédula de Identidad</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Paciente</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Edad</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredPatients.map((paciente) => (
                                            <tr key={paciente.nombre} className="hover:bg-gray-50 text-sm">
                                                <td className="px-4 py-2">{paciente.codigo || "-"}</td>
                                                <td className="px-4 py-2">{paciente.cedula || "-"}</td>
                                                <td className="px-4 py-2">{paciente.nombre || "-"} {paciente.apellido || "-"}</td>
                                                <td className="px-4 py-2">{calculateAge(paciente.fecha_nacimiento)}</td>
                                                <td className="px-4 py-2 flex gap-2">
                                                    <button className="text-blue-600 hover:text-blue-800 p-1 rounded disabled:opacity-50 cursor-pointer" title="Ver Detalles"
                                                        onClick={() => {
                                                            setPatientDetails(paciente);
                                                            setSeePatient(true);
                                                        }}>
                                                        <Eye className="w-4 h-4"></Eye>
                                                    </button>
                                                    <button className="text-green-600 hover:text-green-800 p-1 rounded disabled:opacity-50 cursor-pointer" title="Atender"
                                                        onClick={() => router.push(`/especialista/pacientes/${paciente.codigo}`)}>
                                                        <House className="w-4 h-4"></House>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}

                                        {(patients.length > 0 && filteredPatients.length === 0) && (
                                            <tr>
                                                <td colSpan={5} className="bg-gray-50 border-b border-gray-200 text-center text-sm text-gray-600 py-5">
                                                    No se han encontrado resultados coincidentes
                                                </td>
                                            </tr>
                                        )}

                                        {(patients.length === 0 && filteredPatients.length === 0) && (
                                            <tr>
                                                <td colSpan={5} className="bg-gray-50 border-b border-gray-200 text-center text-sm text-gray-600 py-5">
                                                    No hay pacientes registrados
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className={`bg-white my-8 py-1 duration-500 ${seePatient ? "block" : "hidden"}`}>
                            <div className="flex flex-col w-full border border-gray-200 md:px-32 py-8 rounded-lg gap-8">
                                <span className="block text-gray-800 text-xl font-semibold px-12">Detalles del Paciente</span>
                                <div className="grid grid-cols-3 w-full items-start justify-center">
                                    <div className="w-full pl-12">
                                        <p><span className="font-bold">N° Historia:</span> {PatientDetails?.codigo} </p>
                                        <p><span className="font-bold">Cédula de Identidad / RIF:</span> {PatientDetails?.cedula} </p>
                                    </div>
                                    <div className="w-full pl-12">
                                        <p><span className="font-bold">Paciente:</span> {PatientDetails?.nombre} {PatientDetails?.apellido} </p>
                                        <p><span className="font-bold">Fecha de Nacimiento:</span> {PatientDetails?.fecha_nacimiento ? formatDate(PatientDetails?.fecha_nacimiento.toString()).split(",")[0] : "-"} </p>
                                        <p><span className="font-bold">Edad:</span> { PatientDetails?.fecha_nacimiento ? calculateAge(PatientDetails?.fecha_nacimiento) : "" }</p>
                                    </div>
                                    <div className="w-full pl-12">
                                        <p><span className="font-bold">Correo electrónico:</span> {PatientDetails?.email} </p>
                                        <p><span className="font-bold">Teléfono:</span> {PatientDetails?.telefono} </p>
                                    </div>
                                </div>

                                <div className="w-full flex items-center justify-center">
                                    <Button className="bg-blue-500 hover:bg-blue-600 cursor-pointer rounded-full text-sm text-white mx-3"
                                        onClick={() => {
                                            if (PatientDetails && PatientDetails.codigo) {
                                                router.push(`/especialista/pacientes/historia-clinica/${PatientDetails.codigo}`)
                                            }
                                        }}>
                                        Historia clínica
                                    </Button>
                                    <Button className="bg-blue-500 hover:bg-blue-600 cursor-pointer rounded-full text-sm text-white mx-3"
                                        onClick={() => {
                                            if (PatientDetails && PatientDetails.codigo) {
                                                router.push(`/especialista/pacientes/historial-consultas/${PatientDetails.codigo}`)
                                            }
                                        }}>
                                        Historial de consultas
                                    </Button>
                                    <Button className="bg-blue-500 hover:bg-blue-600 cursor-pointer rounded-full text-sm text-white mx-3"
                                        onClick={() => {
                                            if (PatientDetails && PatientDetails.codigo) {
                                                router.push(`/especialista/pacientes/historial-pagos/${PatientDetails.codigo}`)
                                            }
                                        }}>
                                        Historial de pagos
                                    </Button>
                                    <Button className="bg-blue-500 hover:bg-blue-600 cursor-pointer rounded-full text-sm text-white mx-3"
                                        onClick={() => {
                                            if (PatientDetails && PatientDetails.codigo) {
                                                router.push(`/especialista/pacientes/odontodiagrama/${PatientDetails.codigo}`)
                                            }
                                        }}>
                                        Odontodiagrama
                                    </Button>
                                    <Button className="bg-green-500 hover:bg-green-600 cursor-pointer rounded-full text-sm text-white mx-3"
                                        onClick={() => {
                                            if (PatientDetails && PatientDetails.codigo) {
                                                router.push(`/especialista/pacientes/${PatientDetails.codigo}`)
                                            }
                                        }}>
                                        Iniciar atención
                                    </Button>
                                    <Button className="bg-gray-300 rounded-full text-sm mx-3"
                                        onClick={() => setSeePatient(false)}>
                                        Volver
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className={`${!seePatient ? "flex" : "hidden"} mt-8 justify-center gap-2`}>
                            <button
                                 className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-8 rounded shadow-sm transition-colors border-3 border-gray-300 rounded-3xl cursor-pointer"
                                type="button"
                                onClick={() => { router.push("/especialista/pacientes/registro") }}
                            >
                                Registrar paciente
                            </button>
                        </div>
                    </main>
                </div>
            )}
        </section>
    );
}