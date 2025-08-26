"use client"
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import HeaderC from "@/components/headerC";
import Loading from "@/components/loading";
import Input from "@/components/ui/input";
import { X, Pencil, Trash } from "lucide-react";
import { Examination } from "@/app/types/examination";

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
    
    // State variables for search bar
    const [searchTerm, setSearchTerm] = useState("");

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
                setIsLoading(false);
            } catch (error) {
                console.error("Error al obtener examenes:", error);
            }
        };

        fetchExaminations();
    }, []); 
    
    // Filtered examinations
    const filteredExaminations = examinations.filter((e) => {
        const nombre = e.nombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const descripcion = e.descripcion ? e.descripcion.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : "";
        const termino = searchTerm.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        return nombre.includes(termino) || descripcion.includes(termino);
    });

    // ---------------------------------------------------------------------------

    // State variable for modal visibility
    const [showModal, setShowModal] = useState(false);

    // State variable for selected examination
    const [selectedExamination, setSelectedExamination] = useState<Examination | null>(null);

    // Open modal handler
    const handleOpenModal = (examination: Examination | null = null) => {
        setSelectedExamination(examination ? { ...examination } : { id: 0, nombre: "", descripcion: "" });
        setShowModal(true);
    };

    // Close modal handler
    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedExamination(null);
    };

    // Examination registration handler
    const handleSaveExamination = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedExamination) return;

        const isUpdating = "id" in selectedExamination && selectedExamination.id;
        const method = isUpdating ? "PUT" : "POST";

        if (method === "POST") {
            try {
                const response = await fetch("/api/administrator/basic-data/exams", {
                    method: method,
                    headers: { 
                        'Content-Type': 'application/json' 
                    },
                    body: JSON.stringify({ nombre: selectedExamination.nombre, descripcion: selectedExamination.descripcion }),
                });

                if (response.ok) {
                    handleCloseModal();
                    window.location.reload();
                }
            } catch (error) {
                console.error(error);
            }
        } else if (method === "PUT") {
            try {
                const response = await fetch(`/api/administrator/basic-data/exams/${selectedExamination.id}`, {
                    method: method,
                    headers: { 
                        'Content-Type': 'application/json' 
                    },
                    body: JSON.stringify({ nombre: selectedExamination.nombre, descripcion: selectedExamination.descripcion }),
                });

                if (response.ok) {
                    handleCloseModal();
                    window.location.reload();
                }
            } catch (error) {
                console.error(error);
            }
        } else {
            return;
        }
    };

    // Examination deletion handler
    const handleDelete = async (id: number) => {
        try {
            const response = await fetch(`/api/administrator/basic-data/exams/${id}`, {
                method: 'DELETE',
                headers: { 
                    'Content-Type': 'application/json' 
                }
            });

            if (response.ok) {
                window.location.reload();
            }
        } catch (error) {
            console.error(error);
        }
    };

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
                        <span className="block text-gray-800 text-2xl font-semibold mb-6">Gestión de Exámenes</span>
                        <div className="bg-white py-1 space-y-2">
                            <Input className="border border-gray-300 text-sm font-medium shadow-none" placeholder="ej. Panorámica" type="text" value={searchTerm} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}></Input>
                            <div className="overflow-x-auto duration-500 max-h-[60vh]">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="sticky top-0 bg-gray-100">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Examen</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Descripción</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredExaminations.map((e) => (
                                            <tr key={e.nombre} className="hover:bg-gray-50 text-sm">
                                                <td className="px-4 py-2">{e.nombre || "-"}</td>
                                                <td className="px-4 py-2">{e.descripcion || "-"}</td>
                                                <td className="px-4 py-2 flex gap-2">
                                                    <button className="text-blue-600 hover:text-blue-800 p-1 rounded disabled:opacity-50 cursor-pointer" title="Editar"
                                                        onClick={() => { handleOpenModal(e) }}>
                                                        <Pencil className="w-4 h-4"></Pencil>
                                                    </button>
                                                    <button className="text-red-600 hover:text-green-800 p-1 rounded disabled:opacity-50 cursor-pointer" title="Eliminar"
                                                        onClick={() => { handleDelete(e.id) }}>
                                                        <Trash className="w-4 h-4"></Trash>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}

                                        {(examinations.length > 0 && filteredExaminations.length === 0) && (
                                            <tr>
                                                <td colSpan={5} className="bg-gray-50 border-b border-gray-200 text-center text-sm text-gray-600 py-5">
                                                    No se han encontrado resultados coincidentes
                                                </td>
                                            </tr>
                                        )}

                                        {(examinations.length === 0 && filteredExaminations.length === 0) && (
                                            <tr>
                                                <td colSpan={5} className="bg-gray-50 border-b border-gray-200 text-center text-sm text-gray-600 py-5">
                                                    No hay exámenes registrados
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-8 flex justify-center gap-2">
                                <button
                                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-8 rounded shadow-sm transition-colors border-3 border-gray-300 rounded-3xl cursor-pointer"
                                    type="button"
                                    onClick={() => handleOpenModal() }
                                >
                                    Registrar examen
                                </button>
                                <button
                                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-8 rounded shadow-sm transition-colors border-3 border-gray-300 rounded-3xl cursor-pointer"
                                    type="button"
                                    onClick={() => router.push("/administrador/datos-basicos") }
                                >
                                    Volver
                                </button>
                            </div>
                        </div>
                    </main>
                    
                    {/* Registration/update modal */}
                    {showModal && selectedExamination && (
                        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40 backdrop-blur-sm">
                            <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
                                
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold text-gray-700">{selectedExamination.id ? 'Editar examen' : 'Registrar examen'}</h2>
                                    <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-800 transition-colors"><X size={24} /></button>
                                </div>

                                <form onSubmit={handleSaveExamination}>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                                            <Input type="text" className="text-sm border-gray-300" value={selectedExamination.nombre} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSelectedExamination({ ...selectedExamination, nombre: e.target.value })} placeholder="Nombre del examen" required />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                                            <textarea className="w-full border border-gray-300 rounded-lg text-sm text-gray-500 p-2 outline-none" rows={5} value={selectedExamination.descripcion || ""} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSelectedExamination({ ...selectedExamination, descripcion: e.target.value })} placeholder="Descripción" />
                                        </div>
                                    </div>

                                    <div className="flex justify-center gap-2 mt-4 text-sm">
                                        <button type="button" onClick={handleCloseModal} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-full">
                                            Cancelar
                                        </button>
                                        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full">
                                            Guardar
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </section>
    );
}