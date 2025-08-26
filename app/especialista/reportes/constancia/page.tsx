"use client"
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/input";
import Loading from "@/components/loading";
import HeaderB from "@/components/headerB";
import { Paciente } from "@/app/types/patient";
import { formatDate } from "@/hooks/homePageHooks";

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

    // State variables for report data 
    const [patient, setPatient] = useState<number | null>(null);
    const [issue, setIssue] = useState<string>("Informe Odontológico");
    const [description, setDescription] = useState<string>("");
    const [save, setSave] = useState(false);

    // Report generation handler
    const handleGeneration = async () => {
        if (issue && description && patients.find((p) => Number(p.codigo) === Number(patient))) {
            const data = {
                dentista: dentist,
                paciente: patients.find((p) => Number(p.codigo) === Number(patient)),
                asunto: issue,
                descripcion: description
            }

            const response = await fetch('/api/specialist/reports/letter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            
            const blob = await response.blob();
            const file = new File([blob], `Constancia - ${formatDate(new Date().toISOString()).split(",")[0]}.pdf`, { type: blob.type });
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
                            <h3 className="border-b border-gray-200 text-xl font-semibold py-2 mb-4">Constancia</h3>
                            
                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex flex-col w-full gap-1">
                                    <label htmlFor="patient" className="font-medium">Paciente *</label>
                                    <select name="patient" id="patient" required className="bg-white border border-gray-300 rounded-lg px-3 py-2 mb-2 w-full outline-none" value={ patient || "" } onChange={ (e) => setPatient(Number(e.target.value)) }>
                                        <option value="" disabled>Selecciona un paciente</option>
                                            
                                        {patients.map((p) => (
                                            <option key={p.codigo} value={p.codigo}>
                                                {p.nombre} {p.apellido} - C.I. {p.cedula}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex flex-col w-full gap-1">
                                    <label htmlFor="issue" className="font-medium">Asunto *</label>
                                    <Input name="issue" id="issue" required className="h-9 border border-gray-300 outline-none text-gray-800" placeholder="Asunto" value={ issue } onChange={ (e: React.ChangeEvent<HTMLInputElement>) => setIssue(e.target.value) }></Input>
                                </div>
                            </div>

                            <div className="flex flex-col w-full gap-1 mb-2">
                                <label htmlFor="description" className="font-medium">Descripción *</label>
                                <textarea name="description" id="description" required className="bg-white border border-gray-300 rounded-lg p-3 outline-none" rows={12} placeholder="Descripción de la constancia" value={ description } onChange={ (e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value) }></textarea>
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