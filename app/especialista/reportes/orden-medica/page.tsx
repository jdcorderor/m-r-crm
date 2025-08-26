"use client"
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Loading from "@/components/loading";
import HeaderB from "@/components/headerB";
import { Paciente } from "@/app/types/patient";
import { Examination } from "@/app/types/examination";
import { formatDate } from "@/hooks/homePageHooks";
import { Trash } from "lucide-react";

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

    // State variable for patients array
    const [patients, setPatients] = useState<Paciente[]>([])

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
            } catch (error) {
                console.error("Error al obtener pacientes:", error);
            }
        };

        fetchPatients();
    }, []);

    // ---------------------------------------------------------------------------

    // State variable for examinations array
    const [examinations, setExaminations] = useState<Examination[]>([]);

    // Get examinations data from the DB using fetch
    useEffect(() => {
        const fetchExaminations = async () => {
            try {
                const response = await fetch("/api/administrator/basic-data/exams", {
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
                setExaminations(data);
            } catch (error) {
                console.error("Error al obtener examenes:", error);
            }
        };

        fetchExaminations();
    }, []);

    // ---------------------------------------------------------------------------

    // State variable for dentist data
    const [dentist, setDentist] = useState<string>("")

    // Get dentist data from the DB using fetch
    useEffect(() => {
        const fetchDentist = async () => {
            if (user.username) {
                try {
                    const response = await fetch(`/api/specialist/reports/dentist/${user.username}`, {
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
                    setDentist(data);
                    setIsLoading(false);
                } catch (error) {
                    console.error("Error al obtener el especialista:", error);
                }
            }
        };

        fetchDentist();
    }, [user]);

    // --------------------------------------------------------------------------

    const fileToBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });

    // --------------------------------------------------------------------------

    // State variable for selected examination
    const [selectedExamination, setSelectedExamination] = useState<Examination | null>(null);

    // State variable for added examinations array
    const [addedExaminations, setAddedExaminations] = useState<{ id: number, nombre: string, descripcion: string }[]>([]);

    // Add examination handler
    function handleAddExamination() {
        if (!selectedExamination) return;

        const examen = selectedExamination;

        if (examen) {
            setAddedExaminations([...addedExaminations, {
                id: examen?.id,
                nombre: examen?.nombre,
                descripcion: (examen?.descripcion)
            }]);
        }

        setSelectedExamination(null);
    }

    // Remove examination handler
    const handleRemoveExamination = (indexToRemove: number) => {
        setAddedExaminations(prev => {
            if (indexToRemove < 0 || indexToRemove >= prev.length) {
                console.warn(`Invalid index: ${indexToRemove}`);
                return prev; 
            }

            const updated = [...prev.slice(0, indexToRemove), ...prev.slice(indexToRemove + 1)];
            return updated;
        });
    };

    // ---------------------------------------------------------------------------

    // State variables for report data 
    const [patient, setPatient] = useState<number | null>(null);
    const [observations, setObservations] = useState<string>("");
    const [save, setSave] = useState(false);

    // Report generation handler
    const handleGeneration = async () => {
        if (addedExaminations.length > 0 && patients.find((p) => Number(p.codigo) === Number(patient)) && observations) {
            const data = {
                dentista: dentist,
                paciente: patients.find((p) => Number(p.codigo) === Number(patient)),
                examenes: addedExaminations,
                observaciones: observations
            }

            const response = await fetch('/api/specialist/reports/order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            
            const blob = await response.blob();
            const file = new File([blob], `Orden Médica - ${formatDate(new Date().toISOString()).split(",")[0]}.pdf`, { type: blob.type });
            const url = URL.createObjectURL(blob);

            if (save) {
                const base64 = await fileToBase64(file);

                const fileResponse = await fetch("/api/specialist/files", {
                    method: "POST",
                    headers: { 
                        "Content-Type": "application/json" 
                    },
                    body: JSON.stringify({ codigo_paciente: patient, base64, nombre: file.name })
                });

                if (!fileResponse.ok) {
                    const error = await fileResponse.json();
                    console.error(error.message);
                }
            }

            window.open(url);
            window.history.back();
        }
    }

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

                    <div className="flex flex-col max-w-4xl bg-gray-50 border border-gray-200 rounded-2xl p-16 mx-auto my-10 gap-4">
                        <fieldset className="flex flex-col text-sm text-gray-800 gap-3">
                            <h3 className="border-b border-gray-200 text-xl font-semibold py-2 mb-4">Orden Médica</h3>
                            
                            <div className="flex flex-col w-full gap-1">
                                <label htmlFor="patient" className="font-medium">Paciente *</label>
                                <select name="patient" id="issue" required className="bg-white border border-gray-300 rounded-lg px-3 py-2 mb-2 w-full outline-none" value={ patient || "" } onChange={ (e) => setPatient(Number(e.target.value)) }>
                                    <option value="" disabled>Selecciona un paciente</option>
                                            
                                    {patients.map((p) => (
                                        <option key={p.codigo} value={p.codigo}>
                                            {p.nombre} {p.apellido} - C.I. {p.cedula}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="flex flex-col">
                                <div className="flex flex-col w-full gap-1">
                                    <label htmlFor="treatment" className="font-medium">Examen *</label>
                                    <select name="treatment" id="treatment" required className="bg-white border border-gray-300 rounded-lg px-3 py-2 mb-2 w-full outline-none" value={selectedExamination ? examinations.findIndex(e => e.id === selectedExamination.id) : ""} onChange={ (e) => { setSelectedExamination(examinations[Number(e.target.value)]) } }>
                                        <option value="" disabled>Selecciona un examen</option>
                                                    
                                        {examinations.map((e, index) => (
                                            <option key={index} value={index}>
                                                {e.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex flex-row mx-auto gap-2">
                                    <button className="w-fit bg-gray-200 hover:bg-gray-300 rounded-full font-medium px-5 py-1 mx-auto mt-2" onClick={ handleAddExamination }>
                                        Agregar examen
                                    </button>
                                </div>
                            </div>

                            {addedExaminations.length > 0 && (
                                <div className="border-y border-gray-200 my-3 py-3">
                                    <h4 className="text-base font-semibold mb-3">Exámenes agregados</h4>
                                    <table className="min-w-full border border-gray-300 rounded-md overflow-hidden">
                                        <thead className="bg-gray-100 text-left text-sm font-medium text-gray-700">
                                            <tr>
                                                <th className="px-4 py-2">Examen</th>
                                                <th className="px-4 py-2 text-center">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-sm text-gray-800">
                                            {addedExaminations.map((e, index) => (
                                                <tr key={index} className="border-t border-gray-200">
                                                    <td className="px-4 py-2">{e.nombre}</td>
                                                    <td className="px-4 py-2 text-center">
                                                        <button onClick={() => handleRemoveExamination(index)} className="text-red-600 hover:text-red-800 font-medium transition">
                                                            <Trash className="w-4 h-4"></Trash>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            <div className="flex flex-col w-full gap-1 mb-2">
                                <label htmlFor="observations" className="font-medium">Observaciones *</label>
                                <textarea name="observations" id="observations" required className="bg-white border border-gray-300 rounded-lg p-3 outline-none" rows={4} placeholder="Observaciones" value={ observations } onChange={ (e: React.ChangeEvent<HTMLTextAreaElement>) => setObservations(e.target.value) }></textarea>
                            </div>

                            <div className="flex items-center w-full gap-2 px-2 py-1">
                                <input type="checkbox" className="h-4 w-4 accent-blue-600" checked={save} onChange={(e) => setSave(e.target.checked)}/><span className="leading-3">Guardar el reporte en almacenamiento interno</span>
                            </div>

                            <div className="flex flex-row mx-auto gap-2">
                                <button className="w-fit bg-gray-200 hover:bg-gray-300 rounded-full font-medium px-5 py-1 mx-auto mt-2" onClick={ () => router.push("/especialista/reportes") }>
                                    Volver
                                </button>
                                <button className="w-fit bg-blue-600 hover:bg-blue-700 rounded-full text-white font-medium px-5 py-1 mx-auto mt-2" onClick={ handleGeneration }>
                                    Generar
                                </button>
                            </div>
                        </fieldset>
                    </div>
                </div>
            )}
        </section>
    );
}