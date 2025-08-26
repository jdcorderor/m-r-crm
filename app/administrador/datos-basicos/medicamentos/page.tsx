"use client"
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import HeaderC from "@/components/headerC";
import Loading from "@/components/loading";
import Input from "@/components/ui/input";
import { X, Pencil, Trash } from "lucide-react";
import { Medicine } from "@/app/types/medicine";

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
                setIsLoading(false);
            } catch (error) {
                console.error("Error al obtener medicamentos:", error);
            }
        };

        fetchMedicines();
    }, []); 
    
    // Filtered medicines
    const filteredMedicines = medicines.filter((m) => {
        const nombre = m.nombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const descripcion = m.descripcion ? m.descripcion.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : "";
        const termino = searchTerm.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        return nombre.includes(termino) || descripcion.includes(termino);
    });

    // ---------------------------------------------------------------------------

    // State variable for modal visibility
    const [showModal, setShowModal] = useState(false);

    // State variable for selected medicine
    const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);

    // Open modal handler
    const handleOpenModal = (medicine: Medicine | null = null) => {
        setSelectedMedicine(medicine ? { ...medicine } : { id: 0, nombre: "", descripcion: "" });
        setShowModal(true);
    };

    // Close modal handler
    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedMedicine(null);
    };

    // Medicine registration handler
    const handleSaveMedicine = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedMedicine) return;

        const isUpdating = "id" in selectedMedicine && selectedMedicine.id;
        const method = isUpdating ? "PUT" : "POST";

        if (method === "POST") {
            try {
                const response = await fetch("/api/administrator/basic-data/medicines", {
                    method: method,
                    headers: { 
                        'Content-Type': 'application/json' 
                    },
                    body: JSON.stringify({ nombre: selectedMedicine.nombre, descripcion: selectedMedicine.descripcion }),
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
                const response = await fetch(`/api/administrator/basic-data/medicines/${selectedMedicine.id}`, {
                    method: method,
                    headers: { 
                        'Content-Type': 'application/json' 
                    },
                    body: JSON.stringify({ nombre: selectedMedicine.nombre, descripcion: selectedMedicine.descripcion }),
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

    // Medicine deletion handler
    const handleDelete = async (id: number) => {
        try {
            const response = await fetch(`/api/administrator/basic-data/medicines/${id}`, {
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
                        <span className="block text-gray-800 text-2xl font-semibold mb-6">Gestión de Medicamentos</span>
                        <div className="bg-white py-1 space-y-2">
                            <Input className="border border-gray-300 text-sm font-medium shadow-none" placeholder="ej. Amoxicilina" type="text" value={searchTerm} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}></Input>
                            <div className="overflow-x-auto duration-500 max-h-[60vh]">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="sticky top-0 bg-gray-100">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Medicamento</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Descripción</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredMedicines.map((m) => (
                                            <tr key={m.nombre} className="hover:bg-gray-50 text-sm">
                                                <td className="px-4 py-2">{m.nombre || "-"}</td>
                                                <td className="px-4 py-2">{m.descripcion || "-"}</td>
                                                <td className="px-4 py-2 flex gap-2">
                                                    <button className="text-blue-600 hover:text-blue-800 p-1 rounded disabled:opacity-50 cursor-pointer" title="Editar"
                                                        onClick={() => { handleOpenModal(m) }}>
                                                        <Pencil className="w-4 h-4"></Pencil>
                                                    </button>
                                                    <button className="text-red-600 hover:text-green-800 p-1 rounded disabled:opacity-50 cursor-pointer" title="Eliminar"
                                                        onClick={() => { handleDelete(m.id) }}>
                                                        <Trash className="w-4 h-4"></Trash>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}

                                        {(medicines.length > 0 && filteredMedicines.length === 0) && (
                                            <tr>
                                                <td colSpan={5} className="bg-gray-50 border-b border-gray-200 text-center text-sm text-gray-600 py-5">
                                                    No se han encontrado resultados coincidentes
                                                </td>
                                            </tr>
                                        )}

                                        {(medicines.length === 0 && filteredMedicines.length === 0) && (
                                            <tr>
                                                <td colSpan={5} className="bg-gray-50 border-b border-gray-200 text-center text-sm text-gray-600 py-5">
                                                    No hay medicamentos registrados
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
                                    Registrar medicamento
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
                    {showModal && selectedMedicine && (
                        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40 backdrop-blur-sm">
                            <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
                                
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold text-gray-700">{selectedMedicine.id ? 'Editar medicamento' : 'Registrar medicamento'}</h2>
                                    <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-800 transition-colors"><X size={24} /></button>
                                </div>

                                <form onSubmit={handleSaveMedicine}>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                                            <Input type="text" className="text-sm border-gray-300" value={selectedMedicine.nombre} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSelectedMedicine({ ...selectedMedicine, nombre: e.target.value })} placeholder="Nombre del medicamento" required />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                                            <textarea className="w-full border border-gray-300 rounded-lg text-sm text-gray-500 p-2 outline-none" rows={5} value={selectedMedicine.descripcion || ""} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSelectedMedicine({ ...selectedMedicine, descripcion: e.target.value })} placeholder="Descripción" />
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