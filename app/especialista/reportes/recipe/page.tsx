"use client"
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/input";
import Loading from "@/components/loading";
import HeaderB from "@/components/headerB";
import { Paciente } from "@/app/types/patient";
import { Medicine } from "@/app/types/medicine";
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

    // State variable for medicines array
    const [medicines, setMedicines] = useState<Medicine[]>([]);

    // Get medicines data from the DB using fetch
    useEffect(() => {
        const fetchMedicines = async () => {
            try {
                const response = await fetch("/api/administrator/basic-data/medicines", {
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
                setMedicines(data);
            } catch (error) {
                console.error("Error al obtener medicamentos:", error);
            }
        };

        fetchMedicines();
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

    // State variable for selected medicine
    const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);

    // State variable for indications
    const [indications, setIndications] = useState<string | null>(null);

    // State variable for suggested brand
    const [suggestedBrand, setSuggestedBrand] = useState<string | null>(null);

    // State variable for added medicines array
    const [addedMedicines, setAddedMedicines] = useState<{ id: number, nombre: string, descripcion: string, indicaciones: string, marca: string }[]>([]);

    // Add medicine handler
    function handleAddMedicine() {
        if (!selectedMedicine || !indications) return;

        const medicamento = selectedMedicine;

        if (medicamento && indications) {
            setAddedMedicines([...addedMedicines, {
                id: medicamento?.id,
                nombre: medicamento?.nombre,
                descripcion: (medicamento?.descripcion),
                indicaciones: indications,
                marca: suggestedBrand || ""
            }]);
        }

        setSelectedMedicine(null);
        setIndications(null);
        setSuggestedBrand(null);
    }

    // Remove medicine handler
    const handleRemoveMedicine = (indexToRemove: number) => {
        setAddedMedicines(prev => {
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
    const [warnings, setWarnings] = useState<string>("");
    const [expiration, setExpiration] = useState<string>("");
    const [save, setSave] = useState(false);

    // Report generation handler
    const handleGeneration = async () => {
        if (addedMedicines.length > 0 && patients.find((p) => Number(p.codigo) === Number(patient)) && observations && warnings && expiration) {
            const data = {
                dentista: dentist,
                paciente: patients.find((p) => Number(p.codigo) === Number(patient)),
                medicamentos: addedMedicines,
                observaciones: observations,
                advertencias: warnings,
                fecha_vencimiento: new Date(expiration).toISOString()
            }

            const response = await fetch('/api/specialist/reports/recipe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            
            const blob = await response.blob();
            const file = new File([blob], `Récipe - ${formatDate(new Date().toISOString()).split(",")[0]}.pdf`, { type: blob.type });
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
                            <h3 className="border-b border-gray-200 text-xl font-semibold py-2 mb-4">Récipe</h3>
                            
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
                                <div className="grid grid-cols-2 w-full items-center gap-2">
                                    <div className="flex flex-col w-full gap-1">
                                        <label htmlFor="medicine" className="font-medium">Medicamento *</label>
                                        <select name="medicine" id="medicine" required className="bg-white border border-gray-300 rounded-lg px-3 py-2 mb-2 w-full outline-none" value={selectedMedicine ? medicines.findIndex(m => m.id === selectedMedicine.id) : ""} onChange={ (e) => { setSelectedMedicine(medicines[Number(e.target.value)]) } }>
                                            <option value="" disabled>Selecciona un medicamento</option>
                                                    
                                            {medicines.map((m, index) => (
                                                <option key={index} value={index}>
                                                    {m.nombre}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    
                                    <div className="flex flex-col w-full gap-1">
                                        <label htmlFor="brand" className="font-medium">Marca comercial sugerida</label>
                                        <Input name="brand" id="brand" required className="h-9 border border-gray-300 outline-none text-gray-800" placeholder="Marca comercial sugerida" value={ suggestedBrand || "" } onChange={ (e: React.ChangeEvent<HTMLInputElement>) => setSuggestedBrand(e.target.value) }></Input>
                                    </div>
                                </div>

                                <div className="flex flex-col w-full gap-1 mt-3">
                                    <label htmlFor="indications" className="font-medium">Indicaciones *</label>
                                    <Input name="indications" id="indications" required className="h-9 border border-gray-300 outline-none text-gray-800" placeholder="Indicaciones" value={ indications || "" } onChange={ (e: React.ChangeEvent<HTMLInputElement>) => setIndications(e.target.value) }></Input>
                                </div>

                                <div className="flex flex-row mx-auto gap-2">
                                    <button className="w-fit bg-gray-200 hover:bg-gray-300 rounded-full font-medium px-5 py-1 mx-auto mt-2" onClick={ handleAddMedicine }>
                                        Agregar medicamento
                                    </button>
                                </div>
                            </div>

                            {addedMedicines.length > 0 && (
                                <div className="border-y border-gray-200 my-3 py-3">
                                    <h4 className="text-base font-semibold mb-3">Medicamentos agregados</h4>
                                    <table className="min-w-full border border-gray-300 rounded-md overflow-hidden">
                                        <thead className="bg-gray-100 text-left text-sm font-medium text-gray-700">
                                            <tr>
                                                <th className="px-4 py-2">Medicamento</th>
                                                <th className="px-4 py-2">Indicaciones</th>
                                                <th className="px-4 py-2">Marca sugerida</th>
                                                <th className="px-4 py-2 text-center">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-sm text-gray-800">
                                            {addedMedicines.map((m, index) => (
                                                <tr key={index} className="border-t border-gray-200">
                                                    <td className="px-4 py-2">{m.nombre}</td>
                                                    <td className="px-4 py-2 max-w-xs truncate">{m.indicaciones}</td>
                                                    <td className="px-4 py-2">{m.marca || "-"}</td>
                                                    <td className="px-4 py-2 text-center">
                                                        <button onClick={() => handleRemoveMedicine(index)} className="text-red-600 hover:text-red-800 font-medium transition">
                                                            <Trash className="w-4 h-4"></Trash>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            <div className="flex flex-col w-full gap-1 mt-3">
                                <label htmlFor="expiration" className="font-medium">Fecha de Vencimiento *</label>
                                <Input name="expiration" id="expiration" type="date" min={new Date().toISOString().split("T")[0]} required className="h-9 border border-gray-300 outline-none text-gray-800" placeholder="Fecha de vencimiento" value={ expiration || "" } onChange={ (e: React.ChangeEvent<HTMLInputElement>) => setExpiration(e.target.value) }></Input>
                            </div>

                            <div className="flex flex-col w-full gap-1 mb-2">
                                <label htmlFor="warnings" className="font-medium">Advertencias al farmacéutico *</label>
                                <textarea name="warnings" id="warnings" required className="bg-white border border-gray-300 rounded-lg p-2 outline-none" rows={3} placeholder="Advertencias" value={ warnings } onChange={ (e: React.ChangeEvent<HTMLTextAreaElement>) => setWarnings(e.target.value) }></textarea>
                            </div>

                            <div className="flex flex-col w-full gap-1 mb-2">
                                <label htmlFor="observations" className="font-medium">Observaciones al paciente *</label>
                                <textarea name="observations" id="observations" required className="bg-white border border-gray-300 rounded-lg p-2 outline-none" rows={3} placeholder="Observaciones" value={ observations } onChange={ (e: React.ChangeEvent<HTMLTextAreaElement>) => setObservations(e.target.value) }></textarea>
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